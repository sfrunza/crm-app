import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { ChevronLeftIcon } from "@/components/icons"
import type { ReactNode } from "react"

interface FormCardProps {
  title: string
  handleNext: () => void
  handleBack?: () => void
  nextLabel?: string
  isSubmitting?: boolean
  children: ReactNode
}

export function FormCard({
  title,
  handleNext,
  handleBack,
  nextLabel = "Continue",
  isSubmitting = false,
  children,
}: FormCardProps) {
  return (
    <div className="mx-auto max-w-sm rounded-[2rem] bg-background/10 p-3 backdrop-blur-sm">
      <Card className="rounded-3xl shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            {handleBack && (
              <Button size="lg" variant="outline" onClick={handleBack}>
                <ChevronLeftIcon />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              size="lg"
              className="flex-1"
              disabled={isSubmitting}
            >
              <LoadingSwap isLoading={isSubmitting}>{nextLabel}</LoadingSwap>
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  )
}
