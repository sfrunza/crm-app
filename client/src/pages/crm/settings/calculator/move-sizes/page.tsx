import { PageAction, PageHeader, PageTitle } from "@/components/page-component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { PlusIcon } from "@/components/icons";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { DeleteMoveSizeDialog } from "./delete-move-size-dialog";
import { MoveSizeFormSheet } from "./move-size-form-sheet";
import { MoveSizesTable } from "./move-size-table";
import { useMoveSizes, useUpdateMoveSize } from "@/hooks/api/use-move-sizes";
import type { MoveSize } from "@/types/index";

export function MoveSizes() {
  const [_, setSearchParams] = useSearchParams();
  const { data: moveSizes, isLoading, error } = useMoveSizes();
  const [items, setItems] = useState<MoveSize[]>(moveSizes ?? []);

  useEffect(() => {
    setItems(moveSizes ?? []);
  }, [moveSizes]);

  const { mutate: updateMoveSizeMutation } = useUpdateMoveSize({
    onError: () => {
      setItems(moveSizes ?? []);
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
        updateMoveSizeMutation({
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
      <MoveSizeFormSheet />
      <DeleteMoveSizeDialog />

      <PageHeader className="border-b">
        <PageTitle>Move sizes</PageTitle>
        <PageAction>
          <Button
            size="sm"
            onClick={() => {
              setSearchParams({ create_move_size: "true" });
            }}
          >
            <PlusIcon />
            Create move size
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

      {/* Move sizes table */}
      {moveSizes && (
        <MoveSizesTable moveSizes={items} handleDragEnd={handleDragEnd} />
      )}
    </div>
  );
}
