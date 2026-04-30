import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatPhone } from "@/lib/format-phone";
import { UserRoundIcon } from "@/components/icons";
import { EditProfileDialog } from "./edit-profile-dialog";
import { useAuthStore } from "@/stores/auth-store";
import { useUser } from "@/hooks/api/use-users";

export function CustomerCard() {
  const { user: sessionUser } = useAuthStore();
  const { data: user } = useUser(sessionUser?.id!, {
    enabled: !!sessionUser?.id,
  });
  return (
    <div className="@container">
      <div className="flex flex-col items-start gap-4 px-4 @sm:flex-row @sm:items-center">
        <Avatar className="size-18">
          <AvatarFallback className="bg-foreground/5 dark:bg-muted">
            <UserRoundIcon className="size-9" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div className="flex h-8 items-center gap-4">
            <p className="font-bold">
              {user?.first_name} {user?.last_name}
            </p>
            {user && <EditProfileDialog />}
          </div>
          <div className="space-y-1">
            <p className="h-4 text-sm text-muted-foreground">
              {user?.email_address}
            </p>
            <p className="h-4 text-sm text-muted-foreground">
              {formatPhone(user?.phone)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
