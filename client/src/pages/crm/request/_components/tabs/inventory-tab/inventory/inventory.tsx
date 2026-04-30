import { useGetRooms } from "@/domains/rooms/room.queries";
import { useEffect, useMemo, useRef, useState } from "react";
import { RoomList } from "./room-list";
import { RoomItems } from "./room-items";
import { useRequest } from "@/hooks/use-request";
import { useGetItems } from "@/domains/items/item.queries";
import {
  buildInventory,
  type InventoryItem,
  type InventoryRoom,
} from "./build-inventory";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  useCreateRequestItem,
  useDeleteRequestItem,
  useUpdateRequestItem,
} from "@/domains/request-items/request-item.mutations";
import { useCreateRequestRoom } from "@/domains/request-rooms/request-room.mutations";
import type { RequestRoom } from "@/domains/request-rooms/request-room.types";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { useMoveSizes } from "@/hooks/api/use-move-sizes";

const SAVE_DEBOUNCE_MS = 1000;

export function Inventory() {
  const { request } = useRequest();
  const requestRooms = useMemo(
    () => request?.request_rooms ?? [],
    [request?.request_rooms]
  );
  const requestId = request?.id;
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [pendingItemKeys, setPendingItemKeys] = useState<
    Record<string, boolean>
  >({});
  const [quantityOverrides, setQuantityOverrides] = useState<
    Record<string, number>
  >({});
  const [requestItemIdOverrides, setRequestItemIdOverrides] = useState<
    Record<string, number>
  >({});
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [customRoomName, setCustomRoomName] = useState("");
  const [isCreatingCustomRoom, setIsCreatingCustomRoom] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemQuantity, setCustomItemQuantity] = useState(1);
  const [customItemVolume, setCustomItemVolume] = useState(0);
  const [customItemIsBox, setCustomItemIsBox] = useState(false);
  const [isCreatingCustomItem, setIsCreatingCustomItem] = useState(false);
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );
  const latestQuantityRef = useRef<Record<string, number>>({});
  const queuedPersistRef = useRef<
    Record<
      string,
      { item: InventoryItem; room: InventoryRoom; quantity: number }
    >
  >({});
  const isFlushingQueueRef = useRef(false);
  const ensuredRoomIdsRef = useRef<Record<number, number>>({});
  const ensureRoomPromisesRef = useRef<
    Record<number, Promise<RequestRoom | null>>
  >({});

  const { data: rooms, isPending: isRoomsPending } = useGetRooms();
  const { data: items, isPending: isItemsPending } = useGetItems();
  const { data: moveSizes } = useMoveSizes();
  const { mutateAsync: createRequestRoom } = useCreateRequestRoom();
  const { mutateAsync: createRequestItem } = useCreateRequestItem();
  const { mutateAsync: updateRequestItem } = useUpdateRequestItem();
  const { mutateAsync: deleteRequestItem } = useDeleteRequestItem();

  const moveSize = moveSizes?.find((m) => m.id === request?.move_size_id);

  const inventoryRooms = useMemo(() => {
    return buildInventory(
      rooms ?? [],
      items ?? [],
      requestRooms,
      moveSize?.default_rooms ?? []
    );
  }, [items, moveSize?.default_rooms, requestRooms, rooms]);

  useEffect(() => {
    if (inventoryRooms.length === 0) {
      setSelectedRoomId(null);
      return;
    }

    const hasSelectedRoom = inventoryRooms.some(
      (room) => room.id === selectedRoomId
    );
    if (!hasSelectedRoom) {
      setSelectedRoomId(inventoryRooms[0].id);
    }
  }, [inventoryRooms, selectedRoomId]);

  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return null;
    return inventoryRooms.find((r) => r.id === selectedRoomId) ?? null;
  }, [inventoryRooms, selectedRoomId]);

  const filteredItems = useMemo(() => {
    if (!selectedRoom) return [];

    const term = search.trim().toLowerCase();
    const roomItemsWithOverrides = selectedRoom.items.map((item) => {
      const itemKey = `${selectedRoom.id}-${item.id}`;
      const overrideQuantity = quantityOverrides[itemKey];
      const overrideRequestItemId = requestItemIdOverrides[itemKey];

      if (
        overrideQuantity === undefined &&
        overrideRequestItemId === undefined
      ) {
        return item;
      }

      return {
        ...item,
        quantity: overrideQuantity ?? item.quantity,
        request_item_id: overrideRequestItemId ?? item.request_item_id,
      };
    });

    if (!term) return roomItemsWithOverrides;

    return roomItemsWithOverrides.filter((item) =>
      item.name.toLowerCase().includes(term)
    );
  }, [quantityOverrides, requestItemIdOverrides, search, selectedRoom]);

  const inventoryItemStateMap = useMemo(() => {
    const map = new Map<
      string,
      { quantity: number; request_item_id?: number }
    >();

    inventoryRooms.forEach((room) => {
      room.items.forEach((item) => {
        map.set(`${room.id}-${item.id}`, {
          quantity: item.quantity,
          request_item_id: item.request_item_id,
        });
      });
    });

    return map;
  }, [inventoryRooms]);

  const suggestedItems = filteredItems.filter((item) => item.is_suggested);
  const otherItems = filteredItems.filter((item) => !item.is_suggested);

  const isPending = isRoomsPending || isItemsPending;

  async function ensureRequestRoom(room: InventoryRoom) {
    if (!requestId) return null;
    if (room.request_room) return room.request_room;
    const cachedRoomId = ensuredRoomIdsRef.current[room.id];
    if (cachedRoomId) return { id: cachedRoomId } as RequestRoom;

    const ongoingPromise = ensureRoomPromisesRef.current[room.id];
    if (ongoingPromise) return ongoingPromise;

    const createPromise = createRequestRoom({
      requestId,
      data: {
        name: room.name,
        room_id: room.room_id ?? null,
        is_custom: room.is_custom,
      },
    })
      .then((createdRoom) => {
        ensuredRoomIdsRef.current[room.id] = createdRoom.id;
        return createdRoom;
      })
      .finally(() => {
        delete ensureRoomPromisesRef.current[room.id];
      });

    ensureRoomPromisesRef.current[room.id] = createPromise;
    return createPromise;
  }

  async function persistQuantityChange(
    item: InventoryItem,
    room: InventoryRoom,
    quantity: number
  ) {
    if (!requestId) return;

    const nextQuantity = Math.max(0, quantity);
    const itemKey = `${room.id}-${item.id}`;

    setPendingItemKeys((current) => ({ ...current, [itemKey]: true }));

    try {
      const requestRoom = await ensureRequestRoom(room);
      if (!requestRoom) return;
      const requestItemId =
        requestItemIdOverrides[itemKey] ?? item.request_item_id;

      if (nextQuantity < 1) {
        if (requestItemId) {
          await deleteRequestItem({
            requestId,
            requestRoomId: requestRoom.id,
            id: requestItemId,
          });
          setRequestItemIdOverrides((current) => {
            const next = { ...current };
            delete next[itemKey];
            return next;
          });
        }
        return;
      }

      if (requestItemId) {
        const updated = await updateRequestItem({
          requestId,
          requestRoomId: requestRoom.id,
          id: requestItemId,
          data: { quantity: nextQuantity },
        });
        setRequestItemIdOverrides((current) => ({
          ...current,
          [itemKey]: updated.id,
        }));
        return;
      }

      const created = await createRequestItem({
        requestId,
        requestRoomId: requestRoom.id,
        data: {
          name: item.name,
          item_id: item.item_id ?? null,
          quantity: nextQuantity,
          volume: item.volume,
          is_custom: item.is_custom,
        },
      });
      setRequestItemIdOverrides((current) => ({
        ...current,
        [itemKey]: created.id,
      }));
    } finally {
      setPendingItemKeys((current) => {
        const next = { ...current };
        delete next[itemKey];
        return next;
      });
      delete latestQuantityRef.current[itemKey];
    }
  }

  function scheduleQuantityPersist(
    item: InventoryItem,
    room: InventoryRoom,
    quantity: number
  ) {
    const itemKey = `${room.id}-${item.id}`;
    const nextQuantity = Math.max(0, quantity);

    latestQuantityRef.current[itemKey] = nextQuantity;
    setQuantityOverrides((current) => ({
      ...current,
      [itemKey]: nextQuantity,
    }));

    const existingTimer = saveTimersRef.current[itemKey];
    if (existingTimer) clearTimeout(existingTimer);

    saveTimersRef.current[itemKey] = setTimeout(() => {
      const latestQuantity = latestQuantityRef.current[itemKey] ?? 0;
      queuedPersistRef.current[itemKey] = {
        item,
        room,
        quantity: latestQuantity,
      };
      void flushPersistQueue();
      delete saveTimersRef.current[itemKey];
    }, SAVE_DEBOUNCE_MS);
  }

  async function flushPersistQueue() {
    if (isFlushingQueueRef.current) return;
    isFlushingQueueRef.current = true;

    try {
      while (true) {
        const [itemKey, operation] =
          Object.entries(queuedPersistRef.current)[0] ?? [];
        if (!itemKey || !operation) break;

        delete queuedPersistRef.current[itemKey];
        await persistQuantityChange(
          operation.item,
          operation.room,
          operation.quantity
        );
      }
    } finally {
      isFlushingQueueRef.current = false;
    }
  }

  useEffect(() => {
    const timersRef = saveTimersRef;

    return () => {
      const timers = Object.values(timersRef.current);
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    const ensuredMap: Record<number, number> = {};
    inventoryRooms.forEach((room) => {
      if (room.request_room?.id) {
        ensuredMap[room.id] = room.request_room.id;
      }
    });
    ensuredRoomIdsRef.current = ensuredMap;
  }, [inventoryRooms]);

  useEffect(() => {
    setQuantityOverrides((current) => {
      let changed = false;
      const next: Record<string, number> = {};

      Object.entries(current).forEach(([itemKey, quantity]) => {
        const sourceItem = inventoryItemStateMap.get(itemKey);
        if (!sourceItem || sourceItem.quantity !== quantity) {
          next[itemKey] = quantity;
          return;
        }
        changed = true;
      });

      return changed ? next : current;
    });

    setRequestItemIdOverrides((current) => {
      let changed = false;
      const next: Record<string, number> = {};

      Object.entries(current).forEach(([itemKey, requestItemId]) => {
        const sourceItem = inventoryItemStateMap.get(itemKey);
        if (!sourceItem || sourceItem.request_item_id !== requestItemId) {
          next[itemKey] = requestItemId;
          return;
        }
        changed = true;
      });

      return changed ? next : current;
    });
  }, [inventoryItemStateMap]);

  async function handleCreateCustomRoom() {
    if (!requestId) return;
    const name = customRoomName.trim();
    if (!name) return;

    setIsCreatingCustomRoom(true);
    try {
      const createdRoom = await createRequestRoom({
        requestId,
        data: {
          name,
          is_custom: true,
          room_id: null,
        },
      });

      setIsAddRoomOpen(false);
      setCustomRoomName("");
      setSelectedRoomId(createdRoom.id);
    } finally {
      setIsCreatingCustomRoom(false);
    }
  }

  async function handleCreateCustomItem() {
    if (!requestId || !selectedRoom) return;
    const name = customItemName.trim();
    if (!name) return;

    setIsCreatingCustomItem(true);
    try {
      const requestRoom = await ensureRequestRoom(selectedRoom);
      if (!requestRoom) return;

      await createRequestItem({
        requestId,
        requestRoomId: requestRoom.id,
        data: {
          name,
          item_id: null,
          is_custom: true,
          quantity: Math.max(1, customItemQuantity),
          volume: Math.max(0, customItemVolume),
          weight: 0,
          is_box: customItemIsBox,
          is_furniture: !customItemIsBox,
          is_special_handling: false,
        },
      });

      setIsAddItemOpen(false);
      setCustomItemName("");
      setCustomItemQuantity(1);
      setCustomItemVolume(0);
      setCustomItemIsBox(false);
    } finally {
      setIsCreatingCustomItem(false);
    }
  }

  return (
    <div className="flex h-full min-h-[640px] overflow-hidden">
      <RoomList
        rooms={inventoryRooms}
        selectedRoomId={selectedRoomId}
        onSelect={setSelectedRoomId}
        totalItems={request?.totals?.items ?? 0}
        totalVolume={request?.totals?.volume ?? 0}
        totalBoxes={request?.totals?.boxes ?? 0}
        isLoading={isPending}
        onAddCustomRoom={() => setIsAddRoomOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {selectedRoom?.name ?? "Inventory"}
            </h2>
            {!!selectedRoom && (
              <div className="text-sm text-muted-foreground">
                {selectedRoom.totals.items} items · {selectedRoom.totals.boxes}{" "}
                boxes · {selectedRoom.totals.volume} cu ft
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="relative max-w-md flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for an item"
                className="pl-9"
              />
            </div>

            <Button
              type="button"
              disabled={!selectedRoom}
              onClick={() => setIsAddItemOpen(true)}
            >
              <PlusIcon />
              Add custom item
            </Button>
          </div>
        </div>

        <RoomItems
          suggestedItems={suggestedItems}
          otherItems={otherItems}
          isLoading={isPending}
          hasSelectedRoom={!!selectedRoom}
          search={search}
          pendingItemKeys={pendingItemKeys}
          selectedRoomId={selectedRoom?.id}
          onQuantityChange={(item, quantity) => {
            if (!selectedRoom) return;
            scheduleQuantityPersist(item, selectedRoom, quantity);
          }}
        />
      </div>

      <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Room</DialogTitle>
          </DialogHeader>

          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="custom-room-name">Room name</FieldLabel>
                <Input
                  id="custom-room-name"
                  value={customRoomName}
                  onChange={(event) => setCustomRoomName(event.target.value)}
                  placeholder="e.g. Guest Room"
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
              disabled={!customRoomName.trim() || isCreatingCustomRoom}
              onClick={() => {
                void handleCreateCustomRoom();
              }}
            >
              Add room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Item</DialogTitle>
          </DialogHeader>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="custom-item-name">Item name</FieldLabel>
                <Input
                  id="custom-item-name"
                  value={customItemName}
                  onChange={(event) => setCustomItemName(event.target.value)}
                  placeholder="e.g. Gaming Chair"
                />
              </Field>
            </FieldGroup>

            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="custom-item-qty">Quantity</FieldLabel>
                <Input
                  id="custom-item-qty"
                  type="number"
                  min={1}
                  value={customItemQuantity}
                  onChange={(event) =>
                    setCustomItemQuantity(
                      Math.max(1, Number(event.target.value) || 1)
                    )
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="custom-item-volume">
                  Volume (cu ft)
                </FieldLabel>
                <Input
                  id="custom-item-volume"
                  type="number"
                  min={0}
                  step="0.1"
                  value={customItemVolume}
                  onChange={(event) =>
                    setCustomItemVolume(
                      Math.max(0, Number(event.target.value) || 0)
                    )
                  }
                />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="custom-item-box">
                <Field orientation="horizontal">
                  <FieldContent>Mark item as box</FieldContent>
                  <Switch
                    id="custom-item-box"
                    checked={customItemIsBox}
                    onCheckedChange={setCustomItemIsBox}
                  />
                </Field>
              </FieldLabel>
            </FieldGroup>
          </FieldSet>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddItemOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                !customItemName.trim() || isCreatingCustomItem || !selectedRoom
              }
              onClick={() => {
                void handleCreateCustomItem();
              }}
            >
              Add item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
