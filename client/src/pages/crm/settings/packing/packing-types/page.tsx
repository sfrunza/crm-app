import { PageAction, PageHeader, PageTitle } from "@/components/page-component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  usePackingTypes,
  useUpdatePackingType,
} from "@/hooks/api/use-packing-types";
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { PlusIcon } from "@/components/icons";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { DeletePackingTypeDialog } from "./delete-packing-type-dialog";
import { PackingTypeFormSheet } from "./packing-type-form-sheet";
import { PackingTypesTable } from "./packing-type-table";
import type { PackingType } from "@/types/index";

export function PackingTypes() {
  const [_, setSearchParams] = useSearchParams();
  const { data: packingTypes, isLoading, error } = usePackingTypes();
  const [items, setItems] = useState<PackingType[]>(packingTypes ?? []);

  useEffect(() => {
    setItems(packingTypes ?? []);
  }, [packingTypes]);

  const { mutate: updatePackingTypeMutation } = useUpdatePackingType({
    onError: () => {
      setItems(packingTypes ?? []);
    },
  });

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => items?.map(({ id }) => id) || [],
    [items]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setItems((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });

      const activeItem = items.find((item) => item.id === active.id);

      if (activeItem) {
        updatePackingTypeMutation({
          id: activeItem.id,
          data: {
            position: dataIds.indexOf(over.id),
          },
        });
      }
    }
  }

  return (
    <div>
      {/* Actions based on search params */}
      <PackingTypeFormSheet />
      <DeletePackingTypeDialog />

      <PageHeader className="border-b">
        <PageTitle>Packing services</PageTitle>
        <PageAction>
          <Button
            size="sm"
            onClick={() => {
              setSearchParams({ create_packing_service: "true" });
            }}
          >
            <PlusIcon />
            Create packing service
          </Button>
        </PageAction>
      </PageHeader>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center px-4 py-28">
          <Spinner />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-center px-4 py-28">
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      )}

      {/* Service table */}
      {packingTypes && (
        <PackingTypesTable packingTypes={items} handleDragEnd={handleDragEnd} />
      )}
    </div>
  );
}
