import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { FileUpload } from "@/components/request/file-upload";
import { ImageGallery } from "@/components/request/image-gallery";
import { useRequest } from "@/hooks/use-request";

export function PhotosCard() {
  const { request } = useRequest();

  if (!request) return null;

  const canEdit = request?.can_edit_request;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add photos</CardTitle>
        <CardDescription>Drag and drop or browse</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          {/* Upload Section */}
          <FileUpload requestId={request.id} disabled={!canEdit} />
        </div>
        <ImageGallery
          images={request.image_urls ?? []}
          requestId={request.id}
        />
      </CardContent>
    </Card>
  );
}
