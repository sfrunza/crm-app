import { TipTapEditor } from "@/components/tip-tap-editor"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { NumberInput } from "@/components/ui/number-input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  useCreatePackingType,
  usePackingTypes,
  useUpdatePackingType,
} from "@/hooks/api/use-packing-types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useSearchParams } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  description: z.string().optional(),
  labor_increase: z.number(),
})

type FormValues = z.infer<typeof formSchema>

export function PackingTypeFormSheet() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const { data: packingTypes } = usePackingTypes()

  const packingType = useMemo(
    () => packingTypes?.find((p) => p.id === editId),
    [packingTypes, editId]
  )

  const form = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
    values: {
      name: packingType?.name ?? "",
      description: packingType?.description ?? "",
      labor_increase: packingType?.labor_increase ?? 0,
    },
  })

  const { mutate: createPackingTypeMutation, isPending: isCreating } =
    useCreatePackingType({
      onSuccess: () => {
        toast.success("Packing service created")
        handleCancel()
      },
    })

  const { mutate: updatePackingTypeMutation, isPending: isUpdating } =
    useUpdatePackingType({
      onSuccess: () => {
        toast.success("Packing service updated")
        handleCancel()
      },
    })

  useEffect(() => {
    const editParam = searchParams.get("edit_packing_service")
    const createParam = searchParams.get("create_packing_service")

    if (editParam) {
      setEditId(Number(editParam))
      setIsOpen(true)
    } else if (createParam) {
      setEditId(null)
      setIsOpen(true)
    }
  }, [searchParams])

  function onSubmit(values: FormValues) {
    if (packingType) {
      updatePackingTypeMutation({ id: packingType.id, data: values })
    } else {
      createPackingTypeMutation(values)
    }
  }

  function handleCancel() {
    form.reset()
    setIsOpen(false)
    setEditId(null)
    setSearchParams()
  }
  return (
    <Sheet open={isOpen} onOpenChange={handleCancel}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {packingType ? "Update" : "Add"} packing service
          </SheetTitle>
          <SheetDescription className="sr-only" />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} id="packing-type-form">
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
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <FieldDescription>
                        Description of the packing service visible to customers.
                      </FieldDescription>
                    </FieldContent>
                    <TipTapEditor
                      onChange={field.onChange}
                      value={field.value ?? ""}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="labor_increase"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>
                        Labor increase (%)
                      </FieldLabel>
                      <FieldDescription>
                        The percentage of labor increase used to calculate the
                        total labor cost.
                      </FieldDescription>
                    </FieldContent>
                    <NumberInput
                      {...field}
                      id={field.name}
                      value={field.value ?? 0}
                      onChange={(value) => {
                        field.onChange(value)
                      }}
                      max={100}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
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
          <Button
            type="submit"
            form="packing-type-form"
            disabled={isCreating || isUpdating}
          >
            <LoadingSwap isLoading={isCreating || isUpdating}>
              {`${packingType ? "Update" : "Add"} packing service`}
            </LoadingSwap>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
