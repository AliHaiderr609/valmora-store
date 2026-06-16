import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE } from "@/lib/constants";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Store information and environment.</p>
      </header>

      <Card>
        <CardHeader><CardTitle>Store info</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Row label="Store name" value={SITE.name} />
            <Row label="Email" value={SITE.email} />
            <Row label="Phone" value={SITE.phone} />
            <Row label="Address" value={SITE.address} />
            <Row label="Currency" value={process.env.NEXT_PUBLIC_CURRENCY ?? "PKR"} />
            <Row label="App URL" value={process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"} />
          </dl>
          <p className="mt-6 rounded-md border bg-secondary/30 p-3 text-xs text-muted-foreground">
            Update these values in <code>src/lib/constants.ts</code> and your <code>.env</code> file.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
