import {
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page-component";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hexToRgb } from "@/lib/helpers";
import { MoreHorizontalIcon } from "@/components/icons";
import { Fragment } from "react";
import { useSearchParams } from "react-router";
import { RateFormSheet } from "./rate-form-sheet";
import { useRates } from "@/hooks/api/use-rates";
import type { Rate } from "@/types/index";

function RatesPage() {
  const { data: rates, isLoading, error } = useRates();

  return (
    <Fragment>
      {/* Actions based on search params */}
      <RateFormSheet />

      <PageHeader className="border-b">
        <PageTitle>Rates</PageTitle>
      </PageHeader>

      <PageContent>
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center px-4 py-28">
            <Spinner />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center justify-center px-4 py-28">
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        )}
        <Table className="overflow-x-hidden overflow-y-hidden">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>2 movers</TableHead>
              <TableHead>3 movers</TableHead>
              <TableHead>4 movers</TableHead>
              <TableHead>Extra mover</TableHead>
              <TableHead>Extra truck</TableHead>
              <TableHead></TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates?.map((rate) => (
              <TableRow key={rate.id} className="h-14">
                <TableCell>
                  <span
                    className="flex w-32 items-center gap-2 rounded-sm px-3 py-1 font-medium"
                    style={{
                      color: rate.color,
                      backgroundColor: `rgba(${hexToRgb(rate.color)}, 0.1)`,
                    }}
                  >
                    {rate.name}
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: rate.color,
                      }}
                    ></span>
                  </span>
                </TableCell>
                {Object.keys(rate.movers_rates)
                  .slice(0, 3)
                  .map((mover, i) => {
                    const hRate = rate.movers_rates[mover].hourly_rate;
                    return (
                      <TableCell key={i}>${(hRate / 100).toFixed(2)}</TableCell>
                    );
                  })}

                <TableCell>
                  ${(rate.extra_mover_rate / 100).toFixed(2)}
                </TableCell>
                <TableCell>
                  ${(rate.extra_truck_rate / 100).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Switch checked={rate.active} />
                </TableCell>

                <TableCell className="text-right">
                  <Actions rate={rate} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageContent>
    </Fragment>
  );
}

export const Component = RatesPage;

function Actions({ rate }: { rate: Rate }) {
  const [_, setSearchParams] = useSearchParams();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-7">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setSearchParams({
                edit: rate.id.toString(),
              });
            }}
          >
            Edit rate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
