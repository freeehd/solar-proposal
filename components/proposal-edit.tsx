"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DefaultForm from "./default-form"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

export default function ProposalEdit({ id }: { id: string }) {
  const [proposalData, setProposalData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/proposal/${id}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch proposal: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setProposalData(data.proposal)
        } else {
          throw new Error(data.message || "Failed to fetch proposal details")
        }
      } catch (error) {
        console.error("Error fetching proposal:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch proposal details")
      } finally {
        setLoading(false)
      }
    }

    fetchProposal()
  }, [id])

  const handleSubmitSuccess = (updatedProposal: any) => {
    toast({
      title: "Success",
      description: "Proposal updated successfully",
    })

    // Redirect to the proposal view page
    router.push(`/proposals/${id}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Skeleton className="h-12 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {proposalData && (
        <DefaultForm
          initialData={proposalData}
          isEditing={true}
          proposalId={id}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  )
}

