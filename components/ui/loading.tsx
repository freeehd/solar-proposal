"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun } from "lucide-react"


export default function LoadingScreen() {


    return (
        <div>
            <div className="flex items-center justify-center max-w-7xl space-x-3 mx-auto">
                <h1 className="text-black">My Logo</h1>
                <Sun size={50} />
            </div>
        </div>
    )
}

