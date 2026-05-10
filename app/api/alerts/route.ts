import { NextResponse } from "next/server";
import { mockInventory, mockUsageHistory } from "@/lib/mock-data";
import { buildSnapshot } from "@/lib/inventory-engine";
import { getLatestSnapshot } from "@/lib/storage";
import { sendReorderAlerts } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    let selectedSkus: string[] | null = null;
    try {
          const body = await req.json().catch(() => null);
          if (body && Array.isArray(body.skus)) {
                  selectedSkus = body.skus.map((x: unknown) => String(x));
          }
    } catch {
          selectedSkus = null;
    }

  const stored = await getLatestSnapshot().catch(() => null);
    const snapshot = stored ?? buildSnapshot(mockInventory, mockUsageHistory, []);
    let critical = snapshot.inventory.filter((s) => s.status === "critical");

  if (selectedSkus && selectedSkus.length > 0) {
        const allow = new Set(selectedSkus);
        critical = critical.filter((s) => allow.has(s.sku));
  }

  const emailResult = await sendReorderAlerts(critical);
    return NextResponse.json({
          ok: true,
          criticalCount: critical.length,
          selected: selectedSkus?.length ?? null,
          emailResult,
    });
}
