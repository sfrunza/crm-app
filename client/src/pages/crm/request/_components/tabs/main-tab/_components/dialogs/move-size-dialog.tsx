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
import { useRequest } from "@/hooks/use-request"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import { useMoveSizes } from "@/hooks/api/use-move-sizes"

const formSchema = z.object({
  move_size_id: z.string(),
})

export type Inputs = z.infer<typeof formSchema>

export function MoveSizeDialog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const { data: moveSizes } = useMoveSizes()
  const { draft, setField } = useRequest()

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    values: { move_size_id: draft?.move_size_id?.toString() ?? "" },
  })

  function onSubmit(values: Inputs) {
    setField("move_size_id", parseInt(values.move_size_id))
    const moveSize = moveSizes?.find(
      (m) => m.id.toString() === values.move_size_id
    )
    setField("move_size", moveSize ?? null)
    handleCancel()
  }

  useEffect(() => {
    const editParam = searchParams.get("request_move_size")
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
          <DialogTitle>Move size</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} id="request_move_size">
          <FieldGroup>
            <Controller
              name="move_size_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="sr-only">
                    Move size
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
                      <SelectValue placeholder="Select a move size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {moveSizes?.map((moveSize) => (
                          <SelectItem
                            key={moveSize.id}
                            value={moveSize.id.toString()}
                          >
                            {moveSize.name}
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
          <Button type="submit" form="request_move_size">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
