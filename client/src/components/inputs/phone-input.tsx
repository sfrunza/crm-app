import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { COUNTRY, AsYouType } from "@/lib/format-phone";

function PhoneInput({
  className,
  type,
  handleValueChange,
  ...props
}: React.ComponentProps<"input"> & {
  handleValueChange: (value: string) => void;
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = new AsYouType(COUNTRY).input(inputValue);
    const formattedValue = formatted.replace(/[\s\-\(\)]/g, ""); //replace all spaces and dashes and parentheses
    handleValueChange(formattedValue);
  };

  return (
    <Input
      {...props}
      type="tel"
      autoComplete="off"
      inputMode="numeric"
      title="Please enter your phone number"
      className={className}
      onChange={handleChange}
      maxLength={14}
    />
  );
}

export { PhoneInput };
