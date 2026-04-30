import { SelectWithSearch } from "@/components/inputs/select-with-search"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { usStates } from "@/lib/usStates"
import { debounce } from "throttle-debounce"
import { useCallback, useEffect, useRef } from "react"
import type { Address } from "@/domains/requests/request.types"
import { AddressAutocompleteInput } from "@/components/inputs/address-autocomplete-input"
import { useEntranceTypes } from "@/hooks/api/use-entrance-types"

const DEBOUNCE_DELAY = 1000

const formSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.enum(usStates).optional(),
  zip: z.string().optional(),
  apt: z.string().optional(),
  floor_id: z.number().nullable().optional(),
  location: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddressFormProps {
  data?: Address
  onAddressChange: (values: FormValues) => void
}

export function AddressForm({ data, onAddressChange }: AddressFormProps) {
  const { data: floorOptions } = useEntranceTypes()

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    values: {
      street: data?.street ?? "",
      city: data?.city ?? "",
      state: data?.state ?? "",
      zip: data?.zip ?? "",
      apt: data?.apt ?? "",
      floor_id: data?.floor_id ?? null,
      location: data?.location ?? { lat: 0, lng: 0 },
    },
  })

  // Watch only specific fields instead of entire form
  const street = useWatch({ control: form.control, name: "street" })
  const city = useWatch({ control: form.control, name: "city" })
  const state = useWatch({ control: form.control, name: "state" })
  const zip = useWatch({ control: form.control, name: "zip" })
  const apt = useWatch({ control: form.control, name: "apt" })
  const floor_id = useWatch({ control: form.control, name: "floor_id" })
  const location = useWatch({ control: form.control, name: "location" })

  // Use ref to store latest setField to avoid recreating debounced function
  // Stable onSubmit function using refs
  const onChange = useCallback(
    (values: FormValues) => {
      // console.log("values", values);
      onAddressChange(values)
    },
    [onAddressChange]
  )

  // Stable debounced function that doesn't recreate
  const debouncedSubmit = useRef(
    debounce(DEBOUNCE_DELAY, (values: FormValues) => {
      onChange(values)
    })
  ).current

  useEffect(() => {
    if (form.formState.isDirty) {
      debouncedSubmit({
        street,
        city,
        state,
        zip,
        apt,
        floor_id,
        location,
      })
    }
  }, [
    street,
    city,
    state,
    zip,
    apt,
    floor_id,
    location,
    form.formState.isDirty,
    debouncedSubmit,
  ])

  // Stable onAddressSelect function
  const onAddressSelect = useCallback(
    (address: Partial<Address>) => {
      // console.log("address", address);

      Object.entries(address).forEach(([key, value]) => {
        form.setValue(key as keyof FormValues, value ?? "", {
          shouldDirty: true,
        })
      })
    },
    [form]
  )

  return (
    <form id="address-form">
      <div className="grid grid-cols-12 gap-2">
        <Controller
          name="street"
          control={form.control}
          render={({ field }) => (
            <Field className="col-span-9">
              {/* <AutocompleteInput
                value={field.value}
                onChange={field.onChange}
                onAddressSelect={onAddressSelect}
                placeholder="Address"
                name={field.name}
              /> */}
              <AddressAutocompleteInput
                value={field.value}
                onChange={field.onChange}
                onAddressSelect={onAddressSelect}
                placeholder="Address"
                name={field.name}
              />
            </Field>
          )}
        />
        <Controller
          name="apt"
          control={form.control}
          render={({ field }) => (
            <Field className="col-span-3">
              <Input
                {...field}
                id={field.name}
                autoComplete="off"
                placeholder="Apt #"
              />
            </Field>
          )}
        />
        <Controller
          name="city"
          control={form.control}
          render={({ field }) => (
            <Field className="col-span-6">
              <Input
                {...field}
                id={field.name}
                autoComplete="off"
                placeholder="City"
              />
            </Field>
          )}
        />
        <Controller
          name="state"
          control={form.control}
          render={({ field }) => (
            <Field className="col-span-3">
              <SelectWithSearch
                options={usStates.map((state) => ({
                  label: state,
                  value: state,
                }))}
                className="min-w-full"
                value={field.value}
                handleSelect={field.onChange}
              />
            </Field>
          )}
        />
        <Controller
          name="zip"
          control={form.control}
          render={({ field }) => (
            <Field className="col-span-3">
              <Input
                {...field}
                id={field.name}
                autoComplete="off"
                placeholder="Zip"
              />
            </Field>
          )}
        />
        <Controller
          name="floor_id"
          control={form.control}
          render={({ field }) => (
            <Field className="col-span-12">
              <Select
                name={field.name}
                value={field.value?.toString() ?? ""}
                onValueChange={(value) =>
                  field.onChange(value ? Number(value) : null)
                }
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder="Select floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {floorOptions?.map((floor) => (
                      <SelectItem key={floor.id} value={floor.id.toString()}>
                        {floor.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </div>
    </form>
  )
}
