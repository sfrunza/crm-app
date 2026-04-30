import { MinimizedRequestsBar } from "@/components/minimized-requests-bar";
import { ModeToggle } from "@/components/mode-toggle";
import { RequestOverlay } from "@/components/request-overlay";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import { AppSidebar } from "./_components/app-sidebar";
import { CreateRequestButton } from "./_components/create-request-button";
import { GlobalSearch } from "./_components/global-search";
import { MessageNotifications } from "./_components/message-notifications";

export function CrmLayout() {
  const sidebarState = document.cookie.includes("sidebar_state=true");
  return (
    <SidebarProvider defaultOpen={sidebarState}>
      <AppSidebar />
      <CrmMain />
    </SidebarProvider>
  );
}

function CrmMain() {
  return (
    <SidebarInset className="relative h-screen overflow-hidden">
      <header className="bg-background flex h-16 w-full items-center border-b px-4">
        <div className="mx-auto flex w-full max-w-7xl justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2" />
            <CreateRequestButton />
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-2">
            <MessageNotifications />
            <ModeToggle />
          </div>
        </div>
      </header>
      <div className="h-[calc(100svh-4rem)] overflow-y-scroll">
        <Outlet />
        <RequestOverlay />
        <MinimizedRequestsBar />
      </div>
    </SidebarInset>
  );
}
