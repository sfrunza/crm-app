import { Button } from '@/components/ui/button';
import { Link, useRouteError } from 'react-router';

type Error = {
  statusText?: string;
  message?: string;
};

export function ErrorPage() {
  const error: unknown = useRouteError();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p className="text-center text-muted-foreground">
        {(error as Error)?.message ||
          (error as { statusText?: string })?.statusText}
      </p>
      <Link to="/">
        <Button variant="outline">Home page</Button>
      </Link>
    </div>
  );
}
