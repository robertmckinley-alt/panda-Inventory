import { stringify } from "csv-stringify/sync";
import type { InventorySku } from "./types";

export function buildInventoryCsv(rows: InventorySku[]): string {
  const records = rows.map((r) => ({
    sku: r.sku,
    name: r.name,
    category: r.category,
    subcategory: r.subcategory,
    unit: r.unit,
    currentInventory: r.currentInventory,
    onOrder: r.onOrder,
    averageDailyUsage: r.averageDailyUsage,
    daysRemaining: r.daysRemaining,
    costPerUnit: r.costPerUnit,
    totalValue: r.totalValue,
    leadTimeDays: r.leadTimeDays,
    status: r.status,
    recommendedReorderQty: r.recommendedReorderQty,
    lastInvoiceDate: r.lastInvoiceDate ?? "",
    lastInvoiceNumber: r.lastInvoiceNumber ?? ""
  }));
  return stringify(records, {
    header: true,
    columns: [
      "sku",
      "name",
      "category",
      "subcategory",
      "unit",
      "currentInventory",
      "onOrder",
      "averageDailyUsage",
      "daysRemaining",
      "costPerUnit",
      "totalValue",
      "leadTimeDays",
      "status",
      "recommendedReorderQty",
      "lastInvoiceDate",
      "lastInvoiceNumber"
    ]
  });
}
