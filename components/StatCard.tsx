import { ArrowDown, ArrowUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  helper,
  delta,
  tone = "default",
  icon: Icon
}: {
  label: string;
  value: string;
  helper?: string;
  delta?: { value: string; positive?: boolean };
  tone?: "default" | "critical" | "accent";
  icon?: LucideIcon;
}) {
  const tint =
    tone === "critical"
      ? "var(--critical)"
      : tone === "accent"
      ? "var(--accent)"
      : "var(--text-muted)";
  return (
    <div className="panel-elev p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        {Icon ? <Icon className="w-4 h-4" style={{ color: tint }} /> : null}
      </div>
      <div className="text-[28px] leading-none font-semibold tabular tracking-tight">{value}</div>
      <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-muted)" }}>
        {delta ? (
          <span
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium tabular"
            style={{
              color: delta.positive ? "var(--healthy)" : "var(--critical)",
              background: delta.positive
                ? "color-mix(in oklab, var(--healthy) 14%, transparent)"
                : "color-mix(in oklab, var(--critical) 14%, transparent)"
            }}
          >
            {delta.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {delta.value}
          </span>
        ) : null}
        {helper ? <span>{helper}</span> : null}
      </div>
    </div>
  );
}
