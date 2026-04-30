import { useRequest } from "@/hooks/use-request"
import { useRef } from "react"
import { useParams } from "react-router"
import { useReactToPrint } from "react-to-print"
import { ConfirmationFooter } from "./_components/confirmation-footer"
import { ConfirmationPageHeader } from "./_components/confirmation-page-header"
import { ConfirmationPrintContent } from "./_components/confirmation-print-content"
import {
  PageErrorState,
  PageLoadingState,
  PageNotFoundState,
} from "./_components/page-states"
import { useSettings } from "@/hooks/api/use-settings"

function RequestConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Request Confirmation",
  })

  const { request, isPending, isError, error } = useRequest(Number(id))
  const { data: companySettings } = useSettings()

  const companyLogo = companySettings?.company_logo_url ?? ""

  if (isPending) return <PageLoadingState />
  if (isError) {
    return (
      <PageErrorState
        message={error?.message || "Something went wrong. Please try again."}
      />
    )
  }
  if (!request) return <PageNotFoundState />

  return (
    <div className="mx-auto max-w-3xl">
      <ConfirmationPageHeader requestId={request.id} onPrint={handlePrint} />

      {/* PDF Content - Will be printed */}
      <div ref={printRef}>
        <ConfirmationPrintContent
          request={request}
          companyLogoUrl={companyLogo}
        />
        <ConfirmationFooter request={request} />
      </div>
    </div>
  )
}

export const Component = RequestConfirmationPage
