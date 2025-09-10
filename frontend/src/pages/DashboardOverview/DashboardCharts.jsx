import { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function DashboardChart({ customers = [], leads = [] }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState("90d");
  const [chartData, setChartData] = useState([]);

  // ✅ Chart config required by ChartContainer
  const chartConfig = {
    customers: { label: "Customers", color: "var(--primary)" },
    leads: { label: "Leads", color: "var(--secondary)" },
  };

  // Only update timeRange on mount for mobile
  useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  // Build chart data safely
  useEffect(() => {
    const dataMap = {};
    const referenceDate = new Date();
    const daysToSubtract =
      timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90;

    for (let i = 0; i <= daysToSubtract; i++) {
      const d = new Date(referenceDate);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dataMap[key] = { date: key, customers: 0, leads: 0 };
    }

    customers.forEach((c) => {
      if (!c?.createdAt) return;
      const dateKey = new Date(c.createdAt).toISOString().split("T")[0];
      if (dataMap[dateKey]) dataMap[dateKey].customers += 1;
    });

    leads.forEach((l) => {
      if (!l?.createdAt) return;
      const dateKey = new Date(l.createdAt).toISOString().split("T")[0];
      if (dataMap[dateKey]) dataMap[dateKey].leads += 1;
    });

    setChartData(
      Object.values(dataMap).sort((a, b) => new Date(a.date) - new Date(b.date))
    );
  }, [customers, leads, timeRange]);

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>New Customers & Leads</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the selected range
          </span>
          <span className="@[540px]/card:hidden">Selected range</span>
        </CardDescription>
        <CardAction className="flex gap-2">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            variant="outline"
            className="hidden @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
          >
            <SelectTrigger size="sm" className="@[767px]/card:hidden">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig} // ✅ Fix: always provide config
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillCustomers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--secondary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--secondary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              type="natural"
              dataKey="customers"
              stroke="var(--primary)"
              fill="url(#fillCustomers)"
              stackId="a"
            />
            <Area
              type="natural"
              dataKey="leads"
              stroke="var(--secondary)"
              fill="url(#fillLeads)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
