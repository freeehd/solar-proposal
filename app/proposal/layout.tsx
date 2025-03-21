import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import type { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Solar Proposal",
    description: "View your personalized solar energy solution",
}

export default function ProposalLayout({
                                           children,
                                       }: {
    children: ReactNode
}) {
    return (
        <html lang="en" className="scrollbar-hide">
        <body className={inter.className} >
            <main>{children}</main>
        </body>
        </html>
    )
}

