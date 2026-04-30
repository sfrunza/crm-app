import { PageContainer, PageContent } from "@/components/page-component";
import { Spinner } from "@/components/ui/spinner";
import { NavigationTabs } from "./_components/navigation-tabs";
import { RequestHeader } from "./_components/request-header";
import { useRequest } from "@/hooks/use-request";
import { useOpenRequestsStore } from "@/stores/use-open-requests-store";
import { useRequestStore } from "@/stores/use-request-store";
import { useEffect } from "react";
import type { Request } from "@/domains/requests/request.types";

type RequestPageProps = {
  requestId: number;
};

export function RequestPage({ requestId }: RequestPageProps) {
  const { request, isPending, isError, error } = useRequest(requestId);
  const updateMeta = useOpenRequestsStore((s) => s.updateMeta);

  // Restore unsaved edits from the overlay store on mount.
  // Runs AFTER useRequest's setRequestId effect clears unsaved,
  // because hook effects fire before component effects.
  useEffect(() => {
    const entry = useOpenRequestsStore
      .getState()
      .entries.find((r) => r.id === requestId);
    if (entry?.unsaved && Object.keys(entry.unsaved).length > 0) {
      const { setField } = useRequestStore.getState();
      for (const [key, value] of Object.entries(entry.unsaved)) {
        setField(key as keyof Request, value as Request[keyof Request]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only once on mount (key prop forces remount on switch)

  // Sync display metadata when API data loads or changes
  useEffect(() => {
    if (request) {
      updateMeta(request.id, {
        customerName: request.customer
          ? `${request.customer.first_name} ${request.customer.last_name}`
          : "No customer",
      });
    }
  }, [request, updateMeta]);

  if (isPending) {
    return (
      <PageContainer>
        <PageContent>
          <div className="container mx-auto flex items-center justify-center pt-24">
            <Spinner />
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <PageContent>
          <div className="container mx-auto flex items-center justify-center pt-24">
            <div className="text-muted-foreground text-sm">
              {error?.message || "Failed to load request"}
            </div>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  if (!request) {
    return (
      <PageContainer>
        <PageContent>
          <div className="container mx-auto flex items-center justify-center pt-24">
            <div className="text-muted-foreground text-sm">
              Request not found
            </div>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <div className="bg-background mx-auto mt-6 w-full max-w-7xl flex-1 rounded-t-2xl shadow-lg">
      <RequestHeader />
      <NavigationTabs />
    </div>
  );
}
