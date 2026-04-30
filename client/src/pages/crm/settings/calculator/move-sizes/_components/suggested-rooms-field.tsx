import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import type { Room } from "@/domains/rooms/room.types";

type SuggestedRoomsFieldProps = {
  rooms: Room[];
  value: number[];
  onChange: (value: number[]) => void;
};

export function SuggestedRoomsField({
  rooms,
  value,
  onChange,
}: SuggestedRoomsFieldProps) {
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
        <FieldLabel>Suggested Rooms</FieldLabel>
        <FieldDescription>
          Shown as quick-add room suggestions in request inventory.
        </FieldDescription>
      </FieldContent>
      <div className="flex flex-wrap gap-2">
        {activeRooms.map((room) => (
          <Button
            key={`suggested-${room.id}`}
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
