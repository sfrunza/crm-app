import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty"
import type { Request } from "@/domains/requests/request.types"
import { api } from "@/lib/axios"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  XIcon,
} from "@/components/icons"
import { useEffect, useState } from "react"
import { ImagePreview } from "./file-upload"

export function ImageGallery({
  images,
  requestId,
}: {
  images: Request["image_urls"]
  requestId: number
}) {
  const [active, setActive] = useState<string | null>(null)

  // Add current index tracking
  const currentIndex = active
    ? images.findIndex((img) => img.url === active)
    : -1

  // Handle navigation
  const showNext = () => {
    if (currentIndex < images.length - 1) {
      setActive(images[currentIndex + 1].url)
    }
  }

  const showPrevious = () => {
    if (currentIndex > 0) {
      setActive(images[currentIndex - 1].url)
    }
  }

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!active) return

      if (e.key === "ArrowRight") {
        showNext()
      } else if (e.key === "ArrowLeft") {
        showPrevious()
      } else if (e.key === "Escape") {
        setActive(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [active, currentIndex])

  const handleDeleteImage = async (imageId: number) => {
    await api.delete(`/requests/${requestId}/images/${imageId}`)
  }

  return (
    <div>
      {/* Modal Overlay */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/90 backdrop-blur-sm duration-200 fade-in"
          onClick={() => setActive(null)}
        >
          <div className="group relative max-h-[95vh] max-w-[95vw]">
            {/* Close Button */}
            <Button
              onClick={() => setActive(null)}
              size="icon"
              variant="secondary"
              className="absolute -top-4 -right-4 z-10 rounded-full bg-background/90 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-background"
            >
              <XIcon />
            </Button>

            {/* Navigation Buttons */}
            {currentIndex > 0 && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  showPrevious()
                }}
                size="icon"
                variant="secondary"
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/90 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-white"
              >
                <ChevronLeftIcon />
              </Button>
            )}

            {currentIndex < images.length - 1 && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  showNext()
                }}
                size="icon"
                variant="secondary"
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/90 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-white"
              >
                <ChevronRightIcon />
              </Button>
            )}

            {/* Image Counter */}
            <div className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white">
              {currentIndex + 1} of {images.length}
            </div>

            {/* Main Image */}
            <img
              className="max-h-[95vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
              src={active}
              alt=""
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {images.map((image) => (
            <ImagePreview
              key={image.id}
              url={image.thumb}
              onRemove={() => {
                handleDeleteImage(image.id)
              }}
              onClick={() => setActive(image.url)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon />
            </EmptyMedia>
            <EmptyDescription>No images yet</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
