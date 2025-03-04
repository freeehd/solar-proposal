import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
    const directory = path.join(process.cwd(), "public", "Batteries")

    try {
        const files = await fs.promises.readdir(directory)
        const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))

        const images = imageFiles.map((file) => `/Batteries/${file}`)

        return NextResponse.json({ images })
    } catch (error) {
        console.error("Error reading battery images directory:", error)
        return NextResponse.json({ error: "Failed to read battery images" }, { status: 500 })
    }
}

