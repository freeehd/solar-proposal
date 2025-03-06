import { Suspense } from "react"
import ProposalDashboard from "@/components/proposal-dashboard"
import Loading from "../../components/ui/loading"

export default function DashboardPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ProposalDashboard />
        </Suspense>
    )
}

