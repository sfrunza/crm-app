import { FileUpload } from "@/components/request/file-upload";
import { ImageGallery } from "@/components/request/image-gallery";
import { useRequest } from "@/hooks/use-request";
// import { FileUpload } from "./file-upload";
// import { ImageGallery } from "./image-gallery";

export function PhotosTab() {
  const { request } = useRequest();
  if (!request) return null;

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        {/* Upload Section */}
        <FileUpload requestId={request.id} />
      </div>
      <ImageGallery images={request.image_urls ?? []} requestId={request.id} />
    </div>
  );
}
