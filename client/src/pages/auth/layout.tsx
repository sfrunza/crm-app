import { ModeToggle } from "@/components/mode-toggle";
import { useSettings } from "@/hooks/api/use-settings";
import { Outlet } from "react-router";

export function AuthLayout() {
  const { data: settings } = useSettings();
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <div className="relative isolate flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-muted p-6 md:p-10 dark:bg-background">
        <svg
          aria-hidden="true"
          className="absolute inset-0 -z-10 size-full mask-[radial-gradient(56rem_56rem_at_center,white,transparent)] stroke-foreground/10"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
              width={200}
              height={200}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <rect
            fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)"
            width="100%"
            height="100%"
            strokeWidth={0}
          />
        </svg>
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col items-center gap-2 self-center font-medium">
            <div className="h-16">
              {settings?.company_logo_url && (
                <img
                  src={settings?.company_logo_url ?? null}
                  alt="Company logo"
                  className="h-full object-contain"
                />
              )}
            </div>
            <div className="h-8">
              <h1 className="text-2xl font-bold">
                {settings?.company_name ?? ""}
              </h1>
            </div>
          </div>
          <Outlet />
          <div className="text-center text-xs text-balance text-muted-foreground">
            By using this site, you agree to our{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
