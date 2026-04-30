import { cn } from "@/lib/utils";
import { OpenGoogleMapsButton } from "./open-google-maps-button";
import { MapIcon } from "@/components/icons";

function AddressBox({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

function AddressBoxHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid auto-rows-min items-start", className)}
      {...props}
    />
  );
}

function AddressBoxTitle({
  title,
  origin,
  destination,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  origin?: string;
  destination?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <OpenGoogleMapsButton
        origin={origin}
        destination={destination}
        disabled={!origin || !destination}
      >
        <MapIcon />
      </OpenGoogleMapsButton>

      <p className="text-muted-foreground text-sm font-medium">{title}</p>
    </div>
  );
}

function AddressBoxAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function AddressBoxContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("", className)} {...props} />;
}

function AddressBoxFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center rounded-b-xl px-6 [.border-t]:pt-6",
        className,
      )}
      {...props}
    />
  );
}

export {
  AddressBox,
  AddressBoxHeader,
  AddressBoxTitle,
  AddressBoxAction,
  AddressBoxContent,
  AddressBoxFooter,
};
