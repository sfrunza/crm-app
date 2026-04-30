import { memo } from "react";
import type { Address } from "@/domains/requests/request.types";

interface AddressCellProps {
  address: Pick<Address, "city" | "state" | "zip">;
}

export const AddressCell = memo(({ address }: AddressCellProps) => {
  return (
    <span>
      {address.city}
      <br />
      {address.state} {address.zip}
    </span>
  );
});
