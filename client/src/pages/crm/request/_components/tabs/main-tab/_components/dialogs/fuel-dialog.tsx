import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { AmountInput } from "@/components/inputs/amount-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { useRequest } from "@/hooks/use-request";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const formSchema = z.object({
  percent: z.number().min(0).max(100),
  value: z.number().min(0),
  total: z.number().min(0),
});

export type Inputs = z.infer<typeof formSchema>;

export function FuelDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const { draft, setField } = useRequest();

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    values: {
      percent: draft?.fuel?.percent ?? 0,
      value: draft?.fuel?.value ?? 0,
      total: draft?.fuel?.total ?? 0,
    },
  });

  function onSubmit(values: Inputs) {
    setField("fuel", {
      percent: values.percent,
      value: values.value,
      total: values.total,
    });
    handleCancel();
  }

  useEffect(() => {
    const editParam = searchParams.get("edit_fuel");
    if (editParam) {
      setIsOpen(true);
    }
  }, [searchParams]);

  function handleCancel() {
    form.reset();
    setIsOpen(false);
    setSearchParams();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fuel surcharge</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} id="fuel-form">
          <FieldSet>
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Controller
                name="percent"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Percentage</FieldLabel>
                    <AmountInput
                      {...field}
                      id={field.name}
                      value={(field.value ?? 0).toString() ?? ""}
                      onChange={(value) => {
                        field.onChange(Number(value));
                        const totalMax = draft?.transportation.max ?? 0;
                        form.setValue(
                          "total",
                          (Number(value) / 100) * totalMax,
                        );
                        form.setValue("value", 0);
                      }}
                      max={100}
                      min={0}
                      inputMode="numeric"
                      symbol="%"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="value"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Flat surcharge</FieldLabel>
                    <AmountInput
                      {...field}
                      id={field.name}
                      value={((field.value ?? 0) / 100).toString() ?? ""}
                      onChange={(value) => {
                        field.onChange(Number(value) * 100);
                        form.setValue("total", Number(value) * 100);
                        form.setValue("percent", 0);
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup>
              <Controller
                name="total"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Total</FieldLabel>
                    <AmountInput
                      {...field}
                      id={field.name}
                      value={((field.value ?? 0) / 100).toString() ?? ""}
                      readOnly
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="fuel-form">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
