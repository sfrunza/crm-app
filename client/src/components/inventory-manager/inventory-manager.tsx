import {
  ChatInfo,
  ChatInfoContent,
  ChatInfoDescription,
  ChatInfoHeader,
  ChatInfoTitle,
} from "@/components/chat-info/chat-info"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Room } from "@/domains/rooms/room.types"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "@/components/icons"

export type InventoryManagerProps = {
  variant: "admin" | "request"
  rooms: Room[] | undefined
  isLoading: boolean
  selectedRoomId: number | null
  onSelectRoom: (roomId: string | number) => void
  renderRoomAction?: (room: Room) => React.ReactNode
  /** Called when "Add room" / "Add custom room" is clicked */
  onAddRoom?: () => void
  /** Shown in the right header (e.g. "Add Item" button) */
  rightHeaderAction?: React.ReactNode
  rightHeaderTitle?: string
  /** Item grid content - use InventoryItemGrid or custom */
  children: React.ReactNode
  hideLeftOnMobileWhenActive?: boolean
}

export function InventoryManager({
  variant,
  rooms,
  isLoading,
  selectedRoomId,
  onSelectRoom,
  renderRoomAction,
  onAddRoom,
  rightHeaderAction,
  rightHeaderTitle = "Items",
  children,
  hideLeftOnMobileWhenActive = true,
}: InventoryManagerProps) {
  return (
    <div className="grid min-h-[620px] overflow-hidden rounded-xl border lg:grid-cols-[19rem_1fr]">
      <ScrollArea
        className={cn({
          "hidden lg:block":
            hideLeftOnMobileWhenActive && selectedRoomId !== null,
        })}
      >
        <div className="space-y-3 border-r p-3">
          {/* <div className="border-b px-1 pb-3">
            <p className="text-base font-semibold">{title}</p>
            {subtitle && <p className="text-primary text-sm">{subtitle}</p>}
          </div> */}

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase">Rooms</p>
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Spinner />
              </div>
            )}
            {rooms?.map((room) => (
              <div key={room.id} className="group/room relative">
                <ChatInfo
                  data-active={selectedRoomId === room.id}
                  onClick={() => onSelectRoom(room.id)}
                >
                  {room.image_url && (
                    <div className="h-auto w-9 shrink-0">
                      <img
                        src={room.image_url}
                        alt={room.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <ChatInfoContent>
                    <ChatInfoHeader>
                      <ChatInfoTitle>{room.name}</ChatInfoTitle>
                      <ChatInfoDescription>
                        some description
                      </ChatInfoDescription>
                    </ChatInfoHeader>
                  </ChatInfoContent>
                </ChatInfo>
                {renderRoomAction && (
                  <div
                    className={cn(
                      "absolute top-1/2 right-2 z-10 -translate-y-1/2 opacity-0 transition-opacity group-hover/room:opacity-100",
                      selectedRoomId === room.id && "opacity-100"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderRoomAction(room)}
                  </div>
                )}
              </div>
            ))}

            {rooms?.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No rooms yet.
              </p>
            )}
          </div>

          <div className="space-y-2 border-t pt-3">
            <Button type="button" onClick={() => onAddRoom?.()}>
              <PlusIcon />
              {variant === "admin" ? "Add room" : "Add custom room"}
            </Button>
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <div className="flex min-h-[620px] flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-base font-semibold">{rightHeaderTitle}</h3>
          {rightHeaderAction}
        </div>
        <div className="flex-1 p-4">{children}</div>
      </div>
    </div>
  )
}
