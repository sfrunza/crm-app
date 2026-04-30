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
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useRequest } from "@/hooks/use-request";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const formSchema = z.object({
  deposit: z.number().min(0),
  is_deposit_accepted: z.boolean(),
});

export type Inputs = z.infer<typeof formSchema>;

export function DepositDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const { draft, setField } = useRequest();

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    values: {
      deposit: draft?.deposit ?? 0,
      is_deposit_accepted: draft?.is_deposit_accepted ?? false,
    },
  });

  function onSubmit(values: Inputs) {
    setField("deposit", values.deposit);
    setField("is_deposit_accepted", values.is_deposit_accepted);
    handleCancel();
  }

  useEffect(() => {
    const editParam = searchParams.get("edit_deposit");
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
          <DialogTitle>Reservation price</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} id="deposit-form">
          <FieldGroup>
            <Controller
              name="deposit"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Price</FieldLabel>
                  <AmountInput
                    {...field}
                    id={field.name}
                    value={((field.value ?? 0) / 100).toString() ?? ""}
                    onChange={(value) => {
                      field.onChange(Number(value) * 100);
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="is_deposit_accepted"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Switch
                    id={field.name}
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>
                      Deposit accepted
                    </FieldLabel>
                  </FieldContent>
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
          <Button type="submit" form="deposit-form">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
