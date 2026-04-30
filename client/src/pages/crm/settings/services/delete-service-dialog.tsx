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
import { useDeleteService, useServices } from "@/hooks/api/use-services"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

export function DeleteServiceDialog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: services } = useServices()

  const service = useMemo(
    () => services?.find((p) => p.id === deleteId),
    [services, deleteId]
  )

  useEffect(() => {
    const deleteParam = searchParams.get("delete_service")
    if (deleteParam) {
      setDeleteId(Number(deleteParam))
      setOpen(true)
    }
  }, [searchParams])

  const { mutate: deleteServiceMutation, isPending } = useDeleteService({
    onSuccess: () => {
      toast.success("Service deleted")
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
          <AlertDialogTitle>Delete moving service</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete <b>{service?.name}.</b> Service that have already
            been used cannot be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={isPending}
            variant="destructive"
            onClick={() => {
              if (service) {
                deleteServiceMutation({ id: service.id })
              }
            }}
          >
            <LoadingSwap isLoading={isPending}>Delete service</LoadingSwap>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
