import { LogoutButton } from "@/components/logout-button"
import { ModeToggle } from "@/components/mode-toggle"
import { PageContainer, PageContent } from "@/components/page-component"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/api/use-settings"
// import { useEffect, useRef } from "react";
import { Link, Outlet } from "react-router"

export function AccountLayout() {
  // const containerRef = useRef<HTMLDivElement>(null);
  // const { pathname } = useLocation();

  const { data: settings } = useSettings()

  // useEffect(() => {
  //   containerRef.current?.scrollTo({
  //     top: 0,
  //     behavior: "instant",
  //   });
  // }, [pathname]);

  return (
    <PageContainer
      className="min-h-screen overflow-y-scroll bg-muted dark:bg-background"
      classNameInner="pb-0 h-screen flex flex-col max-w-5xl"
      // ref={containerRef}
    >
      {/* Header */}
      <header className="shrink-0 border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="h-full">
              <Link to="/">
                {settings?.company_logo_url && (
                  <img
                    src={settings?.company_logo_url ?? null}
                    alt="Company logo"
                    className="h-full object-contain"
                  />
                )}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/account">Abut</Link>
              </Button>
              <LogoutButton variant="destructive" />
            </div>
          </div>
        </div>
      </header>
      {/* Main */}
      <PageContent className="flex-1 py-6">
        <Outlet />
      </PageContent>
      {/* Footer */}
      <footer className="flex h-16 w-full shrink-0 items-center border-t px-4">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div>
            <p>Copyright 2025</p>
          </div>
          <ModeToggle />
        </div>
      </footer>
    </PageContainer>
  )
}
