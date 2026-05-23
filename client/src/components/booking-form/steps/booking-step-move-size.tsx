import { Controller, useFormContext, useWatch } from "react-hook-form"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEntranceTypes } from "@/hooks/api/use-entrance-types"
import { useMoveSizes } from "@/hooks/api/use-move-sizes"
import { FormCard } from "../form-card"
import {
  serviceCodesForDestinationZip,
  serviceCodesForOriginZip,
  type FormSchema,
} from "../booking-form-schema"

interface BookingStepMoveSizeProps {
  goNext: () => void
  goBack: () => void
}

export function BookingStepMoveSize({
  goNext,
  goBack,
}: BookingStepMoveSizeProps) {
  const { data: moveSizes } = useMoveSizes({
    select: (rows) => [...rows].sort((a, b) => a.position - b.position),
  })
  const { data: entranceTypes } = useEntranceTypes({
    select: (rows) => [...rows].sort((a, b) => a.position - b.position),
  })

  const { control } = useFormContext<FormSchema>()
  const movingServiceCode = useWatch({
    control: control,
    name: "service_code",
  })
  const showOriginFloor = serviceCodesForOriginZip.includes(movingServiceCode!)

  const showDestinationFloor = serviceCodesForDestinationZip.includes(
    movingServiceCode!
  )

  return (
    <FormCard title="Move details" handleNext={goNext} handleBack={goBack}>
      <FieldGroup>
        <Controller
          name="move_size_id"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Size of move</FieldLabel>
              <Select
                value={field.value > 0 ? String(field.value) : ""}
                onValueChange={(v) => field.onChange(Number(v))}
                disabled={!moveSizes?.length}
              >
                <SelectTrigger
                  id={field.name}
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Select move size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {moveSizes?.map((size) => (
                      <SelectItem key={size.id} value={String(size.id)}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {showOriginFloor && (
          <Controller
            name="origin.floor_id"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Floors at origin</FieldLabel>
                <Select
                  value={field.value?.toString() ?? ""}
                  onValueChange={(v) => field.onChange(Number(v))}
                  disabled={!entranceTypes?.length}
                >
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Origin floor / access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {entranceTypes?.map((entrance) => (
                        <SelectItem
                          key={entrance.id}
                          value={String(entrance.id)}
                        >
                          {entrance.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}

        {showDestinationFloor && (
          <Controller
            name="destination.floor_id"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Floors at destination
                </FieldLabel>
                <Select
                  value={field.value?.toString() ?? ""}
                  onValueChange={(v) => field.onChange(Number(v))}
                  disabled={!entranceTypes?.length}
                >
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Destination floor / access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {entranceTypes?.map((entrance) => (
                        <SelectItem
                          key={entrance.id}
                          value={String(entrance.id)}
                        >
                          {entrance.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}
      </FieldGroup>
    </FormCard>
  )
}
