import { Controller, useFormContext, useWatch } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { HouseIcon } from "@/components/icons"

interface BookingStepMoveSizeProps {
  goNext: () => void
  goBack: () => void
}

export function BookingStepMoveSize({
  goNext,
  goBack,
}: BookingStepMoveSizeProps) {
  const { data: moveSizes } = useMoveSizes()
  const { data: entranceTypes } = useEntranceTypes()

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
                  <div className="flex items-center gap-2">
                    <HouseIcon className="text-muted-foreground" />
                    <SelectValue placeholder="Select move size" />
                  </div>
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
              <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend variant="label" className="mb-1">
                  Origin floor / access
                </FieldLegend>
                <FieldDescription>
                  What floor are you moving from?
                </FieldDescription>
                <RadioGroup
                  name={field.name}
                  value={field.value?.toString()}
                  onValueChange={(v) => field.onChange(Number(v))}
                  aria-invalid={fieldState.invalid}
                  className="flex flex-row flex-wrap gap-2"
                >
                  {entranceTypes?.map((entrance) => (
                    <FieldLabel
                      key={entrance.id}
                      htmlFor={`origin-${entrance.id}`}
                      className="has-[>[data-slot=field]]:h-9 has-[>[data-slot=field]]:w-fit has-[>[data-slot=field]]:flex-1 has-[>[data-slot=field]]:px-4 *:data-[slot=field]:p-0"
                    >
                      <Field
                        orientation="horizontal"
                        data-invalid={fieldState.invalid}
                        className="h-full"
                      >
                        <FieldContent className="h-full items-center justify-center">
                          <FieldTitle>{entrance.form_name}</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem
                          value={entrance.id.toString()}
                          id={`origin-${entrance.id}`}
                          aria-invalid={fieldState.invalid}
                          className="hidden"
                        />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldSet>
            )}
          />
        )}

        {showDestinationFloor && (
          <Controller
            name="destination.floor_id"
            control={control}
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend variant="label" className="mb-1">
                  Destination floor / access
                </FieldLegend>
                <FieldDescription>
                  What floor are you moving to?
                </FieldDescription>
                <RadioGroup
                  name={field.name}
                  value={field.value?.toString()}
                  onValueChange={(v) => field.onChange(Number(v))}
                  aria-invalid={fieldState.invalid}
                  className="flex flex-row flex-wrap gap-2"
                >
                  {entranceTypes?.map((entrance) => (
                    <FieldLabel
                      key={entrance.id}
                      htmlFor={`destination-${entrance.id}`}
                      className="has-[>[data-slot=field]]:h-9 has-[>[data-slot=field]]:w-fit has-[>[data-slot=field]]:flex-1 has-[>[data-slot=field]]:px-4 *:data-[slot=field]:p-0"
                    >
                      <Field
                        orientation="horizontal"
                        data-invalid={fieldState.invalid}
                        className="h-full"
                      >
                        <FieldContent className="h-full items-center justify-center">
                          <FieldTitle>{entrance.form_name}</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem
                          value={entrance.id.toString()}
                          id={`destination-${entrance.id}`}
                          aria-invalid={fieldState.invalid}
                          className="hidden"
                        />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldSet>
            )}
          />
        )}

        {/* {showDestinationFloor && (
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
        )} */}
      </FieldGroup>
    </FormCard>
  )
}
