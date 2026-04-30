import { DetailsForm } from "@/components/request/details-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { requestKeys } from "@/domains/requests/request.keys";
import { useUpdateRequest } from "@/domains/requests/request.mutations";
import type { Request } from "@/domains/requests/request.types";
import { useRequest } from "@/hooks/use-request";
import { queryClient } from "@/lib/query-client";
import { useState } from "react";
import { toast } from "sonner";

export function AdditionalDetailsCard() {
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const { request } = useRequest();

  if (!request) return null;

  const canEdit = request.can_edit_request;

  const { mutate: updateRequestMutation, isPending: isUpdating } =
    useUpdateRequest(
      {
        onSettled: (_, error) => {
          if (error) {
            toast.error("Failed to save details");
          } else {
            queryClient.invalidateQueries({
              queryKey: requestKeys.detail(request.id),
            });
            toast.success("Details saved");
          }
        },
      },
      { forceCalculate: true },
    );

  function onSave(details: Request["details"]) {
    if (!request || !canEdit) return;

    updateRequestMutation({
      id: request.id,
      data: { details },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional details</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailsForm
          formId="details-form"
          details={request.details}
          onSave={onSave}
          disabled={!canEdit}
          setHasChanges={setHasChanges}
        />
      </CardContent>
      <CardFooter className="h-9 justify-end">
        {hasChanges && (
          <Button
            type="submit"
            form="details-form"
            disabled={isUpdating || !canEdit}
          >
            <LoadingSwap isLoading={isUpdating}>Save changes</LoadingSwap>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
