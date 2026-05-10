"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Clock, Send } from "lucide-react";

type AlertRow = {
    sku: string;
    name: string;
    category: string;
    subcategory: string;
    leadTimeDays: number;
    lastInvoiceNumber?: string | null;
    lastInvoiceDate?: string | null;
    daysRemaining: number;
    currentInventory: number;
    recommendedReorderQty: number;
    costPerUnit: number;
};

function fmtNum(n: number) {
    return n.toLocaleString();
}

export function AlertsList({ items }: { items: AlertRow[] }) {
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<string | null>(null);

  const selectedSkus = useMemo(
        () => items.map((i) => i.sku).filter((sku) => selected[sku]),
        [items, selected],
      );

  const allSelected = items.length > 0 && selectedSkus.length === items.length;
    const someSelected = selectedSkus.length > 0 && !allSelected;

  function toggleAll() {
        if (allSelected) {
                setSelected({});
        } else {
                const next: Record<string, boolean> = {};
                for (const i of items) next[i.sku] = true;
                setSelected(next);
        }
  }

  function toggleOne(sku: string) {
        setSelected((prev) => ({ ...prev, [sku]: !prev[sku] }));
  }

  async function sendSelected() {
        if (selectedSkus.length === 0) return;
        setSending(true);
        setResult(null);
        try {
                const res = await fetch("/api/alerts", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ skus: selectedSkus }),
                });
                const data = await res.json();
                setResult(
                          data.emailResult?.sent
                            ? `Dispatched ${selectedSkus.length} alert${selectedSkus.length === 1 ? "" : "s"}`
                            : data.emailResult?.reason ?? "Done",
                        );
        } catch {
                setResult("Failed to send");
        } finally {
                setSending(false);
        }
  }

  if (items.length === 0) return null;

  const dot = "\u00b7";

  return (
        <div className="space-y-3">
              <div
                        className="panel-elev p-3 flex items-center gap-3 sticky top-2 z-10"
                        style={{ backdropFilter: "blur(6px)" }}
                      >
                      <label className="flex items-center gap-2 text-[12.5px] font-semibold cursor-pointer select-none">
                                <input
                                              type="checkbox"
                                              checked={allSelected}
                                              ref={(el) => {
                                                              if (el) el.indeterminate = someSelected;
                                              }}
                                              onChange={toggleAll}
                                              className="w-4 h-4 cursor-pointer"
                                            />
                        {allSelected ? "Deselect all" : "Select all"}
                      </label>label>
                      <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                        {selectedSkus.length} of {items.length} selected
                      </span>span>
                      <div className="flex-1" />
                {result ? (
                                  <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                                    {result}
                                  </span>span>
                                ) : null}
                      <button
                                  onClick={sendSelected}
                                  disabled={sending || selectedSkus.length === 0}
                                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-2 rounded-md transition disabled:opacity-50"
                                  style={{ background: "var(--accent)", color: "var(--on-accent)" }}
                                >
                                <Send className="w-3.5 h-3.5" />
                        {sending
                                      ? "Sending..."
                                      : selectedSkus.length === 0
                                        ? "Send selected"
                                        : `Send ${selectedSkus.length} alert${selectedSkus.length === 1 ? "" : "s"}`}
                      </button>button>
              </div>div>
        
          {items.map((s) => {
                  const urgency =
                              s.daysRemaining < 30 ? "extreme" : s.daysRemaining < 60 ? "high" : "elevated";
                  const urgencyColor =
                              urgency === "extreme"
                                ? "var(--critical)"
                                : urgency === "high"
                                  ? "#f97316"
                                  : "var(--warning)";
                  const isChecked = !!selected[s.sku];
          
                  return (
                              <div
                                            key={s.sku}
                                            className="panel-elev p-5 flex flex-col md:flex-row md:items-center gap-4"
                                            style={
                                                            isChecked
                                                              ? { outline: `1px solid color-mix(in oklab, ${urgencyColor} 40%, transparent)` }
                                                              : undefined
                                            }
                                          >
                                          <label className="flex items-center justify-center shrink-0 cursor-pointer">
                                                        <input
                                                                          type="checkbox"
                                                                          checked={isChecked}
                                                                          onChange={() => toggleOne(s.sku)}
                                                                          aria-label={`Select ${s.sku}`}
                                                                          className="w-4 h-4 cursor-pointer"
                                                                        />
                                          </label>label>
                                          <div
                                                          className="hidden md:grid place-items-center w-10 h-10 rounded-md shrink-0"
                                                          style={{
                                                                            background: `color-mix(in oklab, ${urgencyColor} 14%, transparent)`,
                                                                            border: `1px solid color-mix(in oklab, ${urgencyColor} 28%, transparent)`,
                                                                            color: urgencyColor,
                                                          }}
                                                        >
                                                        <AlertTriangle className="w-4 h-4" />
                                          </div>div>
                                          <div className="flex-1 min-w-0">
                                                        <div className="flex items-baseline gap-2 flex-wrap">
                                                                        <span className="font-mono text-[12px]" style={{ color: "var(--text-muted)" }}>
                                                                          {s.sku}
                                                                        </span>span>
                                                                        <span className="text-[14px] font-semibold tracking-tight">{s.name}</span>span>
                                                        </div>div>
                                                        <div
                                                                          className="mt-1 text-[12px] flex items-center gap-3 flex-wrap"
                                                                          style={{ color: "var(--text-muted)" }}
                                                                        >
                                                                        <span>
                                                                          {s.category} {dot} {s.subcategory}
                                                                        </span>span>
                                                                        <span>{dot}</span>span>
                                                                        <span className="inline-flex items-center gap-1">
                                                                                          <Clock className="w-3 h-3" />
                                                                                          Lead time {s.leadTimeDays}d
                                                                        </span>span>
                                                          {s.lastInvoiceNumber ? (
                                                                                            <>
                                                                                                                <span>{dot}</span>span>
                                                                                                                <span>
                                                                                                                                      Last PO {s.lastInvoiceNumber} ({s.lastInvoiceDate})
                                                                                                                  </span>span>
                                                                                              </>>
                                                                                          ) : null}
                                                        </div>div>
                                          </div>div>
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 shrink-0">
                                                        <Stat label="Days left" value={s.daysRemaining.toFixed(1)} accent={urgencyColor} />
                                                        <Stat label="On hand" value={fmtNum(s.currentInventory)} />
                                                        <Stat label="Recommended PO" value={fmtNum(s.recommendedReorderQty)} />
                                                        <Stat
                                                                          label="PO value"
                                                                          value={`$${(s.recommendedReorderQty * s.costPerUnit).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                                                        />
                                          </div>div>
                              </div>div>
                            );
        })}
        </div>div>
      );
}

function Stat({
    label,
    value,
    accent,
}: {
    label: string;
    value: string;
    accent?: string;
}) {
    return (
          <div className="text-right md:text-left">
                <div
                          className="text-[10.5px] uppercase tracking-[0.12em]"
                          style={{ color: "var(--text-muted)" }}
                        >
                  {label}
                </div>div>
                <div
                          className="text-[15px] font-semibold tabular mt-0.5"
                          style={{ color: accent ?? "var(--text)" }}
                        >
                  {value}
                </div>div>
          </div>div>
        );
}
