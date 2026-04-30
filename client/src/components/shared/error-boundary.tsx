import { type ReactNode, Component } from "react"
import { AlertTriangle } from "@/components/icons"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <div>
              <h3 className="font-semibold">Something went wrong</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {this.state.error?.message ?? "An unexpected error occurred"}
              </p>
            </div>
            <Button onClick={() => this.setState({ hasError: false })}>
              Try again
            </Button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
