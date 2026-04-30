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
  useDeletePackingItem,
  usePackingItems,
} from "@/hooks/api/use-packing-items"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

export function DeletePackingItemDialog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: packingItems } = usePackingItems()

  const packingItem = useMemo(
    () => packingItems?.find((p) => p.id === deleteId),
    [packingItems, deleteId]
  )

  useEffect(() => {
    const deleteParam = searchParams.get("delete_packing_supply")
    if (deleteParam) {
      setDeleteId(Number(deleteParam))
      setOpen(true)
    }
  }, [searchParams])

  const { mutate: deletePackingItemMutation, isPending } = useDeletePackingItem(
    {
      onSuccess: () => {
        toast.success("Packing supply deleted")
        handleCancel()
      },
    }
  )

  function handleCancel() {
    setOpen(false)
    setDeleteId(null)
    setSearchParams()
  }

  if (!packingItem) return null

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete packing supply?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete <strong>{packingItem?.name}.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={isPending}
            variant="destructive"
            onClick={() => {
              deletePackingItemMutation({ id: packingItem.id })
            }}
          >
            <LoadingSwap isLoading={isPending}>
              Delete packing supply
            </LoadingSwap>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
