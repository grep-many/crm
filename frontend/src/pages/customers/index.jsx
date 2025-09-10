import { useEffect, useState } from "react";
import CustomerTable from "./CustomerTable";
import { useCustomers } from "@/hooks/useCustomers";
import { Button } from "@/components/ui/button";
import GenericModal from "@/components/CommonForm/GenericModal";
import { customerControls } from "./constants";
import { validateCustomer } from "@/lib/validateCustomer";

export default function CustomersPage() {
  const { create, fetchAll } = useCustomers();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", company: "" });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="p-1 md:p-8 m-4 lg:px-4 pt-0 mt-0 ">
      <div className="flex items-center justify-between gap-3 px-8 flex-wrap pb-4">
        <h2 className="text-2xl font-bold">Customer</h2>
        <GenericModal
          title="Add Customer"
          triggerElement={<Button className="cursor-pointer">Add Customer</Button>}
          formControls={customerControls}
          formData={formData}
          setFormData={setFormData}
          successMessage="Customer added successfully!"
          validate={validateCustomer}
          onSubmit={async (data) => {
            await create({ customerData: data });
            setFormData({ name: "", email: "", phone: "", company: "" });
          }}
        />
      </div>
      <CustomerTable />
    </div>
  );
}
