import { NextResponse } from "next/server";
import { mockInventory, mockUsageHistory } from "@/lib/mock-data";
import { buildSnapshot } from "@/lib/inventory-engine";
import { getLatestSnapshot } from "@/lib/storage";
import { sendReorderAlerts } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST() {
  const stored = await getLatestSnapshot().catch(() => null);
  const snapshot = stored ?? buildSnapshot(mockInventory, mockUsageHistory, []);
  const critical = snapshot.inventory.filter((s) => s.status === "critical");
  const emailResult = await sendReorderAlerts(critical);
  return NextResponse.json({ ok: true, criticalCount: critical.length, emailResult });
}
