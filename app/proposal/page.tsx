import { Suspense } from "react"
import ProposalContent from "@/components/proposal-content"
import Loading from "../../components/ui/loading"

export default function ProposalPage() {
    return (
        <div className="scrollbar-hide">
            <ProposalContent />

        </div>
    )
}

