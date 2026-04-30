import { PageContent } from "@/components/page-component"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { PhoneInput } from "@/components/inputs/phone-input"
import { Spinner } from "@/components/ui/spinner"
import { formatPhone } from "@/lib/format-phone"
import { zodResolver } from "@hookform/resolvers/zod"
import { isValidPhoneNumber } from "libphonenumber-js"
import { Trash2Icon, UploadIcon } from "@/components/icons"
import { useCallback, useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { AddressAutocompleteInput } from "@/components/inputs/address-autocomplete-input"
import { useSettings, useUpdateSettings } from "@/hooks/api/use-settings"

const formSchema = z.object({
  company_name: z.string().min(1, { message: "Company name is required." }),
  company_address: z
    .string()
    .min(1, { message: "Company address is required." }),
  company_phone: z
    .string()
    .refine((phoneNumber) => isValidPhoneNumber(phoneNumber, "US"), {
      message: "Invalid phone number",
    }),
  company_email: z.email({ message: "Please enter a valid email address." }),
  company_website: z.url({ message: "Invalid URL" }),
  company_logo: z.instanceof(File).optional().nullable(),
  parking_address: z
    .string()
    .min(1, { message: "Parking address is required." }),
  parking_location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
})

type FormValues = z.infer<typeof formSchema>

function CompanyPage() {
  const { data: settings, isLoading } = useSettings()
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
    values: {
      company_name: settings?.company_name ?? "",
      company_address: settings?.company_address ?? "",
      company_phone: settings?.company_phone ?? "",
      company_email: settings?.company_email ?? "",
      company_website: settings?.company_website ?? "",
      company_logo: null,
      parking_address: settings?.parking_address ?? "",
      parking_location: settings?.parking_location ?? {
        lat: 0,
        lng: 0,
      },
    },
  })

  const { mutate: updateSettingsMutation, isPending: isUpdating } =
    useUpdateSettings({
      onSuccess: () => {
        toast.success("Settings updated")
        form.reset()
      },
    })

  const resetLogoImage = useCallback(() => {
    if (settings?.company_logo_url) {
      setLogoPreview(settings.company_logo_url)
    } else {
      setLogoPreview(null)
    }
  }, [settings?.company_logo_url])

  useEffect(() => {
    resetLogoImage()
  }, [resetLogoImage])

  function onSubmit(values: FormValues) {
    updateSettingsMutation(values)
  }

  if (isLoading) {
    return (
      <PageContent>
        <div className="flex h-96 items-center justify-center">
          <Spinner />
        </div>
      </PageContent>
    )
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (file) {
      form.setValue("company_logo", file, {
        shouldDirty: true,
        shouldTouch: true,
      })
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleRemoveLogo() {
    form.setValue("company_logo", null)
    setLogoPreview(null)
    if (logoInputRef.current) {
      logoInputRef.current.value = ""
    }
  }

  return (
    <PageContent>
      <div className="mt-10 w-full max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} id="company-settings-form">
          <FieldGroup>
            {/* Company Logo */}
            <Controller
              name="company_logo"
              control={form.control}
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="image">Company Logo</FieldLabel>
                      {logoPreview && (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={handleRemoveLogo}
                          className="h-auto p-0"
                        >
                          <Trash2Icon />
                          Remove
                        </Button>
                      )}
                    </div>
                    <FieldDescription>
                      Upload your company logo. Recommended size: 200x200px.
                      Supported formats: PNG, JPG, SVG.
                    </FieldDescription>
                  </FieldContent>
                  <input
                    ref={logoInputRef}
                    id="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleLogoChange}
                  />
                  {!logoPreview ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="max-w-24"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <UploadIcon />
                      Upload
                    </Button>
                  ) : (
                    <div className="relative mt-2">
                      <div className="relative flex h-20 w-full items-center justify-center rounded-lg border border-border bg-muted/50">
                        <img
                          src={logoPreview}
                          alt="Preview"
                          className="h-full w-full rounded-lg object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <FieldSeparator />

            {/* Company Name */}
            <Controller
              name="company_name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>
                      Company Name (required)
                    </FieldLabel>
                    <FieldDescription>
                      The official name of your company
                    </FieldDescription>
                  </FieldContent>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="organization"
                    placeholder="Acme Moving Company"
                    className="mt-2"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Company Address */}
            <Controller
              name="company_address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>
                      Company Address (required)
                    </FieldLabel>
                    <FieldDescription>
                      Your company's physical address
                    </FieldDescription>
                  </FieldContent>
                  <AddressAutocompleteInput
                    value={field.value}
                    onChange={field.onChange}
                    onAddressSelect={(address) => {
                      const addressString = `${address.street}, ${address.city}, ${address.state} ${address.zip}`
                      form.setValue("company_address", addressString, {
                        shouldDirty: true,
                        shouldTouch: true,
                      })
                    }}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {/* <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="street-address"
                    placeholder="123 Main St, City, State 12345"
                    className="mt-2"
                  /> */}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Company Phone */}
            <Controller
              name="company_phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>
                      Company Phone (required)
                    </FieldLabel>
                    <FieldDescription>
                      Contact phone number for your company
                    </FieldDescription>
                  </FieldContent>
                  <PhoneInput
                    {...field}
                    handleValueChange={field.onChange}
                    value={field.value ? formatPhone(field.value) : ""}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="tel"
                    placeholder="(555) 123-4567"
                    className="mt-2"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Company Email */}
            <Controller
              name="company_email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>
                      Company Email (required)
                    </FieldLabel>
                    <FieldDescription>
                      Official email address for your company
                    </FieldDescription>
                  </FieldContent>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    aria-invalid={fieldState.invalid}
                    autoComplete="email"
                    placeholder="contact@company.com"
                    className="mt-2"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Company Website */}
            <Controller
              name="company_website"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>
                      Company Website (required)
                    </FieldLabel>
                    <FieldDescription>
                      Your company's website URL
                    </FieldDescription>
                  </FieldContent>
                  <Input
                    {...field}
                    id={field.name}
                    type="url"
                    aria-invalid={fieldState.invalid}
                    autoComplete="url"
                    placeholder="https://www.company.com"
                    className="mt-2"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Company Name */}
            <Controller
              name="parking_address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="col-span-12"
                >
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>
                      Parking Address (required)
                    </FieldLabel>
                  </FieldContent>
                  <AddressAutocompleteInput
                    value={field.value}
                    onChange={field.onChange}
                    onAddressSelect={(address) => {
                      const addressString = `${address.street}, ${address.city}, ${address.state} ${address.zip}`
                      form.setValue("parking_address", addressString, {
                        shouldDirty: true,
                        shouldTouch: true,
                      })
                      form.setValue(
                        "parking_location",
                        {
                          lat: address.location?.lat ?? 0,
                          lng: address.location?.lng ?? 0,
                        },
                        {
                          shouldDirty: true,
                          shouldTouch: true,
                        }
                      )
                    }}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  <FieldDescription>
                    {form.getValues("parking_location")
                      ? Object.values(form.getValues("parking_location")).join(
                          ","
                        )
                      : ""}
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Field>
              <Button
                type="submit"
                form="company-settings-form"
                disabled={isUpdating || !form.formState.isDirty}
              >
                <LoadingSwap isLoading={isUpdating}>Save</LoadingSwap>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  resetLogoImage()
                }}
                disabled={!form.formState.isDirty}
              >
                Cancel
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </PageContent>
  )
}

export const Component = CompanyPage
