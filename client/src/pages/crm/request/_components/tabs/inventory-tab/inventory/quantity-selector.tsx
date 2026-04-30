import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/icons";
import { MinusIcon } from "lucide-react";

export function QuantitySelector({
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
      <div className="flex justify-end">
        <Button type="button" disabled={isLoading} onClick={() => onChange(1)}>
          Add item
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-9 items-center justify-end rounded-md border px-px">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isLoading}
        onClick={() => onChange(quantity - 1)}
      >
        <MinusIcon />
      </Button>

      <span className="w-8 text-center text-sm font-semibold">{quantity}</span>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isLoading}
        onClick={() => onChange(quantity + 1)}
      >
        <PlusIcon />
      </Button>
      {/* </div> */}
    </div>
  );
}
