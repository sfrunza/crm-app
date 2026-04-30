import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { requestKeys } from "@/domains/requests/request.keys"
import { useUpdateRequest } from "@/domains/requests/request.mutations"
import type { Request } from "@/domains/requests/request.types"
import { queryClient } from "@/lib/query-client"
import { PencilLineIcon } from "@/components/icons"
import { useState } from "react"
import { toast } from "sonner"
import { useValuations } from "@/hooks/api/use-valuations"
import { VALUATION_OPTIONS_MAP } from "@/lib/constants"

const formSchema = z.object({
  valuation_id: z.number(),
  total: z.number(),
  description: z.string(),
  name: z.string(),
})

type Inputs = z.infer<typeof formSchema>

export function ValuationDialog({
  requestId,
  valuation,
}: {
  requestId: number
  valuation: Request["valuation"]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: valuations } = useValuations({
    select: (data) => data.filter((valuation) => valuation.active),
  })

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    values: {
      valuation_id: valuation?.valuation_id ?? 0,
      total: valuation?.total ?? 0,
      description: valuation?.description ?? "",
      name: valuation?.name ?? "",
    },
  })

  const { mutate: updateRequestMutation, isPending: isUpdating } =
    useUpdateRequest(
      {
        onSettled: (_, error) => {
          if (error) {
            toast.error("Failed to save insurance plan")
          } else {
            queryClient.invalidateQueries({
              queryKey: requestKeys.detail(requestId),
            })
            toast.success("Insurance plan saved")
            handleSuccessClose()
          }
        },
      },
      { forceCalculate: true }
    )

  const selectedValuationId = form.watch("valuation_id")

  function handleOpenChange(open: boolean) {
    setIsOpen(open)
    if (!open) {
      form.reset({
        valuation_id: valuation?.valuation_id ?? 0,
        total: valuation?.total ?? 0,
        description: valuation?.description ?? "",
        name: valuation?.name ?? "",
      })
    }
  }

  function handleSuccessClose() {
    setIsOpen(false)
    form.reset({
      valuation_id: valuation?.valuation_id ?? 0,
      total: valuation?.total ?? 0,
      description: valuation?.description ?? "",
      name: valuation?.name ?? "",
    })
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
    updateRequestMutation({
      id: requestId,
      data: {
        valuation: {
          valuation_id: selectedValuation?.id,
          total: values.total,
          name: selectedValuation?.name ?? values.name ?? "",
          description: values.description ?? "",
        },
      },
    })

    handleSuccessClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <PencilLineIcon />
          Edit insurance
        </Button>
      </DialogTrigger>
      <DialogContent className="px-0 sm:max-w-lg">
        <DialogHeader className="px-6">
          <DialogTitle>Valuation plan</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-14rem)]">
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
                name="description"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    </FieldContent>
                    <div
                      dangerouslySetInnerHTML={{ __html: field.value ?? "" }}
                      className="prose-sm rounded-md border p-4 prose-neutral"
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
          <Button type="submit" form="valuation-form" disabled={isUpdating}>
            <LoadingSwap isLoading={isUpdating}>Save</LoadingSwap>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
