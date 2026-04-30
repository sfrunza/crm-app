import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { InventoryRoom } from "./build-inventory";
import { RoomRow } from "./room-row";
import { PlusIcon } from "@/components/icons";

export function RoomList({
  rooms,
  selectedRoomId,
  onSelect,
  totalItems,
  totalVolume,
  totalBoxes,
  isLoading,
  onAddCustomRoom,
}: {
  rooms: InventoryRoom[];
  selectedRoomId: number | null;
  onSelect: (roomId: number) => void;
  totalItems: number;
  totalVolume: number;
  totalBoxes: number;
  isLoading: boolean;
  onAddCustomRoom: () => void;
}) {
  return (
    <div className="flex w-80 shrink-0 flex-col border-r">
      <div className="border-b p-5">
        <p className="text-lg font-semibold">Inventory</p>
        <p className="text-muted-foreground mt-1 text-sm">
          {totalItems} items · {totalBoxes} boxes · {totalVolume} cu ft
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Spinner />
          </div>
        )}

        {!isLoading && rooms.length === 0 && (
          <p className="text-muted-foreground px-2 py-10 text-center text-sm">
            No rooms available for this request.
          </p>
        )}

        {!isLoading &&
          rooms.map((room) => (
            <RoomRow
              key={`${room.is_custom ? "custom" : "room"}-${room.id}`}
              room={room}
              active={room.id === selectedRoomId}
              onClick={() => onSelect(room.id)}
            />
          ))}

        <div className="border-t p-3">
          <Button type="button" className="w-full" onClick={onAddCustomRoom}>
            <PlusIcon /> Add room
          </Button>
        </div>
      </div>
    </div>
  );
}
