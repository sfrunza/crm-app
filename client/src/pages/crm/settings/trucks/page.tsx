import {
  PageAction,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page-component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { PlusIcon } from "@/components/icons";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { TruckFormSheet } from "./truck-form-sheet";
import { TrucksTable } from "./trucks-table";
import { useTrucks, useUpdateTruck } from "@/hooks/api/use-trucks";
import type { Truck } from "@/types/index";

function TrucksPage() {
  const [_, setSearchParams] = useSearchParams();
  const { data: trucks, isLoading, error } = useTrucks();
  const [items, setItems] = useState<Truck[]>(trucks ?? []);

  useEffect(() => {
    setItems(trucks ?? []);
  }, [trucks]);

  const { mutate: updateTruckMutatuon } = useUpdateTruck();

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
        updateTruckMutatuon({
          id: activeItem.id,
          data: {
            position: dataIds.indexOf(over.id),
          },
        });
      }
    }
  }

  return (
    <Fragment>
      {/* Actions based on search params */}
      <TruckFormSheet />

      <PageHeader className="border-b">
        <PageTitle>Trucks</PageTitle>
        <PageAction>
          <Button
            size="sm"
            onClick={() => {
              setSearchParams({ create_truck: "true" });
            }}
          >
            <PlusIcon />
            Create truck
          </Button>
        </PageAction>
      </PageHeader>

      <PageContent>
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

        {/* Truck table */}
        {trucks && <TrucksTable trucks={items} handleDragEnd={handleDragEnd} />}
      </PageContent>
    </Fragment>
  );
}

export const Component = TrucksPage;
