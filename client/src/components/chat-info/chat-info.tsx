import { cn } from "@/lib/utils";
import type { Status } from "@/domains/requests/request.types";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { STATUS_BG_COLOR } from "@/domains/requests/request.constants";

function ChatInfo({
  className,
  size = "default",
  onClick = undefined,
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="chat-info"
      data-active="false"
      data-size={size}
      className={cn(
        "flex w-full min-w-0 items-center gap-3 rounded-lg p-2.5 text-left transition-colors",
        "data-[active=true]:bg-muted",
        { "hover:bg-muted/60 hover:cursor-pointer": onClick },
        className,
      )}
      onClick={onClick}
      {...props}
    />
  );
}
function ChatInfoAvatar({
  size = "default",
  status,
  initials,
}: {
  size?: "default" | "sm" | "lg";
  status?: Status;
  initials: string;
}) {
  return (
    <Avatar data-size={size}>
      <AvatarFallback
        className={cn(
          // "bg-foreground text-background",
          status && STATUS_BG_COLOR[status],
          status && "text-white",
        )}
      >
        {initials.toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function ChatInfoHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-info-header"
      className={cn(
        "group/chat-info-header @container/chat-info-header grid auto-rows-min items-start rounded-t-xl group-data-[size=sm]/chat-info:px-4 has-data-[slot=chat-info-action]:grid-cols-[1fr_auto] has-data-[slot=chat-info-description]:grid-rows-[auto_auto] [.border-b]:pb-6 group-data-[size=sm]/chat-info:[.border-b]:pb-4",
        className,
      )}
      {...props}
    />
  );
}

function ChatInfoTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-info-title"
      className={cn(
        "truncate text-sm leading-normal font-medium group-data-[size=sm]/chat-info:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function ChatInfoDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-info-description"
      className={cn("text-muted-foreground truncate text-xs", className)}
      {...props}
    />
  );
}

function ChatInfoAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-info-action"
      className={cn(
        "text-muted-foreground col-start-2 row-span-2 row-start-1 shrink-0 self-start justify-self-end text-[11px]",
        className,
      )}
      {...props}
    />
  );
}

function ChatInfoContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-info-content"
      className={cn("flex-1", className)}
      {...props}
    />
  );
}

export {
  ChatInfo,
  ChatInfoAvatar,
  ChatInfoHeader,
  ChatInfoTitle,
  ChatInfoDescription,
  ChatInfoAction,
  ChatInfoContent,
};
