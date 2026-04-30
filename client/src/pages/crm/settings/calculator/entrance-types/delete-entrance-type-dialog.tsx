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
  useDeleteEntranceType,
  useEntranceTypes,
} from "@/hooks/api/use-entrance-types"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

export function DeleteEntranceTypeDialog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: entranceTypes } = useEntranceTypes()
  const entranceType = useMemo(
    () => entranceTypes?.find((p) => p.id === deleteId),
    [entranceTypes, deleteId]
  )

  useEffect(() => {
    const deleteParam = searchParams.get("delete_entrance_type")
    if (deleteParam) {
      setDeleteId(Number(deleteParam))
      setOpen(true)
    }
  }, [searchParams])

  const { mutate: deleteEntranceTypeMutation, isPending } =
    useDeleteEntranceType({
      onSuccess: () => {
        toast.success("Entrance type deleted")
        handleCancel()
      },
    })

  function handleCancel() {
    setOpen(false)
    setDeleteId(null)
    setSearchParams()
  }

  if (!entranceType) return null

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete entrance type?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete <strong>{entranceType?.name}.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={isPending}
            variant="destructive"
            onClick={() => {
              deleteEntranceTypeMutation({ id: entranceType.id })
            }}
          >
            <LoadingSwap isLoading={isPending}>Delete</LoadingSwap>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
