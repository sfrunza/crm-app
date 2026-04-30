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
  useDeletePackingType,
  usePackingTypes,
} from "@/hooks/api/use-packing-types"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

export function DeletePackingTypeDialog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: packingTypes } = usePackingTypes()

  const packingType = useMemo(
    () => packingTypes?.find((p) => p.id === deleteId),
    [packingTypes, deleteId]
  )

  useEffect(() => {
    const deleteParam = searchParams.get("delete_packing_service")
    if (deleteParam) {
      setDeleteId(Number(deleteParam))
      setOpen(true)
    }
  }, [searchParams])

  const { mutate: deletePackingTypeMutation, isPending } = useDeletePackingType(
    {
      onSuccess: () => {
        toast.success("Packing service deleted")
        handleCancel()
      },
    }
  )

  function handleCancel() {
    setOpen(false)
    setDeleteId(null)
    setSearchParams()
  }

  if (!packingType) return null

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete packing service?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete <strong>{packingType?.name}.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={isPending}
            variant="destructive"
            onClick={() => {
              deletePackingTypeMutation({ id: packingType.id })
            }}
          >
            <LoadingSwap isLoading={isPending}>
              Delete packing service
            </LoadingSwap>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
