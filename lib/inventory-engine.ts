import type {
  InventorySku,
  InventoryStatus,
  DailySummary,
  InventorySnapshot,
  UsageHistoryPoint,
  SkuDelta
} from "./types";

export const TARGET_DAYS = Number(process.env.TARGET_DAYS ?? 120);
export const CRITICAL_THRESHOLD = 90;
export const WARNING_THRESHOLD = 120;

export function getStatus(daysRemaining: number): InventoryStatus {
  if (daysRemaining < CRITICAL_THRESHOLD) return "critical";
  if (daysRemaining < WARNING_THRESHOLD) return "warning";
  return "healthy";
}

export function calculateDaysRemaining(currentInventory: number, averageDailyUsage: number): number {
  if (!averageDailyUsage || averageDailyUsage <= 0) return 9999;
  return Number((currentInventory / averageDailyUsage).toFixed(1));
}

export function calculateRecommendedReorderQty(params: {
  currentInventory: number;
  onOrder?: number;
  averageDailyUsage: number;
  leadTimeDays: number;
  targetDays?: number;
}): number {
  const targetDays = params.targetDays ?? TARGET_DAYS;
  const targetQty = params.averageDailyUsage * (targetDays + params.leadTimeDays);
  const onHand = params.currentInventory + (params.onOrder ?? 0);
  const reorderQty = targetQty - onHand;
  return Math.max(0, Math.ceil(reorderQty));
}

export type RawSku = Omit<
  InventorySku,
  "daysRemaining" | "totalValue" | "status" | "recommendedReorderQty"
>;

export function enrichInventory(raw: RawSku[]): InventorySku[] {
  return raw
    .map((item) => {
      const daysRemaining = calculateDaysRemaining(item.currentInventory, item.averageDailyUsage);
      const totalValue = Number((item.currentInventory * item.costPerUnit).toFixed(2));
      const status = getStatus(daysRemaining);
      const recommendedReorderQty = calculateRecommendedReorderQty({
        currentInventory: item.currentInventory,
        onOrder: item.onOrder,
        averageDailyUsage: item.averageDailyUsage,
        leadTimeDays: item.leadTimeDays
      });
      return {
        ...item,
        daysRemaining,
        totalValue,
        status,
        recommendedReorderQty
      };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function diffSnapshots(prev: InventorySku[] | null, next: InventorySku[]): SkuDelta[] {
  if (!prev) return [];
  const prevMap = new Map(prev.map((s) => [s.sku, s]));
  const newlyCritical: SkuDelta[] = [];
  for (const item of next) {
    const before = prevMap.get(item.sku);
    if (!before) continue;
    if (before.daysRemaining >= CRITICAL_THRESHOLD && item.daysRemaining < CRITICAL_THRESHOLD) {
      newlyCritical.push({
        sku: item.sku,
        name: item.name,
        prevDays: before.daysRemaining,
        daysRemaining: item.daysRemaining
      });
    }
  }
  return newlyCritical;
}

export function buildDailySummary(
  inventory: InventorySku[],
  usageHistory: UsageHistoryPoint[],
  newlyCritical: SkuDelta[]
): DailySummary {
  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const totalSkus = inventory.length;
  const criticalCount = inventory.filter((i) => i.status === "critical").length;
  const warningCount = inventory.filter((i) => i.status === "warning").length;
  const averageDaysRemaining =
    inventory.reduce((sum, item) => sum + Math.min(item.daysRemaining, 365), 0) /
    Math.max(totalSkus, 1);

  const today = usageHistory[usageHistory.length - 1]?.totalUsage ?? 0;
  const inboundUnits = inventory.reduce((sum, item) => sum + (item.onOrder ?? 0), 0);

  const topMovers = [...inventory]
    .sort((a, b) => b.averageDailyUsage - a.averageDailyUsage)
    .slice(0, 5)
    .map((s) => ({ sku: s.sku, name: s.name, averageDailyUsage: s.averageDailyUsage }));

  const mostUrgent = [...inventory]
    .filter((i) => i.status === "critical")
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 5);

  return {
    date: new Date().toISOString().slice(0, 10),
    totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
    totalSkus,
    criticalCount,
    warningCount,
    averageDaysRemaining: Number(averageDaysRemaining.toFixed(1)),
    inboundUnits,
    outboundUnits: today,
    newCriticalSkus: newlyCritical,
    topMovers,
    mostUrgent
  };
}

export function buildSnapshot(
  inventory: InventorySku[],
  usageHistory: UsageHistoryPoint[],
  newlyCritical: SkuDelta[] = []
): InventorySnapshot {
  return {
    generatedAt: new Date().toISOString(),
    date: new Date().toISOString().slice(0, 10),
    inventory,
    usageHistory,
    summary: buildDailySummary(inventory, usageHistory, newlyCritical)
  };
}
