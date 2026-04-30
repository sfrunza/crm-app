import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import type { Room } from "@/domains/rooms/room.types";

type DefaultRoomsFieldProps = {
  rooms: Room[];
  value: number[];
  onChange: (value: number[]) => void;
};

export function DefaultRoomsField({
  rooms,
  value,
  onChange,
}: DefaultRoomsFieldProps) {
  function handleToggle(roomId: number) {
    const exists = value.includes(roomId);
    if (exists) {
      onChange(value.filter((id) => id !== roomId));
    } else {
      onChange([...value, roomId]);
    }
  }

  const activeRooms = rooms.filter((room) => room.active);

  return (
    <Field>
      <FieldContent>
        <FieldLabel>Default Rooms</FieldLabel>
        <FieldDescription>
          Used by the "Typical Items" action in request inventory.
        </FieldDescription>
      </FieldContent>
      <div className="flex flex-wrap gap-2">
        {activeRooms.map((room) => (
          <Button
            key={room.id}
            type="button"
            size="sm"
            variant={value.includes(room.id) ? "default" : "outline"}
            onClick={() => handleToggle(room.id)}
          >
            {room.name}
          </Button>
        ))}
      </div>
    </Field>
  );
}
