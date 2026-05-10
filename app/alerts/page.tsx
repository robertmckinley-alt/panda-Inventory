import { Bell } from "lucide-react";
import { mockInventory, mockUsageHistory } from "@/lib/mock-data";
import { buildSnapshot } from "@/lib/inventory-engine";
import { getLatestSnapshot } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { AlertsList } from "@/components/AlertsList";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
    const stored = await getLatestSnapshot().catch(() => null);
    const snapshot = stored ?? buildSnapshot(mockInventory, mockUsageHistory, []);
    const critical = snapshot.inventory
      .filter((s) => s.status === "critical")
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const items = critical.map((s) => ({
        sku: s.sku,
        name: s.name,
        category: s.category,
        subcategory: s.subcategory,
        leadTimeDays: s.leadTimeDays,
        lastInvoiceNumber: s.lastInvoiceNumber ?? null,
        lastInvoiceDate: s.lastInvoiceDate ?? null,
        daysRemaining: s.daysRemaining,
        currentInventory: s.currentInventory,
        recommendedReorderQty: s.recommendedReorderQty,
        costPerUnit: s.costPerUnit,
  }));

  return (
        <main className="px-6 lg:px-10 py-6 lg:py-8 max-w-[1480px] mx-auto">
              <PageHeader
                        eyebrow="Alerts"
                        title="Reorder alerts"
                        subtitle={`${critical.length} SKU${critical.length === 1 ? "" : "s"} below 90 days of cover \u00b7 target rebuild is 120 days plus lead time.`}
                      />
              <div className="mt-6 space-y-3">
                {critical.length === 0 ? (
                    <div
                                  className="panel-elev p-10 text-center"
                                  style={{ color: "var(--text-muted)" }}
                                >
                                <Bell
                                                className="w-6 h-6 mx-auto mb-3"
                                                style={{ color: "var(--healthy)" }}
                                              />
                                <div className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>
                                              All clear
                                </div>
                                <div className="text-[12.5px] mt-1">
                                              No SKUs are below the 90-day threshold today.
                                </div>
                    </div>
                  ) : (
                    <AlertsList items={items} />
                  )}
              </div>
        </main>
      );
}
