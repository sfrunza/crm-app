import { useOpenRequestsStore } from "@/stores/use-open-requests-store";
import { XIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export function MinimizedRequestsBar() {
  const entries = useOpenRequestsStore((s) => s.entries);
  const activeId = useOpenRequestsStore((s) => s.activeId);
  const open = useOpenRequestsStore((s) => s.open);
  const close = useOpenRequestsStore((s) => s.close);

  // Only show entries that are minimized (not the active overlay)
  const minimized = entries.filter((e) => e.id !== activeId);

  if (minimized.length === 0) return null;

  return (
    <div className="bg-background absolute right-0 bottom-0 left-0 z-20 border-t">
      <ScrollArea className="w-full">
        <div className="flex items-center gap-1.5 px-3 py-1.5">
          {minimized.map((req) => (
            <div
              key={req.id}
              className="bg-muted hover:bg-accent group flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md py-1 pr-1 pl-2.5 text-xs font-medium shadow-sm transition-colors"
              onClick={() => open(req.id)}
            >
              <span className="max-w-32 truncate">
                {req.customerName || "Loading..."}
              </span>
              <span className="text-muted-foreground">#{req.id}</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-0.5 size-5 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  close(req.id);
                }}
              >
                <XIcon className="size-3" />
              </Button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
