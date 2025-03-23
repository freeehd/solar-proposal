import { Suspense } from "react"
import ProposalEdit from "@/components/proposal-edit"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProposalEditPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-normal leading-tight mb-8">Edit Proposal</h1>
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <ProposalEdit id={params.id} />
      </Suspense>
    </div>
  )
}

