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
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { requestKeys } from "@/domains/requests/request.keys";
import { useCloneRequest } from "@/domains/requests/request.mutations";
import { useRequest } from "@/hooks/use-request";
import { queryClient } from "@/lib/query-client";
import {
  BookCopyIcon,
  ClipboardPenLine,
  MailsIcon,
  PrinterIcon,
  TriangleAlertIcon,
  UserRoundIcon,
} from "@/components/icons";
import { useSearchParams } from "react-router";
import { SendEmailDialog } from "./dialogs/send-email-dialog";
import { openRequest } from "@/stores/use-open-requests-store";

export function ActionIcons() {
  const [, setSearchParams] = useSearchParams();

  const { request } = useRequest();

  const { mutate: cloneRequestMutation, isPending } = useCloneRequest({
    onSettled: (data, error) => {
      if (error) {
        queryClient.cancelQueries({ queryKey: requestKeys.lists() });
      }
      if (data) {
        queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: requestKeys.statusCounts(),
        });
        openRequest(data.id);
      }
    },
  });
  function handleClickContract(id: number | undefined) {
    if (!id) return;
    openCenteredPopup(`/crm/requests/${id}/contract`, "_blank", 600, 850);
  }

  function handleClickPdf(id: number | undefined) {
    if (!id) return;
    openCenteredPopup(`/crm/requests/${id}/pdf`, "_blank", 900, 900);
  }

  function handleClickClone(id: number | undefined) {
    if (!id) return;
    cloneRequestMutation({ id });
  }

  // if (!request) return null;

  return (
    <div className="space-x-4">
      <SendEmailDialog />

      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="bg-background text-muted-foreground size-11 rounded-full shadow-md"
              onClick={() => {
                setSearchParams((prev) => {
                  prev.set("send_email", "true");
                  return prev;
                });
              }}
            >
              <MailsIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Emails</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              asChild
              size="icon"
              variant="outline"
              className="bg-background text-muted-foreground size-11 rounded-full shadow-md"
            >
              <a href={`/account/requests/${request?.id}`} target="_blank">
                <UserRoundIcon />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Client page</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <CloneRequest
        requestId={request?.id}
        handleClickClone={handleClickClone}
        isPending={isPending}
      />

      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="bg-background text-muted-foreground size-11 rounded-full shadow-md"
              onClick={() => {
                if (request?.id) {
                  handleClickPdf(request.id);
                }
              }}
            >
              <PrinterIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>View PDF</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {request?.status === "confirmed" && (
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="bg-background text-muted-foreground size-11 rounded-full shadow-md"
                onClick={() => {
                  if (request?.id) {
                    handleClickContract(request.id);
                  }
                }}
              >
                <ClipboardPenLine />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Contract</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

function CloneRequest({
  requestId,
  handleClickClone,
  isPending,
}: {
  requestId?: number;
  handleClickClone: (requestId: number) => void;
  isPending: boolean;
}) {
  return (
    <AlertDialog>
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="bg-background text-muted-foreground size-11 rounded-full shadow-md"
              >
                <BookCopyIcon />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Clone request</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-500">
            <TriangleAlertIcon />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-yellow-500">
            Warning
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to clone this request?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (requestId) {
                handleClickClone(requestId);
              }
            }}
            disabled={isPending}
          >
            <LoadingSwap isLoading={isPending}>Confirm</LoadingSwap>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function openCenteredPopup(
  url: string,
  title: string,
  width: number,
  height: number,
): void {
  // Get the screen position and size
  const screenLeft = window.screenLeft ?? window.screenX;
  const screenTop = window.screenTop ?? window.screenY;

  const screenWidth =
    window.innerWidth || document.documentElement.clientWidth || screen.width;
  const screenHeight =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    screen.height;

  // Calculate the centered position
  const left = screenLeft + (screenWidth - width) / 2;
  const top = screenTop + (screenHeight - height) / 2;

  // Create the features string for the popup
  const features = `width=${width},height=${height},top=${top},left=${left},noopener,noreferrer`;

  // Open the popup window
  window.open(url, title, features);
}
