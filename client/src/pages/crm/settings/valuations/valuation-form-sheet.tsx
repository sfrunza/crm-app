import { TipTapEditor } from "@/components/tip-tap-editor"
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
import {
  useCreateValuation,
  useUpdateValuation,
  useValuations,
} from "@/hooks/api/use-valuations"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useSearchParams } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  description: z.string().optional(),
  active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export function ValuationFormSheet() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const { data: valuations } = useValuations()

  const valuation = useMemo(
    () => valuations?.find((p) => p.id === editId),
    [valuations, editId]
  )

  const form = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
    values: {
      name: valuation?.name ?? "",
      description: valuation?.description ?? "",
      active: valuation?.active ?? true,
    },
  })

  const { mutate: createValuationMutation, isPending: isCreating } =
    useCreateValuation({
      onSuccess: () => {
        toast.success("Valuation created")
        handleCancel()
      },
    })

  const { mutate: updateValuationMutation, isPending: isUpdating } =
    useUpdateValuation({
      onSuccess: () => {
        toast.success("Valuation updated")
        handleCancel()
      },
    })

  useEffect(() => {
    const editParam = searchParams.get("edit_valuation")
    const createParam = searchParams.get("create_valuation")

    if (editParam) {
      setEditId(Number(editParam))
      setIsOpen(true)
    } else if (createParam) {
      setEditId(null)
      setIsOpen(true)
    }
  }, [searchParams])

  function onSubmit(values: FormValues) {
    if (valuation) {
      updateValuationMutation({ id: valuation.id, data: values })
    } else {
      createValuationMutation(values)
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
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{valuation ? "Update" : "Add"} valuation</SheetTitle>
          <SheetDescription className="sr-only" />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} id="valuation-form">
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
                        Description of the valuation visible to customers.
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
                name="active"
                control={form.control}
                render={({ field }) => (
                  <FieldLabel htmlFor={field.name}>
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Active</FieldTitle>
                        <FieldDescription>
                          Enable the valuation to be used in the system.
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
          <Button
            type="submit"
            form="valuation-form"
            disabled={isCreating || isUpdating}
          >
            <LoadingSwap isLoading={isCreating || isUpdating}>
              {`${valuation ? "Update" : "Add"} valuation`}
            </LoadingSwap>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
