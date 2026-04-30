import {
  PageAction,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page-component"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { PlusIcon } from "@/components/icons"
import { Fragment } from "react"
import { useSearchParams } from "react-router"
import { DeleteValuationDialog } from "./delete-valuation-dialog"
import { ValuationFormSheet } from "./valuation-form-sheet"
import { ValuationsTable } from "./valuation-table"
import { useValuations } from "@/hooks/api/use-valuations"

function ValuationsPage() {
  const [_, setSearchParams] = useSearchParams()
  const { data: valuations, isLoading, error } = useValuations()

  return (
    <Fragment>
      {/* Actions based on search params */}
      <ValuationFormSheet />
      <DeleteValuationDialog />

      <PageHeader className="border-b">
        <PageTitle>Valuation settings</PageTitle>
        <PageAction>
          <Button
            size="sm"
            onClick={() => {
              setSearchParams({ create_valuation: "true" })
            }}
          >
            <PlusIcon />
            Create valuation
          </Button>
        </PageAction>
      </PageHeader>

      <PageContent>
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center px-4 py-28">
            <Spinner />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center justify-center px-4 py-28">
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        )}

        {/* Services table */}
        {valuations && <ValuationsTable valuations={valuations} />}
      </PageContent>
    </Fragment>
  )
}

export const Component = ValuationsPage
