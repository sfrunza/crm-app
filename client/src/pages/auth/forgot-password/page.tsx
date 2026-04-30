import { forgotPassword } from "@/api/endpoints/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"
import z from "zod"

const formSchema = z.object({
  email_address: z.email(),
})

type ForgotPasswordFormValues = z.infer<typeof formSchema>

function ForgotPasswordPage() {
  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSettled: (data) => {
      if (data) {
        toast.success(data.message)
      }
    },
  })

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email_address: "",
    },
  })

  function onSubmit(data: ForgotPasswordFormValues): void {
    mutate(data.email_address)
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>
          We will send you an email that will allow you to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} id="forgot-password-form">
          <FieldGroup>
            <Controller
              name="email_address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="m@example.com"
                    autoComplete="email"
                    required
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          disabled={isPending}
          className="w-full"
          type="submit"
          form="forgot-password-form"
        >
          <LoadingSwap isLoading={isPending}>
            Request password reset
          </LoadingSwap>
        </Button>
      </CardFooter>
      <div className="px-6 text-sm">
        Remebmer your password?{" "}
        <Link to="/auth/login" className="underline underline-offset-4">
          Log in
        </Link>
      </div>
    </Card>
  )
}

export const Component = ForgotPasswordPage
