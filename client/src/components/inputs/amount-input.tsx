import * as React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface AmountInputProps extends Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "onChange"
> {
  symbol?: string;
  value?: string;
  onChange?: (value: string) => void;
  locale?: string;
}

function AmountInput({
  className,
  symbol = "$",
  value = "",
  onChange,
  locale = "en-US",
  ...props
}: AmountInputProps) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Format the number with commas and decimals
  const formatNumber = (num: string) => {
    if (!num) return "";

    // Remove all non-digit and non-decimal characters
    const cleaned = num.replace(/[^\d.]/g, "");

    // Split into integer and decimal parts
    const parts = cleaned.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Add commas to integer part
    const withCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Limit decimal to 2 places
    if (decimalPart !== undefined) {
      return `${withCommas}.${decimalPart.slice(0, 2)}`;
    }

    return withCommas;
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatNumber(rawValue);
    setDisplayValue(formatted);

    // Pass back the raw numeric value (without commas)
    const numericValue = formatted.replace(/,/g, "");
    onChange?.(numericValue);
  };

  // Update display value when prop value changes
  React.useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  return (
    <InputGroup className={className}>
      <InputGroupAddon>{symbol}</InputGroupAddon>
      <InputGroupInput
        placeholder="0.00"
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    </InputGroup>
  );
}

export { AmountInput };
