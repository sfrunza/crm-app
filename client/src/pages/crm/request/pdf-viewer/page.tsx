import { PrinterIcon } from "@/components/icons"
import { PageContainer, PageContent } from "@/components/page-component"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/api/use-settings"
import { useRequest } from "@/hooks/use-request"
import { ConfirmationPrintContent } from "@/pages/account/request/confirmation/_components/confirmation-print-content"
import {
  PageErrorState,
  PageLoadingState,
  PageNotFoundState,
} from "@/pages/account/request/confirmation/_components/page-states"
import { useRef } from "react"
import { useParams } from "react-router"
import { useReactToPrint } from "react-to-print"

function RequestPdfView() {
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
    <PageContainer
      className="min-h-screen overflow-y-scroll bg-muted dark:bg-background"
      classNameInner="mb-0 h-screen flex flex-col max-w-5xl"
    >
      <PageContent className="flex-1 py-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex w-full justify-end">
            <Button
              onClick={handlePrint}
              variant="ghost"
              aria-label="Print confirmation"
            >
              <PrinterIcon />
              Print
            </Button>
          </div>

          {/* PDF Content - Will be printed */}
          <div ref={printRef}>
            <ConfirmationPrintContent
              request={request}
              companyLogoUrl={companyLogo}
            />
            {/* <ConfirmationFooter request={request} /> */}
          </div>
        </div>
      </PageContent>
    </PageContainer>
  )
}

export const Component = RequestPdfView
