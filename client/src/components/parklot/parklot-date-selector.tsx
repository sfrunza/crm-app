import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, formatDate, parseDateOnly } from "@/lib/format-date";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ParklotDateSelectorProps {
  selectedDate: string | null;
  setSelectedDate: (date: Date) => void;
  hideCalendar?: boolean;
  movingDate?: string | null;
  deliveryDate?: string | null;
  scheduleStartDate?: string | null;
  showDateTabs?: boolean;
  activeTab?: "pickup" | "delivery";
  onTabChange?: (tab: "pickup" | "delivery") => void;
}

export function ParklotDateSelector({
  selectedDate,
  setSelectedDate,
  hideCalendar = false,
  movingDate,
  deliveryDate,
  scheduleStartDate,
  showDateTabs = false,
  activeTab = "pickup",
  onTabChange,
}: ParklotDateSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  function handleDateChange(date: Date) {
    if (!date) return;
    setSelectedDate(date);
  }

  function handlePreviousDate() {
    if (!selectedDate) return;
    const parsedDate = parseDateOnly(selectedDate);
    if (!parsedDate) return;
    const prevDate = addDays(parsedDate, -1);
    setSelectedDate(prevDate);
  }

  function handleNextDate() {
    if (!selectedDate) return;
    const parsedDate = parseDateOnly(selectedDate);
    if (!parsedDate) return;
    const nextDate = addDays(parsedDate, 1);
    setSelectedDate(nextDate);
  }

  function handleTabChange(tab: "pickup" | "delivery") {
    // Navigate to the tab's date
    // For delivery: jump to schedule start date (first day the truck needs to drive)
    // which may be earlier than the actual delivery date
    const targetDate =
      tab === "delivery" ? (scheduleStartDate ?? deliveryDate) : movingDate;
    if (targetDate) {
      const parsed = parseDateOnly(targetDate);
      if (parsed) handleDateChange(parsed);
    }

    // Notify parent (updates parklotContext)
    onTabChange?.(tab);
  }

  return (
    <div className="bg-background relative border-b py-2">
      {showDateTabs && (
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            handleTabChange(value as "pickup" | "delivery")
          }
          className="mb-2 px-4 lg:absolute lg:top-2 lg:left-0"
        >
          <TabsList className="h-auto">
            <TabsTrigger value="pickup">
              <span className="text-[12px] font-semibold">Pickup</span>
              <span className="text-[10px]">
                {formatDate(parseDateOnly(movingDate), "LLL dd, yyyy")}
              </span>
            </TabsTrigger>
            <TabsTrigger value="delivery">
              <span className="text-[12px] font-semibold">Delivery</span>
              <span className="text-[10px]">
                {formatDate(parseDateOnly(deliveryDate), "LLL dd, yyyy")}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      <div className="mx-auto flex max-w-sm flex-1 items-center justify-between">
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => handlePreviousDate()}
        >
          <ChevronLeftIcon />
        </Button>
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium sm:space-x-1">
            <span className="block sm:inline-block">
              {formatDate(selectedDate, "cccc, LLLL dd, yyyy")}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!hideCalendar && (
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button size="icon-sm" variant="outline">
                  <CalendarDaysIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parseDateOnly(selectedDate)}
                  defaultMonth={parseDateOnly(selectedDate)}
                  showOutsideDays={false}
                  onSelect={(date) => {
                    if (date) {
                      handleDateChange(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => handleNextDate()}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
