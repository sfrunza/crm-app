import { PhoneInput } from "@/components/inputs/phone-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { PencilLineIcon } from "@/components/icons";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { requestKeys } from "@/domains/requests/request.keys";
import { useUpdateUser, useUser } from "@/hooks/api/use-users";
import { useAuth } from "@/hooks/use-auth";
import { extractError } from "@/lib/axios";
import { formatPhone } from "@/lib/format-phone";
import { queryClient } from "@/lib/query-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  email_address: z.email(),
  additional_email: z.email().or(z.literal("")),
  phone: z
    .string()
    .refine((phoneNumber) => isValidPhoneNumber(phoneNumber, "US"), {
      message: "Invalid phone number",
    }),
  additional_phone: z
    .string()
    .optional()
    .refine(
      (phoneNumber) =>
        phoneNumber && isValidPhoneNumber(phoneNumber ?? "", "US"),
      {
        message: "Invalid phone number",
      }
    )
    .or(z.literal("")),
});

type Inputs = z.infer<typeof formSchema>;

export function EditProfileDialog() {
  const { id: requestId } = useParams();

  const { user: sessionUser } = useAuth();
  const { data: user } = useUser(sessionUser?.id!, {
    enabled: !!sessionUser?.id,
  });
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: updateProfileMutation, isPending: isUpdating } =
    useUpdateUser({
      onSuccess: () => {
        toast.success("Profile updated");
        handleCancel();

        if (requestId) {
          queryClient.invalidateQueries({
            queryKey: requestKeys.detail(Number(requestId)),
          });
        }
      },
      onError: (err) => {
        toast.error(extractError(err));
      },
    });

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    values: {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      email_address: user?.email_address ?? "",
      phone: user?.phone ?? "",
      additional_phone: user?.additional_phone ?? "",
      additional_email: user?.additional_email ?? "",
    },
  });

  function handleCancel() {
    form.reset();
    setIsOpen(false);
  }

  function onSubmit(values: Inputs) {
    updateProfileMutation({ id: user?.id!, data: values });
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form onSubmit={form.handleSubmit(onSubmit)} id="customer-form">
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <PencilLineIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="px-0 sm:max-w-xl">
          <DialogHeader className="px-6">
            <DialogTitle>My profile</DialogTitle>
            <DialogDescription className="hidden"></DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(100vh-14rem)] px-4">
            <FieldGroup className="grid gap-6 p-2 md:grid-cols-2">
              <Controller
                name="first_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent className="flex-none">
                      <FieldLabel htmlFor={field.name}>First name *</FieldLabel>
                    </FieldContent>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="last_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent className="flex-none">
                      <FieldLabel htmlFor={field.name}>Last name *</FieldLabel>
                    </FieldContent>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="email_address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent className="flex-none">
                      <FieldLabel htmlFor={field.name}>Email *</FieldLabel>
                      <FieldDescription>
                        Primary email address.
                      </FieldDescription>
                    </FieldContent>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent className="flex-none">
                      <FieldLabel htmlFor={field.name}>Phone *</FieldLabel>
                      <FieldDescription>Primary phone number.</FieldDescription>
                    </FieldContent>
                    <PhoneInput
                      {...field}
                      id={field.name}
                      value={formatPhone(field.value ?? "")}
                      handleValueChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="additional_email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent className="flex-none">
                      <FieldLabel htmlFor={field.name}>
                        Additional email
                      </FieldLabel>
                      <FieldDescription>
                        To receive notifications.
                      </FieldDescription>
                    </FieldContent>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="additional_phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent className="flex-none">
                      <FieldLabel htmlFor={field.name}>
                        Additional phone
                      </FieldLabel>
                      <FieldDescription>
                        To receive notifications.
                      </FieldDescription>
                    </FieldContent>
                    <PhoneInput
                      {...field}
                      id={field.name}
                      value={formatPhone(field.value ?? "")}
                      handleValueChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </FieldGroup>
            <ScrollBar orientation="vertical" className="invisible" />
          </ScrollArea>
          <DialogFooter className="px-6">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" form="customer-form" disabled={isUpdating}>
              <LoadingSwap isLoading={isUpdating}>Save changes</LoadingSwap>
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
