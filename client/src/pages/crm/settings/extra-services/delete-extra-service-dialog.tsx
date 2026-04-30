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
  useDeleteExtraService,
  useExtraServices,
} from "@/hooks/api/use-extra-services"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

export function DeleteExtraServiceDialog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: extraServices } = useExtraServices()

  const extraService = useMemo(
    () => extraServices?.find((extraService) => extraService.id === deleteId),
    [extraServices, deleteId]
  )

  useEffect(() => {
    const deleteParam = searchParams.get("delete_extra_service")
    if (deleteParam) {
      setDeleteId(Number(deleteParam))
      setOpen(true)
    }
  }, [searchParams])

  const { mutate: deleteExtraServiceMutation, isPending } =
    useDeleteExtraService({
      onSuccess: () => {
        toast.success("Extra service deleted")
        handleCancel()
      },
    })

  function handleCancel() {
    setOpen(false)
    setDeleteId(null)
    setSearchParams()
  }

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete extra service</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <b>{extraService?.name}</b>? This
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
              if (extraService) {
                deleteExtraServiceMutation({ id: extraService.id })
              }
            }}
          >
            <LoadingSwap isLoading={isPending}>
              Delete extra service
            </LoadingSwap>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
