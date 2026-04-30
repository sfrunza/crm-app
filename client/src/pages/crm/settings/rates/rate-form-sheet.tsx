import { AmountInput } from "@/components/inputs/amount-input"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoadingSwap } from "@/components/ui/loading-swap"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useRates, useUpdateRate } from "@/hooks/api/use-rates"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useSearchParams } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  color: z.string(),
  movers_rates: z.record(
    z.string(),
    z.object({
      hourly_rate: z.coerce.number<number>().int().min(1),
    })
  ),
  extra_mover_rate: z.coerce.number<number>().int().min(1),
  extra_truck_rate: z.coerce.number<number>().int().min(1),
  active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

const defaultValues: FormValues = {
  name: "",
  color: "#ffffff",
  movers_rates: {},
  extra_mover_rate: 0,
  extra_truck_rate: 0,
  active: true,
}

export function RateFormSheet() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [editId, setEditId] = useState<number | null>(null)

  const { data: rates } = useRates({
    enabled: !!editId,
  })
  const rate = useMemo(
    () => rates?.find((p) => p.id === editId),
    [rates, editId]
  )

  const { mutate: updateRateMutation, isPending: isUpdating } = useUpdateRate({
    onSuccess: () => {
      toast.success("Rate updated")
      handleCancel()
    },
  })

  useEffect(() => {
    const editParam = searchParams.get("edit")
    if (editParam) {
      setEditId(Number(editParam))
      setIsOpen(true)
    }
  }, [searchParams])

  const form = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
    values: {
      name: rate?.name ?? "",
      color: rate?.color ?? "#ffffff",
      movers_rates: rate?.movers_rates ?? {},
      extra_mover_rate: rate?.extra_mover_rate ?? 0,
      extra_truck_rate: rate?.extra_truck_rate ?? 0,
      active: rate?.active ?? true,
    },
  })

  function onSubmit(values: FormValues) {
    if (!rate) return
    updateRateMutation({ id: rate?.id, data: values })
  }

  function handleCancel() {
    form.reset(defaultValues)
    setIsOpen(false)
    setEditId(null)
    setSearchParams()
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleCancel}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Update rate</SheetTitle>
          <SheetDescription className="sr-only" />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} id="rate-form">
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Name (required)
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder="Name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="color"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Color</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      type="color"
                      placeholder="#ffffff"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {Object.keys(rate?.movers_rates ?? {})
                .slice(0, 3)
                .map((mover, i) => (
                  <Controller
                    key={i}
                    name={`movers_rates.${mover}.hourly_rate`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          {mover} Movers
                        </FieldLabel>
                        <AmountInput
                          {...field}
                          id={field.name}
                          value={((field.value ?? 0) / 100).toString() ?? ""}
                          onChange={(value) => {
                            field.onChange(Number(value) * 100)
                          }}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                ))}
              <Controller
                name="extra_mover_rate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Extra mover rate
                    </FieldLabel>
                    <AmountInput
                      {...field}
                      id={field.name}
                      value={((field.value ?? 0) / 100).toString() ?? ""}
                      onChange={(value) => {
                        field.onChange(Number(value) * 100)
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="extra_truck_rate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Extra truck rate
                    </FieldLabel>
                    <AmountInput
                      {...field}
                      id={field.name}
                      value={((field.value ?? 0) / 100).toString() ?? ""}
                      onChange={(value) => {
                        field.onChange(Number(value) * 100)
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="active"
                control={form.control}
                render={({ field }) => (
                  <FieldLabel htmlFor={field.name}>
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Active</FieldTitle>
                        <FieldDescription>
                          Enable the rate to be used in the system.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  </FieldLabel>
                )}
              />
            </FieldGroup>
          </form>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
          <Button type="submit" form="rate-form" disabled={isUpdating}>
            <LoadingSwap isLoading={isUpdating}>Update rate</LoadingSwap>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
