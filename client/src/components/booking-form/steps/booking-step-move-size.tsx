import { Controller, useFormContext } from "react-hook-form"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMoveSizes } from "@/hooks/api/use-move-sizes"
import { useEntranceTypes } from "@/hooks/api/use-entrance-types"
import type { BookingFormValues } from "../booking-form-schema"

export function BookingStepMoveSize() {
  const form = useFormContext<BookingFormValues>()
  const { data: moveSizes } = useMoveSizes({
    select: (rows) => [...rows].sort((a, b) => a.position - b.position),
  })
  const { data: entranceTypes } = useEntranceTypes({
    select: (rows) => [...rows].sort((a, b) => a.position - b.position),
  })

  return (
    <FieldGroup className="gap-6">
      <Controller
        name="move_size_id"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Size of move</FieldLabel>
            <Select
              value={field.value > 0 ? String(field.value) : ""}
              onValueChange={(v) => field.onChange(Number(v))}
              disabled={!moveSizes?.length}
            >
              <SelectTrigger
                className="w-full"
                aria-invalid={fieldState.invalid}
              >
                <SelectValue placeholder="Select move size" />
              </SelectTrigger>
              <SelectContent>
                {moveSizes?.map((size) => (
                  <SelectItem key={size.id} value={String(size.id)}>
                    {size.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              Pick the option that best matches the home or office you are
              moving.
            </FieldDescription>
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Controller
          name="origin_floor_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Floors at origin</FieldLabel>
              <Select
                value={field.value > 0 ? String(field.value) : ""}
                onValueChange={(v) => field.onChange(Number(v))}
                disabled={!entranceTypes?.length}
              >
                <SelectTrigger
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Origin floor / access" />
                </SelectTrigger>
                <SelectContent>
                  {entranceTypes?.map((entrance) => (
                    <SelectItem key={entrance.id} value={String(entrance.id)}>
                      {entrance.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="destination_floor_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Floors at destination</FieldLabel>
              <Select
                value={field.value > 0 ? String(field.value) : ""}
                onValueChange={(v) => field.onChange(Number(v))}
                disabled={!entranceTypes?.length}
              >
                <SelectTrigger
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Destination floor / access" />
                </SelectTrigger>
                <SelectContent>
                  {entranceTypes?.map((entrance) => (
                    <SelectItem key={entrance.id} value={String(entrance.id)}>
                      {entrance.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </div>
    </FieldGroup>
  )
}
