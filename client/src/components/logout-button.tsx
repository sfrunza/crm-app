import { Button, buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import { LoadingSwap } from './ui/loading-swap';

export function LogoutButton({
  className,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const { logout, isPendingLogout } = useAuth();

  return (
    <Button
      onClick={() => logout()}
      disabled={isPendingLogout}
      className={cn(className)}
      {...props}
    >
      <LoadingSwap isLoading={isPendingLogout}>Log out</LoadingSwap>
    </Button>
  );
}
