import { ClockIcon, PencilLineIcon, SunIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { requestKeys } from "@/domains/requests/request.keys";
import { useUpdateRequest } from "@/domains/requests/request.mutations";
import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/query-client";
import { useState } from "react";
import { toast } from "sonner";

type TimeOption = {
  label: string;
  description: string;
  value: string;
  icon: React.ElementType;
  start: number | null;
  end: number | null;
};

const TIME_OPTIONS: TimeOption[] = [
  {
    label: "Any time",
    description: "Flexible schedule",
    value: "any",
    icon: ClockIcon,
    start: null,
    end: null,
  },
  {
    label: "8 AM",
    description: "Early morning",
    value: "8am",
    icon: SunIcon,
    start: 480,
    end: null,
  },
  {
    label: "11 AM - 2 PM",
    description: "Late morning",
    value: "11am-2pm",
    icon: SunIcon,
    start: 660,
    end: 840,
  },
  {
    label: "1 PM - 4 PM",
    description: "Afternoon",
    value: "1pm-4pm",
    icon: ClockIcon,
    start: 780,
    end: 960,
  },
  {
    label: "3 PM - 6 PM",
    description: "Late afternoon",
    value: "3pm-6pm",
    icon: ClockIcon,
    start: 900,
    end: 1080,
  },
];

function findCurrentOption(start: number | null, end: number | null): string {
  const match = TIME_OPTIONS.find(
    (opt) => opt.start === start && opt.end === end,
  );
  return match?.value ?? "any";
}

type StartTimeDialogProps = {
  requestId: number;
  startTime: number | null;
  endTime: number | null;
  type: "move" | "delivery";
};

export function StartTimeDialog({
  requestId,
  startTime,
  endTime,
  type,
}: StartTimeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(() =>
    findCurrentOption(startTime, endTime),
  );

  const { mutate: updateRequestMutation, isPending: isUpdating } =
    useUpdateRequest(
      {
        onSettled: (_, error) => {
          if (error) {
            toast.error("Failed to save changes");
          } else {
            console.log("requestId", requestId);
            queryClient.invalidateQueries({
              queryKey: requestKeys.detail(requestId),
            });
            toast.success("Changes saved");
            setIsOpen(false);
          }
        },
      },
      { forceCalculate: false },
    );

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) {
      setSelected(findCurrentOption(startTime, endTime));
    }
  }

  function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const option = TIME_OPTIONS.find((opt) => opt.value === selected);
    if (!option) return;

    const data =
      type === "move"
        ? {
            start_time_window: option.start,
            end_time_window: option.end,
          }
        : {
            start_time_window_delivery: option.start,
            end_time_window_delivery: option.end,
          };

    updateRequestMutation({ id: requestId, data });
  }

  const title =
    type === "move" ? "Preferred start time" : "Preferred delivery time";
  const formId = `start-time-form-${type}`;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PencilLineIcon />
          Edit time
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Choose your preferred time window
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} id={formId}>
          <RadioGroup
            value={selected}
            onValueChange={setSelected}
            className="grid grid-cols-2 gap-3"
          >
            {TIME_OPTIONS.map((opt) => {
              const isSelected = selected === opt.value;
              const Icon = opt.icon;

              return (
                <label
                  key={opt.value}
                  htmlFor={`time-${type}-${opt.value}`}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-1.5 rounded-xl border p-4 text-center transition-all",
                    "hover:border-primary/40 hover:bg-primary/5",
                    isSelected
                      ? "border-primary bg-primary/5 ring-primary/20"
                      : "border-border",
                  )}
                >
                  <RadioGroupItem
                    value={opt.value}
                    id={`time-${type}-${opt.value}`}
                    className="sr-only"
                  />
                  <Icon className="text-muted-foreground mr-1 size-5" />
                  <span className="text-sm font-semibold">{opt.label}</span>
                </label>
              );
            })}
          </RadioGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form={formId} disabled={isUpdating}>
            <LoadingSwap isLoading={isUpdating}>Save</LoadingSwap>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
