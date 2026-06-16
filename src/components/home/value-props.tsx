import { Headphones, ShieldCheck, Truck, Undo2 } from "lucide-react";

import { SHIPPING } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

const PROPS = [
  { icon: Truck, title: "Free shipping", desc: `On orders over ${formatPrice(SHIPPING.freeOver)}` },
  { icon: Undo2, title: "30-day returns", desc: "Easy & hassle-free" },
  { icon: ShieldCheck, title: "Secure checkout", desc: "Encrypted payments" },
  { icon: Headphones, title: "24/7 support", desc: "We're here to help" },
];

export function ValueProps() {
  return (
    <section className="border-y bg-secondary/30">
      <div className="container-x grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        {PROPS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3">
            <div className="rounded-full bg-background p-2.5 shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
