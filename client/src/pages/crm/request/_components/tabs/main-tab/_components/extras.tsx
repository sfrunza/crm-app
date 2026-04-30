import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRequest } from "@/hooks/use-request"
import { formatCentsToDollarsString, priceObjectToString } from "@/lib/helpers"
import { HouseIcon, PencilLineIcon } from "@/components/icons"
import { useSearchParams } from "react-router"
import { DepositDialog } from "./dialogs/deposit-dialog"
import { ExtraServicesDialog } from "./dialogs/extra-services-dialog"
import { MoveSizeDialog } from "./dialogs/move-size-dialog"
import { PackingServiceDialog } from "./dialogs/packing-service-dialog"
import { PackingSuppliesDialog } from "./dialogs/packing-supplies-dialog"
import { ValuationDialog } from "./dialogs/valuation-dialog"
import { FuelDialog } from "./dialogs/fuel-dialog"
import { DiscountDialog } from "./dialogs/discount-dialog"
import { PaymentsDialog } from "./dialogs/payments-dialog/index"

// ─── Row ────────────────────────────────────────────────────────────
function Row({
  label,
  value,
  striped,
  onClick,
}: {
  label: string
  value: React.ReactNode
  striped?: boolean
  onClick?: () => void
}) {
  const interactive = !!onClick
  return (
    <div
      className={`flex items-center justify-between px-6 py-3 transition-colors ${striped ? "bg-muted" : ""} ${interactive ? "group cursor-pointer hover:bg-accent" : ""}`}
      onClick={onClick}
    >
      <p
        className={`text-sm text-muted-foreground ${interactive ? "group-hover:text-accent-foreground" : ""}`}
      >
        {label}
      </p>
      <p
        className={`text-sm font-medium ${interactive ? "group-hover:text-primary" : ""}`}
      >
        {value}
      </p>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────
export function Extras() {
  const [, setSearchParams] = useSearchParams()
  const { draft } = useRequest()
  if (!draft) return null

  const open = (key: string) => setSearchParams({ [key]: "true" })

  const rows = [
    {
      label: "Reservation deposit",
      value: draft.is_deposit_accepted
        ? "Accepted"
        : formatCentsToDollarsString(draft.deposit),
      onClick: () => open("edit_deposit"),
    },
    {
      label: "Transportation",
      value: priceObjectToString(draft.transportation),
    },
    {
      label: "Fuel surcharge",
      value: formatCentsToDollarsString(draft.fuel?.total),
      onClick: () => open("edit_fuel"),
    },
    {
      label: "Valuation",
      value: formatCentsToDollarsString(draft.valuation?.total),
      onClick: () => open("edit_valuation"),
    },
    {
      label: "Packing service",
      value: draft.packing_type?.name ?? "No packing",
      onClick: () => open("edit_packing_service"),
    },
    {
      label: "Packing supplies",
      value: formatCentsToDollarsString(draft.packing_items_total),
      onClick: () => open("edit_packing_supplies"),
    },
    {
      label: "Extra services",
      value: formatCentsToDollarsString(draft.extra_services_total),
      onClick: () => open("edit_extra_services"),
    },
    {
      label: "Discount",
      value: formatCentsToDollarsString(draft.discount?.total),
      onClick: () => open("edit_discount"),
    },
    {
      label: "Grand total",
      value: priceObjectToString(draft.grand_total),
    },
    {
      label: "Payments",
      value: formatCentsToDollarsString(draft.payments_total ?? 0),
      onClick: () => open("edit_payments"),
    },
  ]

  return (
    <>
      {/* Modals */}
      <MoveSizeDialog />
      <DepositDialog />
      <FuelDialog />
      <DiscountDialog />
      <ValuationDialog />
      <PackingServiceDialog />
      <PackingSuppliesDialog />
      <ExtraServicesDialog />
      <PaymentsDialog />

      {/* Card */}
      <Card className="gap-0 overflow-hidden p-0">
        {/* ── Header ──────────────────────────────────────────── */}
        <CardHeader className="border-b p-6">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback>
                <HouseIcon />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>
                {draft.move_size_snapshot?.name ?? "No move size"}
              </CardTitle>
              <CardDescription>
                {draft.totals.items} items · {draft.totals.boxes} boxes ·{" "}
                {draft.totals.volume} cu ft
              </CardDescription>
            </div>
          </div>
          <CardAction>
            <Button
              size="sm"
              variant="outline"
              onClick={() => open("request_move_size")}
            >
              <PencilLineIcon />
              Edit
            </Button>
          </CardAction>
        </CardHeader>

        {/* ── Line items (zebra striped) ──────────────────────── */}
        <CardContent className="p-0">
          {rows.map((row, i) => (
            <Row
              key={row.label}
              label={row.label}
              value={row.value}
              striped={i % 2 === 0}
              onClick={row.onClick}
            />
          ))}
        </CardContent>

        {/* ── Balance ─────────────────────────────────────────── */}
        <CardFooter className="flex items-center justify-between bg-foreground px-6 py-4 text-background">
          <p className="font-medium opacity-90">Balance</p>
          <p className="font-bold">{priceObjectToString(draft.balance)}</p>
        </CardFooter>
      </Card>
    </>
  )
}
