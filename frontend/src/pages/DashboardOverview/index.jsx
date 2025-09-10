import { useEffect } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { useLeads } from "@/hooks/useLeads";
import DashboardCards from "./DashboardCards";
import DashboardChart from "./DashboardCharts";

const DashboardOverview = () => {
  const { list: customers, fetchAll: fetchCustomers } = useCustomers();
  const { leads, fetchAll: fetchLeads } = useLeads(); // ✅ use updated hook return

  // Fetch data on mount only
  useEffect(() => {
    fetchCustomers();
    fetchLeads(); // ✅ global fetch (no customerId)
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardCards customers={customers} leads={leads} />
      <DashboardChart customers={customers} leads={leads} />
    </div>
  );
};

export default DashboardOverview;
