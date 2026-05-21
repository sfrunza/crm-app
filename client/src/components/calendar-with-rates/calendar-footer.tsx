import { InfoIcon } from "@/components/icons"
import { useState } from "react"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatCentsToDollarsString, hexToRgb } from "@/lib/helpers"
import { cn } from "@/lib/utils"
import type { Rate } from "@/types/index"

const MOVER_KEYS = ["2", "3", "4"] as const

function MoverRatesList({ rate }: { rate: Rate }) {
  return (
    <div className="w-full space-y-1">
      {MOVER_KEYS.map((key) => {
        const hourly = rate.movers_rates[key]?.hourly_rate
        if (hourly == null) return null
        return (
          <div
            key={key}
            className="flex w-full justify-between gap-4 py-0.5 text-xs"
          >
            <span>{key} movers & truck</span>
            <span className="font-semibold">
              {formatCentsToDollarsString(hourly)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function RateFooterLabel({ rate }: { rate: Rate }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-semibold"
      style={{
        color: rate.color,
        backgroundColor: `rgba(${hexToRgb(rate.color)}, 0.1)`,
      }}
    >
      {rate.name}
      <InfoIcon className="size-3.5 opacity-70" />
    </div>
  )
}

function RateFooterItem({ rate }: { rate: Rate }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const ratesPanel = <MoverRatesList rate={rate} />

  if (isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger>
          <RateFooterLabel rate={rate} />
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          className="w-56 p-3"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {ratesPanel}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger className="cursor-help">
        <RateFooterLabel rate={rate} />
      </HoverCardTrigger>
      <HoverCardContent side="top" align="center" className="w-56 p-3">
        {ratesPanel}
      </HoverCardContent>
    </HoverCard>
  )
}

type CalendarFooterProps = {
  rates: Rate[] | undefined
  className?: string
}

export function CalendarFooter({ rates, className }: CalendarFooterProps) {
  const activeRates = rates?.filter((r) => r.active) ?? []

  return (
    <div className="@container mt-6 border-t">
      <div className="flex flex-wrap items-center gap-3 pt-4">
        {activeRates.map((rate) => (
          <RateFooterItem key={rate.id} rate={rate} />
        ))}
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-semibold",
            className
          )}
          style={{
            color: "#000000",
            backgroundColor: "#dcdcdc",
          }}
        >
          Blocked
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: "#000000" }}
          />
        </div>
      </div>
    </div>
  )
}
