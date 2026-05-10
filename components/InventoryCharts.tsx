"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  Legend
} from "recharts";
import type { InventorySku, UsageHistoryPoint } from "@/lib/types";

const STATUS_COLOR = {
  healthy: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444"
} as const;

const PIE_PALETTE = [
  "#72BC44",
  "#8FD158",
  "#4a8f2c",
  "#d4a843",
  "#ef4444",
  "#6b7280",
  "#94a3b8",
  "#cbd5e1"
];

function ChartCard({
  title,
  subtitle,
  right,
  children,
  height = 280
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <div className="panel-elev p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight">{title}</h3>
          {subtitle ? (
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {right}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--panel-elev)",
  border: "1px solid var(--border-strong)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--text)",
  padding: "8px 10px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
} as const;

export function DaysRemainingChart({ inventory }: { inventory: InventorySku[] }) {
  const data = [...inventory]
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 20)
    .map((s) => ({
      sku: s.sku,
      name: s.name,
      days: Math.min(s.daysRemaining, 365),
      status: s.status
    }));

  return (
    <ChartCard
      title="Lowest 20 SKUs by days remaining"
      subtitle="Color-coded against the 90 / 120 day thresholds"
      height={320}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="sku"
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={56}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            width={42}
          />
          <Tooltip
            cursor={{ fill: "var(--accent-soft)" }}
            contentStyle={tooltipStyle}
            formatter={(v: number) => [`${v.toFixed(1)} days`, "Days remaining"]}
            labelFormatter={(_, p) => p?.[0]?.payload?.name ?? ""}
          />
          <Bar dataKey="days" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={STATUS_COLOR[d.status as keyof typeof STATUS_COLOR]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function InventoryValuePie({ inventory }: { inventory: InventorySku[] }) {
  const byCategory = inventory.reduce<Record<string, number>>((acc, item) => {
    const k = item.subcategory || item.category;
    acc[k] = (acc[k] ?? 0) + item.totalValue;
    return acc;
  }, {});
  const data = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard
      title="Inventory value by category"
      subtitle={`$${total.toLocaleString(undefined, { maximumFractionDigits: 0 })} on hand · top 8`}
      height={320}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={100}
            paddingAngle={1}
            stroke="var(--panel-elev)"
            strokeWidth={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number) => [`$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, "Value"]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 11, color: "var(--text-muted)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function UsageTrendChart({ history }: { history: UsageHistoryPoint[] }) {
  const data = history.map((p) => ({
    date: p.date,
    usage: p.totalUsage
  }));

  return (
    <ChartCard
      title="Usage trend · last 90 days"
      subtitle="Total daily burn across all SKUs"
      height={320}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#72BC44" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#72BC44" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tickFormatter={(d: string) => {
              const dt = new Date(d);
              return `${dt.getMonth() + 1}/${dt.getDate()}`;
            }}
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            width={48}
            tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
          />
          <Tooltip
            cursor={{ stroke: "var(--accent)", strokeWidth: 1, strokeDasharray: "3 3" }}
            contentStyle={tooltipStyle}
            formatter={(v: number) => [`${v.toLocaleString()} units`, "Daily burn"]}
            labelFormatter={(d) => new Date(d as string).toDateString()}
          />
          <Area
            type="monotone"
            dataKey="usage"
            stroke="#72BC44"
            strokeWidth={2}
            fill="url(#usageFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
