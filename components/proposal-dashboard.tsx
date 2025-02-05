"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { ShareLinkDialog } from "@/components/share-link-dialog"

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

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      const response = await fetch("/api/proposals")
      const data = await response.json()
      if (data.success) {
        setProposals(data.proposals)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch proposals",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching proposals:", error)
      toast({
        title: "Error",
        description: "Failed to fetch proposals",
        variant: "destructive",
      })
    }
  }

  const updateProposalStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/proposals/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await response.json()
      if (data.success) {
        setProposals(proposals.map((p) => (p.id === id ? { ...p, status: newStatus } : p)))
        toast({
          title: "Success",
          description: "Proposal status updated",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update proposal status",
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

  return (
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
                <TableCell>{proposal.name}</TableCell>
                <TableCell>{proposal.address}</TableCell>
                <TableCell>
                  <Badge
                      variant={
                        proposal.status === "completed"
                            ? "accent"
                            : proposal.status === "in_progress"
                                ? "warning"
                                : "secondary"
                      }
                  >
                    {proposal.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(proposal.created_at).toLocaleDateString()}</TableCell>
                <TableCell>${Number(proposal.total_system_cost).toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Select onValueChange={(value) => updateProposalStatus(proposal.id, value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Link href={`/proposal/${proposal.id}`}>
                      <Button variant="outline">View</Button>
                    </Link>
                    <Link href={`/proposal/${proposal.id}/edit`}>
                      <Button>Edit</Button>
                    </Link>
                    <ShareLinkDialog proposalId={proposal.id} />
                  </div>
                </TableCell>
              </TableRow>
          ))}
        </TableBody>
      </Table>
  )
}

