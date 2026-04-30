import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";

import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useSearchParams } from "react-router";
import { FolderForm } from "./folder-form";
import { FoldersList } from "./folder-list";
import { useFolders } from "@/hooks/api/use-folders";
import type { Folder } from "@/types/index";

export function FoldersEditSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data: folders, isLoading } = useFolders({
    enabled: !!isOpen,
  });

  const [items, setItems] = useState<Folder[]>([]);

  useEffect(() => {
    const editParam = searchParams.get("edit_folders");
    if (editParam) {
      setIsOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (folders) {
      setItems(folders);
    }
  }, [folders]);

  function handleCancel() {
    if (folders) {
      setItems(folders);
    }
    setIsOpen(false);
    setSearchParams((prev) => {
      prev.delete("edit_folders");
      return prev;
    });
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleCancel}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Folder management</SheetTitle>
          <SheetDescription className="sr-only" />
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <FolderForm />
          <Separator />

          {/* Loading state */}
          {isLoading && (
            <div className="flex h-96 items-center justify-center">
              <Spinner />
            </div>
          )}

          <FoldersList items={items} setItems={setItems} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
