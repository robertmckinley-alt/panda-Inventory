"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Search, Download } from "lucide-react";
import type { InventorySku, InventoryStatus } from "@/lib/types";

type SortKey = "sku" | "name" | "category" | "currentInventory" | "averageDailyUsage" | "daysRemaining" | "totalValue" | "recommendedReorderQty";

const STATUS_LABEL: Record<InventoryStatus, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical"
};

function StatusPill({ status }: { status: InventoryStatus }) {
  const c =
    status === "critical"
      ? "var(--critical)"
      : status === "warning"
      ? "var(--warning)"
      : "var(--healthy)";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        color: c,
        background: `color-mix(in oklab, ${c} 14%, transparent)`,
        border: `1px solid color-mix(in oklab, ${c} 28%, transparent)`
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function fmtNum(n: number) {
  return n.toLocaleString();
}
function fmtMoney(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function InventoryTable({
  inventory,
  showFilters = true,
  showExport = true,
  defaultFilter = "all",
  preview = false
}: {
  inventory: InventorySku[];
  showFilters?: boolean;
  showExport?: boolean;
  defaultFilter?: "all" | InventoryStatus;
  preview?: boolean;
}) {
  const [filter, setFilter] = useState<"all" | InventoryStatus>(defaultFilter);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("daysRemaining");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => {
    let r = inventory;
    if (filter !== "all") r = r.filter((s) => s.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      r = r.filter(
        (s) =>
          s.sku.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.subcategory.toLowerCase().includes(q)
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    r = [...r].sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return preview ? r.slice(0, 8) : r;
  }, [inventory, filter, query, sortKey, sortDir, preview]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir(k === "daysRemaining" ? "asc" : "desc");
    }
  }

  const counts = useMemo(() => {
    return {
      all: inventory.length,
      critical: inventory.filter((s) => s.status === "critical").length,
      warning: inventory.filter((s) => s.status === "warning").length,
      healthy: inventory.filter((s) => s.status === "healthy").length
    };
  }, [inventory]);

  const filterChips: { key: "all" | InventoryStatus; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "critical", label: "Critical", count: counts.critical },
    { key: "warning", label: "Warning", count: counts.warning },
    { key: "healthy", label: "Healthy", count: counts.healthy }
  ];

  return (
    <div className="panel-elev overflow-hidden">
      {showFilters ? (
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {filterChips.map((c) => {
              const active = filter === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setFilter(c.key)}
                  className="text-[12px] px-2.5 py-1 rounded-md transition"
                  style={{
                    background: active ? "var(--accent)" : "transparent",
                    color: active ? "white" : "var(--text-muted)",
                    border: active
                      ? "1px solid var(--accent)"
                      : "1px solid var(--border)"
                  }}
                >
                  {c.label}
                  <span
                    className="ml-1.5 tabular"
                    style={{ color: active ? "rgba(255,255,255,0.85)" : "var(--text-subtle)" }}
                  >
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5"
              style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
            >
              <Search className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search SKU, name, category..."
                className="bg-transparent outline-none text-[12px] w-56"
                style={{ color: "var(--text)" }}
              />
            </div>
            {showExport ? (
              <a
                href={`/api/export?filter=${filter}`}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-md transition"
                style={{
                  background: "var(--bg)",
                  color: "var(--text)",
                  border: "1px solid var(--border)"
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1100px] text-left text-[13px]">
          <thead>
            <tr
              className="text-[11px] uppercase tracking-[0.08em]"
              style={{ color: "var(--text-muted)", background: "var(--bg)" }}
            >
              <Th label="SKU" k="sku" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <Th label="Description" k="name" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <Th label="Category" k="category" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <Th label="On hand" k="currentInventory" right sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <Th label="On order" right />
              <Th label="Daily burn" k="averageDailyUsage" right sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <Th label="Days left" k="daysRemaining" right sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <Th label="Unit cost" right />
              <Th label="Value" k="totalValue" right sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <Th label="Reorder qty" k="recommendedReorderQty" right sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <Th label="Status" />
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => {
              const daysColor =
                s.status === "critical"
                  ? "var(--critical)"
                  : s.status === "warning"
                  ? "var(--warning)"
                  : "var(--text)";
              return (
                <tr
                  key={s.sku}
                  className="border-t transition"
                  style={{
                    borderColor: "var(--border)",
                    background: i % 2 === 0 ? "transparent" : "color-mix(in oklab, var(--bg) 55%, transparent)"
                  }}
                >
                  <td className="px-4 py-3 font-mono text-[11.5px]" style={{ color: "var(--text)" }}>
                    {s.sku}
                  </td>
                  <td className="px-4 py-3 max-w-[280px] truncate" title={s.name}>
                    {s.name}
                  </td>
                  <td className="px-4 py-3 text-[12px]" style={{ color: "var(--text-muted)" }}>
                    <span>{s.category}</span>
                    {s.subcategory ? (
                      <span style={{ color: "var(--text-subtle)" }}> · {s.subcategory}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right tabular">{fmtNum(s.currentInventory)}</td>
                  <td className="px-4 py-3 text-right tabular" style={{ color: s.onOrder ? "var(--text)" : "var(--text-subtle)" }}>
                    {s.onOrder ? fmtNum(s.onOrder) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular">{fmtNum(s.averageDailyUsage)}</td>
                  <td className="px-4 py-3 text-right tabular font-semibold" style={{ color: daysColor }}>
                    {s.daysRemaining >= 365 ? "365+" : s.daysRemaining.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right tabular" style={{ color: "var(--text-muted)" }}>
                    ${s.costPerUnit.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 text-right tabular">{fmtMoney(s.totalValue)}</td>
                  <td className="px-4 py-3 text-right tabular" style={{ color: s.recommendedReorderQty > 0 ? "var(--text)" : "var(--text-subtle)" }}>
                    {s.recommendedReorderQty > 0 ? fmtNum(s.recommendedReorderQty) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={s.status} />
                  </td>
                </tr>
              );
            })}
            {!rows.length ? (
              <tr>
                <td colSpan={11} className="text-center py-10" style={{ color: "var(--text-muted)" }}>
                  No SKUs match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  label,
  k,
  right,
  sortKey,
  sortDir,
  onClick
}: {
  label: string;
  k?: SortKey;
  right?: boolean;
  sortKey?: SortKey;
  sortDir?: "asc" | "desc";
  onClick?: (k: SortKey) => void;
}) {
  const active = k && sortKey === k;
  return (
    <th
      className={`px-4 py-2.5 font-medium ${right ? "text-right" : "text-left"}`}
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {k ? (
        <button
          onClick={() => onClick?.(k)}
          className="inline-flex items-center gap-1 hover:text-[var(--text)] transition"
          style={{ color: active ? "var(--text)" : "inherit" }}
        >
          {label}
          <ArrowUpDown className="w-3 h-3 opacity-60" />
          {active ? <span className="text-[9px]">{sortDir === "asc" ? "↑" : "↓"}</span> : null}
        </button>
      ) : (
        label
      )}
    </th>
  );
}
