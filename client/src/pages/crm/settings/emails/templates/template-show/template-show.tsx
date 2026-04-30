import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeftIcon, SendIcon } from "@/components/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  EmailEditor,
  type EditorRef,
  type EmailEditorProps,
} from "react-email-editor";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { TemplateForm } from "./template-form";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  useCreateEmailTemplate,
  useEmailTemplates,
  useUpdateEmailTemplate,
} from "@/hooks/api/use-email-templates";

const templateFormSchema = z.object({
  name: z.string(),
  subject: z.string(),
  folder_id: z.string(),
  event_key: z.string(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

type UnlayerExportHtml = {
  design: Record<string, any>; // Unlayer design JSON
  html: string;
};

export function TemplateShow() {
  const emailEditorRef = useRef<EditorRef>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const folderId = searchParams.get("folder_id") ?? "1";
  const createTemplate = searchParams.get("create_template") ?? false;
  const templateId = searchParams.get("edit_template_id") ?? null;
  const [isOpen, setIsOpen] = useState(false);

  const { data: emailTemplates } = useEmailTemplates({
    enabled: !!templateId,
  });

  const emailTemplate = emailTemplates?.find(
    (emailTemplate) => emailTemplate.id === Number(templateId)
  );

  useEffect(() => {
    if (templateId) {
      setIsOpen(true);
    } else if (createTemplate) {
      setIsOpen(true);
    }
  }, [templateId, createTemplate]);

  const { mutate: createEmailTemplate, isPending: isCreating } =
    useCreateEmailTemplate({
      onSuccess: () => {
        toast.success("Template created");
      },
    });

  const { mutate: updateEmailTemplate, isPending: isUpdating } =
    useUpdateEmailTemplate({
      onSuccess: () => {
        toast.success("Template updated");
      },
    });

  const form = useForm<TemplateFormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(templateFormSchema),
    values: {
      name: emailTemplate?.name ?? "",
      subject: emailTemplate?.subject ?? "",
      folder_id: emailTemplate?.folder_id.toString() ?? folderId?.toString(),
      event_key: emailTemplate?.event_key ?? "",
    },
  });

  const exportHtml = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data: UnlayerExportHtml) => {
      const { design, html } = data;

      console.log("design", design);
      console.log("html", html);
      console.log("name", form.getValues("name"));
      console.log("subject", form.getValues("subject"));
      console.log("folder_id", form.getValues("folder_id"));
      console.log("event_key", form.getValues("event_key"));

      if (createTemplate) {
        createEmailTemplate({
          html,
          design,
          name: form.getValues("name"),
          subject: form.getValues("subject"),
          folder_id: Number(form.getValues("folder_id")),
          event_key: form.getValues("event_key"),
        });
      }
      if (templateId && emailTemplate) {
        updateEmailTemplate({
          id: emailTemplate.id,
          data: {
            html,
            design,
            name: form.getValues("name"),
            subject: form.getValues("subject"),
            folder_id: Number(form.getValues("folder_id")),
            event_key: form.getValues("event_key"),
          },
        });
      }
    });
  };

  const onReady: EmailEditorProps["onReady"] = useCallback(
    (unlayer: any) => {
      console.log("template", emailTemplate);

      if (emailTemplate) {
        unlayer.loadDesign(emailTemplate.design);
      }
      // editor is ready
      // you can load your template here;
      // the design json can be obtained by calling
      // unlayer.loadDesign(callback) or unlayer.exportHtml(callback)
      // const templateJson = { DESIGN JSON GOES HERE };
      // unlayer.loadDesign(templateJson);
    },
    [emailTemplate]
  );

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex min-h-screen flex-col overflow-y-auto">
      <div className="grid h-full flex-1 lg:grid-cols-[16rem_1fr]">
        {/* SideBar */}
        <div className="hidden bg-background lg:block lg:border-r">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                className="size-10 rounded-full"
                onClick={() => {
                  setSearchParams((prev) => {
                    prev.delete("edit_template_id");
                    prev.delete("create_template");
                    return prev;
                  });
                  setIsOpen(false);
                }}
              >
                <ChevronLeftIcon className="size-6" />
              </Button>
              <p className="text-sm font-semibold">Template Settings</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-4">
            <TemplateForm form={form} folderId={folderId} />
          </div>
        </div>

        {/* Editor */}
        <div className="bg-muted dark:bg-background">
          <div className="overflow-y-auto">
            <div className="flex h-16 items-center px-4">
              <div className="flex grow justify-end gap-3">
                <Button variant="outline" disabled={true}>
                  <SendIcon />
                  Send Test Email
                </Button>
                <Button
                  onClick={exportHtml}
                  disabled={isCreating || isUpdating}
                >
                  <LoadingSwap isLoading={isCreating || isUpdating}>
                    Save
                  </LoadingSwap>
                </Button>
              </div>
            </div>

            <div className="flex-1">
              <EmailEditor
                ref={emailEditorRef}
                onReady={onReady}
                style={{
                  fontFamily: "var(--font-sans)",
                  minHeight: "calc(100vh - 4rem)",
                }}
                options={{
                  version: "latest",
                  features: {
                    sendTestEmail: true,
                    colorPicker: {
                      colors: [
                        {
                          id: "brand_colors",
                          label: "Brand Colors",
                          colors: ["#2563ef", "#f54900", "#90a1b9", "#020618"],
                        },
                      ],
                    },
                  },
                  displayMode: "email",
                  fonts: {
                    showDefaultFonts: false,
                    customFonts: [],
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
