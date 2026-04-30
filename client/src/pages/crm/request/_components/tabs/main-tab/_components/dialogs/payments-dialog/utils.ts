export function paymentStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "succeeded":
    case "paid":
      return "default";
    case "pending":
    case "open":
    case "draft":
      return "secondary";
    case "failed":
    case "void":
      return "destructive";
    default:
      return "outline";
  }
}

export function paymentTypeLabel(type: string): string {
  switch (type) {
    case "deposit":
      return "Deposit";
    case "charge":
      return "Card";
    case "invoice_payment":
      return "Invoice";
    case "cash":
      return "Cash";
    case "check":
      return "Check";
    case "other":
      return "Other";
    default:
      return type;
  }
}

export function parseCents(amount: string): number | null {
  const cents = Math.round(parseFloat(amount.replace(/,/g, "")) * 100);
  if (isNaN(cents) || cents <= 0) return null;
  return cents;
}
