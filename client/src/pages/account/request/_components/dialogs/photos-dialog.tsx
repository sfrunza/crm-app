import { FileUpload } from '@/components/request/file-upload';
import { ImageGallery } from '@/components/request/image-gallery';
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useRequest } from '@/hooks/use-request';
import { CameraIcon, CheckCircleIcon } from '@/components/icons';
import { useState } from 'react';

export function PhotosDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { request } = useRequest();

  if (!request) return null;

  const hasPhotos = request.image_urls ? request.image_urls.length > 0 : false;

  function onCancel() {
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={hasPhotos ? 'default' : 'outline'}
          className="h-16 w-full gap-6"
        >
          {hasPhotos ? (
            <CheckCircleIcon className="size-6" />
          ) : (
            <CameraIcon className="size-6" />
          )}
          <span className="flex flex-col items-start">
            {hasPhotos ? 'View or add photos' : 'Add photos'}
            <span className="text-sm font-normal">Optional</span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="px-0 sm:max-w-lg">
        <DialogHeader className="px-6">
          <DialogTitle>Add photos</DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="px-6">
            <div className="mb-8">
              {/* Upload Section */}
              <FileUpload requestId={request.id} />
            </div>
            <ImageGallery
              images={request.image_urls ?? []}
              requestId={request.id}
            />
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <DialogFooter className="px-6">
          <DialogClose asChild>
            <Button variant="outline" type="button" onClick={onCancel}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
