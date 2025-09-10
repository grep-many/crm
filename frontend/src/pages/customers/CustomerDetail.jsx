import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import GenericModal from "@/components/CommonForm/GenericModal";
import DeleteLeadModal from "@/components/modals/DeleteLeadModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCustomers } from "@/hooks/useCustomers";
import { useLeads } from "@/hooks/useLeads";
import { LucideMoreHorizontal } from "lucide-react";
import { validateLead } from "@/lib/validateLead";
import { toast } from "sonner";

const leadFormControls = [
  { name: "title", label: "Title", type: "text", placeholder: "Enter title", componentType: "input" },
  { name: "description", label: "Description", type: "text", placeholder: "Enter description", componentType: "textarea" },
  {
    name: "status",
    label: "Status",
    componentType: "select",
    options: [
      { id: "New", label: "New" },
      { id: "Contacted", label: "Contacted" },
      { id: "Converted", label: "Converted" },
      { id: "Lost", label: "Lost" },
    ],
  },
  { name: "value", label: "Value", type: "number", placeholder: "0", componentType: "input" },
];

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { list: customers, fetchAll: fetchCustomers } = useCustomers();
  const { leads, fetchAll, create, update, remove, loading } = useLeads(id);
  const location = useLocation();

  const [statusFilter, setStatusFilter] = useState("");
  const [leadFormData, setLeadFormData] = useState({ title: "", description: "", status: "New", value: 0 });

  useEffect(() => {
    if (!customers || customers.length === 0) {
      fetchCustomers();
    }
  }, [customers, fetchCustomers]);

  useEffect(() => {
    const status = statusFilter === "all" ? "" : statusFilter;
    fetchAll(status ? { status } : {});
  }, [fetchAll, statusFilter]);

  // default filter from path: e.g., /customers/:id?status=New
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status) setStatusFilter(status);
  }, [location.search]);

  const customer = useMemo(() => customers.find((c) => c._id === id || c.id === id), [customers, id]);

  // Fallback: if customer deleted or not found, navigate back and notify
  useEffect(() => {
    // Only run after customers have been fetched at least once
    if (customers && customers.length >= 0) {
      const exists = customers.some((c) => (c._id === id || c.id === id));
      if (!exists) {
        toast.warning("Customer not found (possibly deleted). Redirecting...");
        navigate("/customers", { replace: true });
      }
    }
  }, [customers, id, navigate]);

  const columns = useMemo(
    () => [
      { accessorKey: "title", header: "Title" },
      { accessorKey: "description", header: "Description" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "value", header: "Value" },
      { accessorKey: "createdAt", header: "Created", cell: ({ row }) => new Date(row.original.createdAt).toLocaleString() },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">⋮</Button> */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="border border-transparent hover:scale-110 hover:shadow-md transition-transform duration-200"
                >
                  <LucideMoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <GenericModal
                    title="Edit Lead"
                    triggerElement={<button className="cursor-pointer w-full text-left px-2 py-1.5 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground">Edit</button>}
                    formControls={leadFormControls}
                    formData={lead}
                    validate={validateLead}
                    successMessage="Lead updated successfully!"
                    onSubmit={(data) => {
                      const payload = {
                        title: data.title,
                        description: data.description,
                        status: data.status,
                        value: Number(data.value ?? 0),
                      };
                      update(lead._id || lead.id, payload);
                    }}
                  />
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <DeleteLeadModal
                    customerId={id}
                    lead={lead}
                    triggerElement={<button className="cursor-pointer w-full text-left px-2 py-1.5 rounded-sm text-sm hover:bg-destructive/10 hover:text-destructive text-destructive">Delete</button>}
                    onConfirm={() => remove(lead._id || lead.id)}
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [update, remove]
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Customer Details</h2>
          <p className="text-sm text-muted-foreground">{customer ? `${customer.name} · ${customer.email}` : "Loading customer..."}</p>
        </div>
        <Button className="cursor-pointer" variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-sm">Filter by status</span>
            <Select value={statusFilter || undefined} onValueChange={(v) => setStatusFilter(v || "")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <GenericModal
            title="Add Lead"
            triggerElement={<Button className="cursor-pointer">Add Lead</Button>}
            formControls={leadFormControls}
            formData={leadFormData}
            setFormData={setLeadFormData}
            validate={validateLead}
            successMessage="Lead created successfully!"
            onSubmit={(data) => {
              create(data);
              setLeadFormData({ title: "", description: "", status: "New", value: 0 });
            }}
          />
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            data={leads || []}
            pageSizeOptions={[10, 20, 50]}
            defaultPageSize={10}
            searchKeys={["title", "description", "status", "value", "createdAt"]}
            searchAccessor={(row) => [
              row.title,
              row.description,
              row.status,
              row.value,
              row.createdAt ? new Date(row.createdAt).toLocaleString() : "",
              "edit delete"
            ].filter(Boolean).join(" ")}
            searchOptions={(leads || []).map((l) => l.title)}
          />
        </div>
        {loading && <div className="text-sm text-muted-foreground mt-2">Loading...</div>}
      </Card>
    </div>
  );
}


