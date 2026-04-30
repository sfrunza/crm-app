import { MessagesFeed } from "@/components/messages-feed";
import { useRequest } from "@/hooks/use-request";

export function MessagesTab() {
  const { request } = useRequest();
  const requestId = request?.id;

  if (!requestId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">No request selected.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100svh-16rem)] md:h-[calc(100svh-10rem)]">
      <MessagesFeed requestId={requestId} status={request.status} />
    </div>
  );
}
