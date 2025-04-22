"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { ShareLinkDialog } from "@/components/share-link-dialog"
import { RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from "swr"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Proposal {
  id: number
  name: string
  address: string
  status: string
  created_at: string
  updated_at: string
  total_system_cost: string
}

// Create a fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Server responded with status: ${res.status}`)
  }
  const data = await res.json()
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch proposals")
  }
  return data.proposals
}

export default function ProposalDashboard() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [isManualRefresh, setIsManualRefresh] = useState(false)

  // Use SWR for data fetching with caching
  const {
    data: proposals,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Proposal[], Error>("/api/proposals", fetcher, {
    refreshInterval: 30000, // Auto refresh every 30 seconds
    revalidateOnFocus: false, // Don't revalidate when window gets focus
    dedupingInterval: 5000, // Deduplicate requests within 5 seconds
    keepPreviousData: true, // Keep showing previous data while fetching new data
    onSuccess: () => {
      setLastRefreshed(new Date())
      if (isManualRefresh) {
        toast({
          title: "Refreshed",
          description: "Proposal list has been updated",
          duration: 2000,
        })
        setIsManualRefresh(false)
      }
    },
    onError: (err) => {
      console.error("Error fetching proposals:", err)
      if (isManualRefresh) {
        toast({
          title: "Error",
          description: err.message || "Failed to refresh proposals",
          variant: "destructive",
        })
        setIsManualRefresh(false)
      }
    },
  })

  // Set up intersection observer for section visibility
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute("data-section-id")
          if (sectionId) {
            setVisibleSections((prev) => {
              const newSet = new Set(prev)
              if (entry.isIntersecting) {
                newSet.add(sectionId)
              } else {
                newSet.delete(sectionId)
              }
              return newSet
            })
          }
        })
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      },
    )

    // Observe all sections
    document.querySelectorAll("[data-section-id]").forEach((section) => {
      observerRef.current?.observe(section)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [proposals]) // Re-observe when proposals change

  // Manually refresh data with cache busting
  const refreshData = useCallback(() => {
    setIsManualRefresh(true)
    // Use a timestamp to bust the cache
    mutate(fetcher(`/api/proposals?refresh=${Date.now()}`))
  }, [mutate])

  // Update proposal status
  const updateProposalStatus = useCallback(
    async (id: number, newStatus: string) => {
      try {
        const response = await fetch(`/api/proposals/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        })

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          // Optimistically update the local data
          mutate(
            proposals?.map((p) => (p.id === id ? { ...p, status: newStatus } : p)) as Proposal[],
            false, // Don't revalidate yet
          )

          toast({
            title: "Success",
            description: "Proposal status updated",
          })

          // Then revalidate to make sure our local data is correct
          // Use a timestamp to bust the cache
          mutate(fetcher(`/api/proposals?refresh=${Date.now()}`))
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to update proposal status",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error updating proposal status:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update proposal status",
          variant: "destructive",
        })
      }
    },
    [proposals, mutate],
  )

  const deleteProposal = useCallback(
    async (id: number) => {
      try {
        const response = await fetch(`/api/proposals/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          // Optimistically update the local data by filtering out the deleted proposal
          mutate(
            proposals?.filter((p) => p.id !== id) as Proposal[],
            false, // Don't revalidate yet
          )

          toast({
            title: "Success",
            description: "Proposal deleted successfully",
          })

          // Then revalidate to make sure our local data is correct
          mutate(fetcher(`/api/proposals?refresh=${Date.now()}`))
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to delete proposal",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting proposal:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete proposal",
          variant: "destructive",
        })
      }
    },
    [proposals, mutate],
  )

  // Format functions
  const formatCurrency = useCallback((value: string) => {
    const num = Number.parseFloat(value)
    return !isNaN(num) ? num.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "$0.00"
  }, [])

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "Invalid date"
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Solar Proposals</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-foreground/70">Last updated: {lastRefreshed.toLocaleTimeString()}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isValidating}
            className="bg-gradient-to-r from-teal-50 to-blue-100 border-none hover:bg-primary/10 text-primary"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded flex items-center mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error.message}</span>
        </div>
      )}

      {isLoading && !proposals ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-2">
              <Skeleton className="h-10 w-[200px]" />
              <Skeleton className="h-10 w-[200px]" />
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[150px]" />
              <Skeleton className="h-10 w-[150px]" />
              <Skeleton className="h-10 w-[250px]" />
            </div>
          ))}
        </div>
      ) : proposals && proposals.length === 0 ? (
        <div className="text-center py-10 bg-gradient-to-r from-teal-50 to-blue-100 rounded-lg">
          <p className="text-foreground/70">No proposals found</p>
          <Button
            variant="outline"
            className="mt-4 bg-gradient-to-r from-teal-50 to-blue-100 border-none hover:bg-primary/10 text-primary"
            onClick={refreshData}
          >
            Refresh
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Total System Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals?.map((proposal) => (
                <TableRow key={proposal.id} data-section-id={`proposal-${proposal.id}`}>
                  <TableCell className="font-medium text-primary">{proposal.name}</TableCell>
                  <TableCell className="text-foreground/70">{proposal.address}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`flex items-center gap-1.5 px-2.5 py-1 ${
                        proposal.status === "completed"
                          ? "bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/30"
                          : proposal.status === "in_progress"
                            ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border-amber-500/30"
                            : "bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/30"
                      }`}
                    >
                      {proposal.status === "completed" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : proposal.status === "in_progress" ? (
                        <Clock className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      <span className="capitalize">{proposal.status.replace("_", " ")}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground/70">{formatDate(proposal.created_at)}</TableCell>
                  <TableCell className="text-primary">{formatCurrency(proposal.total_system_cost)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Select
                        defaultValue={proposal.status}
                        onValueChange={(value) => updateProposalStatus(proposal.id, value)}
                      >
                        <SelectTrigger className="w-[150px] bg-gradient-to-r from-teal-50 to-blue-100 border-none">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Link href={`/proposal/${proposal.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gradient-to-r from-teal-50 to-blue-100 border-none hover:bg-primary/10 text-primary"
                        >
                          View
                        </Button>
                      </Link>
                      <Link href={`/proposal/${proposal.id}/edit`}>
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                          Edit
                        </Button>
                      </Link>
                      <ShareLinkDialog proposalId={proposal.id} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the proposal for{" "}
                              {proposal.name} and remove all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteProposal(proposal.id)}
                              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {isValidating && proposals && (
            <div className="p-4 bg-background/50 text-center text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
              Refreshing data...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
