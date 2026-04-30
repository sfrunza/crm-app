import { Button } from "@/components/ui/button";
import { formatPhone } from "@/lib/format-phone";
import {
  ChevronDownIcon,
  MailIcon,
  PhoneIcon,
  TriangleAlertIcon,
  XIcon,
} from "@/components/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRequest } from "@/hooks/use-request";
import { useOpenRequestsStore } from "@/stores/use-open-requests-store";

export function RequestHeader() {
  const [open, setOpen] = useState(false);

  const { request, isDirty, clear } = useRequest();

  const minimizeRequest = useOpenRequestsStore((s) => s.minimize);
  const closeRequest = useOpenRequestsStore((s) => s.close);

  if (!request) return null;

  function handleClose() {
    closeRequest(request!.id);
    clear();
  }

  function CloseButton() {
    if (!isDirty) {
      return (
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <XIcon />
        </Button>
      );
    }

    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <XIcon />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-500">
              <TriangleAlertIcon />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-yellow-500">
              Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              Request was not saved. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  function MinimizeButton() {
    return (
      <Button variant="ghost" size="icon" onClick={minimizeRequest}>
        <ChevronDownIcon />
      </Button>
    );
  }

  return (
    <div className="flex flex-row justify-between p-4 sm:items-center">
      <div className="flex max-sm:flex-col sm:items-center sm:justify-center sm:gap-6">
        <h1 className="text-xl leading-normal font-bold group-data-[size=sm]/card:text-sm">
          {request.customer
            ? `${request.customer.first_name} ${request.customer.last_name}`
            : "No customer"}
        </h1>
        <Button variant="ghost" asChild className="justify-start">
          <a href={`tel:${request.customer?.phone}`}>
            <PhoneIcon />
            {request.customer?.phone
              ? formatPhone(request.customer.phone)
              : "No phone number"}
          </a>
        </Button>
        <Button variant="ghost" asChild className="justify-start">
          <a href={`mailto:${request.customer?.email_address}`}>
            <MailIcon />
            {request.customer?.email_address
              ? request.customer.email_address
              : "No email address"}
          </a>
        </Button>
      </div>
      <div className="space-x-0.5">
        <MinimizeButton />
        <CloseButton />
      </div>
    </div>
  );
}
