import {
  PageAction,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page-component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { queryClient } from "@/lib/query-client";
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { PlusIcon } from "@/components/icons";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { DeleteServiceDialog } from "./delete-service-dialog";
import { ServiceFormSheet } from "./service-form-sheet";
import { ServicesTable } from "./services-table";
import { useServices, useUpdateService } from "@/hooks/api/use-services";
import type { Service } from "@/types/index";

function ServicesPage() {
  const [_, setSearchParams] = useSearchParams();
  const { data: services, isLoading, error } = useServices();
  const [items, setItems] = useState<Service[]>(services ?? []);

  useEffect(() => {
    setItems(services ?? []);
  }, [services]);

  const { mutate: updateServiceMutatuon } = useUpdateService({
    onSettled: (_, error) => {
      if (error) {
        queryClient.cancelQueries({ queryKey: ["services"] });
        setItems(services ?? []);
      } else {
        queryClient.invalidateQueries({ queryKey: ["services"] });
      }
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
        updateServiceMutatuon({
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
      <ServiceFormSheet />
      <DeleteServiceDialog />

      <PageHeader className="border-b">
        <PageTitle>Moving services</PageTitle>
        <PageAction>
          <Button
            size="sm"
            onClick={() => {
              setSearchParams({ create_service: "true" });
            }}
          >
            <PlusIcon />
            Create service
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

        {/* Services table */}
        {services && (
          <ServicesTable services={items} handleDragEnd={handleDragEnd} />
        )}
      </PageContent>
    </Fragment>
  );
}

export const Component = ServicesPage;
