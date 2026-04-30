import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import type { Item } from "@/domains/items/item.types";

type VolumeDisplayProps = {
  items: Item[];
  itemQuantities: Record<string, Record<string, number>>;
  dispersion: number;
  /** Saved values from the database, shown when form matches saved state */
  savedVolume?: number;
  savedVolumeWithDispersion?: { min: number; max: number };
};

function calculateFromItems(
  items: Item[],
  itemQuantities: Record<string, Record<string, number>>,
  dispersion: number,
) {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  let volume = 0;
  let weight = 0;

  for (const roomItems of Object.values(itemQuantities)) {
    for (const [itemIdStr, quantity] of Object.entries(roomItems)) {
      const item = itemsById.get(Number(itemIdStr));
      if (item && quantity > 0) {
        volume += (item.volume || 0) * quantity;
        weight += (item.weight || 0) * quantity;
      }
    }
  }

  const dispersionPct = (dispersion ?? 0) / 100;
  const minVol = Math.round(volume * (1 - dispersionPct) * 100) / 100;
  const maxVol = Math.round(volume * (1 + dispersionPct) * 100) / 100;

  return {
    volume,
    weight: Math.round(weight * 100) / 100,
    volumeWithDispersion: { min: minVol, max: maxVol },
  };
}

export function VolumeDisplay({
  items,
  itemQuantities,
  dispersion,
  savedVolume,
  savedVolumeWithDispersion,
}: VolumeDisplayProps) {
  const computed = calculateFromItems(items, itemQuantities, dispersion);

  const hasFormItems = Object.values(itemQuantities).some(
    (roomItems) => Object.keys(roomItems).length > 0,
  );

  const volume = hasFormItems ? computed.volume : Number(savedVolume) || 0;
  const volWithDisp = hasFormItems
    ? computed.volumeWithDispersion
    : {
        min: Number(savedVolumeWithDispersion?.min) || 0,
        max: Number(savedVolumeWithDispersion?.max) || 0,
      };

  return (
    <Field>
      <FieldContent>
        <FieldLabel>Calculated Totals</FieldLabel>
      </FieldContent>
      <div className="bg-muted/50 grid grid-cols-3 gap-4 rounded-md border p-3">
        <div>
          <p className="text-muted-foreground text-xs">Volume</p>
          <p className="text-lg font-semibold">
            {Number(volume).toFixed(2)} cu ft
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Min size</p>
          <p className="text-lg font-semibold">
            {Number(volWithDisp.min).toFixed(2)} cu ft
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Max size</p>
          <p className="text-lg font-semibold">
            {Number(volWithDisp.max).toFixed(2)} cu ft
          </p>
        </div>
      </div>
    </Field>
  );
}
