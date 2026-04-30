import { AmountInput } from "@/components/inputs/amount-input";
import { Field, FieldLabel } from "@/components/ui/field";

interface AmountFieldProps extends React.ComponentProps<typeof AmountInput> {
  amount: string;
  setAmount: (v: string) => void;
}

export function AmountField({ amount, setAmount, ...props }: AmountFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor="pay-amount">Amount</FieldLabel>
      <AmountInput
        id="pay-amount"
        value={amount}
        onChange={(value) => setAmount(value)}
        {...props}
      />
    </Field>
  );
}
