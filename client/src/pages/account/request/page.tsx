import { InfoIcon } from "@/components/icons";
import { PageContainer, PageContent } from "@/components/page-component";
import { QuoteDetails } from "@/components/request/quote-details";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useRequest } from "@/hooks/use-request";
import { MoveSizeDialog } from "@/pages/crm/request/_components/tabs/main-tab/_components/dialogs/move-size-dialog";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { CustomerCard } from "../_components/customer-card";
import { AdditionalDetailsCard } from "./_components/additional-details-card";
import { AddressesCard } from "./_components/addresses-card";
import { DateTimeCard } from "./_components/date-time-card";
import { AddressEditDialog } from "./_components/dialogs/address-edit-dialog";
import { MessagesDialog } from "./_components/dialogs/messages-dialog";
import { PackingDialog } from "./_components/dialogs/packing-dialog";
import { ValuationDialog } from "./_components/dialogs/valuation-dialog";
import { Faqs } from "./_components/faqs";
import { MoveSizeCard } from "./_components/move-size-card";
import { MovingAssistantCard } from "./_components/moving-assistant-card";
import { PhotosCard } from "./_components/photos-card";
import { RequestsToggle } from "./_components/requests-toggle";
import { StatusCard } from "./_components/status-card";
import { WhatsNext } from "./_components/whats-next";
import { PolicySheet } from "./confirmation/_components/policy-sheet";

function AccountRequestPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const requestId = Number(id);
  const { request, isPending, isError, error } = useRequest(requestId);

  // Redirect if request doesn't have allowed status
  useEffect(() => {
    if (isError) {
      navigate("/account/requests", { replace: true });
    }
  }, [isError, navigate]);

  // ── Loading / error / not-found states ────────────────────────────
  if (isPending) {
    return (
      <PageContainer classNameInner="h-full">
        <PageContent className="h-full">
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Spinner />
              <p className="text-sm">Loading</p>
            </div>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <PageContent>
          <div className="container mx-auto flex items-center justify-center pt-24">
            <div className="text-sm text-muted-foreground">
              {error?.message || "Failed to load request"}
            </div>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  if (!request) {
    return (
      <PageContainer>
        <PageContent>
          <div className="container mx-auto flex items-center justify-center pt-24">
            <div className="text-sm text-muted-foreground">
              Request not found
            </div>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  const canEdit = request.can_edit_request;
  const initials = `${request.customer?.first_name?.[0] ?? ""}${request.customer?.last_name?.[0] ?? ""}`;

  return (
    <div className="space-y-6">
      {/* Address edit dialog (controlled via search params) */}
      <AddressEditDialog />
      <MoveSizeDialog />

      <div className="fixed right-20 bottom-20 z-10 max-sm:right-8 max-sm:bottom-8">
        <MessagesDialog requestId={requestId} status={request.status} isLarge />
      </div>

      <div className="border-b pb-6">
        <CustomerCard
        // onUpdateSuccess={async () => {
        //   if (!request) return;

        //   // Refresh UI
        //   await Promise.all([
        //     queryClient.invalidateQueries({
        //       queryKey: customerKeys.id({ id: request.customer?.id! }),
        //     }),
        //     queryClient.invalidateQueries({
        //       queryKey: requestKeys.detail(request.id),
        //     }),
        //   ]);
        // }}
        />
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12">
        {/* ════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN                                            */}
        {/* ════════════════════════════════════════════════════════ */}

        {/* ── Requests toggle ─────────────────────────────────── */}
        {request.paired_request && <RequestsToggle />}

        <div className="space-y-4 lg:col-span-8">
          {/* ── Status card ──────────────────────────────────────── */}
          <StatusCard />

          {/* ── Moving date/time ─────────────────────────────────── */}
          <DateTimeCard />

          {/* ── Addresses ─────────────────────────────────── */}
          <AddressesCard />

          {/* ── Move size card ─────────────────────────────────── */}
          <MoveSizeCard />

          {/* ── Photos card ─────────────────────────────────── */}
          <PhotosCard />

          {/* ── Additional Details card ─────────────────────── */}
          <AdditionalDetailsCard />

          {/* ── Packing Option ─────────────────────────────────── */}
          <Card className="gap-0 py-0 sm:flex-row">
            <CardContent className="grow p-4">
              <img
                src="https://cdn.shadcnstudio.com/ss-assets/components/card/image-3.png"
                alt="Banner"
                className="size-full rounded-xl object-cover"
              />
            </CardContent>
            <div className="sm:min-w-100">
              <CardHeader className="pt-6">
                <CardTitle>Packing</CardTitle>
                <CardDescription className="text-base font-semibold text-primary">
                  {request.packing_type?.name}
                </CardDescription>
                <div className="relative h-32 overflow-hidden">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: request.packing_type?.description ?? "",
                    }}
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-card to-transparent"></div>
                </div>
              </CardHeader>
              <CardFooter className="gap-3 py-6">
                {canEdit && (
                  <PackingDialog
                    requestId={request.id}
                    packingTypeId={request.packing_type_id}
                  />
                )}
              </CardFooter>
            </div>
          </Card>

          {/* ── Valuation Option ─────────────────────────────────── */}
          <Card className="gap-0 py-0 sm:flex-row">
            <CardContent className="grow p-4">
              <img
                src="https://cdn.shadcnstudio.com/ss-assets/components/card/image-3.png"
                alt="Banner"
                className="size-full rounded-xl object-cover"
              />
            </CardContent>
            <div className="sm:min-w-100">
              <CardHeader className="pt-6">
                <CardTitle>Moving insurance</CardTitle>
                <CardDescription className="text-base font-semibold text-primary">
                  {request.valuation?.name}
                </CardDescription>
                <div className="relative h-32 overflow-hidden">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: request.valuation?.description ?? "",
                    }}
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-card to-transparent"></div>
                </div>
              </CardHeader>
              <CardFooter className="gap-3 py-6">
                {canEdit && (
                  <ValuationDialog
                    requestId={request.id}
                    valuation={request.valuation}
                  />
                )}
              </CardFooter>
            </div>
          </Card>

          {/* ── Additional Details ─────────────────────────────── */}
          {request.details?.comments && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {request.details.comments}
                </p>
              </CardContent>
            </Card>
          )}
          {/* <div className="max-sm:fixed max-sm:right-0 max-sm:bottom-0 max-sm:left-0 max-sm:z-50 max-sm:p-4"> */}
          <Button size="lg" className="w-full" asChild>
            <Link to={`/account/requests/${request.id}/confirmation`}>
              Proceed to confirmation
            </Link>
          </Button>
          {/* </div> */}

          {/* ── What's Next ─────────────────────────────────────── */}
          <WhatsNext />

          {/* ── FAQs ────────────────────────────────────────────── */}
          <Faqs />
        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN                                           */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className="space-y-4 lg:col-span-4">
          {/* ── Moving assistant card ─────────────────────────── */}
          <MovingAssistantCard
            requestId={requestId}
            status={request.status}
            initials={initials}
          />

          {/* ── Quote Summary card ────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Quote details</CardTitle>
            </CardHeader>
            <CardContent>
              <QuoteDetails request={request} />
              <div className="mt-4 space-y-4">
                <Alert className="rounded-md border-l-6 border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400">
                  <InfoIcon />
                  <AlertTitle>Please note</AlertTitle>
                  <AlertDescription className="text-amber-600/80 dark:text-amber-400/80">
                    This quote is just an estimate and provided for your
                    convenience only. We can provide only with estimated time
                    based on you information and our experience. Most of the
                    time it's 95% accurate.
                  </AlertDescription>
                </Alert>
                <PolicySheet
                  title="How is it calculated?"
                  trigger="How is it calculated?"
                >
                  <div className="space-y-2">
                    <p>
                      <span className="font-bold">Please note:</span> this quote
                      is just an estimate and is provided for your convenience
                      only.
                    </p>
                    <p>
                      Move cost is based on the size of your shipment and the
                      amount of packing to be performed. By entering the items
                      through the online inventory our system will generate a
                      quote based on a database average for generally similar
                      moves. It is best to consider this as a thinking tool.
                      Your final cost will be based on the actual size of your
                      move and the number of items you need to move.
                    </p>
                    <p>
                      It is best to consider this a thinking tool. Your final
                      cost will be based on the hourly rate and your move's
                      actual time. Additional time may be required if your move
                      involves long walks from your apartment to the truck,
                      narrow hallways and/or tight staircases, disassembling and
                      reassembling furniture, hoisting, moving oversized,
                      antique items, ones with glass and/or marble, appliances
                      moving any items over 300lb. It is important to
                      understand, that the move time will also depend on how
                      well you are packed and organized: all drawers of all the
                      furniture must be emptied, and all miscellaneous items
                      packed neatly into moving boxes of correct sizes.
                    </p>
                  </div>
                </PolicySheet>
              </div>
            </CardContent>
          </Card>

          {/* ── Customer Notes card (if any) ──────────────────── */}
          {request.customer_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  // className="text-muted-foreground text-sm whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: request.customer_notes }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export const Component = AccountRequestPage;
