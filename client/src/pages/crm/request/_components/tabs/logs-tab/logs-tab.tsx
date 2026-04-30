import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useGetRequestLogs } from "@/domains/request-logs/request-log.queries";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useRequest } from "@/hooks/use-request";
import { LogsIcon, MessageCircleIcon, UserIcon } from "@/components/icons";
import { LogEntry } from "./log-entry";
import { formatGroupDate, groupLogsByDate } from "./log-utils";

const OBSERVER_OPTIONS: IntersectionObserverInit = { threshold: 0.1 };

export function LogsTab() {
  const { request } = useRequest();
  const requestId = request?.id;

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetRequestLogs(requestId!);

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    observerOptions: OBSERVER_OPTIONS,
  });

  if (!requestId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">No request selected.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-destructive text-sm">
          Failed to load activity logs.
        </p>
      </div>
    );
  }

  const allLogs = data?.pages.flatMap((page) => page.logs) ?? [];
  const grouped = groupLogsByDate(allLogs);

  if (allLogs.length === 0) {
    return (
      <div className="h-[calc(100svh-15rem)] md:h-[calc(100svh-9rem)]">
        <div className="flex h-full items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LogsIcon />
              </EmptyMedia>
              <EmptyDescription>
                No messages yet. Start the conversation.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100svh-15rem)] md:h-[calc(100svh-9rem)]">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Activity Log</h3>
            <p className="text-muted-foreground text-sm">
              {data?.pages[0]?.pagination.total_count ?? 0} total events
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <UserIcon className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-muted-foreground">Tracking all changes</span>
          </div>
        </div>

        {allLogs.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleIcon />
              </EmptyMedia>
            </EmptyHeader>
          </Empty>
        )}

        {/* Timeline */}
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.date}>
              {/* Date header */}
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-border h-px flex-1" />
                <span className="text-muted-foreground shrink-0 text-xs font-medium">
                  {formatGroupDate(group.date)}
                </span>
                <div className="bg-border h-px flex-1" />
              </div>

              {/* Entries */}
              <div className="divide-y">
                {group.logs.map((log) => (
                  <LogEntry key={log.id} log={log} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        )}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
