import { useState } from 'react';

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
import { CheckIcon, ChevronsUpDownIcon } from '@/components/icons';

interface SelectWithSearchProps<T> {
  options: { label: string; value: T }[];
  value: T | null;
  handleSelect: (value: T) => void;
  id?: string;
  className?: string;
}

export function SelectWithSearch<T>({
  options,
  value,
  handleSelect,
  id,
  className,
}: SelectWithSearchProps<T>) {
  const [open, setOpen] = useState<boolean>(false);
  const selected = options.find((o) => o.value === value)?.label;

  function _onSelect(val: string) {
    const selectedValue = options.find((o) => o.label === val)?.value;
    if (selectedValue) {
      handleSelect(selectedValue);
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild id={id}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('min-w-20 justify-between', className)}
        >
          <span className="">{selected}</span>
          <ChevronsUpDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] overflow-hidden p-0">
        <Command value={selected}>
          <CommandInput />
          <CommandList>
            <CommandEmpty>Not found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={option.label}
                  onSelect={_onSelect}
                >
                  {option.label}
                  <CheckIcon
                    className={cn(
                      'ml-auto size-4',
                      selected === option.label ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
