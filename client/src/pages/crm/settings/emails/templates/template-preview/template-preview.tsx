import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEmailTemplates } from "@/hooks/api/use-email-templates"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"

export function TemplatePreview() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [previewId, setPreviewId] = useState<number | null>(null)

  const { data: emailTemplates } = useEmailTemplates()

  const emailTemplate = useMemo(
    () =>
      emailTemplates?.find((emailTemplate) => emailTemplate.id === previewId),
    [emailTemplates, previewId]
  )

  useEffect(() => {
    const previewParam = searchParams.get("preview_template_id")
    if (previewParam) {
      setPreviewId(Number(previewParam))
      setOpen(true)
    }
  }, [searchParams])

  function handleCancel() {
    setOpen(false)
    setPreviewId(null)
    setSearchParams((prev) => {
      prev.delete("preview_template_id")
      return prev
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Template preview</DialogTitle>
          <DialogDescription className="sr-only" />
        </DialogHeader>
        <div className="h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] w-full">
          {emailTemplate?.html && (
            <iframe
              title="Email Preview"
              className="h-full w-full rounded-md border"
              sandbox=""
              srcDoc={emailTemplate?.html || ""}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
