import { PageAction, PageHeader, PageTitle } from "@/components/page-component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PlusIcon } from "@/components/icons";
import { useSearchParams } from "react-router";
import { DeleteEntranceTypeDialog } from "./delete-entrance-type-dialog";
import { EntranceTypeFormSheet } from "./entrance-type-form-sheet";
import { EntranceTypesTable } from "./entrance-types-table";
import { useEffect, useMemo, useState } from "react";
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  useEntranceTypes,
  useUpdateEntranceType,
} from "@/hooks/api/use-entrance-types";
import type { EntranceType } from "@/types/index";

export function EntranceTypes() {
  const [_, setSearchParams] = useSearchParams();
  const { data: entranceTypes, isLoading, error } = useEntranceTypes();
  const [items, setItems] = useState<EntranceType[]>(entranceTypes ?? []);

  useEffect(() => {
    setItems(entranceTypes ?? []);
  }, [entranceTypes]);

  const { mutate: updateEntranceTypeMutation } = useUpdateEntranceType({
    onError: () => {
      setItems(entranceTypes ?? []);
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
        updateEntranceTypeMutation({
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
      <EntranceTypeFormSheet />
      <DeleteEntranceTypeDialog />

      <PageHeader className="border-b">
        <PageTitle>Entrance types</PageTitle>
        <PageAction>
          <Button
            size="sm"
            onClick={() => {
              setSearchParams({ create_entrance_type: "true" });
            }}
          >
            <PlusIcon />
            Create entrance type
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
      {entranceTypes && (
        <EntranceTypesTable
          entranceTypes={items}
          handleDragEnd={handleDragEnd}
        />
      )}
    </div>
  );
}
