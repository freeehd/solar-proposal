"use client"

import { useState, useEffect } from "react"
import { Sun } from 'lucide-react'
import dynamic from "next/dynamic"

// Dynamically import the MetallicPaint component with no SSR

const MetalicPaint = dynamic(() => import("@/components/ui/metallic"), { ssr: false });
// Also dynamically import the parseLogoImage functionim


export default function LoadingScreen() {

  return (
    <div>
      <div className="flex items-center justify-center max-w-7xl space-x-3 mx-auto">
        <h1 className="text-black">My Logo</h1>
        <MetalicPaint />
      </div>
    </div>
  )
}
