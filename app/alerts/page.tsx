import { Bell, AlertTriangle, Clock } from "lucide-react";
import { mockInventory, mockUsageHistory } from "@/lib/mock-data";
import { buildSnapshot } from "@/lib/inventory-engine";
import { getLatestSnapshot } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { SendAlertsButton } from "@/components/Actions";

export const dynamic = "force-dynamic";

function fmtNum(n: number) {
  return n.toLocaleString();
}

export default async function AlertsPage() {
  const stored = await getLatestSnapshot().catch(() => null);
  const snapshot = stored ?? buildSnapshot(mockInventory, mockUsageHistory, []);
  const critical = snapshot.inventory
    .filter((s) => s.status === "critical")
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <main className="px-6 lg:px-10 py-6 lg:py-8 max-w-[1480px] mx-auto">
      <PageHeader
        eyebrow="Alerts"
        title="Reorder alerts"
        subtitle={`${critical.length} SKU${critical.length === 1 ? "" : "s"} below 90 days of cover · target rebuild is 120 days plus lead time.`}
        right={<SendAlertsButton />}
      />

      <div className="mt-6 space-y-3">
        {critical.length === 0 ? (
          <div
            className="panel-elev p-10 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            <Bell className="w-6 h-6 mx-auto mb-3" style={{ color: "var(--healthy)" }} />
            <div className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>
              All clear
            </div>
            <div className="text-[12.5px] mt-1">No SKUs are below the 90-day threshold today.</div>
          </div>
        ) : (
          critical.map((s) => {
            const urgency = s.daysRemaining < 30 ? "extreme" : s.daysRemaining < 60 ? "high" : "elevated";
            const urgencyColor =
              urgency === "extreme" ? "var(--critical)" : urgency === "high" ? "#f97316" : "var(--warning)";
            return (
              <div
                key={s.sku}
                className="panel-elev p-5 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div
                  className="hidden md:grid place-items-center w-10 h-10 rounded-md shrink-0"
                  style={{
                    background: `color-mix(in oklab, ${urgencyColor} 14%, transparent)`,
                    border: `1px solid color-mix(in oklab, ${urgencyColor} 28%, transparent)`,
                    color: urgencyColor
                  }}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-mono text-[12px]" style={{ color: "var(--text-muted)" }}>
                      {s.sku}
                    </span>
                    <span className="text-[14px] font-semibold tracking-tight">{s.name}</span>
                  </div>
                  <div
                    className="mt-1 text-[12px] flex items-center gap-3 flex-wrap"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span>{s.category} · {s.subcategory}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Lead time {s.leadTimeDays}d
                    </span>
                    {s.lastInvoiceNumber ? (
                      <>
                        <span>·</span>
                        <span>
                          Last PO {s.lastInvoiceNumber} ({s.lastInvoiceDate})
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 shrink-0">
                  <Stat label="Days left" value={s.daysRemaining.toFixed(1)} accent={urgencyColor} />
                  <Stat label="On hand" value={fmtNum(s.currentInventory)} />
                  <Stat label="Recommended PO" value={fmtNum(s.recommendedReorderQty)} />
                  <Stat
                    label="PO value"
                    value={`$${(s.recommendedReorderQty * s.costPerUnit).toLocaleString(undefined, {
                      maximumFractionDigits: 0
                    })}`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="text-right md:text-left">
      <div className="text-[10.5px] uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
      <div className="text-[15px] font-semibold tabular mt-0.5" style={{ color: accent ?? "var(--text)" }}>
        {value}
      </div>
    </div>
  );
}
