import { NextRequest } from "next/server";
import { mockInventory, mockUsageHistory } from "@/lib/mock-data";
import { buildSnapshot } from "@/lib/inventory-engine";
import { getLatestSnapshot } from "@/lib/storage";
import { buildInventoryCsv } from "@/lib/csv";
import type { InventoryStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const filterParam = req.nextUrl.searchParams.get("filter") ?? "all";
  const stored = await getLatestSnapshot().catch(() => null);
  const snapshot = stored ?? buildSnapshot(mockInventory, mockUsageHistory, []);
  let rows = snapshot.inventory;
  if (["critical", "warning", "healthy"].includes(filterParam)) {
    rows = rows.filter((s) => s.status === (filterParam as InventoryStatus));
  }
  const csv = buildInventoryCsv(rows);
  const filename = `inventory-${filterParam}-${snapshot.date}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
