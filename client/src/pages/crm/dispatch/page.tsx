import { useEffect, useState } from "react";
import { ParklotDay } from "./_components/parklot-day";
import { SidebarRight } from "./_components/sidebar-right";
import { formatDate } from "@/lib/format-date";
import { useSearchParams } from "react-router";
import type { Request } from "@/domains/requests/request.types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CalendarIcon, UsersIcon } from "@/components/icons";
import { useIsMobile } from "@/hooks/use-mobile";
import { openRequest } from "@/stores/use-open-requests-store";

function DispatchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const date = searchParams.get("date");
  const month = searchParams.get("month");
  const requestId = searchParams.get("requestId");

  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!date && !month) {
      setSearchParams({
        date: formatDate(new Date(), "yyyy-MM-dd"),
        month: formatDate(new Date(), "yyyy-MM"),
      });
    }
  }, []);

  function handleDateChange(date: Date) {
    const formattedMonth = formatDate(date, "yyyy-MM");

    setSearchParams((prev) => {
      prev.set("date", formatDate(date, "yyyy-MM-dd"));
      month !== formattedMonth && prev.set("month", formattedMonth);
      return prev;
    });
  }

  function handleMonthChange(month: Date) {
    setSearchParams((prev) => {
      prev.set("month", formatDate(month, "yyyy-MM"));
      return prev;
    });
  }

  function handleRequestClick(request: Request) {
    if (requestId && requestId === request.id.toString()) {
      openRequest(request.id);
    } else {
      setSearchParams((prev) => {
        prev.set("requestId", request.id.toString());
        return prev;
      });
      // Auto-open sheet only on mobile
      if (isMobile) {
        setSheetOpen(true);
      }
    }
  }

  const selectedRequestId = requestId ? Number(requestId) : null;

  const sidebarProps = {
    selectedDate: date,
    setSelectedDate: handleDateChange,
    selectedMonth: month,
    setSelectedMonth: handleMonthChange,
    selectedRequestId,
  };

  return (
    <div className="grid h-full lg:grid-cols-[auto_320px]">
      <div className="grid grid-rows-[max-content_auto] overflow-y-auto">
        <ParklotDay
          selectedDate={date}
          setSelectedDate={handleDateChange}
          selectedRequestId={selectedRequestId}
          handleRequestClick={handleRequestClick}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden grid-rows-[max-content_auto] overflow-y-auto border-l lg:grid">
        <SidebarRight {...sidebarProps} />
      </div>

      {/* Mobile floating button */}
      <Button
        size="icon"
        className="fixed right-4 bottom-4 z-40 size-12 rounded-full shadow-lg lg:hidden"
        onClick={() => setSheetOpen(true)}
      >
        {selectedRequestId ? (
          <UsersIcon className="size-5" />
        ) : (
          <CalendarIcon className="size-5" />
        )}
      </Button>

      {/* Mobile sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-xs">
          <SheetHeader>
            <SheetTitle>
              {selectedRequestId ? "Crew Assignment" : "Dispatch Calendar"}
            </SheetTitle>
          </SheetHeader>
          <SidebarRight {...sidebarProps} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export const Component = DispatchPage;
