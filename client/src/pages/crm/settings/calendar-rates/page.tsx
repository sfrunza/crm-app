import { PageContent, PageHeader, PageTitle } from "@/components/page-component"
import { useSearchParams } from "react-router"
import { EditCalendarRateDialog } from "./edit-calendar-rate-dialog"
import { CalendarWithRates } from "@/components/calendar-with-rates"
import { useCalendarRates } from "@/hooks/api/use-calendar-rates"
import { Fragment } from "react"
import { formatDate } from "@/lib/format-date"
import { useRates } from "@/hooks/api/use-rates"

function CalendarRatesPage() {
  const [_, setSearchParams] = useSearchParams()

  const { data: calendarRates, isLoading } = useCalendarRates()
  const { data: rates } = useRates() //array

  return (
    <Fragment>
      {/* Actions based on search params */}
      <EditCalendarRateDialog />

      <PageHeader>
        <PageTitle>Calendar rates</PageTitle>
      </PageHeader>

      <PageContent className="flex justify-center">
        <CalendarWithRates
          rates={rates}
          calendarRates={calendarRates}
          isLoading={isLoading}
          onDayClick={(date: Date | undefined) => {
            if (!date) return
            setSearchParams({
              edit: formatDate(date, "yyyy-MM-dd"),
            })
          }}
          hideNavigation={true}
          showFooter={true}
          numberOfMonths={12}
          showOutsideDays={false}
          classNames={{
            months: "grid sm:grid-cols-2 gap-8 relative",
            month: "bg-card border p-3 rounded-xl flex flex-col w-full gap-4",
          }}
        />
      </PageContent>
    </Fragment>
  )
}

export const Component = CalendarRatesPage
