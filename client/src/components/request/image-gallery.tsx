import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "@/components/icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { requestKeys } from "@/domains/requests/request.keys"
import type { Request } from "@/domains/requests/request.types"
import { api } from "@/lib/axios"
import { queryClient } from "@/lib/query-client"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { ImagePreview } from "./file-upload"

export function ImageGallery({
  images,
  requestId,
}: {
  images: Request["image_urls"]
  requestId: number
}) {
  const [active, setActive] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const currentIndex = active
    ? images.findIndex((img) => img.url === active)
    : -1

  const showNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setActive(images[currentIndex + 1].url)
    }
  }, [currentIndex, images])

  const showPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setActive(images[currentIndex - 1].url)
    }
  }, [currentIndex, images])

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
  }, [active, showNext, showPrevious])

  const handleDeleteImage = async () => {
    if (deleteTarget === null) return

    setDeletingId(deleteTarget)
    setDeleteTarget(null)

    try {
      await api.delete(`/requests/${requestId}/images/${deleteTarget}`)
      queryClient.invalidateQueries({
        queryKey: requestKeys.detail(requestId),
      })
    } catch {
      toast.error("Failed to delete image.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete image?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The image will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteImage}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lightbox overlay */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/90 backdrop-blur-sm duration-200 fade-in"
          onClick={() => setActive(null)}
        >
          <div className="group relative max-h-[95vh] max-w-[95vw]">
            <Button
              onClick={() => setActive(null)}
              size="icon"
              variant="secondary"
              className="absolute -top-4 -right-4 z-10 rounded-full bg-background/90 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-background"
            >
              <XIcon className="size-4" />
            </Button>

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
                <ChevronLeftIcon className="size-5" />
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
                <ChevronRightIcon className="size-5" />
              </Button>
            )}

            <div className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white">
              {currentIndex + 1} of {images.length}
            </div>

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
      <div className="@container">
        {images.length > 0 ? (
          <div className="grid grid-cols-4 gap-4 @2xl:grid-cols-5 @3xl:grid-cols-6 @4xl:grid-cols-7">
            {images.map((image) => (
              <ImagePreview
                key={image.id}
                url={image.thumb}
                onRemove={() => setDeleteTarget(image.id)}
                onClick={() => setActive(image.url)}
                isDeleting={deletingId === image.id}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
