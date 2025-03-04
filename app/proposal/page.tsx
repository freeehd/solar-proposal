import { Suspense } from "react"
import ProposalContent from "@/components/proposal-content"
import Loading from "../loading"

export default function ProposalPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ProposalContent />
        </Suspense>
    )
}

