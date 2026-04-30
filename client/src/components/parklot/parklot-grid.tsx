import { Spinner } from "@/components/ui/spinner";

interface ParklotGridProps {
  isLoading: boolean;
  DateSelector: React.ComponentType;
  Trucks: React.ComponentType;
  Timeline: React.ComponentType;
  Jobs: React.ComponentType;
}

export function ParklotGrid({
  isLoading,
  DateSelector,
  Trucks,
  Timeline,
  Jobs,
}: ParklotGridProps) {
  return (
    <>
      <DateSelector />
      <div className="relative grid h-full w-full grid-cols-[140px_auto] grid-rows-[45px_auto] overflow-y-auto select-none [grid-template-areas:'corner_table'_'trucks_table']">
        <div className="flex items-center justify-center border-b font-medium [grid-area:corner]">
          {isLoading ? <Spinner /> : null}
        </div>
        <Trucks />
        <div className="[grid-area:table]">
          <div className="grid translate-x-0 grid-cols-[min-content] grid-rows-[45px_auto]">
            <Timeline />
            <Jobs />
          </div>
        </div>
      </div>
    </>
  );
}
