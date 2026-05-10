import {
  fetchInventoryFromSheet,
  fetchInvoiceCostMap,
  type InvoiceCostEntry
} from "./google-drive";
import { mockInventory, mockUsageHistory } from "./mock-data";
import {
  buildSnapshot,
  diffSnapshots,
  enrichInventory,
  type RawSku
} from "./inventory-engine";
import { getLatestSnapshot, saveSnapshot } from "./storage";
import { sendReorderAlerts } from "./email";
import type { InventorySnapshot } from "./types";

/**
 * Run the full daily sync. Returns the new snapshot plus a summary of side
 * effects (which alerts were dispatched, how many SKUs were newly critical).
 */
export async function runDailySync(): Promise<{
  snapshot: InventorySnapshot;
  newlyCritical: number;
  emailResult: unknown;
  source: "drive" | "mock";
}> {
  const previous = await getLatestSnapshot();
  const previousInventory = previous?.inventory ?? null;
  const previousHistory = previous?.usageHistory ?? mockUsageHistory;

  const credentialsPresent =
    !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
    !!process.env.DRIVE_INVENTORY_FILE_ID;

  let inventory = mockInventory;
  let source: "drive" | "mock" = "mock";

  if (credentialsPresent) {
    const [rows, costMap] = await Promise.all([
      fetchInventoryFromSheet(),
      process.env.DRIVE_INVOICE_FOLDER_ID
        ? fetchInvoiceCostMap()
        : Promise.resolve(new Map<string, InvoiceCostEntry>())
    ]);

    const raw: RawSku[] = rows.map((r) => {
      const cost = costMap.get(r.sku.toUpperCase());
      return {
        sku: r.sku,
        name: r.name,
        category: r.category,
        subcategory: r.subcategory,
        unit: r.unit,
        currentInventory: r.currentInventory,
        onOrder: r.onOrder,
        averageDailyUsage: r.averageDailyUsage,
        costPerUnit: cost?.costPerUnit ?? 0,
        leadTimeDays: r.leadTimeDays,
        lastInvoiceDate: cost?.invoiceDate ?? null,
        lastInvoiceNumber: cost?.invoiceNumber ?? null
      };
    });

    inventory = enrichInventory(raw);
    source = "drive";
  }

  const newlyCritical = diffSnapshots(previousInventory, inventory);

  // Append today's usage point if not already there.
  const todayKey = new Date().toISOString().slice(0, 10);
  const usageHistory = [...previousHistory];
  const todayUsage = inventory.reduce((s, i) => s + i.averageDailyUsage, 0);
  const todayValue = inventory.reduce((s, i) => s + i.averageDailyUsage * i.costPerUnit, 0);
  if (usageHistory[usageHistory.length - 1]?.date !== todayKey) {
    usageHistory.push({
      date: todayKey,
      totalUsage: Math.round(todayUsage),
      totalValue: Number(todayValue.toFixed(2))
    });
    while (usageHistory.length > 90) usageHistory.shift();
  }

  const snapshot = buildSnapshot(inventory, usageHistory, newlyCritical);
  await saveSnapshot(snapshot);

  const newlyCriticalSkus = inventory.filter((i) =>
    newlyCritical.find((d) => d.sku === i.sku)
  );
  const emailResult =
    newlyCriticalSkus.length > 0 ? await sendReorderAlerts(newlyCriticalSkus) : { sent: false, reason: "No newly-critical SKUs." };

  return { snapshot, newlyCritical: newlyCritical.length, emailResult, source };
}
