import { AddressAutocompleteInput } from "@/components/inputs/address-autocomplete-input";
import { SelectWithSearch } from "@/components/inputs/select-with-search";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestKeys } from "@/domains/requests/request.keys";
import { useUpdateRequest } from "@/domains/requests/request.mutations";
import type { Address } from "@/domains/requests/request.types";
import { useEntranceTypes } from "@/hooks/api/use-entrance-types";
import { useRequest } from "@/hooks/use-request";
import { queryClient } from "@/lib/query-client";
import { usStates } from "@/lib/usStates";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP is required"),
  apt: z.string(),
  floor_id: z.number().nullable().optional(),
  location: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EMPTY_ADDRESS: Address = {
  street: "",
  city: "",
  state: "",
  zip: "",
  apt: "",
  floor_id: null,
  location: { lat: 0, lng: 0 },
};

export function AddressEditDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const { request } = useRequest();
  const { data: entranceTypes } = useEntranceTypes();

  const editParam = searchParams.get("edit_address");

  const isNewStop = editParam === "new_stop";
  const isStop = editParam?.startsWith("stop_") ?? false;
  const stopIndex = isStop ? parseInt(editParam!.replace("stop_", "")) : -1;

  // Get current address data based on param
  const currentAddress = (() => {
    if (!request || !editParam) return EMPTY_ADDRESS;
    if (editParam === "origin") return request.origin ?? EMPTY_ADDRESS;
    if (editParam === "destination")
      return request.destination ?? EMPTY_ADDRESS;
    if (isStop && stopIndex >= 0)
      return request.stops?.[stopIndex] ?? EMPTY_ADDRESS;
    return EMPTY_ADDRESS;
  })();

  const dialogTitle = (() => {
    if (isNewStop) return "Add a stop";
    if (editParam === "origin") return "Edit pickup address";
    if (editParam === "destination") return "Edit drop-off address";
    if (isStop) return "Edit stop address";
    return "Edit address";
  })();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    values: {
      street: currentAddress.street ?? "",
      city: currentAddress.city ?? "",
      state: currentAddress.state ?? "",
      zip: currentAddress.zip ?? "",
      apt: currentAddress.apt ?? "",
      floor_id: currentAddress.floor_id ?? null,
      location: currentAddress.location ?? { lat: 0, lng: 0 },
    },
  });

  const { mutate: updateRequestMutation, isPending: isUpdating } =
    useUpdateRequest(
      {
        onSettled: (_, error) => {
          if (error) {
            toast.error("Failed to update address");
          } else {
            queryClient.invalidateQueries({
              queryKey: requestKeys.detail(request!.id),
            });
            toast.success(isNewStop ? "Stop added" : "Address updated");
            handleClose();
          }
        },
      },
      { forceCalculate: true }
    );

  useEffect(() => {
    if (editParam) {
      setIsOpen(true);
    }
  }, [editParam]);

  function handleClose() {
    form.reset();
    setIsOpen(false);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("edit_address");
      return next;
    });
  }

  function onSubmit(values: FormValues) {
    if (!request) return;

    const updatedAddress: Omit<Address, "location"> = {
      ...currentAddress,
      ...values,
    };

    if (editParam === "origin") {
      updateRequestMutation({
        id: request.id,
        data: { origin: updatedAddress },
      });
    } else if (editParam === "destination") {
      updateRequestMutation({
        id: request.id,
        data: { destination: updatedAddress },
      });
    } else if (isStop && stopIndex >= 0) {
      const newStops = [...(request.stops ?? [])];
      newStops[stopIndex] = { ...newStops[stopIndex], ...updatedAddress };
      updateRequestMutation({
        id: request.id,
        data: { stops: newStops },
      });
    } else if (isNewStop) {
      const newStop: Address = {
        ...updatedAddress,
        type: "drop_off",
      };
      updateRequestMutation({
        id: request.id,
        data: { stops: [...(request.stops ?? []), newStop] },
      });
    }
  }

  const onAddressSelect = useCallback(
    (address: Partial<Address>) => {
      Object.entries(address).forEach(([key, value]) => {
        form.setValue(key as keyof FormValues, value ?? "", {
          shouldDirty: true,
          shouldValidate: true,
        });
      });
    },
    [form]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal={false}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {isNewStop
              ? "Add an extra stop along the route."
              : "Update the address details below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} id="address-edit-form">
          <FieldGroup className="grid gap-4">
            <div className="grid grid-cols-12 gap-3">
              <Controller
                name="street"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    className="col-span-9"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                    <AddressAutocompleteInput
                      value={field.value}
                      onChange={field.onChange}
                      onAddressSelect={onAddressSelect}
                      placeholder="Start typing an address..."
                      name={field.name}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="apt"
                control={form.control}
                render={({ field }) => (
                  <Field className="col-span-3">
                    <FieldLabel htmlFor={field.name}>Apt #</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="off"
                      placeholder="Apt"
                    />
                  </Field>
                )}
              />
            </div>
            <div className="grid grid-cols-12 gap-3">
              <Controller
                name="city"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    className="col-span-6"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor={field.name}>City</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="off"
                      placeholder="City"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="state"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    className="col-span-3"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor={field.name}>State</FieldLabel>
                    <SelectWithSearch
                      options={usStates.map((s) => ({ label: s, value: s }))}
                      className="min-w-full"
                      value={field.value}
                      handleSelect={field.onChange}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="zip"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    className="col-span-3"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor={field.name}>ZIP</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="off"
                      placeholder="ZIP"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="floor_id"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Entrance type</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value?.toString() ?? ""}
                    onValueChange={(value) =>
                      field.onChange(value ? Number(value) : null)
                    }
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select entrance type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {entranceTypes?.map((floor) => (
                          <SelectItem
                            key={floor.id}
                            value={floor.id.toString()}
                          >
                            {floor.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
          <Button type="submit" form="address-edit-form" disabled={isUpdating}>
            <LoadingSwap isLoading={isUpdating}>
              {isNewStop ? "Add stop" : "Save changes"}
            </LoadingSwap>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
