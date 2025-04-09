"use client"

import { useState } from "react"
import Image from "next/image"
import type { DigimonData } from "./digimon-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ImageGalleryProps {
  digimon: DigimonData
  onClose: () => void
}

export function ImageGallery({ digimon, onClose }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? digimon.images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === digimon.images.length - 1 ? 0 : prev + 1))
  }

  // Extract image name from URL
  const getImageName = (url: string) => {
    const parts = url.split("/")
    const filename = parts[parts.length - 1]
    // Remove any file extension
    return filename.split(".")[0]
  }

  return (
    <Dialog open={!!digimon} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{digimon.name} Images</DialogTitle>
          <DialogDescription>
            {currentIndex + 1} of {digimon.images.length} images
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-square w-full max-h-[60vh] overflow-hidden rounded-md bg-muted">
          {/* Image */}
          <div className="flex items-center justify-center h-full">
            <div className="bg-white dark:bg-black p-2 rounded-md">
              <Image
                src={digimon.images[currentIndex] || "/placeholder.svg"}
                alt={`${digimon.name} - ${getImageName(digimon.images[currentIndex])}`}
                width={300}
                height={300}
                className="object-contain"
                unoptimized // For external URLs
              />
            </div>
          </div>

          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous image</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next image</span>
          </Button>
        </div>

        {/* Image name */}
        <div className="text-center text-sm text-muted-foreground">{getImageName(digimon.images[currentIndex])}</div>

        {/* Thumbnails */}
        <div className="flex overflow-x-auto gap-2 pb-2">
          {digimon.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 rounded-md overflow-hidden border-2 ${
                index === currentIndex ? "border-primary" : "border-transparent"
              }`}
            >
              <div className="bg-white dark:bg-black p-1">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${digimon.name} thumbnail ${index + 1}`}
                  width={60}
                  height={60}
                  className="object-cover w-[60px] h-[60px]"
                  unoptimized // For external URLs
                />
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
