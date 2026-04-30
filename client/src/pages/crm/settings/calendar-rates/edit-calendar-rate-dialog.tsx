import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { hexToRgb } from "@/lib/helpers";
import { formatDate } from "@/lib/format-date";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useRates } from "@/hooks/api/use-rates";
import {
  useCalendarRates,
  useCreateCalendarRate,
  useUpdateCalendarRate,
} from "@/hooks/api/use-calendar-rates";
import type { CalendarRate } from "@/types/index";

export function EditCalendarRateDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParams = searchParams.get("edit");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editDate, setEditDate] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string>("1");

  const { data: dbRates, isPending } = useRates({
    select: (data) => data.filter((rate) => rate.active),
  });

  const defaultRate = useMemo(() => {
    return dbRates?.find((rate) => rate.is_default) ?? null;
  }, [dbRates]);

  const { data: calendarRates, isPending: isCalendarRatesPending } =
    useCalendarRates();

  const { mutate: updateCalendarRateMutation } = useUpdateCalendarRate();

  const { mutate: createCalendarRateMutation } = useCreateCalendarRate();

  const calendarRate = editDate ? calendarRates?.[editDate] : null;

  useEffect(() => {
    if (dateParams) {
      setEditDate(dateParams);
      setIsOpen(true);
    }
  }, [dateParams]);

  useEffect(() => {
    if (calendarRate) {
      const value = calendarRate.rate_id
        ? calendarRate.rate_id.toString()
        : "0";
      setSelectedValue(value);
    } else {
      if (!defaultRate) return;
      setSelectedValue(defaultRate.id.toString() ?? "0");
    }
  }, [calendarRate, defaultRate]);

  function handleCancel() {
    setIsOpen(false);
    setSearchParams();
  }

  function handleSaveRate(id: number, newRateId: number) {
    const newData: Partial<CalendarRate> = {
      is_blocked: newRateId === 0,
      rate_id: newRateId === 0 ? null : newRateId,
    };

    if (id) {
      updateCalendarRateMutation({
        id,
        data: newData,
      });
    } else {
      createCalendarRateMutation({
        date: editDate,
        ...newData,
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>
            {isCalendarRatesPending || !editDate ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              formatDate(editDate, "PPP")
            )}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex h-80 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <RadioGroup
            value={selectedValue}
            onValueChange={(value) => {
              setSelectedValue(value);
              if (calendarRate) {
                handleSaveRate(calendarRate.id, parseInt(value));
              } else {
                handleSaveRate(0, parseInt(value));
              }
            }}
          >
            {dbRates?.map((rate) => (
              <FieldLabel
                key={rate.id}
                htmlFor={rate.id.toString()}
                style={{
                  color: rate.color,
                  backgroundColor: `rgba(${hexToRgb(rate.color)}, 0.1)`,
                }}
              >
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>
                      {rate.name}
                      <span
                        className="size-2 rounded-full"
                        style={{
                          backgroundColor: rate.color,
                        }}
                      ></span>
                    </FieldTitle>
                  </FieldContent>
                  <RadioGroupItem
                    value={rate.id.toString()}
                    id={rate.id.toString()}
                  />
                </Field>
              </FieldLabel>
            ))}
            <FieldLabel
              key="blocked"
              htmlFor="0"
              style={{
                color: "#000000",
                backgroundColor: `rgba(${hexToRgb("#000000")}, 0.1)`,
              }}
            >
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>
                    Blocked
                    <span
                      className="size-2 rounded-full"
                      style={{
                        backgroundColor: "#000000",
                      }}
                    ></span>
                  </FieldTitle>
                </FieldContent>
                <RadioGroupItem value="0" id="0" />
              </Field>
            </FieldLabel>
          </RadioGroup>
        )}
      </DialogContent>
    </Dialog>
  );
}
