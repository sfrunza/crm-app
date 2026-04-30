import { cn } from "@/lib/utils";
import type { InventoryRoom } from "./build-inventory";
import { Badge } from "@/components/ui/badge";
import {
  ChatInfo,
  ChatInfoContent,
  ChatInfoDescription,
  ChatInfoHeader,
  ChatInfoTitle,
} from "@/components/chat-info/chat-info";

export function RoomRow({
  room,
  active,
  onClick,
}: {
  room: InventoryRoom;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mb-2 flex w-full items-center justify-between rounded-lg border text-left transition",
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40 hover:bg-primary/5",
      )}
    >
      <ChatInfo>
        <div className="h-auto w-10 shrink-0">
          {room.image_url && (
            <img
              src={room.image_url}
              alt={room.name}
              className="h-full w-full object-contain"
            />
          )}
        </div>
        <ChatInfoContent>
          <ChatInfoHeader>
            <ChatInfoTitle>
              <div className="flex items-center gap-2">
                <p className="text-foreground truncate text-sm font-medium">
                  {room.name}
                </p>
                {room.is_suggested && (
                  <Badge
                    variant="outline"
                    className="text-muted-foreground h-5 px-1.5 text-[10px]"
                  >
                    suggested
                  </Badge>
                )}
                {room.is_custom && (
                  <Badge
                    variant="outline"
                    className="text-muted-foreground h-5 px-1.5 text-[10px]"
                  >
                    custom
                  </Badge>
                )}
              </div>
            </ChatInfoTitle>
            <ChatInfoDescription>
              {room.totals.volume} cu ft
            </ChatInfoDescription>
          </ChatInfoHeader>
        </ChatInfoContent>
      </ChatInfo>
      {/* <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-foreground truncate text-sm font-medium">
            {room.name}
          </p>
          {room.is_suggested && (
            <Badge
              variant="outline"
              className="text-muted-foreground h-5 px-1.5 text-[10px]"
            >
              suggested
            </Badge>
          )}
          {room.is_custom && (
            <Badge
              variant="outline"
              className="text-muted-foreground h-5 px-1.5 text-[10px]"
            >
              custom
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          {room.totals.volume} cu ft
        </p>
      </div> */}

      <div className="p-2.5">
        <Badge variant="outline">{room.totals.items}</Badge>
      </div>
    </button>
  );
}
