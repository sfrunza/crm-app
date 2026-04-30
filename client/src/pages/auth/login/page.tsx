import { PasswordInput } from "@/components/inputs/password-input"
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
import { useAuth } from "@/hooks/use-auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Link } from "react-router"
import { z } from "zod"

const formSchema = z.object({
  email_address: z.email(),
  password: z.string().min(6),
})

type LoginFormValues = z.infer<typeof formSchema>

function LoginPage() {
  const { login, isPendingLogin } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email_address: "frunza.sergiu3@gmail.com",
      password: "111111",
    },
  })

  function onSubmit(data: LoginFormValues): void {
    login({ email_address: data.email_address, password: data.password })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} id="login-form">
          <FieldGroup>
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
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <PasswordInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="password"
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
          disabled={isPendingLogin}
          className="w-full"
          type="submit"
          form="login-form"
        >
          <LoadingSwap isLoading={isPendingLogin}>Login</LoadingSwap>
        </Button>
      </CardFooter>
      <div className="px-6 text-sm">
        <Link
          to="/auth/forgot-password"
          className="underline underline-offset-4"
        >
          Forgot your password?
        </Link>
      </div>
    </Card>
  )
}

export const Component = LoginPage
