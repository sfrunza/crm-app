import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { AmountInput } from "@/components/inputs/amount-input"
import { TipTapEditor } from "@/components/tip-tap-editor"
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useRequest } from "@/hooks/use-request"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import { useValuations } from "@/hooks/api/use-valuations"
import { VALUATION_OPTIONS_MAP } from "@/lib/constants"

const formSchema = z.object({
  valuation_id: z.number(),
  total: z.number(),
  description: z.string(),
  name: z.string(),
})

type Inputs = z.infer<typeof formSchema>

export function ValuationDialog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const { data: valuations } = useValuations({
    select: (data) => data.filter((valuation) => valuation.active),
  })
  const { draft, setField } = useRequest()

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    values: {
      valuation_id: draft?.valuation.valuation_id ?? 0,
      total: draft?.valuation.total ?? 0,
      description: draft?.valuation.description ?? "",
      name: draft?.valuation.name ?? "",
    },
  })

  const selectedValuationId = form.watch("valuation_id")
  const tiptapKey = `valuation-desc-${selectedValuationId}`

  useEffect(() => {
    const editParam = searchParams.get("edit_valuation")
    if (editParam) {
      setIsOpen(true)
    }
  }, [searchParams])

  function handleCancel() {
    form.reset()
    setIsOpen(false)
    setSearchParams()
  }

  function handleValuationChange(valuationId: string) {
    if (valuationId === "") return

    const valuationIdNumber = Number(valuationId)

    const selectedValuation = valuations?.find(
      (valuation) => valuation.id === valuationIdNumber
    )

    if (selectedValuation) {
      form.setValue("valuation_id", valuationIdNumber)
      form.setValue("name", selectedValuation.name)
      form.setValue("description", selectedValuation.description ?? "")
    }
  }

  function onSubmit(values: Inputs) {
    const selectedValuation = values.valuation_id
      ? valuations?.find((valuation) => valuation.id === values.valuation_id)
      : undefined

    if (!selectedValuation) return
    setField("valuation", {
      valuation_id: selectedValuation?.id,
      total: values.total,
      name: selectedValuation?.name ?? values.name ?? "",
      description: values.description ?? "",
    })

    handleCancel()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="px-0 sm:max-w-lg">
        <DialogHeader className="px-6">
          <DialogTitle>Valuation plan</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100vh-14rem)]">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6"
            id="valuation-form"
          >
            <RadioGroup
              value={selectedValuationId?.toString() ?? ""}
              onValueChange={handleValuationChange}
            >
              {valuations?.map((valuation, index) => (
                <FieldLabel
                  key={valuation.id}
                  htmlFor={valuation.id.toString()}
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                      <div className="font-medium">
                        {VALUATION_OPTIONS_MAP[index + 1]}
                      </div>
                      <FieldDescription>{valuation.name}</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      value={valuation.id.toString()}
                      id={valuation.id.toString()}
                    />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>

            <FieldGroup className="mt-4">
              <Controller
                name="total"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Charge</FieldLabel>
                    <AmountInput
                      {...field}
                      id={field.name}
                      value={((field.value ?? 0) / 100).toString() ?? ""}
                      onChange={(value) => {
                        const numeric = Number(value)
                        field.onChange(
                          Number.isNaN(numeric) ? 0 : numeric * 100
                        )
                      }}
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
                render={({ field }) => (
                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    </FieldContent>
                    <TipTapEditor
                      key={tiptapKey}
                      onChange={field.onChange}
                      value={field.value ?? ""}
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <DialogFooter className="px-6">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="valuation-form">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
