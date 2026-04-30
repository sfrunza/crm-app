import {
  ArrowLeftRightIcon,
  LayoutGridIcon,
  MessageCircleMoreIcon,
  SettingsIcon,
  TruckIcon,
} from "@/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const items = [
  {
    title: "Requests",
    url: "requests",
    icon: LayoutGridIcon,
  },
  {
    title: "Dispatch",
    url: "dispatch",
    icon: TruckIcon,
  },
  {
    title: "Settings",
    url: "settings",
    icon: SettingsIcon,
  },
  {
    title: "Messages",
    url: "messages",
    icon: MessageCircleMoreIcon,
  },
  {
    title: "Transactions",
    url: "transactions",
    icon: ArrowLeftRightIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
