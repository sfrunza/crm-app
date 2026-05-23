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
import { ArrowLeftIcon } from "lucide-react"
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
          <CardTitle className="text-2xl font-bold text-primary">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent
        // className="flex-1 overflow-y-auto"
        >
          {children}
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal" className="">
            {handleBack && (
              <Button size="lg" variant="outline" onClick={handleBack}>
                <ArrowLeftIcon />
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
