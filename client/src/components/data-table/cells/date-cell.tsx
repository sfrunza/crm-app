import { memo } from "react";
import { TABLE_CONFIG } from "../table.config";
import { formatDate, parseDateOnly, differenceInDays } from "@/lib/format-date";

interface DateCellProps {
  date: string | null;
  showRelative?: boolean;
}

export const DateCell = memo(
  ({ date, showRelative = false }: DateCellProps) => {
    if (!date) return null;

    if (!showRelative) {
      return <span>{formatDate(date, TABLE_CONFIG.DATE_FORMAT)}</span>;
    }

    const diffDays = differenceInDays(parseDateOnly(date)!, formatDate(new Date()));

    let value = "";
    if (diffDays >= 0) {
      switch (diffDays) {
        case 0:
          value = "today";
          break;
        case 1:
          value = "tomorrow";
          break;
        default:
          value = `in ${diffDays} days`;
      }
    }

    return (
      <span>
        {formatDate(date, TABLE_CONFIG.DATE_FORMAT)}
        <br />
        <span className={diffDays === 0 ? "text-red-500" : "text-green-600"}>
          {value}
        </span>
      </span>
    );
  },
);
