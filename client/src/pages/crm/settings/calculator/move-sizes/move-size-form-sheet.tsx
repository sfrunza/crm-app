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
import { NumberInput } from "@/components/ui/number-input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useWatch } from "react-hook-form";
import { CrewSizeField } from "./_components/crew-size-field";
import { DefaultItemsField } from "./_components/default-items-field";
import { DefaultRoomsField } from "./_components/default-rooms-field";
import { ImageField } from "./_components/image-field";
import { SuggestedRoomsField } from "./_components/suggested-rooms-field";
import { VolumeDisplay } from "./_components/volume-display";
import { useMoveSizeForm } from "./_hooks/use-move-size-form";

export function MoveSizeFormSheet() {
  const {
    form,
    rooms,
    items,
    isOpen,
    moveSize,
    isSubmitting,
    imagePreview,
    fileInputRef,
    entranceTypes,
    handleClose,
    handleSubmit,
    handleImageChange,
    handleRemoveImage,
  } = useMoveSizeForm();

  const defaultRoomIds =
    useWatch({ control: form.control, name: "default_room_ids" }) || [];
  const suggestedRoomIds =
    useWatch({ control: form.control, name: "suggested_room_ids" }) || [];
  const defaultRoomItems =
    useWatch({ control: form.control, name: "default_room_items" }) || {};
  const suggestedRoomItems =
    useWatch({ control: form.control, name: "suggested_room_items" }) || {};
  const dispersion =
    useWatch({ control: form.control, name: "dispersion" }) || 0;

  const mergedRoomItems = {
    ...defaultRoomItems,
    ...suggestedRoomItems,
  };
  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{moveSize ? "Update" : "Add"} move size</SheetTitle>
          <SheetDescription className="sr-only" />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={form.handleSubmit(handleSubmit)} id="move-size-form">
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>
                        Name (required)
                      </FieldLabel>
                      <FieldDescription>
                        Name of the move size, visible to customers.
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
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <FieldDescription>
                        Appears on the customer portal, and in quotes.
                      </FieldDescription>
                    </FieldContent>
                    <Textarea
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
                name="image"
                control={form.control}
                render={({ fieldState }) => (
                  <ImageField
                    imagePreview={imagePreview}
                    fileInputRef={fileInputRef}
                    fieldError={fieldState.error}
                    onImageChange={handleImageChange}
                    onRemoveImage={handleRemoveImage}
                  />
                )}
              />

              <Controller
                name="dispersion"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Dispersion (%)</FieldLabel>
                    <NumberInput
                      id={field.name}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      min={0}
                      max={100}
                      inputMode="numeric"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="truck_count"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Truck count</FieldLabel>
                    <NumberInput
                      id={field.name}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      inputMode="numeric"
                      min={1}
                      step={1}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <VolumeDisplay
                items={items}
                itemQuantities={mergedRoomItems}
                dispersion={dispersion}
                savedVolume={moveSize?.totals?.volume}
                savedVolumeWithDispersion={moveSize?.totals?.volume_with_dispersion}
              />

              <Controller
                name="default_room_ids"
                control={form.control}
                render={({ field }) => (
                  <DefaultRoomsField
                    rooms={rooms}
                    value={field.value}
                    onChange={(newRoomIds) => {
                      const removedRoomIds = field.value.filter(
                        (id) => !newRoomIds.includes(id),
                      );
                      if (removedRoomIds.length > 0) {
                        const currentItems =
                          form.getValues("default_room_items") || {};
                        const nextItems = { ...currentItems };
                        for (const roomId of removedRoomIds) {
                          delete nextItems[roomId.toString()];
                        }
                        form.setValue("default_room_items", nextItems);
                      }
                      field.onChange(newRoomIds);
                    }}
                  />
                )}
              />

              <Controller
                name="default_room_items"
                control={form.control}
                render={({ field }) => (
                  <DefaultItemsField
                    rooms={rooms}
                    items={items}
                    selectedRoomIds={defaultRoomIds}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name="suggested_room_ids"
                control={form.control}
                render={({ field }) => (
                  <SuggestedRoomsField
                    rooms={rooms}
                    value={field.value}
                    onChange={(newRoomIds) => {
                      const removedRoomIds = field.value.filter(
                        (id) => !newRoomIds.includes(id),
                      );
                      if (removedRoomIds.length > 0) {
                        const currentItems =
                          form.getValues("suggested_room_items") || {};
                        const nextItems = { ...currentItems };
                        for (const roomId of removedRoomIds) {
                          delete nextItems[roomId.toString()];
                        }
                        form.setValue("suggested_room_items", nextItems);
                      }
                      field.onChange(newRoomIds);
                    }}
                  />
                )}
              />

              <Controller
                name="suggested_room_items"
                control={form.control}
                render={({ field }) => (
                  <DefaultItemsField
                    rooms={rooms}
                    items={items}
                    selectedRoomIds={suggestedRoomIds}
                    value={field.value}
                    onChange={field.onChange}
                    label="Suggested Items per Room"
                    description="Configure typical items for suggested rooms (optional)."
                  />
                )}
              />

              <Controller
                name="crew_size_settings"
                control={form.control}
                render={({ field, fieldState }) => (
                  <CrewSizeField
                    value={field.value}
                    onChange={field.onChange}
                    fieldError={fieldState.error}
                    entranceTypes={entranceTypes}
                  />
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
          <Button type="submit" form="move-size-form" disabled={isSubmitting}>
            <LoadingSwap isLoading={isSubmitting}>
              {`${moveSize ? "Update" : "Add"} move size`}
            </LoadingSwap>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
