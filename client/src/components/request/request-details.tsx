import {
  convertMinutesToHoursAndMinutes,
  formatCentsToDollarsString,
  priceObjectToString,
  timeObjectToString,
  timeWindowToString,
} from "@/lib/helpers";
import { formatPhone } from "@/lib/format-phone";
import { formatDate } from "@/lib/format-date";
import { getRequestUIBehavior } from "@/domains/requests/request.behavior";
import { AddressItem } from "@/pages/crm/request/pdf-viewer/address-item";
import type {
  Request,
  RequestExtraItem,
} from "@/domains/requests/request.types";
import type { RequestRoom } from "@/domains/request-rooms/request-room.types";
import { useGetPayments } from "@/domains/payments/payment.queries";

// ─── Detail row ─────────────────────────────────────────────────────
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-muted-foreground shrink-0">{label}</p>
      <p className="text-right font-medium">{value}</p>
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div>
        {title && (
          <p className="mb-2 text-xs font-bold tracking-wide uppercase">
            {title}
          </p>
        )}
        <div className="space-y-1">{children}</div>
      </div>
      <hr className="border-border" />
    </>
  );
}

// ─── Items table (packing supplies / extra services) ────────────────
function ItemsTable({
  title,
  items,
  total,
}: {
  title: string;
  items: RequestExtraItem[];
  total: number;
}) {
  if (!items.length) return null;

  return (
    <>
      <div>
        <p className="mb-2 text-xs font-bold tracking-wide uppercase">
          {title}
        </p>
        <div className="border-border overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-left text-xs">
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 text-center font-medium">Qty</th>
                <th className="px-3 py-2 text-right font-medium">Price</th>
                <th className="px-3 py-2 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2 text-center">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">
                    {formatCentsToDollarsString(item.price)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatCentsToDollarsString(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/30 font-medium">
                <td colSpan={3} className="px-3 py-2 text-right">
                  Total
                </td>
                <td className="px-3 py-2 text-right">
                  {formatCentsToDollarsString(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <hr className="border-border" />
    </>
  );
}

function InventoryTable({ rooms }: { rooms: RequestRoom[] }) {
  if (!rooms.length) return null;

  const totalItems = rooms.reduce(
    (sum, room) => sum + (room.totals?.items ?? 0),
    0,
  );
  const totalVolume = rooms.reduce(
    (sum, room) => sum + Number(room.totals?.volume ?? 0),
    0,
  );

  return (
    <>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold tracking-wide uppercase">Inventory</p>
          <p className="text-muted-foreground text-xs">
            {totalItems} items, {totalVolume.toFixed(0)} cbf
          </p>
        </div>

        <div className="p-0">
          <div className="grid gap-x-4 gap-y-3 md:grid-cols-2 print:grid-cols-2">
            {rooms.map((room) => (
              <div key={room.id} className="border-border rounded-md border">
                <div className="border-border grid grid-cols-[1fr_56px] items-center border-b px-3 py-1.5">
                  <p className="truncate text-sm font-semibold">{room.name}</p>
                  <p className="text-right text-sm font-semibold">Qty</p>
                </div>

                <div className="divide-border divide-y">
                  {room.request_items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_56px] items-center gap-2 px-3 py-1"
                    >
                      <span className="truncate text-[13px] font-medium">
                        {item.name}
                      </span>
                      <span className="text-right text-[13px]">
                        {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <hr className="border-border" />
    </>
  );
}

// ─── Quote summary row ──────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  bold,
  negative,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 ${bold ? "font-semibold" : ""} ${negative ? "text-green-600" : ""}`}
    >
      <p>{label}</p>
      <p>{value}</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Main component
// ═════════════════════════════════════════════════════════════════════
interface RequestDetailsProps {
  request: Request;
}

export function RequestDetails({ request }: RequestDetailsProps) {
  if (!request) return null;

  const { data: payments = [] } = useGetPayments(request.id, {
    enabled: !!request.id,
  });

  const depositPaid = payments.reduce((acc, payment) => {
    if (payment.payment_type === "deposit" && payment.status === "succeeded") {
      return acc + payment.amount;
    }
    return acc + 0;
  }, 0);

  const {
    showOrigin,
    showDestination,
    showStorageOrigin,
    showStorageDestination,
    showDeliveryDateTime,
    showIfFlatRate,
  } = getRequestUIBehavior(request);

  const hasAddresses =
    showOrigin ||
    showDestination ||
    showStorageOrigin ||
    showStorageDestination ||
    (request.stops?.length ?? 0) > 0;

  const hasPackingItems = (request.packing_items?.length ?? 0) > 0;
  const hasExtraServices = (request.extra_services?.length ?? 0) > 0;
  const inventoryRooms = (request.request_rooms ?? []).filter(
    (room) => (room.request_items?.length ?? 0) > 0,
  );
  const hasInventoryRooms = inventoryRooms.length > 0;

  return (
    <div className="space-y-4 text-sm">
      {/* ── General Info ────────────────────────────────────────── */}
      <Section>
        <DetailRow label="Request" value={`#${request.id}`} />
        <DetailRow label="Service" value={request.service?.name} />
        <div className="flex items-start justify-between gap-4">
          <p className="text-muted-foreground shrink-0">Client</p>
          <div className="text-right font-medium">
            <p>
              {request.customer?.first_name} {request.customer?.last_name}
            </p>
            <p>{formatPhone(request.customer?.phone)}</p>
            <p className="text-muted-foreground">
              {request.customer?.email_address}
            </p>
          </div>
        </div>
      </Section>

      {/* ── Schedule ────────────────────────────────────────────── */}
      <Section title="Schedule">
        <DetailRow
          label={showIfFlatRate ? "Pickup date" : "Moving date"}
          value={formatDate(request.moving_date)}
        />
        <DetailRow
          label="Start time"
          value={timeWindowToString(
            request.start_time_window,
            request.end_time_window,
          )}
        />
        {showDeliveryDateTime && (
          <>
            <DetailRow
              label="Delivery date"
              value={
                <>
                  {formatDate(request.delivery_date_window_start)}
                  {request.delivery_date_window_end
                    ? ` - ${formatDate(request.delivery_date_window_end)}`
                    : ""}
                </>
              }
            />
            <DetailRow
              label="Delivery time"
              value={timeWindowToString(
                request.start_time_window_delivery,
                request.end_time_window_delivery,
              )}
            />
          </>
        )}
      </Section>

      {/* ── Pricing & Crew ──────────────────────────────────────── */}
      <Section title="Pricing">
        <DetailRow
          label={showIfFlatRate ? "Flat rate" : "Hourly rate"}
          value={formatCentsToDollarsString(request.rate || 0)}
        />
        <DetailRow label="Move size" value={request.move_size?.name} />

        {!showIfFlatRate && (
          <>
            <DetailRow
              label="Crew size"
              value={`${request.crew_size} movers`}
            />
            <DetailRow
              label="Trucks"
              value={
                request.trucks?.length
                  ? `${request.trucks.length} ${request.trucks.length > 1 ? "trucks" : "truck"}`
                  : null
              }
            />
            <DetailRow
              label="Travel time"
              value={convertMinutesToHoursAndMinutes(request.travel_time || 0)}
            />
            <DetailRow
              label="Est. labor time"
              value={timeObjectToString(request.work_time)}
            />
            {/* <DetailRow
              label="Estimated labor price"
              value={priceObjectToString(request.labor_price)}
            /> */}
            <DetailRow
              label="Est. total time"
              value={timeObjectToString(request.total_time)}
            />
            {/* <DetailRow
              label="Transportation"
              value={priceObjectToString(request.transportation)}
            /> */}
          </>
        )}
      </Section>

      {/* ── Addresses ───────────────────────────────────────────── */}
      {hasAddresses && (
        <Section title="Addresses">
          <div className="grid gap-6 md:grid-cols-2 print:grid-cols-2">
            {showStorageOrigin && (
              <AddressItem
                title="Origin"
                address={request.origin}
                isCompanyStorage
              />
            )}
            {showOrigin && !showStorageOrigin && (
              <AddressItem title="Origin" address={request.origin} />
            )}

            {showStorageDestination && (
              <AddressItem
                title="Destination"
                address={request.destination}
                isCompanyStorage
              />
            )}
            {showDestination && !showStorageDestination && (
              <AddressItem title="Destination" address={request.destination} />
            )}

            {request.stops?.map((stop, i) => (
              <AddressItem
                key={i}
                title={
                  stop?.type === "pick_up" ? "Extra pickup" : "Extra dropoff"
                }
                address={stop}
              />
            ))}
          </div>
        </Section>
      )}

      {/* ── Additional Details ──────────────────────────────────── */}
      <Section title="Additional Details">
        <p className="whitespace-pre-line">
          {request.details?.comments || "N/A"}
        </p>
      </Section>

      {/* ── Packing & Valuation ─────────────────────────────────── */}
      <Section>
        <DetailRow
          label="Packing"
          value={request.packing_type?.name ?? "No packing"}
        />
        {request.valuation?.name && (
          <DetailRow label="Valuation" value={request.valuation.name} />
        )}
      </Section>

      {/* ── Packing Supplies table ──────────────────────────────── */}
      {hasPackingItems && (
        <ItemsTable
          title="Packing Supplies"
          items={request.packing_items}
          total={request.packing_items_total}
        />
      )}

      {/* ── Extra Services table ────────────────────────────────── */}
      {hasExtraServices && (
        <ItemsTable
          title="Extra Services"
          items={request.extra_services}
          total={request.extra_services_total}
        />
      )}

      {hasInventoryRooms && <InventoryTable rooms={inventoryRooms} />}

      {/* ── Quote Summary ───────────────────────────────────────── */}
      <div>
        <p className="mb-2 text-xs font-bold tracking-wide uppercase">
          Quote Summary
        </p>
        <div className="border-border divide-border divide-y overflow-hidden rounded-md border">
          <SummaryRow
            label="Transportation"
            value={priceObjectToString(request.transportation)}
          />
          {request.fuel?.total > 0 && (
            <SummaryRow
              label="Fuel surcharge"
              value={formatCentsToDollarsString(request.fuel.total)}
            />
          )}
          {request.valuation?.total > 0 && (
            <SummaryRow
              label="Valuation"
              value={formatCentsToDollarsString(request.valuation.total)}
            />
          )}
          {hasPackingItems && (
            <SummaryRow
              label="Packing supplies"
              value={formatCentsToDollarsString(request.packing_items_total)}
            />
          )}
          {hasExtraServices && (
            <SummaryRow
              label="Extra services"
              value={formatCentsToDollarsString(request.extra_services_total)}
            />
          )}
          {request.discount?.total > 0 && (
            <SummaryRow
              label="Discount"
              value={`-${formatCentsToDollarsString(request.discount.total)}`}
              negative
            />
          )}
          {!request.is_deposit_accepted && (
            <SummaryRow
              label="Deposit"
              value={formatCentsToDollarsString(request.deposit || 0)}
            />
          )}
          {request.is_deposit_accepted && depositPaid > 0 && (
            <SummaryRow
              label="Deposit paid"
              value={formatCentsToDollarsString(depositPaid || 0)}
            />
          )}
          <div className="bg-muted/50 flex items-center justify-between px-3 py-3 font-semibold">
            <p>Estimated Total</p>
            <p className="text-base">{priceObjectToString(request.balance)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
