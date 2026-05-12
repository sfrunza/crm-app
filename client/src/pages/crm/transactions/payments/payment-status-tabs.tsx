import { TABLE_CONFIG } from "@/components/data-table/table.config"
import {
  ContentHeader,
  ContentTab,
  ContentTabCount,
  ContentTabIndicator,
  ContentTabs,
  ContentTabTitle,
} from "@/components/content-tabs"
import {
  PAYMENT_STATUS_BG_COLOR,
  PAYMENT_TAB_OPTIONS,
  type PaymentTabValue,
} from "@/domains/payments/payment.constants"
import { useGetPaymentStatusCounts } from "@/domains/payments/payment.queries"
import type {
  PaymentStatusCountsParams,
  PaymentStatusFilter,
} from "@/domains/payments/payment.types"
import { PAYMENT_STATUSES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"

function parseStatusParam(value: string | null): PaymentStatusFilter {
  if (!value) return "all"
  if (value === "all") return "all"
  return PAYMENT_STATUSES.includes(value as (typeof PAYMENT_STATUSES)[number])
    ? (value as PaymentStatusFilter)
    : "all"
}

export function PaymentStatusTabs() {
  const [searchParams, setSearchParams] = useSearchParams()

  const statusFilter = parseStatusParam(searchParams.get("status"))
  const startDate = searchParams.get("start_date")
  const endDate = searchParams.get("end_date")

  const countsParams = useMemo<PaymentStatusCountsParams>(() => {
    return {
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
    }
  }, [startDate, endDate])

  const { data: statusCounts } = useGetPaymentStatusCounts(countsParams, {
    staleTime: TABLE_CONFIG.STALE_TIME,
    gcTime: TABLE_CONFIG.GC_TIME,
    refetchOnMount: true,
  })

  const handleTabClick = useCallback(
    (value: PaymentTabValue) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value === "all") next.delete("status")
        else next.set("status", value)
        next.delete("page")
        return next
      })
    },
    [setSearchParams]
  )

  const tabs = useMemo(() => {
    return PAYMENT_TAB_OPTIONS.map((tab) => ({
      value: tab.value,
      label: tab.label,
      count: statusCounts?.[tab.value] ?? 0,
    }))
  }, [statusCounts])

  return (
    <ContentTabs>
      {tabs.map((tab) => (
        <ContentTab
          key={tab.value}
          isActive={statusFilter === tab.value}
          onTabClick={() => handleTabClick(tab.value)}
        >
          <ContentHeader>
            <ContentTabTitle>{tab.label}</ContentTabTitle>
            <ContentTabCount>{tab.count}</ContentTabCount>
            <ContentTabIndicator>
              <div
                className={cn(
                  "size-2 rounded-full",
                  PAYMENT_STATUS_BG_COLOR[tab.value]
                )}
              />
            </ContentTabIndicator>
          </ContentHeader>
        </ContentTab>
      ))}
    </ContentTabs>
  )
}
