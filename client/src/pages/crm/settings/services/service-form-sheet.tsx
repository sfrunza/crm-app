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
  useCreateService,
  useServices,
  useUpdateService,
} from "@/hooks/api/use-services"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useSearchParams } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export function ServiceFormSheet() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const { data: services } = useServices()

  const service = useMemo(
    () => services?.find((p) => p.id === editId),
    [services, editId]
  )

  const form = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
    values: {
      name: service?.name ?? "",
      active: service?.active ?? true,
    },
  })

  const { mutate: createServiceMutation, isPending: isCreating } =
    useCreateService({
      onSuccess: () => {
        toast.success("Service created")
        handleCancel()
      },
    })

  const { mutate: updateServiceMutation, isPending: isUpdating } =
    useUpdateService({
      onSuccess: () => {
        toast.success("Service updated")
        handleCancel()
      },
    })

  useEffect(() => {
    const editParam = searchParams.get("edit_service")
    const createParam = searchParams.get("create_service")

    if (editParam) {
      setEditId(Number(editParam))
      setIsOpen(true)
    } else if (createParam) {
      setEditId(null)
      setIsOpen(true)
    }
  }, [searchParams])

  function onSubmit(values: FormValues) {
    if (service) {
      updateServiceMutation({ id: service.id, data: values })
    } else {
      createServiceMutation(values)
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
          <SheetTitle>{service ? "Update" : "Add"} service</SheetTitle>
          <SheetDescription className="sr-only" />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} id="service-form">
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Service name (required)
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder="Local move"
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
                          Enable the service to be used in the system.
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
            form="service-form"
            disabled={isCreating || isUpdating}
          >
            <LoadingSwap isLoading={isCreating || isUpdating}>
              {`${service ? "Update" : "Add"} service`}
            </LoadingSwap>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
