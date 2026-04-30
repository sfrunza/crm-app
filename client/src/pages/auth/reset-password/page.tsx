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
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"
import z from "zod"
import { useMutation } from "@tanstack/react-query"
import { resetPassword } from "@/api/endpoints/auth"
import { LoadingSwap } from "@/components/ui/loading-swap"

const formSchema = z.object({
  password: z.string().min(6),
})

type ResetPasswordFormValues = z.infer<typeof formSchema>

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  })

  const { mutate, isPending } = useMutation<
    { message: string },
    Error,
    { password: string; token: string }
  >({
    mutationFn: ({ password, token }) => resetPassword(password, token),
    onSettled: (data) => {
      if (data) {
        toast.success(data.message)
        navigate("/auth/login", { replace: true })
      }
    },
  })

  function onSubmit(data: ResetPasswordFormValues): void {
    if (!token) return
    mutate({ password: data.password, token: token })
  }
  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Change your password</CardTitle>
        <CardDescription>
          Enter a new password below to change your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} id="reset-password-form">
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                    <FieldDescription>
                      Please provide a new password.
                    </FieldDescription>
                  </FieldContent>
                  <PasswordInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
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
          type="submit"
          className="w-full"
          form="reset-password-form"
        >
          <LoadingSwap isLoading={isPending}>Change password</LoadingSwap>
        </Button>
      </CardFooter>
      <div className="px-6 text-sm">
        <Link to="/auth/login" className="underline underline-offset-4">
          Log in
        </Link>
      </div>
    </Card>
  )
}

export const Component = ResetPasswordPage
