import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateEntranceType, useEntranceTypes, useUpdateEntranceType } from "@/hooks/api/use-entrance-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  form_name: z.string().min(1, { message: "Form name is required" }),
});

type FormValues = z.infer<typeof formSchema>;

export function EntranceTypeFormSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const { data: entranceTypes } = useEntranceTypes();

  const entranceType = useMemo(
    () => entranceTypes?.find((p) => p.id === editId),
    [entranceTypes, editId],
  );

  const form = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
    values: {
      name: entranceType?.name ?? "",
      form_name: entranceType?.form_name ?? "",
    },
  });

  const { mutate: createEntranceTypeMutation, isPending: isCreating } =
    useCreateEntranceType({
      onSuccess: () => {
        toast.success("Entrance type created");
        handleCancel();
      },
    });

  const { mutate: updateEntranceTypeMutation, isPending: isUpdating } =
    useUpdateEntranceType({
      onSuccess: () => {
        toast.success("Entrance type updated");
        handleCancel();
      },
    });

  useEffect(() => {
    const editParam = searchParams.get("edit_entrance_type");
    const createParam = searchParams.get("create_entrance_type");

    if (editParam) {
      setEditId(Number(editParam));
      setIsOpen(true);
    } else if (createParam) {
      setEditId(null);
      setIsOpen(true);
    }
  }, [searchParams]);

  function onSubmit(values: FormValues) {
    if (entranceType) {
      updateEntranceTypeMutation({ id: entranceType.id, data: values });
    } else {
      createEntranceTypeMutation(values);
    }
  }

  function handleCancel() {
    form.reset();
    setIsOpen(false);
    setEditId(null);
    setSearchParams();
  }
  return (
    <Sheet open={isOpen} onOpenChange={handleCancel}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {entranceType ? "Update" : "Add"} entrance type
          </SheetTitle>
          <SheetDescription className="sr-only" />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} id="entrance-type-form">
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
                name="form_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Form name (required)
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
            form="entrance-type-form"
            disabled={isCreating || isUpdating}
          >
            <LoadingSwap isLoading={isCreating || isUpdating}>
              {`${entranceType ? "Update" : "Add"} entrance type`}
            </LoadingSwap>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
