import { isValidPhoneNumber } from "libphonenumber-js"
import { z } from "zod"

export const serviceCodesForDeliveryDate = ["moving_with_storage", "overnight_truck_storage"];
export const serviceCodesForOriginZip = ["local_move", "loading_help", "packing_only", "moving_with_storage", "overnight_truck_storage"];
export const serviceCodesForDestinationZip = ["local_move", "unloading_help", "moving_with_storage", "overnight_truck_storage"];
export const serviceCodesForOriginFloor = ["local_move", "loading_help", "packing_only", "moving_with_storage", "overnight_truck_storage"];
export const serviceCodesForDestinationFloor = ["local_move", "unloading_help", "moving_with_storage", "overnight_truck_storage"];


const addressSchema = z.object({
  street: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  floor_id: z.number().int().positive().nullable().optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
});


export const formSchema = z.object({
  moving_date: z.string().nullable().refine(v => v !== null, { message: "Select moving date" }),
  delivery_date: z.string().nullable(),
  origin: addressSchema,
  destination: addressSchema,
  service_id: z.number().int().positive('Select service'),
  service_code: z.string().optional(),
  move_size_id: z.number().int().positive('Select move size'),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email_address: z.email("Enter a valid email address"),
  phone: z.string().refine((value) => isValidPhoneNumber(value, "US"), {
    message: "Enter a valid US phone number",
  }),
})
  .superRefine((data, ctx) => {
    const serviceCode = data.service_code!;

    // Step 1 conditional validations
    if (serviceCodesForDeliveryDate.includes(serviceCode) && !data.delivery_date) {
      ctx.addIssue({
        path: ["delivery_date"],
        message: "Select delivery date",
        code: "custom"
      });
    }
    if (serviceCodesForOriginZip.includes(serviceCode) && !data.origin.zip?.trim()) {
      ctx.addIssue({
        path: ["origin", "zip"],
        message: "From ZIP required",
        code: "custom"
      });
    }
    if (serviceCodesForDestinationZip.includes(serviceCode) && !data.destination.zip?.trim()) {
      ctx.addIssue({
        path: ["destination", "zip"],
        message: "To ZIP required",
        code: "custom"
      });
    }

    // Step 2 conditional floor validations
    if (serviceCodesForOriginFloor.includes(serviceCode)) {
      if (!data.origin.floor_id) ctx.addIssue({
        path: ["origin", "floor_id"],
        message: "Select floor",
        code: "custom"
      });
    }
    if (serviceCodesForDestinationFloor.includes(serviceCode)) {
      if (!data.destination.floor_id) ctx.addIssue({
        path: ["destination", "floor_id"],
        message: "Select floor",
        code: "custom"
      });
    }
  });


export type AddressSchema = z.infer<typeof addressSchema>;
export type FormSchema = z.input<typeof formSchema>;
