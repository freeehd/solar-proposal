"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImagePlus, Upload, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"

interface ImageGalleryDialogProps {
  initialImage?: string
  onSelect: (imagePath: string) => void
  imageType?: "solar" | "battery" // Add imageType prop
  disabled?: boolean // Add disabled prop
}

interface ImageItem {
  url: string
  pathname: string
  size: number
  uploadedAt: string
}

export function ImageGalleryDialog({
  initialImage,
  onSelect,
  imageType = "battery",
  disabled = false,
}: ImageGalleryDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(initialImage)
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [open, setOpen] = useState(false)

  // Fetch images when dialog opens
  useEffect(() => {
    if (open) {
      fetchImages()
    }
  }, [open])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/upload-image?type=${imageType}`)
      if (!response.ok) {
        throw new Error("Failed to fetch images")
      }

      const data = await response.json()
      if (data.success) {
        setImages(data.images)
      } else {
        throw new Error(data.message || "Failed to fetch images")
      }
    } catch (error) {
      console.error("Error fetching images:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch images",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      try {
        setUploading(true)

        // Create form data for upload
        const formData = new FormData()
        formData.append("image", file)
        formData.append("imageType", imageType)

        // Upload the image
        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to upload image")
        }

        const result = await response.json()

        if (result.success) {
          toast({
            title: "Image uploaded",
            description: "Image uploaded successfully.",
          })

          // Refresh the image list
          fetchImages()
        } else {
          throw new Error(result.message || "Upload failed")
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload image",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
      }
    }
  }

  const handleImageSelect = (image: ImageItem) => {
    setSelectedImage(image.url)
    onSelect(image.url)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" disabled={disabled}>
          <ImagePlus className="mr-2 h-4 w-4" />
          {initialImage ? "Change Image" : "Select Image"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Select {imageType === "battery" ? "Battery" : "Solar Panel"} Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="image-upload" className="sr-only">
                Upload Image
              </Label>
              <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </div>
            <Button type="submit" size="sm" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No images found. Upload some images to get started.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative aspect-video rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedImage === image.url
                      ? "border-primary ring-2 ring-primary"
                      : "border-muted hover:border-muted-foreground"
                  }`}
                  onClick={() => handleImageSelect(image)}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

