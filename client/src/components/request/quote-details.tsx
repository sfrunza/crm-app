import { getRequestUIBehavior } from '@/domains/requests/request.behavior';
import type {
  Request,
  RequestExtraItem,
} from '@/domains/requests/request.types';
import { formatDate } from '@/lib/format-date';
import {
  convertMinutesToHoursAndMinutes,
  formatCentsToDollarsString,
  priceObjectToString,
  timeObjectToString,
  timeWindowToString,
} from '@/lib/helpers';

// ─── Detail row ─────────────────────────────────────────────────────
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (value == null || value === '') return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-muted-foreground shrink-0">{label}</p>
      <p className="text-right font-medium">{value}</p>
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────
// function Section({
//   title,
//   children,
// }: {
//   title?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <>
//       <div>
//         {title && (
//           <p className="mb-2 text-xs font-bold tracking-wide uppercase">
//             {title}
//           </p>
//         )}
//         <div className="space-y-1">{children}</div>
//       </div>
//       <hr className="border-border" />
//     </>
//   );
// }

// ─── Items table (packing supplies / extra services) ────────────────
function ItemsTable({
  title,
  items,
}: {
  title: string;
  items: RequestExtraItem[];
}) {
  if (!items.length) return null;

  return (
    <>
      <div>
        <p className="text-xs font-bold tracking-wide uppercase">{title}</p>
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <p>
              {item.name} ({item.quantity})
            </p>
            <p>{formatCentsToDollarsString(item.price * item.quantity)}</p>
          </div>
        ))}
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
      className={`flex items-center justify-between px-3 py-2 ${bold ? 'font-semibold' : ''} ${negative ? 'text-green-600' : ''}`}
    >
      <p className="truncate">{label}</p>
      <p>{value}</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Main component
// ═════════════════════════════════════════════════════════════════════
interface QuoteDetailsProps {
  request: Request;
}

export function QuoteDetails({ request }: QuoteDetailsProps) {
  if (!request) return null;

  const { showDeliveryDateTime, showIfFlatRate } =
    getRequestUIBehavior(request);

  const hasPackingItems = (request.packing_items?.length ?? 0) > 0;
  const hasExtraServices = (request.extra_services?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div>
        {/* ── Schedule ────────────────────────────────────────────── */}
        <DetailRow
          label={showIfFlatRate ? 'Pickup date' : 'Move date'}
          value={formatDate(request.moving_date)}
        />
        <DetailRow
          label="Start time"
          value={timeWindowToString(
            request.start_time_window,
            request.end_time_window
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
                    : ''}
                </>
              }
            />
            <DetailRow
              label="Delivery time"
              value={timeWindowToString(
                request.start_time_window_delivery,
                request.end_time_window_delivery
              )}
            />
          </>
        )}

        {/* ── Pricing & Crew ──────────────────────────────────────── */}
        {!showIfFlatRate && (
          <DetailRow
            label="Hourly rate"
            value={formatCentsToDollarsString(request.rate || 0)}
          />
        )}
        <DetailRow label="Move size" value={request.move_size_snapshot?.name} />

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
                  ? `${request.trucks.length} ${request.trucks.length > 1 ? 'trucks' : 'truck'}`
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
            <DetailRow
              label="Est. total time"
              value={timeObjectToString(request.total_time)}
            />
          </>
        )}
      </div>

      {/* ── Packing Supplies table ──────────────────────────────── */}
      {hasPackingItems && (
        <ItemsTable title="Packing supplies" items={request.packing_items} />
      )}

      {/* ── Extra Services table ────────────────────────────────── */}
      {hasExtraServices && (
        <ItemsTable title="Extra services" items={request.extra_services} />
      )}

      {/* ── Quote Summary ───────────────────────────────────────── */}

      <div className="border-border divide-border divide-y overflow-hidden rounded-md border">
        {!showIfFlatRate && (
          <>
            <SummaryRow
              label="Est. labor cost"
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
                label={request.valuation.name}
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
          </>
        )}
        {/* <SummaryRow
            label="Deposit"
            value={formatCentsToDollarsString(request.deposit || 0)}
          /> */}
        <div className="bg-muted/50 flex flex-col items-center justify-between px-3 py-3 font-semibold">
          <p>{showIfFlatRate ? 'Flat rate' : 'Estimated quote'}</p>
          <p className="text-lg font-bold">
            {priceObjectToString(request.grand_total)}
          </p>
        </div>
      </div>
    </div>
  );
}
