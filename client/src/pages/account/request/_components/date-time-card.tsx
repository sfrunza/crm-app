import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getRequestUIBehavior } from "@/domains/requests/request.behavior"
import { requestKeys } from "@/domains/requests/request.keys"
import { useUpdateRequest } from "@/domains/requests/request.mutations"
import { useRequest } from "@/hooks/use-request"
import { formatDate, parseDateOnly } from "@/lib/format-date"
import { timeWindowToString } from "@/lib/helpers"
import { queryClient } from "@/lib/query-client"
import { toast } from "sonner"
import { StartTimeDialog } from "./dialogs/start-time-dialog"
import { EditDate } from "./edit-date"
import { useCalendarRates } from "@/hooks/api/use-calendar-rates"
import { useRates } from "@/hooks/api/use-rates"

export function DateTimeCard() {
  const { request } = useRequest()
  const { data: calendarRates } = useCalendarRates()
  const { data: rates } = useRates()

  // if (!request) return null;

  const { mutate: updateRequestMutation, isPending: isUpdating } =
    useUpdateRequest(
      {
        onSettled: (_, err) => {
          if (err) {
            toast.error("Failed to save changes")
          } else {
            if (request) {
              queryClient.invalidateQueries({
                queryKey: requestKeys.detail(request.id),
              })
              toast.success("Changes saved")
            }
          }
        },
      },
      { forceCalculate: true }
    )

  const { showDeliveryDateTime } = getRequestUIBehavior(request)

  const canEdit = request?.can_edit_request

  return (
    <Card>
      <CardHeader>
        <CardTitle>Move date/time</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Moving date/time */}
        <div className="grid grid-cols-2 gap-6">
          <div className="grid gap-y-2 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="text-muted-foreground">Move date</p>
              <p>{formatDate(request?.moving_date ?? "")}</p>
            </div>
            <div>
              {canEdit && (
                <EditDate
                  rates={rates}
                  calendarRates={calendarRates}
                  selected={parseDateOnly(request?.moving_date ?? "")}
                  isLoading={isUpdating}
                  onSelectDate={(date) => {
                    updateRequestMutation({
                      id: request.id,
                      data: {
                        moving_date: formatDate(date, "yyyy-MM-dd"),
                      },
                    })
                  }}
                />
              )}
            </div>
          </div>
          <div className="grid gap-y-2 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="text-muted-foreground">Start time window</p>
              <p>
                {timeWindowToString(
                  request?.start_time_window ?? null,
                  request?.end_time_window ?? null
                )}
              </p>
            </div>
            <div>
              {canEdit && (
                <StartTimeDialog
                  requestId={request?.id ?? 0}
                  startTime={request?.start_time_window ?? null}
                  endTime={request?.end_time_window ?? null}
                  type="move"
                />
              )}
            </div>
          </div>
        </div>

        {/* Delivery date/time */}
        {showDeliveryDateTime && (
          <>
            <Separator />
            {/* ── Delivery date/time ─────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-y-2 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-muted-foreground">Delivery date</p>
                  <p className="flex flex-wrap max-sm:max-w-28">
                    {formatDate(request?.delivery_date_window_start ?? "")}
                    {request?.delivery_date_window_end
                      ? ` - ${formatDate(request?.delivery_date_window_end ?? "")}`
                      : ""}
                  </p>
                </div>
                <div>
                  {canEdit && (
                    <EditDate
                      rates={rates}
                      calendarRates={calendarRates}
                      selected={parseDateOnly(
                        request.delivery_date_window_start
                      )}
                      isLoading={isUpdating}
                      onSelectDate={(date) => {
                        updateRequestMutation({
                          id: request.id,
                          data: {
                            delivery_date_window_start: formatDate(
                              date,
                              "yyyy-MM-dd"
                            ),
                          },
                        })
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="grid gap-y-2 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-muted-foreground">Delivery time</p>
                  <p>
                    {timeWindowToString(
                      request?.start_time_window_delivery ?? null,
                      request?.end_time_window_delivery ?? null
                    )}
                  </p>
                </div>
                <div>
                  {canEdit && (
                    <StartTimeDialog
                      requestId={request?.id ?? 0}
                      startTime={request?.start_time_window_delivery ?? null}
                      endTime={request?.end_time_window_delivery ?? null}
                      type="delivery"
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
