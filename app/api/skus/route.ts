import { NextResponse } from "next/server";
import { mockInventory, mockUsageHistory } from "@/lib/mock-data";
import { buildSnapshot } from "@/lib/inventory-engine";
import { getLatestSnapshot } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const stored = await getLatestSnapshot().catch(() => null);
  const snapshot = stored ?? buildSnapshot(mockInventory, mockUsageHistory, []);
  return NextResponse.json(snapshot);
}
