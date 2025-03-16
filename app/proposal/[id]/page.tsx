import ProposalContent from "@/components/proposal-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "View Proposal",
  description: "Detailed view of your solar proposal",
}

export default function ProposalPage({ params }: { params: { id: string } }) {
  return (
    <div className="scrollbar-hide">
      <ProposalContent proposalId={params.id} />
    </div>
  )
}

