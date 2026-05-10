import { ArrowDownCircle, ArrowUpCircle, AlertTriangle, Flame, Truck } from "lucide-react";
import type { DailySummary, InventorySku } from "@/lib/types";

function fmtNum(n: number) {
  return n.toLocaleString();
}

export function DailySummaryPanel({ summary }: { summary: DailySummary }) {
  return (
    <div className="panel-elev p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight">Daily summary</h3>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {new Date(summary.date).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric"
            })}
          </p>
        </div>
        <span
          className="text-[10.5px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-md"
          style={{
            background: "color-mix(in oklab, var(--healthy) 14%, transparent)",
            color: "var(--healthy)"
          }}
        >
          Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Stat
          icon={<ArrowDownCircle className="w-3.5 h-3.5" style={{ color: "var(--healthy)" }} />}
          label="Inbound (on order)"
          value={fmtNum(summary.inboundUnits)}
          tone="var(--healthy)"
        />
        <Stat
          icon={<ArrowUpCircle className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />}
          label="Outbound today"
          value={fmtNum(summary.outboundUnits)}
          tone="var(--accent)"
        />
        <Stat
          icon={<AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--critical)" }} />}
          label="New critical SKUs"
          value={fmtNum(summary.newCriticalSkus.length)}
          tone="var(--critical)"
        />
        <Stat
          icon={<Truck className="w-3.5 h-3.5" style={{ color: "var(--warning)" }} />}
          label="Reorders pending"
          value={fmtNum(summary.criticalCount + summary.warningCount)}
          tone="var(--warning)"
        />
      </div>

      <Section title="Top movers">
        <ul className="space-y-2">
          {summary.topMovers.map((m) => (
            <li key={m.sku} className="flex items-center gap-3 text-[12.5px]">
              <Flame className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--warning)" }} />
              <span className="font-mono text-[11.5px] shrink-0" style={{ color: "var(--text-muted)" }}>
                {m.sku}
              </span>
              <span className="truncate flex-1" title={m.name}>
                {m.name}
              </span>
              <span className="tabular shrink-0 font-semibold">
                {fmtNum(m.averageDailyUsage)}
                <span className="ml-1 font-normal" style={{ color: "var(--text-subtle)" }}>
                  /day
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Most urgent reorders">
        {summary.mostUrgent.length ? (
          <ul className="space-y-2">
            {summary.mostUrgent.map((s: InventorySku) => (
              <li key={s.sku} className="flex items-center gap-3 text-[12.5px]">
                <span
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{ background: "var(--critical)" }}
                />
                <span className="font-mono text-[11.5px] shrink-0" style={{ color: "var(--text-muted)" }}>
                  {s.sku}
                </span>
                <span className="truncate flex-1">{s.name}</span>
                <span className="tabular shrink-0 font-semibold" style={{ color: "var(--critical)" }}>
                  {s.daysRemaining.toFixed(1)}d
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
            No SKUs in the critical band today.
          </p>
        )}
      </Section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div
      className="rounded-md p-3"
      style={{
        background: `color-mix(in oklab, ${tone} 8%, transparent)`,
        border: `1px solid color-mix(in oklab, ${tone} 16%, transparent)`
      }}
    >
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
        {icon}
        {label}
      </div>
      <div className="mt-1 text-[18px] font-semibold tabular leading-none">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="mt-4 pt-4 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="text-[10.5px] uppercase tracking-[0.14em] mb-2.5"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
