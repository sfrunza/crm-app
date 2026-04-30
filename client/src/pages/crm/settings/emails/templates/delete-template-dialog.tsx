import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/ui/loading-swap"
import {
  useDeleteEmailTemplate,
  useEmailTemplates,
} from "@/hooks/api/use-email-templates"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

export function DeleteTemplateDialog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: emailTemplates } = useEmailTemplates()

  const emailTemplate = useMemo(
    () =>
      emailTemplates?.find((emailTemplate) => emailTemplate.id === deleteId),
    [emailTemplates, deleteId]
  )

  useEffect(() => {
    const deleteParam = searchParams.get("delete_template_id")
    if (deleteParam) {
      setDeleteId(Number(deleteParam))
      setOpen(true)
    }
  }, [searchParams])

  const { mutate: deleteEmailTemplateMutation, isPending } =
    useDeleteEmailTemplate({
      onSuccess: () => {
        toast.success("Email template deleted")
        handleCancel()
      },
    })

  function handleCancel() {
    setOpen(false)
    setDeleteId(null)
    setSearchParams((prev) => {
      prev.delete("delete_template_id")
      return prev
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete email template</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <b>{emailTemplate?.name}</b>? This
            can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={isPending}
            variant="destructive"
            onClick={() => {
              if (emailTemplate) {
                deleteEmailTemplateMutation({ id: emailTemplate.id })
              }
            }}
          >
            <LoadingSwap isLoading={isPending}>Delete</LoadingSwap>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
