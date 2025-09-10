import { useEffect, useState } from "react";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import GenericModal from "../CommonForm/GenericModal"; // import modal
import { useCustomers } from "@/hooks/useCustomers";
import { validateCustomer } from "@/lib/validateCustomer";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";

export function NavMain({ items, socket }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState("");
  const { create } = useCustomers(socket);
  const [formData, setFormData] = useState({});

  const handleClick = (item) => {
    if (!item || !item.url) return;
    setActive(item.title.toLowerCase());
    navigate(item.url);
  };

  // derive active from current pathname on first mount and whenever it changes
  useEffect(() => {
    const current = items.find((i) => location.pathname.startsWith(i.url));
    if (current) setActive(current.title.toLowerCase());
  }, [location.pathname, items]);

  const customerControls = [
    { name: "name", label: "Name", componentType: "input", type: "text", placeholder: "Enter name" },
    { name: "email", label: "Email", componentType: "input", type: "email", placeholder: "Enter email" },
    { name: "phone", label: "Phone", componentType: "input", type: "text", placeholder: "Enter phone" },
    { name: "company", label: "Company", componentType: "input", type: "text", placeholder: "Enter company" },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            {/* Wrap your existing button as trigger */}
            <GenericModal
              title="Add Customer"
              triggerElement={
                <SidebarMenuButton
                  tooltip="Add Customer"
                  className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                >
                  <IconCirclePlusFilled />
                  <span>Add Customer</span>
                </SidebarMenuButton>
              }
              formControls={customerControls}
              formData={formData}
              setFormData={setFormData}
              successMessage="Customer added successfully!"
              validate={validateCustomer}
              onSubmit={async (data) => {
                await create({ customerData: data, socket });
                setFormData({ name: "", email: "", phone: "", company: "" });
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => handleClick(item)}
                className={`${active === item.title.toLowerCase() ? "bg-accent/60" : ""} cursor-pointer`}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}