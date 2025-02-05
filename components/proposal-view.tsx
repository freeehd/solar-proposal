"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

interface ProposalData {
  id: number
  name: string
  address: string
  status: string
  created_at: string
  total_system_cost: string
  // Add other fields as necessary
}

export default function ProposalView({ id }: { id: string }) {
  const [proposal, setProposal] = useState<ProposalData | null>(null)

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const response = await fetch(`/api/proposals/${id}`)
        const data = await response.json()
        if (data.success) {
          setProposal(data.proposal)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch proposal details",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching proposal:", error)
        toast({
          title: "Error",
          description: "Failed to fetch proposal details",
          variant: "destructive",
        })
      }
    }

    fetchProposal()
  }, [id])

  if (!proposal) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{proposal.name}&apos;s Solar Proposal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Address:</strong> {proposal.address}
          </div>
          <div>
            <strong>Status:</strong> {proposal.status}
          </div>
          <div>
            <strong>Created At:</strong> {new Date(proposal.created_at).toLocaleDateString()}
          </div>
          <div>
            <strong>Total System Cost:</strong> ${Number(proposal.total_system_cost).toFixed(2)}
          </div>
          {/* Add more fields as necessary */}
        </div>
      </CardContent>
    </Card>
  )
}

