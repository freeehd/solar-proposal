import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AppleNav } from "@/components/apple-nav"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Sun Studios - Premium Solar Solutions</title>
        <meta name="description" content="Premium solar energy solutions for discerning homes and businesses" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <main className="relative flex min-h-screen flex-col">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
