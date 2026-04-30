import { PageAction, PageHeader, PageTitle } from "@/components/page-component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  usePackingItems,
  useUpdatePackingItem,
} from "@/hooks/api/use-packing-items";
import type { PackingItem } from "@/types/index";
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { PlusIcon } from "@/components/icons";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { DeletePackingItemDialog } from "./delete-packing-item-dialog";
import { PackingItemFormSheet } from "./packing-item-form-sheet";
import { PackingItemsTable } from "./packing-item-table";

export function PackingItems() {
  const [_, setSearchParams] = useSearchParams();
  const { data: packingItems, isLoading, error } = usePackingItems();
  const [items, setItems] = useState<PackingItem[]>(packingItems ?? []);

  useEffect(() => {
    setItems(packingItems ?? []);
  }, [packingItems]);

  const { mutate: updatePackingItemMutation } = useUpdatePackingItem({
    onError: () => {
      setItems(packingItems ?? []);
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
        updatePackingItemMutation({
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
      <PackingItemFormSheet />
      <DeletePackingItemDialog />

      <PageHeader className="border-b">
        <PageTitle>Packing supplies</PageTitle>
        <PageAction>
          <Button
            size="sm"
            onClick={() => {
              setSearchParams({ create_packing_supply: "true" });
            }}
          >
            <PlusIcon />
            Create supply
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
      {packingItems && (
        <PackingItemsTable packingItems={items} handleDragEnd={handleDragEnd} />
      )}
    </div>
  );
}
