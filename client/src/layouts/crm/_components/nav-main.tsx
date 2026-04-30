import { NavLink, useLocation, useNavigate } from "react-router";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type NavMainProps = {
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }[];
};

export function NavMain({ items }: NavMainProps) {
  const { setOpenMobile, isMobile } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname.split("/").pop();

  function handleClick(url: string) {
    if (isMobile) {
      setOpenMobile(false);
    }
    navigate(url, { replace: true });
  }
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={isActive}
                asChild
              >
                <NavLink to={item.url} onClick={() => handleClick(item.url)}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
