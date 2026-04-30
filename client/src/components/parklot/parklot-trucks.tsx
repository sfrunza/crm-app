import type { Truck } from "@/types/index";
import { cn } from "@/lib/utils";

interface ParklotTrucksProps {
  trucks: Truck[];
  selectedTrucks?: number[];
  onTruckClick?: (truckId: number) => void;
  size?: "sm" | "lg";
}
export function ParklotTrucks({
  trucks,
  selectedTrucks,
  onTruckClick,
  size = "sm",
}: ParklotTrucksProps) {
  const rowHight = {
    sm: "auto-rows-[55px]",
    lg: "auto-rows-[100px]",
  };

  return (
    <div
      className={cn(
        "grid-area:trucks] sticky left-0 z-20 grid grid-cols-[100%]",
        rowHight[size]
      )}
    >
      {trucks?.map((truck) => {
        return (
          <div
            key={truck.id}
            onClick={
              onTruckClick
                ? (e) => {
                    e.stopPropagation();
                    onTruckClick(truck.id);
                  }
                : undefined
            }
            className={cn(
              "relative flex items-center justify-center border-r border-b bg-muted text-sm font-semibold",
              {
                "cursor-pointer": Boolean(onTruckClick),
                "bg-primary text-primary-foreground": selectedTrucks?.includes(
                  truck.id
                ),
              }
            )}
          >
            {truck.name} #{truck.id}
          </div>
        );
      })}
    </div>
  );
}
