import { ImageOffIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "./build-inventory";
import { QuantitySelector } from "./quantity-selector";

export function ItemRow({
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
        {
          "bg-muted/50 shadow-inner": !isSelected,
          "border-primary/50 bg-primary/5 ring-primary/30 shadow-md ring":
            isSelected,
          // "border-primary/50 bg-primary/3 ring-primary/15 shadow-sm ring-1":
          //   isSelected,
          "opacity-75": isLoading,
        },
      )}
      // className={cn(
      //   "flex h-full flex-col justify-between rounded-xl border p-3 transition",
      //   isSelected
      //     ? "border-primary/50 bg-primary/3 ring-primary/15 shadow-sm ring-1"
      //     : "border-border bg-card/70 opacity-90",
      //   "hover:border-primary/40 hover:opacity-100 hover:shadow-sm",
      //   isLoading && "opacity-75",
      // )}
    >
      <div className="space-y-3">
        <div
          className={cn(
            "text-muted-foreground flex aspect-4/3 items-center justify-center overflow-hidden rounded-lg border border-dashed",
            isSelected ? "border-primary/30" : "bg-muted/50",
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
                ? "text-foreground font-semibold"
                : "text-foreground/80 font-medium",
            )}
          >
            {item.name}
          </h4>
          {item.is_custom && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              Custom
            </Badge>
          )}
        </div>
        <div
          className={cn(
            "text-xs",
            isSelected ? "text-foreground/80" : "text-muted-foreground",
          )}
        >
          {Number(item.volume || 0).toFixed(2)} cu ft each
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <QuantitySelector
          quantity={item.quantity}
          isLoading={isLoading}
          onChange={(nextQuantity) => onQuantityChange(item, nextQuantity)}
        />
      </div>
    </article>
  );
}
