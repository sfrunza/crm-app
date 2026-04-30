import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { DATE_FILTER_OPTIONS } from '@/domains/requests/request.constants';
import {
  useTableRequestsStore,
  type DateFilter,
} from '@/stores/use-table-requests-store';
import { memo } from 'react';

const DateFilterItem = memo(
  ({
    option,
    isActive,
    onClick,
  }: {
    option: { value: string; label: string };
    isActive: boolean;
    onClick: () => void;
  }) => {
    return (
      <Button
        variant={isActive ? 'default' : 'outline'}
        size="sm"
        className="rounded-full"
        onClick={onClick}
      >
        {option.label}
      </Button>
    );
  }
);

export function DateFilterTabs() {
  const dateFilter = useTableRequestsStore((state) => state.dateFilter);
  const setDateFilter = useTableRequestsStore((state) => state.setDateFilter);
  const setPage = useTableRequestsStore((state) => state.setPage);

  const handleDateFilterChange = (value: DateFilter) => {
    setDateFilter(value);
    setPage(1); // Reset to first page when filter changes
  };

  return (
    <ScrollArea className="w-full px-4 whitespace-nowrap">
      <div className="flex gap-2">
        {DATE_FILTER_OPTIONS.map((option) => {
          const isActive = option.value === dateFilter;
          return (
            <DateFilterItem
              key={option.value}
              option={option}
              isActive={isActive}
              onClick={() => handleDateFilterChange(option.value as DateFilter)}
            />
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
}
