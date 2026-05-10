import Link from "next/link";
import { ArrowRight, AlertTriangle, Boxes, DollarSign, Gauge } from "lucide-react";
import { mockInventory, mockUsageHistory } from "@/lib/mock-data";
import { buildSnapshot } from "@/lib/inventory-engine";
import { getLatestSnapshot } from "@/lib/storage";
import { StatCard } from "@/components/StatCard";
import { InventoryTable } from "@/components/InventoryTable";
import {
  DaysRemainingChart,
  InventoryValuePie,
  UsageTrendChart
} from "@/components/InventoryCharts";
import { DailySummaryPanel } from "@/components/DailySummaryPanel";
import { HeaderActions } from "@/components/Actions";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stored = await getLatestSnapshot().catch(() => null);
  const snapshot = stored ?? buildSnapshot(mockInventory, mockUsageHistory, []);
  const { inventory, summary, usageHistory } = snapshot;

  return (
    <main className="px-6 lg:px-10 py-6 lg:py-8 max-w-[1480px] mx-auto">
      <PageHeader
        eyebrow="Operations · Packaging"
        title="Inventory dashboard"
        subtitle="Daily SKU visibility, reorder alerts, and invoice-matched cost — synced from Drive every morning."
        right={<HeaderActions />}
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard
          label="Total inventory value"
          value={`$${summary.totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          helper="Matched to latest invoice cost"
          icon={DollarSign}
          tone="accent"
        />
        <StatCard
          label="Total SKUs tracked"
          value={summary.totalSkus.toLocaleString()}
          helper={`${summary.warningCount} warning · ${summary.criticalCount} critical`}
          icon={Boxes}
        />
        <StatCard
          label="SKUs below 90 days"
          value={summary.criticalCount.toLocaleString()}
          helper={summary.newCriticalSkus.length ? `${summary.newCriticalSkus.length} new since yesterday` : "No new criticals today"}
          icon={AlertTriangle}
          tone="critical"
        />
        <StatCard
          label="Avg days remaining"
          value={summary.averageDaysRemaining.toFixed(1)}
          helper="Across all packaging SKUs"
          icon={Gauge}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2 grid grid-cols-1 gap-4">
          <DaysRemainingChart inventory={inventory} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InventoryValuePie inventory={inventory} />
            <UsageTrendChart history={usageHistory} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <DailySummaryPanel summary={summary} />
        </div>
      </section>

      <section className="mt-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-[14px] font-semibold tracking-tight">SKU control table</h2>
            <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
              Sorted by lowest days remaining first.
            </p>
          </div>
          <Link
            href="/skus"
            className="inline-flex items-center gap-1 text-[12.5px] font-medium"
            style={{ color: "var(--accent)" }}
          >
            View all {inventory.length} SKUs
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <InventoryTable inventory={inventory} preview showFilters={false} showExport={false} />
      </section>
    </main>
  );
}
