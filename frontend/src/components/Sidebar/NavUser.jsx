import {IconLogout} from "@tabler/icons-react";
import { Avatar, AvatarFallback} from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function NavUser({ user }) {

  const { logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser(); // call your hook's logout
    toast("Logged out successfully"); // you can replace with Sonner toast if installed
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg grayscale border">
            <AvatarFallback className="rounded-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user.email}
            </span>
          </div>
          <div
            className="p-3 border rounded-2xl border-red-600 hover:bg-red-500"
            onClick={() => handleLogout()}
          >
            <IconLogout className="ml-auto size-4 text-red-600 " />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
