import { ArrowUpRight, DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export function StatsCards({
  totalRevenue,
  monthlyRevenue,
  totalOrders,
  totalCustomers,
  totalProducts,
}: {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}) {
  const cards = [
    {
      title: "Total revenue",
      value: formatPrice(totalRevenue),
      hint: `${formatPrice(monthlyRevenue)} last 30 days`,
      Icon: DollarSign,
    },
    {
      title: "Total orders",
      value: totalOrders.toLocaleString(),
      hint: "All time",
      Icon: ShoppingBag,
    },
    {
      title: "Customers",
      value: totalCustomers.toLocaleString(),
      hint: "Registered users",
      Icon: Users,
    },
    {
      title: "Products",
      value: totalProducts.toLocaleString(),
      hint: "Active SKUs",
      Icon: Package,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {c.title}
            </CardTitle>
            <c.Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{c.value}</div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3" /> {c.hint}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
