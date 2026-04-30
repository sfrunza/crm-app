import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRequest } from "@/hooks/use-request"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePackingTypes } from "@/hooks/api/use-packing-types"

const formSchema = z.object({
  packing_type_id: z.string(),
})

export type Inputs = z.infer<typeof formSchema>

export function PackingServiceDialog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const { draft, setField } = useRequest()

  const { data: packingTypes } = usePackingTypes()

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    values: { packing_type_id: draft?.packing_type_id?.toString() ?? "" },
  })

  function onSubmit(values: Inputs) {
    setField("packing_type_id", parseInt(values.packing_type_id))
    setField(
      "packing_type",
      packingTypes?.find(
        (item) => item.id === parseInt(values.packing_type_id)
      ) ?? null
    )
    handleCancel()
  }

  useEffect(() => {
    const editParam = searchParams.get("edit_packing_service")
    if (editParam) {
      setIsOpen(true)
    }
  }, [searchParams])

  function handleCancel() {
    form.reset()
    setIsOpen(false)
    setSearchParams()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Packing service</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} id="packing-service-form">
          <FieldGroup>
            <Controller
              name="packing_type_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="sr-only">
                    Packing service
                  </FieldLabel>

                  <Select
                    key={field.value}
                    name={field.name}
                    value={field.value.toString()}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      id={field.name}
                    >
                      <SelectValue placeholder="Select packing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {packingTypes?.map((packingType) => (
                          <SelectItem
                            key={packingType.id}
                            value={packingType.id.toString()}
                          >
                            {packingType.name}
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
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="packing-service-form">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
