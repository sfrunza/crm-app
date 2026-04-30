import { DetailsForm } from "@/components/request/details-form";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { requestKeys } from "@/domains/requests/request.keys";
import { useUpdateRequest } from "@/domains/requests/request.mutations";
import type { Request } from "@/domains/requests/request.types";
import { useRequest } from "@/hooks/use-request";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";

export function DetailsTab() {
  const { draft, clear } = useRequest();

  if (!draft) return null;

  const { mutate: updateRequestMutation, isPending: isUpdating } =
    useUpdateRequest({
      onSettled: (data, error) => {
        if (error) {
          if (draft?.id) {
            queryClient.cancelQueries({
              queryKey: requestKeys.detail(draft.id),
            });
          }
        }
        if (data) {
          // update store
          clear();
          queryClient.setQueryData(requestKeys.detail(data.id), data);
          toast.success("Details saved");
        }
      },
    });

  function handleSave(values: Request["details"]) {
    if (!draft) return;
    updateRequestMutation({
      id: draft.id,
      data: {
        details: values,
      },
    });
  }

  return (
    <div className="p-6">
      <h3 className="mb-6 text-lg font-semibold">Additional questions</h3>
      <DetailsForm
        formId="details-form"
        details={draft?.details}
        onSave={handleSave}
      />
      <div className="mt-6 flex justify-end gap-2">
        <Button type="submit" form="details-form" disabled={isUpdating}>
          <LoadingSwap isLoading={isUpdating}>Save changes</LoadingSwap>
        </Button>
      </div>
    </div>
  );
}
