import { useSelector } from "react-redux";
import { IconUser, IconUsers, IconTrendingUp, IconCrown } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardCards({ customers = [] }) {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  // --- Admin: total stats ---
  const totalCustomers = customers.length;
  const totalLeads = customers.reduce((sum, c) => sum + (c.leadsCount || 0), 0);
  const avgLeads = totalCustomers > 0 ? (totalLeads / totalCustomers).toFixed(1) : 0;

  // --- Admin: top owner aggregation ---
  const ownerStats = customers.reduce((map, c) => {
    if (!c.ownerId) return map;

    let ownerId, name, email;
    if (typeof c.ownerId === "object") {
      ownerId = c.ownerId._id;
      name = c.ownerId.name;
      email = c.ownerId.email;
    } else {
      ownerId = c.ownerId;
      name = ownerId;
      email = "";
    }

    if (!map[ownerId]) map[ownerId] = { name, email, leads: 0 };
    map[ownerId].leads += c.leadsCount || 0;
    return map;
  }, {});

  const topOwner = Object.values(ownerStats).sort((a, b) => b.leads - a.leads)[0] || null;

  // --- Non-admin: filter only my customers ---
  const myCustomers = customers.filter((c) => {
    if (!c.ownerId) return false;
    if (typeof c.ownerId === "object") return c.ownerId._id === user?._id;
    return c.ownerId === user?._id;
  });

  const myLeads = myCustomers.reduce((sum, c) => sum + (c.leadsCount || 0), 0);

  // --- Config-driven cards ---
  const cards = [
    {
      title: "Total Customers",
      value: totalCustomers,
      change: `${totalCustomers} active`,
      icon: IconUsers,
      footerTitle: "Customer Accounts",
      footerDesc: "Total in system",
    },
    {
      title: "Total Leads",
      value: totalLeads,
      change: `${totalLeads} leads`,
      icon: IconUser,
      footerTitle: "Leads Overview",
      footerDesc: "Sum across all customers",
    },
    {
      title: "Avg Leads / Customer",
      value: avgLeads,
      change: `${avgLeads} avg`,
      icon: IconTrendingUp,
      footerTitle: "Engagement Ratio",
      footerDesc: "Pipeline density",
    },
    isAdmin
      ? {
        title: "Top Owner",
        value: topOwner ? (
          <div className="flex flex-col">
            <span className="text-base font-semibold">{topOwner.name || "Unnamed"}</span>
            <span className="text-sm text-muted-foreground">{topOwner.email || "No email"}</span>
          </div>
        ) : (
          "—"
        ),
        change: topOwner ? `${topOwner.leads} total leads` : "No data",
        icon: IconCrown,
        footerTitle: "Best Performer",
        footerDesc: "Sum of leads across all their customers",
      }
      : {
        title: "My Engagement",
        value: (
          <div className="flex flex-col">
            <span className="text-base font-semibold">{user?.name || "Me"}</span>
            <span className="text-sm text-muted-foreground">{user?.email || "—"}</span>
          </div>
        ),
        change: `${myLeads} total leads`,
        icon: IconTrendingUp,
        footerTitle: "My Customers",
        footerDesc: `${totalCustomers} customer${totalCustomers > 1 ? "s" : ""}, avg ${totalLeads/totalCustomers} leads/customer`,
      },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 2xl:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Card key={i}>
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{card.value}</CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <Icon className="size-4 mr-1" />
                  {card.change}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="flex gap-2 font-medium line-clamp-1">
                {card.footerTitle} <Icon className="size-4" />
              </div>
              <div className="text-muted-foreground">{card.footerDesc}</div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
