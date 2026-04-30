import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  storageIcons,
  type StorageIconKey,
} from "@/domains/requests/request.constants";
import { requestKeys } from "@/domains/requests/request.keys";
import { useUnpairRequests } from "@/domains/requests/request.mutations";
import type { Service } from "@/types/index";
import { formatDate } from "@/lib/format-date";
import { queryClient } from "@/lib/query-client";
import { Trash2Icon } from "@/components/icons";
import { toast } from "sonner";
import { openRequest } from "@/stores/use-open-requests-store";

interface PairedRequestInfoProps {
  currentRequestId: number;
  service: Service;
  pairedRequestId: number | null;
  movingDate: string | null | undefined;
  type: "in" | "out";
}

export function PairedRequestInfo({
  currentRequestId,
  service,
  pairedRequestId,
  movingDate,
  type,
}: PairedRequestInfoProps) {
  const { mutate: unpairRequestsMutation, isPending: isUnpairing } =
    useUnpairRequests({
      onSettled: (data, error) => {
        if (error) {
          queryClient.cancelQueries({ queryKey: requestKeys.lists() });
        }
        if (data) {
          queryClient.invalidateQueries({
            queryKey: requestKeys.lists(),
          });

          queryClient.invalidateQueries({
            queryKey: requestKeys.statusCounts(),
          });
          // queryClient.setQueryData(requestKeys.detail(data.id), data);
        }
      },
    });

  async function handleDisconnectRequests() {
    if (!pairedRequestId) {
      toast.error("Paired request ID is missing.");
      return;
    }
    unpairRequestsMutation({
      requestId: currentRequestId,
      pairedRequestId: pairedRequestId,
    });
  }

  return (
    <div className="flex justify-between gap-2">
      <div className="relative flex-1 space-y-1 text-sm">
        <p className="font-semibold">Company storage</p>
        <Button
          variant="link"
          className="px-0"
          onClick={() => pairedRequestId && openRequest(pairedRequestId)}
        >
          Request #{pairedRequestId}
        </Button>
        <p className="text-muted-foreground">
          Move {type} date: {movingDate && formatDate(movingDate, "MM/dd/yyyy")}
        </p>
        <img
          src={storageIcons[service.name as StorageIconKey]}
          className="absolute top-0 right-0 size-10"
        />
      </div>
      <Button
        size="icon"
        variant="ghost"
        disabled={isUnpairing}
        onClick={handleDisconnectRequests}
      >
        <LoadingSwap isLoading={isUnpairing}>
          <Trash2Icon />
        </LoadingSwap>
      </Button>
    </div>
  );
}
