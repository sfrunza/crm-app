import { CheckCircleIcon, ClipboardListIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRequest } from '@/hooks/use-request';
import { Link } from 'react-router';
import { MoveSizeDialog } from './dialogs/move-size-dialog';

export function MoveSizeCard() {
  const { request } = useRequest();

  if (!request) return null;

  const moveSize = request.move_size_snapshot;
  const canEdit = request.can_edit_request;
  const requestId = request.id;
  const hasClientInventory = (request?.request_rooms ?? []).some(
    (room) => (room.request_items?.length ?? 0) > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{moveSize?.name ?? 'No move size'}</CardTitle>
        <CardDescription>
          {request.totals.items} items · {request.totals.boxes} boxes ·{' '}
          {request.totals.volume} cu ft
        </CardDescription>
        <CardAction>
          {canEdit && (
            <MoveSizeDialog requestId={requestId} moveSize={moveSize} />
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="aspect-video w-1/2">
            {moveSize?.image_url && (
              <img
                src={moveSize.image_url}
                alt="Move size image"
                className="w-full rounded-lg object-contain"
              />
            )}
          </div>
        </div>
        <div className="mx-auto max-w-xs space-y-2">
          {/* Inventory Dialog */}
          <Button
            variant={hasClientInventory ? 'default' : 'outline'}
            className="h-16 w-full gap-6"
            asChild
          >
            <Link to={`/account/requests/${requestId}/inventory`}>
              {hasClientInventory ? (
                <CheckCircleIcon className="size-6" />
              ) : (
                <ClipboardListIcon className="size-6" />
              )}
              <span className="flex flex-col items-start">
                {hasClientInventory
                  ? 'View or edit inventory'
                  : 'Edit inventory'}
                <span className="text-sm font-normal">Optional</span>
              </span>
            </Link>
          </Button>
          {/* <Button variant="outline" className="h-16 w-full gap-6" asChild>
            <Link to={`/account/requests/${requestId}/inventory`}>
              <ClipboardListIcon className="size-6" />
              <span className="text-primary flex flex-col items-start">
                Edit inventory
                <span className="text-muted-foreground text-sm font-normal">
                  Optional
                </span>
              </span>
            </Link>
          </Button> */}

          {/* Details Dialog */}
          {/* <DetailsDialog /> */}

          {/* Photos Dialog */}
          {/* <PhotosDialog /> */}
        </div>
      </CardContent>
    </Card>
  );
}
