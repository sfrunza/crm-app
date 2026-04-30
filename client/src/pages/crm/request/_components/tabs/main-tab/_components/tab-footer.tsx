import { CalendarIcon, SquareArrowOutUpRightIcon } from "@/components/icons";

import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/button";
import { useRequest } from "@/hooks/use-request";
import { formatDate } from "@/lib/format-date";

export function TabFooter() {
  const { draft } = useRequest();

  return (
    <div className="flex w-full flex-col justify-between gap-4 *:grow md:flex-row">
      <div
        className={cn(
          buttonVariants({
            variant: "ghost",
          }),
          "flex h-full flex-col gap-2 p-4",
        )}
      >
        <div className="text-muted-foreground flex items-center gap-4">
          <SquareArrowOutUpRightIcon className="size-4" />
          <p>Source</p>
        </div>
        <p>{"--"}</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 p-4 text-sm">
        <div className="text-muted-foreground flex items-center gap-4">
          <CalendarIcon className="size-4" />
          <p>Created at</p>
        </div>
        <p>{formatDate(draft?.created_at || new Date(), "Pp")}</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 p-4 text-sm">
        <div className="text-muted-foreground flex items-center gap-4">
          <CalendarIcon className="size-4" />
          <p>Updated at</p>
        </div>
        <p>{formatDate(draft?.updated_at || new Date(), "Pp")}</p>
      </div>
    </div>
  );
}
