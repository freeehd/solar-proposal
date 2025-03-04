import { Suspense } from "react";
import ProposalDashboard from "@/components/why-sun-studios";
import Loading from "../loading";

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProposalDashboard />
    </Suspense>
  );
}
