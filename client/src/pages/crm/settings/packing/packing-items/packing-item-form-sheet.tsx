import { AmountInput } from "@/components/inputs/amount-input"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
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
import {
  useCreatePackingItem,
  usePackingItems,
  useUpdatePackingItem,
} from "@/hooks/api/use-packing-items"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useSearchParams } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  price: z.number(),
})

type FormValues = z.infer<typeof formSchema>

export function PackingItemFormSheet() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const { data: packingItems } = usePackingItems()

  const packingItem = useMemo(
    () => packingItems?.find((p) => p.id === editId),
    [packingItems, editId]
  )

  const form = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
    values: {
      name: packingItem?.name ?? "",
      price: packingItem?.price ?? 0,
    },
  })

  const { mutate: createPackingItemMutation, isPending: isCreating } =
    useCreatePackingItem({
      onSuccess: () => {
        toast.success("Packing supply created")
        handleCancel()
      },
    })

  const { mutate: updatePackingItemMutation, isPending: isUpdating } =
    useUpdatePackingItem({
      onSuccess: () => {
        toast.success("Packing supply updated")
        handleCancel()
      },
    })

  useEffect(() => {
    const editParam = searchParams.get("edit_packing_supply")
    const createParam = searchParams.get("create_packing_supply")

    if (editParam) {
      setEditId(Number(editParam))
      setIsOpen(true)
    } else if (createParam) {
      setEditId(null)
      setIsOpen(true)
    }
  }, [searchParams])

  function onSubmit(values: FormValues) {
    if (packingItem) {
      updatePackingItemMutation({ id: packingItem.id, data: values })
    } else {
      createPackingItemMutation(values)
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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {packingItem ? "Update" : "Add"} packing supply
          </SheetTitle>
          <SheetDescription className="sr-only" />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} id="packing-item-form">
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
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Price</FieldLabel>
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
            form="packing-item-form"
            disabled={isCreating || isUpdating}
          >
            <LoadingSwap isLoading={isCreating || isUpdating}>
              {`${packingItem ? "Update" : "Add"} packing item`}
            </LoadingSwap>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
