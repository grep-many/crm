import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCustomers } from "@/hooks/useCustomers";
import GenericModal from "@/components/CommonForm/GenericModal";
import DeleteCustomerModal from "@/components/modals/DeleteCustomerModal";
import { customerControls } from "./constants";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { LucideMoreHorizontal } from "lucide-react";
import { validateCustomer } from "@/lib/validateCustomer";
import { Badge } from "@/components/ui/badge";

// ✅ Column factory so we can hide Owner for non-admins
export const getCustomerColumns = (isAdmin) => [
  {
    id: "drag",
    header: "",
    cell: () => (
      <Button 
        variant="ghost" 
        size="icon" 
        className="cursor-grab hover:cursor-grab active:cursor-grabbing" 
        tabIndex={0} 
        aria-label="Drag row"
        style={{ cursor: 'grab' }}
      >
        ⋮
        <span className="sr-only">Drag row</span>
      </Button>
    ),
  },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "company", header: "Company" },
  {
    id: "leadsCount",
    header: "Leads",
    cell: ({ row }) => {
      const count = row.original.leadsCount ?? 0;
      return <Badge variant={count > 0 ? "secondary" : "outline"}>{count}</Badge>;
    }
  },
  ...(isAdmin ? [{
    id: "owner",
    header: "Owner",
    cell: ({ row }) => {
      const customer = row.original;
      const owner = customer.ownerId;
      const ownerName = typeof owner === 'object' ? owner.name : undefined;
      const ownerEmail = typeof owner === 'object' ? owner.email : undefined;
      return <span className="text-sm text-muted-foreground">{ownerName || "-"}{ownerEmail ? ` (${ownerEmail})` : ''}</span>;
    }
  }] : []),
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const customer = row.original;
      const { update, remove } = useCustomers(); // get update/remove hooks
      const navigate = useNavigate();
      const handleViewLeads = () => navigate(`/customers/${customer._id || customer.id}`);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="border border-transparent hover:scale-110 hover:shadow-md transition-transform duration-200 cursor-pointer"
            >
              <LucideMoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <GenericModal
                title="Edit Customer"
                triggerElement={<button className="cursor-pointer w-full text-left px-2 py-1.5 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground">Edit</button>}
                formControls={customerControls}
                formData={{
                  name: customer.name || "",
                  email: customer.email || "",
                  phone: customer.phone || "",
                  company: customer.company || "",
                }}
                validate={validateCustomer}
                successMessage="Customer updated successfully!"
                onSubmit={(data) => update({ id: customer._id || customer.id, customerData: data })}
              />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewLeads} className="cursor-pointer">View Leads</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
              <DeleteCustomerModal
                customerId={customer._id || customer.id}
                triggerElement={<button className="cursor-pointer w-full text-left px-2 py-1.5 rounded-sm text-sm hover:bg-destructive/10 hover:text-destructive text-destructive">Delete</button>}
                onConfirm={() => remove({ id: customer._id || customer.id })}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// ✅ Default export for the page component
export default function CustomerTablePage({ socket }) {
  const { list: customers } = useCustomers(socket);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="lg:px-4 ">
      <DataTable
        columns={getCustomerColumns(isAdmin)}
        data={customers}
        searchKeys={["name", "email", "phone", "company", ...(isAdmin ? ["ownerId.name", "ownerId.email"] : [])]}
        searchAccessor={(row) => {
          const ownerName = typeof row.ownerId === 'object' ? row.ownerId?.name : '';
          const ownerEmail = typeof row.ownerId === 'object' ? row.ownerId?.email : '';
          const actionHints = isAdmin ? 'edit delete view leads' : 'edit delete view leads';
          return [row.name, row.email, row.phone, row.company, ownerName, ownerEmail, actionHints]
            .filter(Boolean)
            .join(' ');
        }}
        searchOptions={customers.map((c) => c.name)}
        pageSizeOptions={[10, 20, 50]}
        rowClassName="group hover:bg-primary/20 data-[selected=true]:bg-primary/30 transition-colors"
      />
    </div>
  );
}
