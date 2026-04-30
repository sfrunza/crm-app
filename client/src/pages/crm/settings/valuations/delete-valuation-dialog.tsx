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
import { useDeleteValuation, useValuations } from "@/hooks/api/use-valuations"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

export function DeleteValuationDialog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: valuations } = useValuations()

  const valuation = useMemo(
    () => valuations?.find((p) => p.id === deleteId),
    [valuations, deleteId]
  )

  useEffect(() => {
    const deleteParam = searchParams.get("delete_valuation")
    if (deleteParam) {
      setDeleteId(Number(deleteParam))
      setOpen(true)
    }
  }, [searchParams])

  const { mutate: deleteValuationMutation, isPending } = useDeleteValuation({
    onSuccess: () => {
      toast.success("Valuation deleted")
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
          <AlertDialogTitle>Delete valuation</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete <b>{valuation?.name}.</b> Valuation that have
            already been used cannot be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={isPending}
            variant="destructive"
            onClick={() => {
              if (valuation) {
                deleteValuationMutation({ id: valuation.id })
              }
            }}
          >
            <LoadingSwap isLoading={isPending}>Delete valuation</LoadingSwap>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
