import { useState } from 'react';

import { CheckIcon, ChevronsUpDownIcon, XIcon } from '@/components/icons';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Separator } from '@/components/ui/separator';
import { TIME_OPTIONS_WITH_MERIDIEM } from '@/domains/requests/request.constants';

interface StartTimeRangeSelectProps {
  startTimeWindow: number | null;
  endTimeWindow: number | null;
  handleSelect: (
    filed: 'start_time_window' | 'end_time_window',
    value: number | null
  ) => void;
}

export function StartTimeRangeSelect({
  startTimeWindow,
  endTimeWindow,
  handleSelect,
}: StartTimeRangeSelectProps) {
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  const selectedStartTime = TIME_OPTIONS_WITH_MERIDIEM.find(
    (framework) => framework.value === startTimeWindow
  )?.label;
  const selectedEndTime = TIME_OPTIONS_WITH_MERIDIEM.find(
    (framework) => framework.value === endTimeWindow
  )?.label;

  return (
    <div className="flex h-9">
      <Popover open={openStart} onOpenChange={setOpenStart}>
        <PopoverTrigger asChild id="start-time-window">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openStart}
            className="min-w-20 justify-between rounded-r-none border-r-0"
          >
            <span className="min-w-16">{selectedStartTime}</span>
            <ChevronsUpDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] overflow-hidden p-0">
          <Command value={selectedStartTime}>
            <CommandInput />
            <CommandList>
              <CommandEmpty>No time found.</CommandEmpty>
              <CommandGroup>
                {TIME_OPTIONS_WITH_MERIDIEM.map((framework) => (
                  <CommandItem
                    // itemType="tel"
                    key={framework.value}
                    value={framework.label}
                    onSelect={(currentValue) => {
                      const newStartTimeValue = TIME_OPTIONS_WITH_MERIDIEM.find(
                        (time) => time.label === currentValue
                      )?.value;
                      handleSelect(
                        'start_time_window',
                        Number(newStartTimeValue)
                      );
                      setOpenStart(false);
                    }}
                  >
                    {framework.label}
                    <CheckIcon
                      className={cn(
                        'ml-auto',
                        startTimeWindow === framework.value
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Separator orientation="vertical" className="h-full" />
      <Popover open={openEnd} onOpenChange={setOpenEnd}>
        <div className="relative flex items-center">
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openEnd}
              className="min-w-22.5 flex-1 justify-between rounded-l-none border-l-0 pr-5"
            >
              <span className="min-w-16">{selectedEndTime}</span>
              <ChevronsUpDownIcon />
            </Button>
          </PopoverTrigger>
          {/* Clear button OUTSIDE PopoverTrigger */}
          {endTimeWindow && (
            <XIcon
              className="hover:text-muted-foreground absolute top-1/2 right-1 size-4 -translate-y-1/2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('end_time_window', null);
              }}
            />
          )}
        </div>
        <PopoverContent className="w-[200px] p-0">
          <Command value={selectedEndTime}>
            <CommandInput />
            <CommandList>
              <CommandEmpty>No time found.</CommandEmpty>
              <CommandGroup>
                {TIME_OPTIONS_WITH_MERIDIEM.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.label}
                    onSelect={(currentValue) => {
                      const newStartTimeValue = TIME_OPTIONS_WITH_MERIDIEM.find(
                        (time) => time.label === currentValue
                      )?.value;
                      handleSelect(
                        'end_time_window',
                        Number(newStartTimeValue)
                      );
                      setOpenEnd(false);
                    }}
                  >
                    {framework.label}
                    <CheckIcon
                      className={cn(
                        'ml-auto',
                        endTimeWindow === framework.value
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
