import {
  STATUS_SOFT_BG_COLOR,
  STATUS_TEXT_COLOR,
  statusesMap,
} from "@/lib/constants";
import { useRequest } from "@/hooks/use-request";
import { cn } from "@/lib/utils";

export function StatusCard() {
  const { request } = useRequest();

  if (!request) return null;
  return (
    <div
      className={cn(
        "relative rounded-xl px-4 py-3",
        STATUS_SOFT_BG_COLOR[request.status]
      )}
    >
      <div
        className={cn(
          "grid grid-cols-2 items-center justify-center text-sm md:grid-cols-[1fr_auto_1fr]",
          STATUS_TEXT_COLOR[request.status]
        )}
      >
        <div>
          <p className="font-bold">Request #{request.id}</p>
          <p>{request.service?.name}</p>
        </div>
        <p className="text-end text-xl font-bold tracking-tight max-md:text-end">
          {statusesMap[request.status]}
        </p>
      </div>
    </div>
  );
}
