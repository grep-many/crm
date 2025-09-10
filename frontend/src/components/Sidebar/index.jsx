import {
  Icon24Hours,
  IconDashboard,
  IconListDetails,
} from "@tabler/icons-react";

// import { NavDocuments } from "./components/nav-documents";
import { NavMain } from "./NavMain";
// import { NavSecondary } from "./components/nav-secondary";
import { NavUser } from "./NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const navMain= [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "Customers", url: "/customers", icon: IconListDetails },
];

export function AppSidebar(props) {

  const {user}=useAuth();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#" aria-disabled>
                <Icon24Hours className="!size-5" />
                <span className="text-base font-semibold">CRM Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
