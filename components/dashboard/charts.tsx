"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui";
import { formatUSD } from "@/lib/currency";
import { SALE_CHANNEL_LABELS, CHANNEL_CHART_ORDER } from "@/lib/constants";

const FINANCIAL_COLORS = ["#22c55e", "#86efac", "#f472b6", "#3b82f6"];
const CHANNEL_COLORS = ["#14b8a6", "#3b82f6", "#f97316", "#8b5cf6", "#a1a1aa"];

export function FinancialSummaryChart({
  totalCost,
  potentialProfit,
  realizedProfit,
  totalRevenue,
}: {
  totalCost: number;
  potentialProfit: number;
  realizedProfit: number;
  totalRevenue: number;
}) {
  const data = [
    { name: "Capital invertido", value: totalCost },
    { name: "Ganancia potencial", value: Math.max(potentialProfit, 0) },
    { name: "Ganancia realizada", value: Math.max(realizedProfit, 0) },
    { name: "Total facturación", value: totalRevenue },
  ];

  return (
    <Card>
      <h2 className="text-base font-semibold text-white md:text-lg">
        Resumen financiero
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr] md:items-center">
        <div className="mx-auto h-44 w-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={FINANCIAL_COLORS[i % FINANCIAL_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatUSD(Number(value ?? 0))}
                contentStyle={{
                  background: "#161616",
                  border: "1px solid #262626",
                  borderRadius: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 text-zinc-300">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: FINANCIAL_COLORS[i] }}
                />
                {item.name}
              </div>
              <div className="font-medium text-white">{formatUSD(item.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function ChannelSalesChart({
  channelCounts,
  total,
}: {
  channelCounts: Record<string, number>;
  total: number;
}) {
  const data = CHANNEL_CHART_ORDER.map((key) => ({
    key,
    name: SALE_CHANNEL_LABELS[key],
    value: channelCounts[key] || 0,
  }));

  const colored = data.filter((d) => d.value > 0);

  return (
    <Card>
      <h2 className="text-base font-semibold text-white md:text-lg">
        Ventas por canal (30 días)
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr] md:items-center">
        <div className="mx-auto h-44 w-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={colored}
                dataKey="value"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                stroke="none"
              >
                {colored.map((item) => {
                  const i = CHANNEL_CHART_ORDER.indexOf(item.key);
                  return (
                    <Cell
                      key={item.key}
                      fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]}
                    />
                  );
                })}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#161616",
                  border: "1px solid #262626",
                  borderRadius: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {data.map((item, i) => {
            const pct = total ? Math.round((item.value / total) * 100) : 0;
            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-2 text-zinc-300">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: CHANNEL_COLORS[i] }}
                  />
                  {item.name}
                </div>
                <div className="text-zinc-400">
                  {item.value} ventas ({pct}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
