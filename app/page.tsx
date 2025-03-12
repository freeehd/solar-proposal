import Link from "next/link";
import { Suspense } from "react";
import ProposalDashboard from "@/components/proposal-dashboard";
import { Button } from "@/components/ui/button";
import Loading from "../components/ui/loading";
import Navbar from "@/components/navbar";
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Check if the user is authenticated
  const session = await auth();
  
  // If not authenticated, redirect to login page
  if (!session) {
    redirect('/login');
  }
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-10">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-normal leading-tight text-black">
            Solar Proposal Dashboard
          </h1>
          <Link href="/create-proposal">
            <Button>Create New Proposal</Button>
          </Link>
        </header>
        <Suspense fallback={<Loading />}>
          <ProposalDashboard />
        </Suspense>
      </div>
    </>
  );
}