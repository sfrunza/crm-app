import { DetailsForm } from '@/components/request/details-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LoadingSwap } from '@/components/ui/loading-swap';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { requestKeys } from '@/domains/requests/request.keys';
import { useUpdateRequest } from '@/domains/requests/request.mutations';
import type { Request } from '@/domains/requests/request.types';
import { useRequest } from '@/hooks/use-request';
import { queryClient } from '@/lib/query-client';
import { CheckCircleIcon, InfoIcon } from '@/components/icons';
import { useState } from 'react';
import { toast } from 'sonner';

export function DetailsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { request } = useRequest();

  if (!request) return null;

  const isTouched = request.details.is_touched;
  const canEdit = request.can_edit_request;

  function onSave(details: Request['details']) {
    if (!request || !canEdit) return;

    updateRequestMutation({
      id: request.id,
      data: { details },
    });
  }

  function onCancel() {
    setIsOpen(false);
  }

  const { mutate: updateRequestMutation, isPending: isUpdating } =
    useUpdateRequest(
      {
        onSettled: (_, error) => {
          if (error) {
            toast.error('Failed to save details');
          } else {
            queryClient.invalidateQueries({
              queryKey: requestKeys.detail(request.id),
            });
            toast.success('Details saved');
            onCancel();
          }
        },
      },
      { forceCalculate: true }
    );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isTouched ? 'default' : 'outline'}
          className="h-16 w-full gap-6 rounded-xl"
        >
          {isTouched ? (
            <CheckCircleIcon className="size-6" />
          ) : (
            <InfoIcon className="size-6" />
          )}
          <span className="flex flex-col items-start">
            {isTouched ? 'View or modify details' : 'Add details'}
            <span className="text-sm font-normal">Optional</span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="px-0 sm:max-w-lg">
        <DialogHeader className="px-6">
          <DialogTitle>Additional questions</DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="px-6">
            <DetailsForm
              formId="details-form"
              details={request.details}
              onSave={onSave}
              disabled={!canEdit}
            />
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <DialogFooter className="px-6">
          <DialogClose asChild>
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="details-form"
            disabled={isUpdating || !canEdit}
          >
            <LoadingSwap isLoading={isUpdating}>Save</LoadingSwap>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
