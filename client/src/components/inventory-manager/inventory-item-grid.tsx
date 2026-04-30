import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Empty, EmptyMedia } from "@/components/ui/empty";
import {
  ImageOff,
  Minus,
  PencilLine,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { Item } from "@/domains/items/item.types";
// import type { ItemTypeFilter } from "@/pages/crm/settings/inventory/_components/inventory-settings.utils"
// import type { ItemTypeFilter } from "@/types/index"
import { Spinner } from "../ui/spinner";

type ItemTypeFilter = "all" | "furniture" | "box";

function ItemImage({
  imageUrl,
  alt,
}: {
  imageUrl?: string | null;
  alt: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    return (
      <Empty className="aspect-video w-full p-2">
        <EmptyMedia variant="icon">
          <ImageOff className="size-6" />
        </EmptyMedia>
      </Empty>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="aspect-video w-full object-contain"
      onError={() => setHasError(true)}
    />
  );
}

function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border px-2 py-1">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={onDecrement}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="min-w-6 text-center text-sm font-semibold">
        {quantity}
      </span>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={onIncrement}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

type InventoryItemGridProps =
  | {
      variant: "admin";
      items: [string, Item[]][];
      isLoading: boolean;
      search: string;
      onSearchChange: (value: string) => void;
      typeFilter: ItemTypeFilter;
      onTypeFilterChange: (value: ItemTypeFilter) => void;
      onEdit: (item: Item) => void;
      onDelete?: (item: Item) => void;
      emptyText?: string;
      searchPlaceholder?: string;
    }
  | {
      variant: "request";
      items: [string, Item[]][];
      isLoading: boolean;
      search: string;
      onSearchChange: (value: string) => void;
      typeFilter: ItemTypeFilter;
      onTypeFilterChange: (value: ItemTypeFilter) => void;
      getQuantity: (item: Item) => number;
      onIncrement: (item: Item) => void;
      onDecrement: (item: Item) => void;
      onEdit?: (item: Item) => void;
      emptyText?: string;
      searchPlaceholder?: string;
    };

export function InventoryItemGrid(props: InventoryItemGridProps) {
  const {
    items,
    isLoading,
    search,
    onSearchChange,
    typeFilter,
    onTypeFilterChange,
    searchPlaceholder = "Search for an item",
  } = props;

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(value) => onTypeFilterChange(value as ItemTypeFilter)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="furniture">Furniture</SelectItem>
            <SelectItem value="box">Box</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Spinner />
        </div>
      )}

      <div
      // className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {items?.map(([title, items]) => (
          <div key={title} className="px-4">
            <div className="my-3 flex items-center gap-3 border-b border-dashed pb-1">
              <p className="font-bold">{title}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="h-full max-w-xs overflow-hidden border"
                  size="sm"
                >
                  <CardHeader>
                    <CardDescription>{item.volume} cu ft</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ItemImage imageUrl={item.image_url} alt={item.name} />
                    <div>
                      <p className="truncate text-center text-sm font-medium">
                        {item.name}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {props.variant === "request" ? (
                      <div className="flex w-full items-center justify-between gap-2">
                        <QuantityControl
                          quantity={props.getQuantity(item)}
                          onIncrement={() => props.onIncrement(item)}
                          onDecrement={() => props.onDecrement(item)}
                        />
                        {props.onEdit ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => props.onEdit?.(item)}
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                          </Button>
                        ) : undefined}
                      </div>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => props.onEdit(item)}
                        >
                          <PencilLine className="h-4 w-4" />
                          Edit
                        </Button>
                        {props.onDelete && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => props.onDelete?.(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
