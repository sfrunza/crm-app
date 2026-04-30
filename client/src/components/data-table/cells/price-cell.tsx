import { TABLE_CONFIG } from "../table.config";
import { memo } from "react";

interface PriceCellProps {
  price: {
    min: number;
    max: number;
  };
}

export const PriceCell = memo(({ price }: PriceCellProps) => {
  const formatter = new Intl.NumberFormat(
    "en-US",
    TABLE_CONFIG.CURRENCY_FORMAT,
  );

  const formattedMin = formatter.format(price.min / 100);
  const formattedMax = formatter.format(price.max / 100);

  return (
    <span>
      {formattedMin} - {formattedMax}
    </span>
  );
});
