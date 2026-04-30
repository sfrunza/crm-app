import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Item } from "@/domains/items/item.types";
import type { Room } from "@/domains/rooms/room.types";
import { ChevronDown, Plus, X } from "lucide-react";
import { useState } from "react";

type DefaultItemsFieldProps = {
  rooms: Room[];
  items: Item[];
  selectedRoomIds: number[];
  value: Record<string, Record<string, number>>;
  onChange: (value: Record<string, Record<string, number>>) => void;
  label?: string;
  description?: string;
};

export function DefaultItemsField({
  rooms,
  items,
  selectedRoomIds,
  value,
  onChange,
  label = "Default Items per Room",
  description = "Configure the typical items and quantities for each default room.",
}: DefaultItemsFieldProps) {
  const selectedRooms = rooms.filter((room) =>
    selectedRoomIds.includes(room.id),
  );

  function handleUpdateQuantity(
    roomId: number,
    itemId: number,
    quantity: number,
  ) {
    const roomKey = roomId.toString();
    const itemKey = itemId.toString();
    const currentRoomItems = value[roomKey] || {};

    if (quantity <= 0) {
      const { [itemKey]: _, ...rest } = currentRoomItems;
      if (Object.keys(rest).length === 0) {
        const { [roomKey]: __, ...restRooms } = value;
        onChange(restRooms);
      } else {
        onChange({ ...value, [roomKey]: rest });
      }
    } else {
      onChange({
        ...value,
        [roomKey]: { ...currentRoomItems, [itemKey]: quantity },
      });
    }
  }

  function handleAddItem(roomId: number, itemId: number) {
    const roomKey = roomId.toString();
    const itemKey = itemId.toString();
    const currentRoomItems = value[roomKey] || {};

    if (currentRoomItems[itemKey]) return;

    onChange({
      ...value,
      [roomKey]: { ...currentRoomItems, [itemKey]: 1 },
    });
  }

  function handleRemoveItem(roomId: number, itemId: number) {
    handleUpdateQuantity(roomId, itemId, 0);
  }

  if (selectedRooms.length === 0) {
    return null;
  }

  return (
    <Field>
      <FieldContent>
        <FieldLabel>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
      <div className="space-y-2">
        {selectedRooms.map((room) => (
          <RoomItemsCollapsible
            key={room.id}
            room={room}
            allItems={items}
            roomItems={value[room.id.toString()] || {}}
            onAddItem={(itemId) => handleAddItem(room.id, itemId)}
            onRemoveItem={(itemId) => handleRemoveItem(room.id, itemId)}
            onUpdateQuantity={(itemId, quantity) =>
              handleUpdateQuantity(room.id, itemId, quantity)
            }
          />
        ))}
      </div>
    </Field>
  );
}

type RoomItemsCollapsibleProps = {
  room: Room;
  allItems: Item[];
  roomItems: Record<string, number>;
  onAddItem: (itemId: number) => void;
  onRemoveItem: (itemId: number) => void;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
};

function RoomItemsCollapsible({
  room,
  allItems,
  roomItems,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
}: RoomItemsCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const selectedItemIds = Object.keys(roomItems).map(Number);
  const selectedItems = allItems.filter((item) =>
    selectedItemIds.includes(item.id),
  );
  const availableItems = allItems.filter(
    (item) => !selectedItemIds.includes(item.id),
  );

  const totalItems = Object.values(roomItems).reduce(
    (sum, qty) => sum + qty,
    0,
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
        >
          <span>
            {room.name}
            {totalItems > 0 && (
              <span className="text-muted-foreground ml-2">
                ({totalItems} items)
              </span>
            )}
          </span>
          <ChevronDown
            className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="bg-muted/50 rounded-md border p-3">
          <div className="mb-3">
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Plus className="mr-2 size-4" />
                  Add item...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search items..." />
                  <CommandList>
                    <CommandEmpty>No items found.</CommandEmpty>
                    <CommandGroup>
                      {availableItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.name}
                          onSelect={() => {
                            onAddItem(item.id);
                            setSearchOpen(false);
                          }}
                        >
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {item.volume || 0} cu ft, {item.weight || 0} lbs
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedItems.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No items added yet. Use the button above to add items.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.volume || 0} cu ft, {item.weight || 0} lbs
                    </p>
                  </div>
                  <NumberInput
                    value={roomItems[item.id.toString()] || 0}
                    onChange={(val) => {
                      if (val) {
                        onUpdateQuantity(item.id, val);
                      }
                    }}
                    min={1}
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive size-8"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
