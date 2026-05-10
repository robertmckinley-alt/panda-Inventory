export type InventoryStatus = "healthy" | "warning" | "critical";

export type InventorySku = {
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  unit: "EA" | "CS";
  currentInventory: number;
  onOrder: number;
  averageDailyUsage: number;
  daysRemaining: number;
  costPerUnit: number;
  totalValue: number;
  leadTimeDays: number;
  status: InventoryStatus;
  recommendedReorderQty: number;
  lastInvoiceDate: string | null;
  lastInvoiceNumber: string | null;
};

export type UsageHistoryPoint = {
  date: string;
  totalUsage: number;
  totalValue: number;
};

export type SkuDelta = {
  sku: string;
  name: string;
  prevDays: number;
  daysRemaining: number;
};

export type DailySummary = {
  date: string;
  totalInventoryValue: number;
  totalSkus: number;
  criticalCount: number;
  warningCount: number;
  averageDaysRemaining: number;
  inboundUnits: number;
  outboundUnits: number;
  newCriticalSkus: SkuDelta[];
  topMovers: { sku: string; name: string; averageDailyUsage: number }[];
  mostUrgent: InventorySku[];
};

export type InventorySnapshot = {
  generatedAt: string;
  date: string;
  inventory: InventorySku[];
  usageHistory: UsageHistoryPoint[];
  summary: DailySummary;
};
