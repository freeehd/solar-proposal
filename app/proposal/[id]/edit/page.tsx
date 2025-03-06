import { Suspense } from "react";
import ProposalEdit from "@/components/proposal-edit";
import Loading from "@/components/ui/loading";

export default function ProposalEditPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-normal leading-tight mb-8">Edit Proposal</h1>
      <Suspense fallback={<Loading />}>
        <ProposalEdit id={params.id} />
      </Suspense>
    </div>
  );
}
