import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useRequest } from "@/hooks/use-request";
import { cn } from "@/lib/utils";
import {
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  MailIcon,
  XIcon,
} from "@/components/icons";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import type { EmailTemplate, Folder } from "@/types/index";
import { useFolders } from "@/hooks/api/use-folders";
import {
  useEmailTemplates,
  useSendEmails,
} from "@/hooks/api/use-email-templates";

export function SendEmailDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [selectedTemplates, setSelectedTemplates] = useState<EmailTemplate[]>(
    []
  );

  const { request } = useRequest();
  const { data: folders } = useFolders();
  const { data: emailTemplates } = useEmailTemplates();

  const { mutate: sendEmailsMutation, isPending: isSending } = useSendEmails({
    onSuccess: () => {
      toast.success("Emails queued for delivery");
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send emails");
    },
  });

  // Group templates by folder
  const templatesByFolder = useMemo(() => {
    if (!emailTemplates || !folders) return new Map<number, EmailTemplate[]>();
    const map = new Map<number, EmailTemplate[]>();
    for (const folder of folders) {
      const folderTemplates = emailTemplates
        .filter((t) => t.folder_id === folder.id)
        .sort((a, b) => a.position - b.position);
      if (folderTemplates.length > 0) {
        map.set(folder.id, folderTemplates);
      }
    }
    return map;
  }, [emailTemplates, folders]);

  // Open dialog when search param is set and pre-populate customer emails
  useEffect(() => {
    if (searchParams.get("send_email") === "true") {
      setIsOpen(true);

      const customer = request?.customer;
      if (customer) {
        const customerEmails: string[] = [];
        if (customer.email_address) {
          customerEmails.push(customer.email_address);
        }
        if (customer.additional_email) {
          customerEmails.push(customer.additional_email);
        }
        setEmails(customerEmails);
      }
    }
  }, [searchParams, request?.customer]);

  function handleClose() {
    setIsOpen(false);
    setEmails([]);
    setEmailInput("");
    setSelectedTemplates([]);
    setSearchParams((prev) => {
      prev.delete("send_email");
      return prev;
    });
  }

  // Email input handling
  function handleEmailKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail();
    }
    if (e.key === "Backspace" && emailInput === "" && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  }

  function addEmail() {
    const trimmed = emailInput.trim().replace(/,+$/, "");
    if (trimmed && isValidEmail(trimmed) && !emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed]);
      setEmailInput("");
    }
  }

  function removeEmail(email: string) {
    setEmails((prev) => prev.filter((e) => e !== email));
  }

  // Template selection
  const toggleTemplate = useCallback((template: EmailTemplate) => {
    setSelectedTemplates((prev) => {
      const exists = prev.find((t) => t.id === template.id);
      if (exists) {
        return prev.filter((t) => t.id !== template.id);
      }
      return [...prev, template];
    });
  }, []);

  function removeTemplate(templateId: number) {
    setSelectedTemplates((prev) => prev.filter((t) => t.id !== templateId));
  }

  const isTemplateSelected = useCallback(
    (templateId: number) => selectedTemplates.some((t) => t.id === templateId),
    [selectedTemplates]
  );

  function handleSend() {
    if (!request?.id) return;

    sendEmailsMutation({
      recipients: emails,
      template_ids: selectedTemplates.map((t) => t.id),
      request_id: request.id,
    });
  }

  const canSend =
    emails.length > 0 && selectedTemplates.length > 0 && !isSending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="grid max-h-[90vh] min-h-[70vh] grid-rows-[auto_auto_1fr_auto] gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>Request #{request?.id}</DialogDescription>
        </DialogHeader>

        {/* Email addresses input */}
        <div className="border-b px-6 pb-4">
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Recipients
          </label>
          <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input px-2.5 py-1.5 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
            {emails.map((email) => (
              <Badge
                key={email}
                variant="secondary"
                className="gap-1 pr-1 text-xs"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeEmail(email)}
                  className="rounded-full text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
            <Input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              onBlur={addEmail}
              placeholder={
                emails.length === 0 ? "Enter email addresses..." : ""
              }
              className="h-auto min-w-[120px] flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
        {/* 
        <div className="min-h-0">
          <div className="grid h-full grid-cols-5 gap-0">
            <div className="min-h-0 border-r">
              <ScrollArea className="h-full">
                <div className="p-2">
                  {folders
                    ?.filter((f) => templatesByFolder.has(f.id))
                    .map((folder) => (
                      <FolderSection
                        key={folder.id}
                        folder={folder}
                        templates={templatesByFolder.get(folder.id) ?? []}
                        isTemplateSelected={isTemplateSelected}
                        onToggleTemplate={toggleTemplate}
                      />
                    ))}
                  {(!folders || templatesByFolder.size === 0) && (
                    <p className="text-muted-foreground px-2 py-8 text-center text-sm">
                      No templates available.
                    </p>
                  )}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>

            <div className="min-h-0">
              <ScrollArea className="h-full">
                <div className="space-y-2 p-4"></div>
              </ScrollArea>
            </div>
          </div>
        </div> */}

        {/* Main content: folder browser + selected templates */}
        <div className="min-h-0">
          <div className="grid h-full grid-cols-5">
            {/* Left: Folder browser */}
            <div className="col-span-2 min-h-0 border-r">
              <div className="flex items-center gap-2 border-b px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <FolderIcon className="size-3.5" />
                Templates
              </div>
              <ScrollArea className="h-[calc(100%-33px)] *:data-[slot=scroll-area-viewport]:[&>div]:block!">
                <div className="p-2">
                  {folders
                    ?.filter((f) => templatesByFolder.has(f.id))
                    .map((folder) => (
                      <FolderSection
                        key={folder.id}
                        folder={folder}
                        templates={templatesByFolder.get(folder.id) ?? []}
                        isTemplateSelected={isTemplateSelected}
                        onToggleTemplate={toggleTemplate}
                      />
                    ))}
                  {(!folders || templatesByFolder.size === 0) && (
                    <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                      No templates available.
                    </p>
                  )}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>

            {/* Right: Selected templates */}
            <div className="col-span-3 min-h-0">
              <div className="flex items-center gap-2 border-b px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <MailIcon className="size-3.5" />
                Selected ({selectedTemplates.length})
              </div>
              <ScrollArea className="h-[calc(100%-33px)]">
                {selectedTemplates.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FileTextIcon />
                      </EmptyMedia>
                      <EmptyDescription>
                        Click on templates to add them here.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <div className="divide-y">
                    {selectedTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="group flex items-center justify-between px-4 py-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {template.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {template.subject}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeTemplate(template.id)}
                          className="ml-2 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                        >
                          <XIcon />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSend} disabled={!canSend}>
            <MailIcon />
            <LoadingSwap isLoading={isSending}>Send Email</LoadingSwap>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Sub-components ---

function FolderSection({
  folder,
  templates,
  isTemplateSelected,
  onToggleTemplate,
}: {
  folder: Folder;
  templates: EmailTemplate[];
  isTemplateSelected: (id: number) => boolean;
  onToggleTemplate: (template: EmailTemplate) => void;
}) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted">
        <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
        {/* <FolderIcon className="text-muted-foreground size-4" /> */}
        <FolderIcon className="size-4 shrink-0 text-muted-foreground [[data-state=open]>&]:hidden" />
        <FolderOpenIcon className="size-4 shrink-0 text-muted-foreground [[data-state=closed]>&]:hidden" />
        <span className="flex-1 truncate text-left">{folder.name}</span>
        <Badge variant="secondary" className="text-[10px]">
          {templates.length}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 border-l pl-2">
          {templates.map((template) => {
            const selected = isTemplateSelected(template.id);
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onToggleTemplate(template)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                  selected && "bg-primary/10 text-primary"
                )}
              >
                <FileTextIcon className="size-3.5 shrink-0" />
                <span className="truncate">{template.name}</span>
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
