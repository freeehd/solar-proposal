"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface ProposalData {
  id: number
  name: string
  address: string
  status: string
  total_system_cost: string
  // Add other fields as necessary
}

export default function ProposalEdit({ id }: { id: string }) {
  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const router = useRouter()

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (proposal) {
      setProposal({ ...proposal, [e.target.name]: e.target.value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/proposals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proposal),
      })
      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Proposal updated successfully",
        })
        router.push("/")
      } else {
        toast({
          title: "Error",
          description: "Failed to update proposal",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating proposal:", error)
      toast({
        title: "Error",
        description: "Failed to update proposal",
        variant: "destructive",
      })
    }
  }

  if (!proposal) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Proposal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={proposal.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" value={proposal.address} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="total_system_cost">Total System Cost</Label>
            <Input
              id="total_system_cost"
              name="total_system_cost"
              type="number"
              step="0.01"
              value={proposal.total_system_cost}
              onChange={handleChange}
              required
            />
          </div>
          {/* Add more fields as necessary */}
          <Button type="submit">Update Proposal</Button>
        </form>
      </CardContent>
    </Card>
  )
}

