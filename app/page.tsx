import Link from "next/link"
import { Suspense } from "react"
import ProposalDashboard from "@/components/proposal-dashboard"
import { Button } from "@/components/ui/button"
import Loading from "./loading"
import Navbar from "@/components/navbar"

export default function Home() {
    return (
        <>
            <Navbar />
            <div className="container mx-auto py-10">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Solar Proposal Dashboard</h1>
                    <Link href="/create-proposal">
                        <Button>Create New Proposal</Button>
                    </Link>
                </header>
                <Suspense fallback={<Loading />}>
                    <ProposalDashboard />
                </Suspense>
            </div>
        </>
    )
}

