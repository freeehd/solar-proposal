"use client"

import { useEffect, useState, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { ShareLinkDialog } from "@/components/share-link-dialog"
import { RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Proposal {
  id: number
  name: string
  address: string
  status: string
  created_at: string
  total_system_cost: string
}

export default function ProposalDashboard() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  // Memoize fetchProposals to avoid recreating it on every render
  const fetchProposals = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Add cache-busting query parameter to prevent caching
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/proposals?t=${timestamp}`, {
        // Add cache control headers
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        console.log("Fetched proposals:", data.proposals)
        setProposals(data.proposals)
        setLastRefreshed(new Date())
      } else {
        setError(data.error || "Failed to fetch proposals")
        toast({
          title: "Error",
          description: data.error || "Failed to fetch proposals",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching proposals:", error)
      setError("Failed to fetch proposals. Please try again.")
      toast({
        title: "Error",
        description: "Failed to fetch proposals. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch on component mount
  useEffect(() => {
    fetchProposals()

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchProposals()
    }, 30000)

    return () => clearInterval(refreshInterval)
  }, [fetchProposals])

  const updateProposalStatus = async (id: number, newStatus: string) => {
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
        // Update local state
        setProposals(proposals.map((p) => (p.id === id ? { ...p, status: newStatus } : p)))
        toast({
          title: "Success",
          description: "Proposal status updated",
        })

        // Refresh the data to ensure we have the latest
        fetchProposals()
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
        description: "Failed to update proposal status",
        variant: "destructive",
      })
    }
  }

  // Format currency
  const formatCurrency = (value: string) => {
    const num = Number.parseFloat(value)
    return !isNaN(num) ? num.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "$0.00"
  }

  // Format date
  const formatDate = (dateString: string) => {
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
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Solar Proposals</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-foreground/70">Last updated: {lastRefreshed.toLocaleTimeString()}</p>
          <Button variant="outline" size="sm" onClick={fetchProposals} disabled={isLoading} className="pearlescent-surface border-none hover:bg-primary/10 text-primary">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded flex items-center mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
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
      ) : proposals.length === 0 ? (
        <div className="text-center py-10 pearlescent-surface rounded-lg">
          <p className="text-foreground/70">No proposals found</p>
          <Button variant="outline" className="mt-4 pearlescent-surface border-none hover:bg-primary/10 text-primary" onClick={fetchProposals}>
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
              {proposals.map((proposal) => (
                <TableRow key={proposal.id}>
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
                        <SelectTrigger className="w-[150px] pearlescent-surface border-none">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Link href={`/proposal/${proposal.id}`}>
                        <Button variant="outline" size="sm" className="pearlescent-surface border-none hover:bg-primary/10 text-primary">
                          View
                        </Button>
                      </Link>
                      <Link href={`/proposal/${proposal.id}/edit`}>
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Edit</Button>
                      </Link>
                      <ShareLinkDialog proposalId={proposal.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

