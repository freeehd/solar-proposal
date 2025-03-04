"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ImageIcon, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ImageGalleryDialogProps {
  initialImage?: string
}

export function ImageGalleryDialog({ initialImage }: ImageGalleryDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(initialImage)
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/battery-images")
        if (!response.ok) {
          throw new Error("Failed to fetch battery images")
        }
        const data = await response.json()
        setImages(data.images)
        console.log("Fetched images:", data.images)
      } catch (error) {
        console.error("Error fetching battery images:", error)
        toast({
          title: "Error",
          description: "Failed to load battery images. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchImages()
    }
  }, [open])

  const handleSelect = (image: string) => {
    const fullImagePath = image.startsWith("/") ? image : `/${image}`
    setSelectedImage(fullImagePath)
    setOpen(false)
    // You can add any additional logic here, such as updating a form state
  }

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <ImageIcon className="mr-2 h-4 w-4" />
            Choose from Gallery
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Battery Image</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {loading ? (
                <div className="col-span-full text-center">Loading images...</div>
            ) : images.length > 0 ? (
                images.map((image, index) => (
                    <div
                        key={index}
                        className="group relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleSelect(image)}
                    >
                      <Image
                          src={image || "/placeholder.svg"}
                          alt={`Battery option ${index + 1}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                      />
                      {selectedImage === image && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                      )}
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center">No images found</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
  )
}

