"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export function RevenueChart({
  data,
}: {
  data: { day: string; total: number; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue · last 30 days</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d49829" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#d49829" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="day" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(value: number) => formatPrice(value)}
              labelClassName="font-semibold"
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#d49829"
              strokeWidth={2}
              fill="url(#rev)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
