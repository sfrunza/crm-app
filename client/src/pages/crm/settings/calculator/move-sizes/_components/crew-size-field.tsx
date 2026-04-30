import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EntranceType } from "@/types/index";
import type { FieldError as RHFFieldError } from "react-hook-form";

type CrewSizeFieldProps = {
  value: number[][] | undefined;
  onChange: (value: number[][]) => void;
  fieldError?: RHFFieldError;
  entranceTypes: EntranceType[] | undefined;
};

export function CrewSizeField({
  value,
  onChange,
  fieldError,
  entranceTypes,
}: CrewSizeFieldProps) {
  if (!entranceTypes || entranceTypes.length === 0) {
    return (
      <Field>
        <FieldContent>
          <FieldLabel>Crew size settings</FieldLabel>
          <FieldDescription>
            Configure the number of movers needed for each combination of origin
            and destination entrance types.
          </FieldDescription>
        </FieldContent>
        <div className="py-4 text-sm text-muted-foreground">
          No entrance types available. Please add entrance types first.
        </div>
      </Field>
    );
  }

  const handleCellChange = (
    rowIdx: number,
    colIdx: number,
    cellValue: number | null
  ) => {
    const newSettings = value
      ? value.map((row) => [...row])
      : Array.from({ length: entranceTypes.length }, () =>
          Array(entranceTypes.length).fill(2)
        );

    if (!newSettings[rowIdx]) {
      newSettings[rowIdx] = Array(entranceTypes.length).fill(2);
    }

    newSettings[rowIdx][colIdx] = cellValue ?? 2;
    onChange(newSettings);
  };

  return (
    <Field data-invalid={!!fieldError}>
      <FieldContent>
        <FieldLabel>Crew size settings</FieldLabel>
        <FieldDescription>
          Configure the number of movers needed for each combination of origin
          and destination entrance types.
        </FieldDescription>
      </FieldContent>
      <div className="mt-2 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 min-w-[120px] bg-background">
                Origin → Destination
              </TableHead>
              {entranceTypes.map((type) => (
                <TableHead key={type.id} className="min-w-[100px] text-center">
                  {type.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {entranceTypes.map((originType, rowIdx) => {
              const row = value?.[rowIdx] ?? [];
              return (
                <TableRow key={originType.id}>
                  <TableCell className="sticky left-0 z-10 bg-background font-medium">
                    {originType.name}
                  </TableCell>
                  {entranceTypes.map((destType, colIdx) => (
                    <TableCell key={`${originType.id}-${destType.id}`}>
                      <NumberInput
                        id={`crew-size-${originType.id}-${destType.id}`}
                        name={`crew-size-${originType.id}-${destType.id}`}
                        value={row[colIdx] ?? 2}
                        onChange={(v) => handleCellChange(rowIdx, colIdx, v)}
                        className="w-full"
                        min={2}
                        step={1}
                        inputMode="numeric"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {fieldError && <FieldError errors={[fieldError]} />}
    </Field>
  );
}
