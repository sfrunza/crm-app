import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { PasswordInput } from "@/components/inputs/password-input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { PhoneInput } from "@/components/inputs/phone-input";
import {
  createCustomer,
  findCustomerByEmail,
  updateCustomer,
} from "@/domains/customer/customer.api";
import { useUpdateRequest } from "@/domains/requests/request.mutations";
import type { Customer } from "@/domains/requests/request.types";
import { useRequest } from "@/hooks/use-request";
import { formatPhone } from "@/lib/format-phone";
import { useMutation } from "@tanstack/react-query";
import { isValidPhoneNumber } from "libphonenumber-js";
import { InfoIcon } from "@/components/icons";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { debounce } from "throttle-debounce";

const DEBOUNCE_DELAY = 500;

const formSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email_address: z.email(),
  additional_email: z.email().or(z.literal("")),
  phone: z
    .string()
    .refine((phoneNumber) => isValidPhoneNumber(phoneNumber, "US"), {
      message: "Invalid phone number",
    })
    .or(z.literal("")),
  additional_phone: z
    .string()
    .optional()
    .refine(
      (phoneNumber) =>
        phoneNumber && isValidPhoneNumber(phoneNumber ?? "", "US"),
      {
        message: "Invalid phone number",
      },
    )
    .or(z.literal("")),
  password: z.string().optional(),
});

type Inputs = z.infer<typeof formSchema>;

export function CustomerForm() {
  const { draft } = useRequest();
  const [open, setOpen] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(
    null,
  );

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    mode: "onChange",
    values: {
      first_name: draft?.customer?.first_name ?? "",
      last_name: draft?.customer?.last_name ?? "",
      email_address: draft?.customer?.email_address ?? "",
      phone: draft?.customer?.phone ?? "",
      additional_phone: draft?.customer?.additional_phone ?? "",
      additional_email: draft?.customer?.additional_email ?? "",
      password: "",
    },
  });

  const { mutate: updateRequestMutation } = useUpdateRequest();

  const { mutate: updateCustomerMutation, isPending: isUpdating } = useMutation(
    {
      mutationFn: (values: Partial<Customer>) =>
        updateCustomer(draft?.customer?.id, values),
      onSuccess: (data: Customer) => {
        if (!draft?.id) return;
        updateRequestMutation({
          id: draft?.id,
          data: { customer_id: data.id },
        });
        toast.success("Customer updated");
      },
    },
  );

  const { mutate: createCustomerMutation, isPending: isCreating } = useMutation(
    {
      mutationFn: (values: Partial<Customer>) => createCustomer(values),
      onSuccess: (data: Partial<Customer>) => {
        if (!draft?.id) return;
        updateRequestMutation({
          id: draft?.id,
          data: { customer_id: data?.id },
        });
      },
    },
  );

  function onSubmit(values: Inputs) {
    if (draft?.customer?.id) {
      updateCustomerMutation(values);
    } else {
      createCustomerMutation(values);
    }
  }

  const handleFindCustomer = useCallback(
    async (value: string): Promise<Customer | null> => {
      const isValid = form.getFieldState("email_address").error ? false : true;
      if (!isValid || !value) return null;

      try {
        const user = await findCustomerByEmail(value);

        if (!user) {
          return null;
        }
        setExistingCustomer(user);
        setOpen(true);
        return user;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
        return null;
      }
    },
    [form.getFieldState("email_address").error],
  );

  const debouncedSearch = useCallback(
    debounce(DEBOUNCE_DELAY, handleFindCustomer, { atBegin: false }),
    [handleFindCustomer],
  );

  return (
    <div>
      <div className="pb-6">
        <form onSubmit={form.handleSubmit(onSubmit)} id="customer-form">
          <FieldGroup className="grid gap-6 md:grid-cols-2">
            <Controller
              name="first_name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>First name</FieldLabel>
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
              name="last_name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
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
              name="email_address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    onChange={(e) => {
                      field.onChange(e);
                      if (!draft?.customer?.id) {
                        debouncedSearch(e.target.value);
                      }
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="additional_email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Additional email</FieldLabel>
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
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                  <PhoneInput
                    {...field}
                    id={field.name}
                    value={formatPhone(field.value ?? "")}
                    handleValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="additional_phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Additional phone</FieldLabel>
                  <PhoneInput
                    {...field}
                    id={field.name}
                    value={formatPhone(field.value ?? "")}
                    handleValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <FieldDescription>
                      Required only when creating a new customer.
                    </FieldDescription>
                  </FieldContent>
                  <PasswordInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => form.reset()}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="customer-form"
          disabled={!form.formState.isDirty || isUpdating || isCreating}
        >
          <LoadingSwap isLoading={isUpdating || isCreating}>
            Save changes
          </LoadingSwap>
        </Button>
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-500">
              <InfoIcon />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-blue-500">
              User with this email already exists
            </AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to merge this request with the existing profile?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, cancel</AlertDialogCancel>
            <Button
              disabled={isUpdating}
              onClick={() => {
                if (!draft?.id) return;
                updateRequestMutation({
                  id: draft.id,
                  data: { customer_id: existingCustomer?.id },
                });
                setOpen(false);
              }}
            >
              <LoadingSwap isLoading={isUpdating}>Yes</LoadingSwap>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
