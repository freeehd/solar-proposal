
import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold text-gray-800">
          Solar Proposal
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">
            Dashboard
          </Link>
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}