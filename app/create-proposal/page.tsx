import DefaultForm from "@/components/default-form";
import Navbar from "@/components/navbar";

export default function CreateProposalPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-normal leading-tight leading-tight mb-8">
          Create New Solar Proposal
        </h1>
        <DefaultForm />
      </div>
    </>
  );
}
