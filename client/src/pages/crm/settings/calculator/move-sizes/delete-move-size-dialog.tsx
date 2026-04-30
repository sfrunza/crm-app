import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { useDeleteMoveSize, useMoveSizes } from "@/hooks/api/use-move-sizes";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

export function DeleteMoveSizeDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: moveSizes } = useMoveSizes();

  const moveSize = useMemo(
    () => moveSizes?.find((m) => m.id === deleteId),
    [moveSizes, deleteId],
  );

  useEffect(() => {
    const deleteParam = searchParams.get("delete_move_size");
    if (deleteParam) {
      setDeleteId(Number(deleteParam));
      setOpen(true);
    }
  }, [searchParams]);

  const { mutate: deleteMoveSizeMutation, isPending } = useDeleteMoveSize({
    onSuccess: () => {
        toast.success("Move size deleted");
        handleCancel();
    },
  });

  function handleCancel() {
    setOpen(false);
    setDeleteId(null);
    setSearchParams();
  }

  if (!moveSize) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete move size?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete <strong>{moveSize?.name}.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={isPending}
            variant="destructive"
            onClick={() => {
              deleteMoveSizeMutation({ id: moveSize.id });
            }}
          >
            <LoadingSwap isLoading={isPending}>Delete</LoadingSwap>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
