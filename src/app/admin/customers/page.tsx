import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Customers</h1>
        <p className="text-sm text-muted-foreground">{customers.length} customers</p>
      </header>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name ?? "—"}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone ?? "—"}</TableCell>
                <TableCell>{c._count.orders}</TableCell>
                <TableCell>{formatDate(c.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={c.isBlocked ? "destructive" : "success"}>
                    {c.isBlocked ? "Blocked" : "Active"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No customers yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
