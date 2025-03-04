import { Suspense } from "react"
import ProposalContent from "@/components/proposal-content"
import Loading from "@/app/loading"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "View Proposal",
    description: "Detailed view of your solar proposal",
}

export default function ProposalPage({ params }: { params: { id: string } }) {
    return (
        <div >
            <Suspense fallback={<Loading />}>
                <ProposalContent proposalId={params.id} />

            </Suspense>
        </div>
    )
}

