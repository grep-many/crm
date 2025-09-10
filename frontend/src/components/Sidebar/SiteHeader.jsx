import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "../../hooks/useTheme";
import { useLocation } from "react-router-dom";

export function SiteHeader() {

  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [header, setHeader] = useState("CMR");

  const HeaderText =()=>{
    switch (true) {
    case location.pathname.startsWith("/dashboard"):
      setHeader("Dashboard");
      break;
    case location.pathname.startsWith("/customers"):
      setHeader("Customers");
      break;
    default:
      setHeader("CRM");
    }
  };

  useEffect(() => {
    HeaderText();
  }, [location.pathname]);



  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{header}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="secondary"
            className="cursor-pointer"
            onClick={() => toggleTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "dark" ? <IconSun className="!size-5" /> : <IconMoon className="!size-5" />}
          </Button>

        </div>
      </div>
    </header>
  );
}