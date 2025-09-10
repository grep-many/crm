import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { connectSocket, disconnectSocket } from "@/api/socket";

import { AppSidebar } from "../components/Sidebar";
import { SiteHeader } from "../components/Sidebar/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function HomeLayout() {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) return;
    const baseUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const s = connectSocket({ baseUrl, token, userId: user._id || user.id });
    if (user?.role === 'admin') {
      s.emit('joinAdmin');
    }
    return () => {
      disconnectSocket();
    };
  }, [user]);

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
