import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { useRequest } from "@/hooks/use-request";
import { requestKeys } from "@/domains/requests/request.keys";
import { queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUpdateRequest } from "@/domains/requests/request.mutations";

export function UpdateRequestButton() {
  const { draft, unsaved, clear, isDirty } = useRequest();

  const { mutate: updateRequestMutation, isPending } = useUpdateRequest({
    onSettled: (data, error) => {
      if (error) {
        if (draft?.id) {
          queryClient.cancelQueries({ queryKey: requestKeys.detail(draft.id) });
        }
      }
      if (data) {
        clear();
        queryClient.setQueryData(requestKeys.detail(data.id), data);
        toast.success("Request updated");
      }
    },
  });

  return (
    <div className="max-lg:fixed max-lg:right-4 max-lg:bottom-6 max-lg:z-50">
      <Button
        size="lg"
        onClick={() => {
          if (!draft) return;
          updateRequestMutation({ id: draft.id, data: unsaved });
        }}
        disabled={!isDirty || isPending}
        className={cn("transition-opacity duration-500", {
          invisible: !isDirty,
        })}
      >
        <LoadingSwap
          isLoading={isPending}
          className={cn("transition-opacity duration-500", {
            invisible: !isDirty,
          })}
        >
          Update request
        </LoadingSwap>
      </Button>
    </div>
  );
}
