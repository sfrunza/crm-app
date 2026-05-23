import { CalendarWithRates } from "@/components/calendar-with-rates"
import { PencilLineIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { CalendarRateMap, Rate } from "@/types/index"
import { parseDateOnly } from "@/lib/format-date"
import { useMemo, useState } from "react"
import { startOfToday } from "date-fns"

interface EditDateProps {
  rates: Rate[] | undefined
  calendarRates: CalendarRateMap | undefined
  id?: string
  selected: Date | undefined
  onSelectDate: (date: Date) => void
  isLoading: boolean
}

export function EditDate({
  rates,
  calendarRates,
  id,
  selected,
  onSelectDate,
  isLoading,
  ...props
}: EditDateProps) {
  const [open, setOpen] = useState(false)

  const disabledDates = useMemo(() => {
    const blocked = Object.values(calendarRates ?? {})
      .map((rate) =>
        rate.is_blocked ? (parseDateOnly(rate.formatted_date) ?? null) : null
      )
      .filter((date): date is Date => date !== null)

    return [{ before: startOfToday() }, ...blocked]
  }, [calendarRates])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} variant="outline" size="sm">
          <PencilLineIcon />
          Edit date
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto overflow-hidden">
        <CalendarWithRates
          rates={rates}
          calendarRates={calendarRates}
          selected={selected}
          isLoading={!calendarRates}
          onDayClick={(date) => {
            onSelectDate(date)
            if (!isLoading) {
              setOpen(false)
            }
          }}
          modifiers={{
            disabled: disabledDates,
          }}
          startMonth={startOfToday()}
          defaultMonth={selected ?? startOfToday()}
          showFooter
          {...props}
        />
      </PopoverContent>
    </Popover>
  )
}
