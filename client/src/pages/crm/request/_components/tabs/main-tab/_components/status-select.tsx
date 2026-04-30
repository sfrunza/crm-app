import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  STATUS_BG_COLOR,
  STATUS_OPTIONS,
} from '@/domains/requests/request.constants';
import { useRequest } from '@/hooks/use-request';
import { cn } from '@/lib/utils';
import type { Status } from '@/domains/requests/request.types';

export function StatusSelect() {
  const { draft, setField } = useRequest();

  return (
    <Select
      value={draft?.status ?? ''}
      onValueChange={(val: Status) => {
        setField('status', val);
      }}
    >
      <SelectTrigger
        className={cn(
          "w-full font-medium text-white md:w-56 [&_svg]:text-white [&_svg:not([class*='text-'])]:text-white",
          STATUS_BG_COLOR[draft?.status as Status]
        )}
      >
        <SelectValue placeholder="select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {STATUS_OPTIONS.map((status, i) => {
            return (
              <SelectItem key={i} value={status.value}>
                {status.label}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
