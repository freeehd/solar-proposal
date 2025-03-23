import { Suspense } from "react"
import ProposalDashboard from "@/components/proposal-dashboard"
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    // Check if the user is authenticated
    const session = await auth()
    
    // If not authenticated, redirect to login page
    if (!session) {
        redirect('/login')
    }
    
    return (
            <ProposalDashboard />
    )
}