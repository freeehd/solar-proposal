import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-normal leading-tight leading-tight"
            >
              Solar Proposals
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/create-proposal"
              className="text-foreground hover:text-primary transition-colors"
            >
              Create Proposal
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
