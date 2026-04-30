import {
  PageAction,
  PageContent,
  PageHeader,
} from "@/components/page-component";

import { Button } from "@/components/ui/button";
import { PlusIcon, SettingsIcon } from "@/components/icons";
import { useSearchParams } from "react-router";
import { FolderTabs } from "./folders/folder-tabs";
import { FoldersEditSheet } from "./folders/folders-edit-sheet";

import { Fragment, useEffect, useMemo, useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { DeleteTemplateDialog } from "./templates/delete-template-dialog";
import { TemplatesTable } from "./templates/templates-table";
import { TemplateShow } from "./templates/template-show/template-show";
import { TemplatePreview } from "./templates/template-preview/template-preview";
import {
  useEmailTemplates,
  useUpdateEmailTemplate,
} from "@/hooks/api/use-email-templates";
import { useFolders } from "@/hooks/api/use-folders";
import type { EmailTemplate } from "@/types/index";

function EmailsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const folderId = searchParams.get("folder_id");

  const {
    data: emailTemplates,
    isLoading: isLoadingEmailTemplates,
    error: errorEmailTemplates,
  } = useEmailTemplates();
  const { data: folders } = useFolders();

  const defaultFolderId = useMemo(() => {
    return folders?.find((folder) => folder.is_default)?.id;
  }, [folders]);

  useEffect(() => {
    if (!folderId) {
      setSearchParams((prev) => {
        prev.set("folder_id", defaultFolderId?.toString() ?? "");
        return prev;
      });
    }
  }, [folderId, defaultFolderId, setSearchParams]);

  // Filter and sort templates for the current folder
  const filteredEmailTemplates = useMemo(
    () =>
      emailTemplates
        ?.filter((t) => t.folder_id === Number(folderId))
        .sort((a, b) => a.position - b.position) ?? [],
    [emailTemplates, folderId]
  );

  // Local state for optimistic drag-and-drop reordering within the current folder
  const [items, setItems] = useState<EmailTemplate[]>([]);

  // Sync local items when server data changes or folder switches
  useEffect(() => {
    setItems(filteredEmailTemplates);
  }, [filteredEmailTemplates]);

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => items.map(({ id }) => id),
    [items]
  );

  const { mutate: updateEmailTemplateMutation } = useUpdateEmailTemplate({
    onError: () => {
      setItems(filteredEmailTemplates);
    },
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = dataIds.indexOf(active.id);
      const newIndex = dataIds.indexOf(over.id);

      // Optimistically reorder the local list
      setItems((prev) => arrayMove(prev, oldIndex, newIndex));

      // Send the new position (within this folder's scope) to the backend
      updateEmailTemplateMutation({
        id: active.id as number,
        data: {
          position: newIndex,
        },
      });
    }
  }

  return (
    <Fragment>
      {/* Actions based on search params */}
      <FoldersEditSheet />
      <DeleteTemplateDialog />
      <TemplateShow />
      <TemplatePreview />

      {/* Folder tabs */}
      <FolderTabs />

      <PageHeader className="border-b">
        <PageAction className="flex flex-row justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchParams((prev) => {
                prev.set("edit_folders", "true");
                return prev;
              });
            }}
          >
            <SettingsIcon />
            Edit folders
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setSearchParams((prev) => {
                prev.set("create_template", "true");
                return prev;
              });
            }}
          >
            <PlusIcon />
            Create template
          </Button>
        </PageAction>
      </PageHeader>

      <PageContent>
        {/* Loading state */}
        {isLoadingEmailTemplates && (
          <div className="flex items-center justify-center px-4 py-28">
            <Spinner />
          </div>
        )}

        {/* Error state */}
        {errorEmailTemplates && (
          <div className="flex items-center justify-center px-4 py-28">
            <p className="text-muted-foreground">
              {errorEmailTemplates.message}
            </p>
          </div>
        )}

        {emailTemplates && (
          <TemplatesTable items={items} handleDragEnd={handleDragEnd} />
        )}
      </PageContent>
    </Fragment>
  );
}

export const Component = EmailsPage;
