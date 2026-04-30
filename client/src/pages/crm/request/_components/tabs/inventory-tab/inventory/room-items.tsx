import { Spinner } from "@/components/ui/spinner";
import type { InventoryItem } from "./build-inventory";
import { ItemRow } from "./item-row";

export function RoomItems({
  suggestedItems,
  otherItems,
  isLoading,
  hasSelectedRoom,
  search,
  pendingItemKeys,
  selectedRoomId,
  onQuantityChange,
}: {
  suggestedItems: InventoryItem[];
  otherItems: InventoryItem[];
  isLoading: boolean;
  hasSelectedRoom: boolean;
  search: string;
  pendingItemKeys: Record<string, boolean>;
  selectedRoomId?: number;
  onQuantityChange: (item: InventoryItem, quantity: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!hasSelectedRoom) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-sm text-muted-foreground">
        Select a room to start managing inventory.
      </div>
    );
  }

  if (suggestedItems.length === 0 && otherItems.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-sm text-muted-foreground">
        {search ? "No items match your search." : "No items in this room yet."}
      </div>
    );
  }

  return (
    <div className="@container flex-1 space-y-6 overflow-y-auto p-5">
      {suggestedItems.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Suggested Items
            </h3>
            <span className="text-xs text-muted-foreground">
              {suggestedItems.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @md:grid-cols-3 @2xl:grid-cols-4">
            {suggestedItems.map((item) => (
              <ItemRow
                key={`suggested-${item.id}`}
                item={item}
                isLoading={!!pendingItemKeys[`${selectedRoomId}-${item.id}`]}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </div>
        </section>
      )}

      {otherItems.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Other Items
            </h3>
            <span className="text-xs text-muted-foreground">
              {otherItems.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @md:grid-cols-3 @2xl:grid-cols-4">
            {otherItems.map((item) => (
              <ItemRow
                key={`other-${item.id}`}
                item={item}
                isLoading={!!pendingItemKeys[`${selectedRoomId}-${item.id}`]}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
