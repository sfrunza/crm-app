import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLineIcon } from "@/components/icons";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestKeys } from "@/domains/requests/request.keys";
import { useUpdateRequest } from "@/domains/requests/request.mutations";
import { queryClient } from "@/lib/query-client";
import { useState } from "react";
import { toast } from "sonner";
import { useMoveSizes } from "@/hooks/api/use-move-sizes";
import type { MoveSize } from "@/types/index";

const formSchema = z.object({
  move_size_id: z.string(),
});

export type Inputs = z.infer<typeof formSchema>;

export function MoveSizeDialog({
  requestId,
  moveSize,
}: {
  requestId: number;
  moveSize: MoveSize | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: moveSizes } = useMoveSizes();

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    values: { move_size_id: moveSize?.id?.toString() ?? "" },
  });

  const { mutate: updateRequestMutation, isPending: isUpdating } =
    useUpdateRequest(
      {
        onSettled: (_, error) => {
          if (error) {
            toast.error("Failed to save move size");
          } else {
            queryClient.invalidateQueries({
              queryKey: requestKeys.detail(requestId),
            });
            toast.success("Move size saved");
            handleSuccessClose();
          }
        },
      },
      { forceCalculate: true }
    );

  function onSubmit(values: Inputs) {
    updateRequestMutation({
      id: requestId,
      data: { move_size_id: parseInt(values.move_size_id) },
    });
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      form.reset({ move_size_id: moveSize?.id?.toString() ?? "" });
    }
  }

  function handleSuccessClose() {
    setIsOpen(false);
    form.reset({ move_size_id: moveSize?.id?.toString() ?? "" });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <PencilLineIcon />
          Edit move size
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move size</DialogTitle>
          <DialogDescription>
            The Quote will be calculated based on the move size selected.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} id="edit_move_size">
          <FieldGroup>
            <Controller
              name="move_size_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="sr-only">
                    Move size
                  </FieldLabel>
                  <Select
                    key={field.value}
                    name={field.name}
                    value={field.value.toString()}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      id={field.name}
                    >
                      <SelectValue placeholder="Select a move size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {moveSizes?.map((moveSize) => (
                          <SelectItem
                            key={moveSize.id}
                            value={moveSize.id.toString()}
                          >
                            {moveSize.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="edit_move_size" disabled={isUpdating}>
            <LoadingSwap isLoading={isUpdating}>Save</LoadingSwap>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
