import { AmountInput } from "@/components/inputs/amount-input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreateInvoice } from "@/domains/payments/payment.mutations";
import { paymentKeys } from "@/domains/payments/payment.keys";
import type { Request as RequestType } from "@/domains/requests/request.types";
import { formatCentsToDollarsString } from "@/lib/helpers";
import { PlusIcon, Trash2Icon } from "@/components/icons";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { parseCents } from "./utils";

// ─── Types ───────────────────────────────────────────────────────

type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

function emptyLineItem(): InvoiceLineItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: "1",
    unitPrice: "",
  };
}

// ─── Add Invoice Form ────────────────────────────────────────────

export function AddInvoiceForm({
  requestId,
  draft,
  onSuccess,
}: {
  requestId: number;
  draft: RequestType | null | undefined;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const customer = draft?.customer;
  const origin = draft?.origin;

  const defaultAddress = useMemo(() => {
    if (!origin) return "";
    const parts = [origin.street, origin.apt ? `Apt ${origin.apt}` : ""].filter(
      Boolean,
    );
    const line2 = [origin.city, origin.state, origin.zip]
      .filter(Boolean)
      .join(", ");
    return [parts.join(" "), line2].filter(Boolean).join("\n");
  }, [origin]);

  const [email, setEmail] = useState(customer?.email_address || "");
  const [clientName, setClientName] = useState(
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "",
  );
  const [clientAddress, setClientAddress] = useState(defaultAddress);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Line items
  const [items, setItems] = useState<InvoiceLineItem[]>([emptyLineItem()]);

  // Fees / discounts / tax
  const [feeMode, setFeeMode] = useState<"percent" | "custom">("percent");
  const [feePercent, setFeePercent] = useState("0");
  const [feeCustom, setFeeCustom] = useState("");

  const [discountMode, setDiscountMode] = useState<"percent" | "custom">(
    "percent",
  );
  const [discountPercent, setDiscountPercent] = useState("0");
  const [discountCustom, setDiscountCustom] = useState("");

  const [taxMode, setTaxMode] = useState<"percent" | "custom">("percent");
  const [taxPercent, setTaxPercent] = useState("0");
  const [taxCustom, setTaxCustom] = useState("");

  // Computed totals
  const subtotalCents = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = parseInt(item.quantity) || 0;
      const price = parseCents(item.unitPrice);
      return sum + qty * (price ?? 0);
    }, 0);
  }, [items]);

  const feeCents = useMemo(() => {
    if (feeMode === "custom") return parseCents(feeCustom) ?? 0;
    const pct = parseFloat(feePercent) || 0;
    return Math.round((subtotalCents * pct) / 100);
  }, [feeMode, feePercent, feeCustom, subtotalCents]);

  const discountCents = useMemo(() => {
    if (discountMode === "custom") return parseCents(discountCustom) ?? 0;
    const pct = parseFloat(discountPercent) || 0;
    return Math.round((subtotalCents * pct) / 100);
  }, [discountMode, discountPercent, discountCustom, subtotalCents]);

  const taxableCents = subtotalCents + feeCents - discountCents;

  const taxCents = useMemo(() => {
    if (taxMode === "custom") return parseCents(taxCustom) ?? 0;
    const pct = parseFloat(taxPercent) || 0;
    return Math.round((taxableCents * pct) / 100);
  }, [taxMode, taxPercent, taxCustom, taxableCents]);

  const totalCents = subtotalCents + feeCents - discountCents + taxCents;

  // Line item handlers
  function addLineItem() {
    setItems((prev) => [...prev, emptyLineItem()]);
  }

  function removeLineItem(id: string) {
    setItems((prev) =>
      prev.length === 1 ? prev : prev.filter((i) => i.id !== id),
    );
  }

  function updateLineItem(
    id: string,
    field: keyof InvoiceLineItem,
    value: string,
  ) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  const createInvoice = useCreateInvoice({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.invoicesForRequest(requestId),
      });
      onSuccess();
    },
    onError: (err) => {
      setError(err.message || "Failed to create invoice");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }
    if (!clientName.trim()) {
      setError("Please enter a client name");
      return;
    }

    const validItems = items.filter(
      (item) => item.description.trim() && parseCents(item.unitPrice) !== null,
    );

    if (validItems.length === 0) {
      setError(
        "Please add at least one line item with a description and price",
      );
      return;
    }

    createInvoice.mutate({
      requestId,
      params: {
        email: email.trim(),
        client_name: clientName.trim(),
        client_address: clientAddress.trim() || undefined,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        due_date: dueDate || undefined,
        processing_fee_percent:
          feeMode === "percent" ? parseFloat(feePercent) || 0 : 0,
        processing_fee_amount:
          feeMode === "custom" ? (parseCents(feeCustom) ?? 0) : undefined,
        discount_percent:
          discountMode === "percent" ? parseFloat(discountPercent) || 0 : 0,
        discount_amount:
          discountMode === "custom"
            ? (parseCents(discountCustom) ?? 0)
            : undefined,
        tax_percent: taxMode === "percent" ? parseFloat(taxPercent) || 0 : 0,
        tax_amount:
          taxMode === "custom" ? (parseCents(taxCustom) ?? 0) : undefined,
        items: validItems.map((item) => ({
          description: item.description.trim(),
          quantity: parseInt(item.quantity) || 1,
          unit_price: parseCents(item.unitPrice) ?? 0,
        })),
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-6">
      {/* Recipient Info */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Recipient</p>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="inv-email">Email</FieldLabel>
            <Input
              id="inv-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@email.com"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="inv-client-name">Client Name</FieldLabel>
            <Input
              id="inv-client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="John Doe"
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="inv-client-address">Client Address</FieldLabel>
          <Input
            id="inv-client-address"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            placeholder="123 Main St, City, State, 12345"
          />
        </Field>
      </div>

      <Separator />

      {/* Line Items Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Line Items</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLineItem}
          >
            <PlusIcon className="mr-1 size-3.5" />
            Add Item
          </Button>
        </div>

        <div className="rounded-md border">
          <div className="text-muted-foreground bg-muted/50 grid grid-cols-[1fr_64px_100px_100px_32px] gap-2 border-b px-3 py-2 text-xs font-medium">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit Price</span>
            <span className="text-right">Amount</span>
            <span />
          </div>

          {items.map((item) => {
            const qty = parseInt(item.quantity) || 0;
            const price = parseCents(item.unitPrice) ?? 0;
            const lineAmount = qty * price;

            return (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_64px_100px_100px_32px] items-center gap-2 border-b px-3 py-2 last:border-b-0"
              >
                <Input
                  value={item.description}
                  onChange={(e) =>
                    updateLineItem(item.id, "description", e.target.value)
                  }
                  placeholder="Service or item"
                  className="h-8 text-sm"
                />
                <Input
                  value={item.quantity}
                  onChange={(e) =>
                    updateLineItem(item.id, "quantity", e.target.value)
                  }
                  type="number"
                  min="1"
                  className="h-8 text-right text-sm"
                />
                <AmountInput
                  value={item.unitPrice}
                  onChange={(v) => updateLineItem(item.id, "unitPrice", v)}
                  className="h-8 text-sm"
                />
                <span className="text-right text-sm font-medium tabular-nums">
                  {formatCentsToDollarsString(lineAmount)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeLineItem(item.id)}
                  disabled={items.length === 1}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Fees, Discounts, Tax */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Adjustments</p>

        <AdjustmentRow
          label="Processing Fee"
          mode={feeMode}
          onModeChange={setFeeMode}
          percentValue={feePercent}
          onPercentChange={setFeePercent}
          customValue={feeCustom}
          onCustomChange={setFeeCustom}
          computedCents={feeCents}
        />

        <AdjustmentRow
          label="Discount"
          mode={discountMode}
          onModeChange={setDiscountMode}
          percentValue={discountPercent}
          onPercentChange={setDiscountPercent}
          customValue={discountCustom}
          onCustomChange={setDiscountCustom}
          computedCents={discountCents}
          isNegative
        />

        <AdjustmentRow
          label="Sales Tax"
          mode={taxMode}
          onModeChange={setTaxMode}
          percentValue={taxPercent}
          onPercentChange={setTaxPercent}
          customValue={taxCustom}
          onCustomChange={setTaxCustom}
          computedCents={taxCents}
        />
      </div>

      <Separator />

      {/* Totals Summary */}
      <div className="bg-muted/50 rounded-md p-3 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums">
            {formatCentsToDollarsString(subtotalCents)}
          </span>
        </div>
        {feeCents > 0 && (
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Processing Fee</span>
            <span className="tabular-nums">
              +{formatCentsToDollarsString(feeCents)}
            </span>
          </div>
        )}
        {discountCents > 0 && (
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-green-600 tabular-nums">
              -{formatCentsToDollarsString(discountCents)}
            </span>
          </div>
        )}
        {taxCents > 0 && (
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Tax</span>
            <span className="tabular-nums">
              +{formatCentsToDollarsString(taxCents)}
            </span>
          </div>
        )}
        <Separator className="my-1" />
        <div className="flex justify-between py-1 text-base font-semibold">
          <span>Total</span>
          <span className="tabular-nums">
            {formatCentsToDollarsString(totalCents)}
          </span>
        </div>
      </div>

      {/* Description, Notes, Due Date */}
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="inv-description">
            Description (optional)
          </FieldLabel>
          <Textarea
            id="inv-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Final balance for moving service"
            rows={2}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="inv-notes">Notes (optional)</FieldLabel>
          <Textarea
            id="inv-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={2}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="inv-due-date">Due Date</FieldLabel>
        <Input
          id="inv-due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
        <p className="text-muted-foreground mt-1 text-xs">
          Defaults to 7 days from today if not set.
        </p>
      </Field>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        type="submit"
        disabled={createInvoice.isPending || totalCents <= 0}
        className="w-full"
      >
        {createInvoice.isPending ? "Sending..." : "Create & Send Invoice"}
      </Button>
    </form>
  );
}

// ─── Adjustment Row ──────────────────────────────────────────────

function AdjustmentRow({
  label,
  mode,
  onModeChange,
  percentValue,
  onPercentChange,
  customValue,
  onCustomChange,
  computedCents,
  isNegative,
}: {
  label: string;
  mode: "percent" | "custom";
  onModeChange: (mode: "percent" | "custom") => void;
  percentValue: string;
  onPercentChange: (value: string) => void;
  customValue: string;
  onCustomChange: (value: string) => void;
  computedCents: number;
  isNegative?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground w-28 shrink-0 text-sm">
        {label}
      </span>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant={mode === "percent" ? "default" : "outline"}
          size="xs"
          onClick={() => onModeChange("percent")}
        >
          %
        </Button>
        <Button
          type="button"
          variant={mode === "custom" ? "default" : "outline"}
          size="xs"
          onClick={() => onModeChange("custom")}
        >
          $
        </Button>
      </div>

      {mode === "percent" ? (
        <div className="flex items-center gap-1.5">
          <Input
            value={percentValue}
            onChange={(e) => onPercentChange(e.target.value)}
            type="number"
            min="0"
            max="100"
            step="0.5"
            className="h-8 w-20 text-right text-sm"
          />
          <span className="text-muted-foreground text-sm">%</span>
        </div>
      ) : (
        <AmountInput
          value={customValue}
          onChange={onCustomChange}
          className="h-8 w-28 text-sm"
        />
      )}

      <span
        className={`ml-auto text-sm font-medium tabular-nums ${isNegative && computedCents > 0 ? "text-green-600" : ""}`}
      >
        {isNegative && computedCents > 0 ? "-" : ""}
        {formatCentsToDollarsString(computedCents)}
      </span>
    </div>
  );
}
