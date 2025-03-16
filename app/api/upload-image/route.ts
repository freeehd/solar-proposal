import { put, list } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File
    const imageType = formData.get("imageType") as string // 'solar' or 'battery'

    if (!file) {
      return NextResponse.json({ success: false, message: "No image provided" }, { status: 400 })
    }

    if (!imageType || (imageType !== "solar" && imageType !== "battery")) {
      return NextResponse.json({ success: false, message: "Invalid image type" }, { status: 400 })
    }

    // Create a unique filename with timestamp to avoid collisions
    const timestamp = new Date().getTime()
    const filename = `${timestamp}-${file.name.replace(/\s+/g, "-")}`

    // Store in different directories based on image type
    const pathname = `${imageType}/${filename}`

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false, // We already added a timestamp
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ success: false, message: "Failed to upload image" }, { status: 500 })
  }
}

// GET endpoint to list images by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageType = searchParams.get("type") // 'solar' or 'battery'

    if (!imageType || (imageType !== "solar" && imageType !== "battery")) {
      return NextResponse.json({ success: false, message: "Invalid image type" }, { status: 400 })
    }

    // List all blobs in the specified directory
    const blobs = await list({
      prefix: `${imageType}/`,
    })

    return NextResponse.json({
      success: true,
      images: blobs.blobs.map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      })),
    })
  } catch (error) {
    console.error("Error listing images:", error)
    return NextResponse.json({ success: false, message: "Failed to list images" }, { status: 500 })
  }
}

