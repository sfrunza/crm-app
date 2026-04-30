import { ImageOffIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  useCreateRequestItem,
  useDeleteRequestItem,
  useUpdateRequestItem,
} from "@/domains/request-items/request-item.mutations";
import type { RequestItem } from "@/domains/request-items/request-item.types";
import { useCreateRequestRoom } from "@/domains/request-rooms/request-room.mutations";
import type { RequestRoom } from "@/domains/request-rooms/request-room.types";
import {
  type InventoryItem,
  type InventoryRoom,
} from "@/pages/crm/request/_components/tabs/inventory-tab/inventory/build-inventory";
import { cn } from "@/lib/utils";
import { MinusIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import type { InventoryOutletContext } from "../page";

const SAVE_DEBOUNCE_MS = 800;

function QuantitySelector({
  quantity,
  onChange,
  isLoading,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  isLoading?: boolean;
}) {
  if (quantity < 1) {
    return (
      <Button
        type="button"
        size="sm"
        className="w-full"
        disabled={isLoading}
        onClick={() => onChange(1)}
      >
        Add item
      </Button>
    );
  }

  return (
    <div className="flex h-8 items-center justify-between rounded-md border bg-background px-px">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isLoading}
        onClick={() => onChange(quantity - 1)}
        className="size-7"
      >
        <MinusIcon />
      </Button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums">
        {quantity}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isLoading}
        onClick={() => onChange(quantity + 1)}
        className="size-7"
      >
        <PlusIcon />
      </Button>
    </div>
  );
}

function ItemCard({
  item,
  onQuantityChange,
  isLoading,
}: {
  item: InventoryItem;
  onQuantityChange: (item: InventoryItem, quantity: number) => void;
  isLoading?: boolean;
}) {
  const isSelected = item.quantity > 0;

  return (
    <article
      className={cn(
        "flex h-full flex-col justify-between rounded-xl border p-3 transition",
        isSelected
          ? "border-primary/50 bg-primary/5 shadow-md ring ring-primary/30"
          : "bg-muted/50 shadow-inner",
        isLoading && "opacity-70"
      )}
    >
      <div className="flex flex-col gap-3">
        <div
          className={cn(
            "flex aspect-4/3 items-center justify-center overflow-hidden rounded-lg border border-dashed text-muted-foreground",
            isSelected ? "border-primary/30" : "bg-muted/50"
          )}
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <ImageOffIcon className="size-5" />
              <span className="text-xs tracking-wide uppercase">No image</span>
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "line-clamp-2 text-sm leading-5",
              isSelected
                ? "font-semibold text-foreground"
                : "font-medium text-foreground/80"
            )}
          >
            {item.name}
          </h4>
          {item.is_custom && (
            <Badge
              variant="secondary"
              className="h-5 shrink-0 px-1.5 text-[10px]"
            >
              Custom
            </Badge>
          )}
        </div>

        <span
          className={cn(
            "text-xs",
            isSelected ? "text-foreground/80" : "text-muted-foreground"
          )}
        >
          {Number(item.volume || 0).toFixed(2)} cu ft each
        </span>
      </div>

      <div className="mt-3">
        <QuantitySelector
          quantity={item.quantity}
          isLoading={isLoading}
          onChange={(qty) => onQuantityChange(item, qty)}
        />
      </div>
    </article>
  );
}

function ItemsSection({
  label,
  items,
  pendingItemKeys,
  selectedRoomId,
  onQuantityChange,
}: {
  label: string;
  items: InventoryItem[];
  pendingItemKeys: Record<string, boolean>;
  selectedRoomId?: number;
  onQuantityChange: (item: InventoryItem, quantity: number) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </h3>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="@container">
        <div className="grid gap-3 @sm:grid-cols-2 @md:grid-cols-3 @xl:grid-cols-4">
          {items.map((item) => (
            <ItemCard
              key={`${label}-${item.id}`}
              item={item}
              isLoading={!!pendingItemKeys[`${selectedRoomId}-${item.id}`]}
              onQuantityChange={onQuantityChange}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function InventoryRoomsPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { inventoryRooms, requestId, isPending } =
    useOutletContext<InventoryOutletContext>();

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
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemQuantity, setCustomItemQuantity] = useState(1);
  const [customItemVolume, setCustomItemVolume] = useState(0);
  const [customItemIsBox, setCustomItemIsBox] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);

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

  const { mutateAsync: createRequestRoom } = useCreateRequestRoom();
  const { mutateAsync: createRequestItem } = useCreateRequestItem();
  const { mutateAsync: updateRequestItem } = useUpdateRequestItem();
  const { mutateAsync: deleteRequestItem } = useDeleteRequestItem();

  const selectedRoom = useMemo(() => {
    if (!roomId) return null;
    return inventoryRooms.find((r) => r.id === Number(roomId)) ?? null;
  }, [inventoryRooms, roomId]);

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

  const filteredItems = useMemo(() => {
    if (!selectedRoom) return [];
    const term = search.trim().toLowerCase();

    const withOverrides = selectedRoom.items.map((item) => {
      const key = `${selectedRoom.id}-${item.id}`;
      const overrideQty = quantityOverrides[key];
      const overrideId = requestItemIdOverrides[key];
      if (overrideQty === undefined && overrideId === undefined) return item;
      return {
        ...item,
        quantity: overrideQty ?? item.quantity,
        request_item_id: overrideId ?? item.request_item_id,
      };
    });

    if (!term) return withOverrides;
    return withOverrides.filter((item) =>
      item.name.toLowerCase().includes(term)
    );
  }, [quantityOverrides, requestItemIdOverrides, search, selectedRoom]);

  const suggestedItems = filteredItems.filter((item) => item.is_suggested);
  const otherItems = filteredItems.filter((item) => !item.is_suggested);

  useEffect(() => {
    const timers = saveTimersRef;
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
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
      Object.entries(current).forEach(([key, qty]) => {
        const source = inventoryItemStateMap.get(key);
        if (!source || source.quantity !== qty) {
          next[key] = qty;
          return;
        }
        changed = true;
      });
      return changed ? next : current;
    });

    setRequestItemIdOverrides((current) => {
      let changed = false;
      const next: Record<string, number> = {};
      Object.entries(current).forEach(([key, id]) => {
        const source = inventoryItemStateMap.get(key);
        if (!source || source.request_item_id !== id) {
          next[key] = id;
          return;
        }
        changed = true;
      });
      return changed ? next : current;
    });
  }, [inventoryItemStateMap]);

  async function ensureRequestRoom(room: InventoryRoom) {
    if (!requestId) return null;
    if (room.request_room) return room.request_room;

    const cachedId = ensuredRoomIdsRef.current[room.id];
    if (cachedId) return { id: cachedId } as RequestRoom;

    const ongoing = ensureRoomPromisesRef.current[room.id];
    if (ongoing) return ongoing;

    const promise = createRequestRoom({
      requestId,
      data: {
        name: room.name,
        room_id: room.room_id ?? null,
        is_custom: room.is_custom,
      },
    })
      .then((created) => {
        ensuredRoomIdsRef.current[room.id] = created.id;
        return created;
      })
      .finally(() => {
        delete ensureRoomPromisesRef.current[room.id];
      });

    ensureRoomPromisesRef.current[room.id] = promise;
    return promise;
  }

  async function persistQuantityChange(
    item: InventoryItem,
    room: InventoryRoom,
    quantity: number
  ) {
    if (!requestId) return;
    const nextQty = Math.max(0, quantity);
    const key = `${room.id}-${item.id}`;

    setPendingItemKeys((c) => ({ ...c, [key]: true }));

    try {
      const requestRoom = await ensureRequestRoom(room);
      if (!requestRoom) return;

      const requestItemId = requestItemIdOverrides[key] ?? item.request_item_id;

      if (nextQty < 1) {
        if (requestItemId) {
          await deleteRequestItem({
            requestId,
            requestRoomId: requestRoom.id,
            id: requestItemId,
          });
          setRequestItemIdOverrides((c) => {
            const next = { ...c };
            delete next[key];
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
          data: { quantity: nextQty } as Partial<RequestItem>,
        });
        setRequestItemIdOverrides((c) => ({ ...c, [key]: updated.id }));
        return;
      }

      const created = await createRequestItem({
        requestId,
        requestRoomId: requestRoom.id,
        data: {
          name: item.name,
          item_id: item.item_id ?? undefined,
          quantity: nextQty,
          volume: item.volume,
          is_custom: item.is_custom,
        } as Partial<RequestItem>,
      });
      setRequestItemIdOverrides((c) => ({ ...c, [key]: created.id }));
    } finally {
      setPendingItemKeys((c) => {
        const next = { ...c };
        delete next[key];
        return next;
      });
      delete latestQuantityRef.current[key];
    }
  }

  function scheduleQuantityPersist(
    item: InventoryItem,
    room: InventoryRoom,
    quantity: number
  ) {
    const key = `${room.id}-${item.id}`;
    const nextQty = Math.max(0, quantity);

    latestQuantityRef.current[key] = nextQty;
    setQuantityOverrides((c) => ({ ...c, [key]: nextQty }));

    if (saveTimersRef.current[key]) clearTimeout(saveTimersRef.current[key]);

    saveTimersRef.current[key] = setTimeout(() => {
      const latestQty = latestQuantityRef.current[key] ?? 0;
      queuedPersistRef.current[key] = { item, room, quantity: latestQty };
      void flushPersistQueue();
      delete saveTimersRef.current[key];
    }, SAVE_DEBOUNCE_MS);
  }

  async function flushPersistQueue() {
    if (isFlushingQueueRef.current) return;
    isFlushingQueueRef.current = true;
    try {
      while (true) {
        const [key, op] = Object.entries(queuedPersistRef.current)[0] ?? [];
        if (!key || !op) break;
        delete queuedPersistRef.current[key];
        await persistQuantityChange(op.item, op.room, op.quantity);
      }
    } finally {
      isFlushingQueueRef.current = false;
    }
  }

  async function handleCreateCustomItem() {
    if (!requestId || !selectedRoom) return;
    const name = customItemName.trim();
    if (!name) return;

    setIsCreatingItem(true);
    try {
      const requestRoom = await ensureRequestRoom(selectedRoom);
      if (!requestRoom) return;

      await createRequestItem({
        requestId,
        requestRoomId: requestRoom.id,
        data: {
          name,
          item_id: undefined,
          is_custom: true,
          quantity: Math.max(1, customItemQuantity),
          volume: Math.max(0, customItemVolume),
          weight: 0,
          is_box: customItemIsBox,
          is_furniture: !customItemIsBox,
          is_special_handling: false,
        } as Partial<RequestItem>,
      });

      setIsAddItemOpen(false);
      setCustomItemName("");
      setCustomItemQuantity(1);
      setCustomItemVolume(0);
      setCustomItemIsBox(false);
    } finally {
      setIsCreatingItem(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!selectedRoom) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-sm text-muted-foreground">
        Room not found.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b px-5 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{selectedRoom.name}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedRoom.totals.items} items &middot;{" "}
              {selectedRoom.totals.boxes} boxes &middot;{" "}
              {selectedRoom.totals.volume.toFixed(1)} cu ft
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items…"
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddItemOpen(true)}
          >
            <PlusIcon data-icon="inline-start" />
            Custom item
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {suggestedItems.length === 0 && otherItems.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {search
              ? "No items match your search."
              : "No items available for this room."}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <ItemsSection
              label="Suggested Items"
              items={suggestedItems}
              pendingItemKeys={pendingItemKeys}
              selectedRoomId={selectedRoom.id}
              onQuantityChange={(item, qty) => {
                scheduleQuantityPersist(item, selectedRoom, qty);
              }}
            />
            <ItemsSection
              label="Other Items"
              items={otherItems}
              pendingItemKeys={pendingItemKeys}
              selectedRoomId={selectedRoom.id}
              onQuantityChange={(item, qty) => {
                scheduleQuantityPersist(item, selectedRoom, qty);
              }}
            />
          </div>
        )}
      </div>

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
                  onChange={(e) => setCustomItemName(e.target.value)}
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
                  onChange={(e) =>
                    setCustomItemQuantity(
                      Math.max(1, Number(e.target.value) || 1)
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
                  onChange={(e) =>
                    setCustomItemVolume(
                      Math.max(0, Number(e.target.value) || 0)
                    )
                  }
                />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="custom-item-box">Mark as box</FieldLabel>
                </FieldContent>
                <Switch
                  id="custom-item-box"
                  checked={customItemIsBox}
                  onCheckedChange={setCustomItemIsBox}
                />
              </Field>
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
              disabled={!customItemName.trim() || isCreatingItem}
              onClick={() => void handleCreateCustomItem()}
            >
              Add item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Component = InventoryRoomsPage;
