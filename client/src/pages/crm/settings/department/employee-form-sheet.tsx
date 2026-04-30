import { PasswordInput } from "@/components/inputs/password-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { PhoneInput } from "@/components/inputs/phone-input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { employeeKeys } from "@/domains/employees/employee.keys";
import {
  useCreateEmployee,
  useUpdateEmployee,
} from "@/domains/employees/employee.mutations";
import { useGetEmployeeById } from "@/domains/employees/employee.queries";
import { queryClient } from "@/lib/query-client";
import { formatPhone } from "@/lib/format-phone";
import type { UserRole } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const userRoles = [
  {
    label: "Admin",
    value: "admin",
  },
  {
    label: "Manager",
    value: "manager",
  },
  {
    label: "Foreman",
    value: "foreman",
  },
  {
    label: "Driver",
    value: "driver",
  },
  {
    label: "Helper",
    value: "helper",
  },
] as const;

const formSchema = z.object({
  first_name: z.string().min(1, {
    message: "First name is required.",
  }),
  last_name: z.string().min(1, {
    message: "Last name is required.",
  }),
  email_address: z.email({
    message: "Invalid email address.",
  }),
  phone: z
    .string()
    .refine((phoneNumber) => isValidPhoneNumber(phoneNumber, "US"), {
      message: "Invalid phone number",
    }),
  role: z.enum(
    userRoles.map((role) => role.value) as [UserRole, ...UserRole[]],
  ),
  active: z.boolean().optional(),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EmployeeFormSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const { data: employee, isFetching } = useGetEmployeeById(editId, {
    enabled: !!editId,
  });

  const form = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
    values: {
      first_name: employee?.first_name ?? "",
      last_name: employee?.last_name ?? "",
      email_address: employee?.email_address ?? "",
      phone: employee?.phone ?? "",
      role: employee?.role ?? "helper",
      active: employee?.active ?? true,
      password: "",
    },
  });

  const { mutate: updateEmployeeMutation, isPending: isUpdating } =
    useUpdateEmployee({
      onSettled: (_, error) => {
        if (error) {
          queryClient.cancelQueries({ queryKey: employeeKeys.all });
        } else {
          queryClient.invalidateQueries({ queryKey: employeeKeys.all });
          toast.success("Employee updated");
          handleCancel();
        }
      },
    });

  const { mutate: createEmployeeMutation, isPending: isCreating } =
    useCreateEmployee({
      onSettled: (_, error) => {
        if (error) {
          queryClient.cancelQueries({ queryKey: employeeKeys.all });
        } else {
          queryClient.invalidateQueries({ queryKey: employeeKeys.all });
          toast.success("Employee created");
          handleCancel();
        }
      },
    });

  useEffect(() => {
    const editParam = searchParams.get("edit_employee");
    const createParam = searchParams.get("create_employee");

    if (editParam) {
      setEditId(Number(editParam));
      setIsOpen(true);
    } else if (createParam) {
      setEditId(null);
      setIsOpen(true);
    }
  }, [searchParams]);

  function onSubmit(values: FormValues) {
    if (employee) {
      updateEmployeeMutation({ id: employee.id, data: values });
    } else {
      createEmployeeMutation(values);
    }
  }

  function handleCancel() {
    form.reset();
    setIsOpen(false);
    setSearchParams((prev) => {
      prev.delete("edit_employee");
      prev.delete("create_employee");
      return prev;
    });
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleCancel}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editId ? "Update" : "Add"} employee</SheetTitle>
          <SheetDescription className="flex flex-row items-center gap-2">
            <span>Employee ID: {employee?.id ?? ""}</span>
            <span>
              Created at:{" "}
              {employee?.created_at
                ? new Date(employee?.created_at).toLocaleDateString()
                : ""}
            </span>
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {isFetching ? (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} id="employee-form">
              <FieldGroup>
                <Controller
                  name="first_name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        First name (required)
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
                  name="last_name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Last name (required)
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
                  name="email_address"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Email (required)
                        </FieldLabel>
                        <FieldDescription>
                          Email address used to login to the system.
                        </FieldDescription>
                      </FieldContent>
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
                      <FieldLabel htmlFor={field.name}>
                        Phone (required)
                      </FieldLabel>
                      <PhoneInput
                        {...field}
                        id={field.name}
                        value={formatPhone(field.value)}
                        handleValueChange={field.onChange}
                      />
                    </Field>
                  )}
                />
                <Controller
                  name="role"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Position</FieldLabel>
                      <Select
                        key={field.value}
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          aria-invalid={fieldState.invalid}
                          id={field.name}
                        >
                          <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {userRoles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
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
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Password (required)
                        </FieldLabel>
                        <FieldDescription>
                          Required only when creating a new user.
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
                <Controller
                  name="active"
                  control={form.control}
                  render={({ field }) => (
                    <FieldLabel htmlFor={field.name}>
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Active</FieldTitle>
                          <FieldDescription>
                            If the employee is active, they will be able to
                            login to the system.
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
          )}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="submit"
            form="employee-form"
            disabled={isUpdating || isCreating}
          >
            <LoadingSwap isLoading={isUpdating || isCreating}>
              {`${editId ? "Update" : "Create"} employee`}
            </LoadingSwap>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
