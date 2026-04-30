import { ChevronLeftIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetItems } from "@/domains/items/item.queries";
import { useCreateRequestRoom } from "@/domains/request-rooms/request-room.mutations";
import { useGetRooms } from "@/domains/rooms/room.queries";
import { useMoveSizes } from "@/hooks/api/use-move-sizes";
import { useRequest } from "@/hooks/use-request";
import { cn } from "@/lib/utils";
import {
  buildInventory,
  type InventoryRoom,
} from "@/pages/crm/request/_components/tabs/inventory-tab/inventory/build-inventory";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useMatch, useNavigate, useParams } from "react-router";

export type InventoryOutletContext = {
  inventoryRooms: InventoryRoom[];
  requestId: number;
  isPending: boolean;
};

function RoomSidebarItem({
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
        "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition",
        active
          ? "border-primary bg-primary/5"
          : "border-transparent hover:border-border hover:bg-muted/50"
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{room.name}</span>
          {room.is_custom && (
            <Badge
              variant="outline"
              className="h-4 shrink-0 px-1 text-[10px] text-muted-foreground"
            >
              custom
            </Badge>
          )}
          {room.is_suggested && !room.request_room && (
            <Badge
              variant="outline"
              className="h-4 shrink-0 px-1 text-[10px] text-muted-foreground"
            >
              suggested
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {room.totals.volume.toFixed(1)} cu ft
        </span>
      </div>
      <Badge variant="outline" className="shrink-0 tabular-nums">
        {room.totals.items}
      </Badge>
    </button>
  );
}

function RoomSidebar({
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
  console.log("rooms", rooms);

  return (
    <div className="flex shrink-0 flex-col border-r max-md:hidden md:w-64">
      <div className="border-b px-4 py-4">
        <p className="font-semibold">Inventory Desktop</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {totalItems} items &middot; {totalBoxes} boxes &middot; {totalVolume}{" "}
          cu ft
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}

        {!isLoading && rooms.length === 0 && (
          <p className="px-2 py-10 text-center text-sm text-muted-foreground">
            No rooms yet.
          </p>
        )}

        {!isLoading &&
          rooms.map((room) => (
            <RoomSidebarItem
              key={`${room.is_custom ? "custom" : "room"}-${room.id}`}
              room={room}
              active={room.id === selectedRoomId}
              onClick={() => onSelect(room.id)}
            />
          ))}
        <div className="border-t p-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onAddCustomRoom}
          >
            <PlusIcon data-icon="inline-start" />
            Add custom room
          </Button>
        </div>
      </div>
    </div>
  );
}

function RoomSidebarMobile({
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
  console.log("rooms", rooms);

  return (
    <div className="flex w-full shrink-0 flex-col border-r md:hidden">
      <div className="border-b px-4 py-4">
        <p className="font-semibold">Inventory Mobile</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {totalItems} items &middot; {totalBoxes} boxes &middot; {totalVolume}{" "}
          cu ft
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto p-3">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}

        {!isLoading && rooms.length === 0 && (
          <p className="px-2 py-10 text-center text-sm text-muted-foreground">
            No rooms yet.
          </p>
        )}

        {!isLoading &&
          rooms.map((room) => (
            <RoomSidebarItem
              key={`${room.is_custom ? "custom" : "room"}-${room.id}`}
              room={room}
              active={room.id === selectedRoomId}
              onClick={() => onSelect(room.id)}
            />
          ))}
        <div className="border-t p-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onAddCustomRoom}
          >
            <PlusIcon data-icon="inline-start" />
            Add custom room
          </Button>
        </div>
      </div>
    </div>
  );
}

function InventoryPage() {
  const { requestId: requestIdParam } = useParams<{ requestId: string }>();
  const requestId = Number(requestIdParam);
  const navigate = useNavigate();

  const match = useMatch(
    "/account/requests/:requestId/inventory/rooms/:roomId"
  );
  const selectedRoomId = match?.params.roomId
    ? Number(match.params.roomId)
    : null;

  const { request, isPending: isRequestPending } = useRequest(requestId);
  const { data: rooms, isPending: isRoomsPending } = useGetRooms();
  const { data: items, isPending: isItemsPending } = useGetItems();
  const { data: moveSizes } = useMoveSizes();

  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [customRoomName, setCustomRoomName] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const { mutateAsync: createRequestRoom } = useCreateRequestRoom();

  const requestRooms = useMemo(
    () => request?.request_rooms ?? [],
    [request?.request_rooms]
  );

  const moveSize = moveSizes?.find((m) => m.id === request?.move_size_id);

  const inventoryRooms = useMemo(() => {
    return buildInventory(
      rooms ?? [],
      items ?? [],
      requestRooms,
      moveSize?.default_rooms ?? []
    );
  }, [rooms, items, requestRooms, moveSize?.default_rooms]);

  const isPending = isRequestPending || isRoomsPending || isItemsPending;

  useEffect(() => {
    if (!isPending && !selectedRoomId && inventoryRooms.length > 0) {
      navigate(`rooms/${inventoryRooms[0].id}`, { replace: true });
    }
  }, [inventoryRooms, isPending, navigate, selectedRoomId]);

  async function handleAddCustomRoom() {
    const name = customRoomName.trim();
    if (!name) return;
    setIsCreatingRoom(true);
    try {
      const created = await createRequestRoom({
        requestId,
        data: { name, is_custom: true },
      });
      setIsAddRoomOpen(false);
      setCustomRoomName("");
      navigate(`rooms/${created.id}`);
    } finally {
      setIsCreatingRoom(false);
    }
  }

  const totals = request?.totals ?? {
    items: 0,
    boxes: 0,
    volume: 0,
    weight: 0,
  };

  const outletContext: InventoryOutletContext = {
    inventoryRooms,
    requestId,
    isPending,
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="ghost" asChild aria-label="Back to request">
          <Link to={`/account/requests/${requestId}`} replace>
            <ChevronLeftIcon data-icon="inline-start" />
            Back
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <div className="flex min-h-[580px]">
            <RoomSidebar
              rooms={inventoryRooms}
              selectedRoomId={selectedRoomId}
              onSelect={(roomId) => navigate(`rooms/${roomId}`)}
              totalItems={totals.items}
              totalVolume={totals.volume}
              totalBoxes={totals.boxes}
              isLoading={isPending}
              onAddCustomRoom={() => setIsAddRoomOpen(true)}
            />

            <RoomSidebarMobile
              rooms={inventoryRooms}
              selectedRoomId={selectedRoomId}
              onSelect={(roomId) => navigate(`rooms/${roomId}`)}
              totalItems={totals.items}
              totalVolume={totals.volume}
              totalBoxes={totals.boxes}
              isLoading={isPending}
              onAddCustomRoom={() => setIsAddRoomOpen(true)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
              <Outlet context={outletContext} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Room</DialogTitle>
          </DialogHeader>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="add-room-name">Room name</FieldLabel>
                <Input
                  id="add-room-name"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  placeholder="e.g. Storage Room"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleAddCustomRoom();
                  }}
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddRoomOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!customRoomName.trim() || isCreatingRoom}
              onClick={() => void handleAddCustomRoom()}
            >
              Add room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Component = InventoryPage;
