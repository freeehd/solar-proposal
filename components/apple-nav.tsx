"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Search, ShoppingBag } from "lucide-react"

export function AppleNav() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <nav className="apple-nav">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          <a href="#" className="apple-nav-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-apple"
            >
              <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
              <path d="M10 2c1 .5 2 2 2 5" />
            </svg>
          </a>
          <a href="#" className="apple-nav-item">
            Store
          </a>
          <a href="#" className="apple-nav-item">
            Mac
          </a>
          <a href="#" className="apple-nav-item">
            iPad
          </a>
          <a href="#" className="apple-nav-item">
            iPhone
          </a>
          <a href="#" className="apple-nav-item">
            Watch
          </a>
        </div>
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="apple-nav-item"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a href="#" className="apple-nav-item">
            <Search size={18} />
          </a>
          <a href="#" className="apple-nav-item">
            <ShoppingBag size={18} />
          </a>
        </div>
      </div>
    </nav>
  )
}
