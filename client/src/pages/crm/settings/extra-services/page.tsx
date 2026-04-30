import {
  PageAction,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page-component";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/icons";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { DeleteExtraServiceDialog } from "./delete-extra-service-dialog";
import { ExtraServiceFormSheet } from "./extra-service-form-sheet";
import { ExtraServicesTable } from "./extra-services-table";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { Spinner } from "@/components/ui/spinner";
import {
  useExtraServices,
  useUpdateExtraService,
} from "@/hooks/api/use-extra-services";
import type { ExtraService } from "@/types/index";

function ExtraServicesPage() {
  const [_, setSearchParams] = useSearchParams();
  const { data: extraServices, isLoading, error } = useExtraServices();
  const [items, setItems] = useState<ExtraService[]>(extraServices ?? []);

  useEffect(() => {
    setItems(extraServices ?? []);
  }, [extraServices]);

  const { mutate: updateExtraServiceMutatuon } = useUpdateExtraService();

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
        updateExtraServiceMutatuon({
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
      <ExtraServiceFormSheet />
      <DeleteExtraServiceDialog />

      <PageHeader className="border-b">
        <PageTitle>Extra services</PageTitle>
        <PageAction>
          <Button
            size="sm"
            onClick={() => {
              setSearchParams({ create_extra_service: "true" });
            }}
          >
            <PlusIcon />
            Create extra service
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
        {/* Extra services table */}
        {extraServices && (
          <ExtraServicesTable
            extraServices={items}
            handleDragEnd={handleDragEnd}
          />
        )}
      </PageContent>
    </Fragment>
  );
}

export const Component = ExtraServicesPage;
