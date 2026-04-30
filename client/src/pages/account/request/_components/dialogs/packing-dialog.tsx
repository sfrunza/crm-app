import { z } from "zod";

import { Button } from "@/components/ui/button";
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
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { usePackingTypes } from "@/hooks/api/use-packing-types";
import type { PackingType } from "@/types/index";
import { requestKeys } from "@/domains/requests/request.keys";
import { useUpdateRequest } from "@/domains/requests/request.mutations";
import { queryClient } from "@/lib/query-client";
import { PencilLineIcon } from "@/components/icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  packing_type_id: z.string(),
});

export type Inputs = z.infer<typeof formSchema>;

export function PackingDialog({
  requestId,
  packingTypeId,
}: {
  requestId: number;
  packingTypeId: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: packingTypes } = usePackingTypes();

  const [selectedPackingType, setSelectedPackingType] = useState<
    PackingType | undefined
  >(undefined);

  useEffect(() => {
    if (packingTypeId) {
      setSelectedPackingType(
        packingTypes?.find((p) => p.id === packingTypeId) ?? undefined
      );
    }
  }, [packingTypeId, packingTypes]);

  const { mutate: updateRequestMutation, isPending: isUpdating } =
    useUpdateRequest(
      {
        onSettled: (_, error) => {
          if (error) {
            toast.error("Failed to save packing service");
          } else {
            queryClient.invalidateQueries({
              queryKey: requestKeys.detail(requestId),
            });
            toast.success("Packing service saved");
            handleSuccessClose();
          }
        },
      },
      { forceCalculate: true }
    );

  function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!selectedPackingType) return;

    updateRequestMutation({
      id: requestId,
      data: { packing_type_id: selectedPackingType?.id ?? 0 },
    });
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
  }

  function handleSuccessClose() {
    setIsOpen(false);
  }

  function handlePackingTypeChange(packingTypeId: string) {
    if (packingTypeId === "") return;

    const selectedPackingType = packingTypes?.find(
      (packingType) => packingType.id === parseInt(packingTypeId)
    );

    if (selectedPackingType) {
      setSelectedPackingType(selectedPackingType);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <PencilLineIcon />
          Edit packing
        </Button>
      </DialogTrigger>
      <DialogContent className="px-0 sm:max-w-lg">
        <DialogHeader className="px-6">
          <DialogTitle>Packing service</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-14rem)]">
          <form onSubmit={onSubmit} id="packing-form" className="px-6">
            <RadioGroup
              value={selectedPackingType?.id.toString() ?? ""}
              onValueChange={handlePackingTypeChange}
            >
              {packingTypes?.map((p) => (
                <FieldLabel key={p.id} htmlFor={p.id.toString()}>
                  <Field orientation="horizontal">
                    <FieldContent>
                      <div className="font-medium">{p.name}</div>
                    </FieldContent>
                    <RadioGroupItem
                      value={p.id.toString()}
                      id={p.id.toString()}
                    />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
            <FieldGroup className="mt-4">
              <Field>
                <FieldContent>
                  <FieldLabel htmlFor="packing-description">
                    Description
                  </FieldLabel>
                </FieldContent>
                <div
                  id="packing-description"
                  dangerouslySetInnerHTML={{
                    __html: selectedPackingType?.description ?? "",
                  }}
                  className="prose-sm rounded-md border p-4 prose-neutral"
                />
              </Field>
            </FieldGroup>
          </form>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <DialogFooter className="px-6">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="packing-form" disabled={isUpdating}>
            <LoadingSwap isLoading={isUpdating}>Save</LoadingSwap>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
