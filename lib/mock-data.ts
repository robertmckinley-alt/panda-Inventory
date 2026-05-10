import { enrichInventory, RawSku } from "./inventory-engine";
import type { InventorySku, UsageHistoryPoint } from "./types";

// Categories observed in the source sheet.
const PROCESSING = "PROCESSING";
const PACKAGING = "PACKAGING";
const PROPAGATION = "PROPAGATION";
const GROW = "GROW";

// 40 SKUs derived from the real "Finished Goods Reorder Report WIP" tab.
// `currentInventory` is In-stock minus Reserved. `averageDailyUsage` is from
// the 90 Burn Rate tab. Costs are matched from the most recent invoices.
const RAW: RawSku[] = [
  // --- Mylar Bag Panda Pen variants (cartridges, 510 carts) ---
  { sku: "MBGR9001-WA", name: "Mylar Bag Panda Pen 1g Blueberry WA", category: PROCESSING, subcategory: "510 Cart Bag", unit: "EA", currentInventory: 18420, onOrder: 0, averageDailyUsage: 320, costPerUnit: 0.42, leadTimeDays: 30, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },
  { sku: "MBGR9002-WA", name: "Mylar Bag Panda Pen 1g Pineapple WA", category: PROCESSING, subcategory: "510 Cart Bag", unit: "EA", currentInventory: 4280, onOrder: 0, averageDailyUsage: 410, costPerUnit: 0.42, leadTimeDays: 30, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },
  { sku: "MBGR9003-WA", name: "Mylar Bag Panda Pen 1g Granddaddy WA", category: PROCESSING, subcategory: "510 Cart Bag", unit: "EA", currentInventory: 26100, onOrder: 0, averageDailyUsage: 295, costPerUnit: 0.42, leadTimeDays: 30, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },
  { sku: "MBGR9004-WA", name: "Mylar Bag Panda Pen 1g Sour Diesel WA", category: PROCESSING, subcategory: "510 Cart Bag", unit: "EA", currentInventory: 12880, onOrder: 5000, averageDailyUsage: 360, costPerUnit: 0.42, leadTimeDays: 30, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },
  { sku: "MBGR9005-WA", name: "Mylar Bag Panda Pen 1g Wedding Cake WA", category: PROCESSING, subcategory: "510 Cart Bag", unit: "EA", currentInventory: 88420, onOrder: 0, averageDailyUsage: 305, costPerUnit: 0.42, leadTimeDays: 30, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },
  { sku: "MBGR9006-WA", name: "Mylar Bag Panda Pen 1g Gelato WA", category: PROCESSING, subcategory: "510 Cart Bag", unit: "EA", currentInventory: 41200, onOrder: 0, averageDailyUsage: 340, costPerUnit: 0.42, leadTimeDays: 30, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },

  // --- Tags / labels ---
  { sku: "PPWHITETIN", name: "Phat Panda White Tin Sticker", category: PACKAGING, subcategory: "Sticker", unit: "EA", currentInventory: 152400, onOrder: 0, averageDailyUsage: 2200, costPerUnit: 0.045, leadTimeDays: 21, lastInvoiceDate: "2026-03-30", lastInvoiceNumber: "INV-43890" },
  { sku: "PINETAG", name: "Pineapple Express Strain Tag", category: PACKAGING, subcategory: "Strain Tag", unit: "EA", currentInventory: 8200, onOrder: 0, averageDailyUsage: 480, costPerUnit: 0.085, leadTimeDays: 21, lastInvoiceDate: "2026-03-30", lastInvoiceNumber: "INV-43890" },
  { sku: "CHEMTAG", name: "Chemdawg Strain Tag", category: PACKAGING, subcategory: "Strain Tag", unit: "EA", currentInventory: 31600, onOrder: 0, averageDailyUsage: 410, costPerUnit: 0.085, leadTimeDays: 21, lastInvoiceDate: "2026-03-30", lastInvoiceNumber: "INV-43890" },
  { sku: "Sealcard101", name: "Tamper-Evident Seal Card 101", category: PACKAGING, subcategory: "Seal Card", unit: "EA", currentInventory: 240500, onOrder: 50000, averageDailyUsage: 3100, costPerUnit: 0.038, leadTimeDays: 28, lastInvoiceDate: "2026-04-02", lastInvoiceNumber: "INV-43951" },

  // --- Dab / Concentrate jars + lids ---
  { sku: "Balmstick", name: "Lip Balm Stick Tube 5g", category: PROCESSING, subcategory: "Topical", unit: "EA", currentInventory: 3850, onOrder: 0, averageDailyUsage: 110, costPerUnit: 0.62, leadTimeDays: 35, lastInvoiceDate: "2026-02-18", lastInvoiceNumber: "INV-43204" },
  { sku: "Dabjar1lid", name: "Dab Jar 1g Black Lid", category: PROCESSING, subcategory: "Concentrate Lid", unit: "EA", currentInventory: 76200, onOrder: 0, averageDailyUsage: 920, costPerUnit: 0.16, leadTimeDays: 30, lastInvoiceDate: "2026-04-08", lastInvoiceNumber: "INV-44104" },
  { sku: "Dabjar2lid", name: "Dab Jar 2g Black Lid", category: PROCESSING, subcategory: "Concentrate Lid", unit: "EA", currentInventory: 19800, onOrder: 0, averageDailyUsage: 540, costPerUnit: 0.18, leadTimeDays: 30, lastInvoiceDate: "2026-04-08", lastInvoiceNumber: "INV-44104" },
  { sku: "Clamshell101", name: "Concentrate Clamshell 1g Clear", category: PROCESSING, subcategory: "Clamshell", unit: "EA", currentInventory: 102300, onOrder: 0, averageDailyUsage: 880, costPerUnit: 0.21, leadTimeDays: 28, lastInvoiceDate: "2026-04-08", lastInvoiceNumber: "INV-44104" },
  { sku: "DABWPJAR", name: "Dab White Plastic Jar 5ml", category: PROCESSING, subcategory: "Concentrate Jar", unit: "EA", currentInventory: 14250, onOrder: 0, averageDailyUsage: 290, costPerUnit: 0.28, leadTimeDays: 30, lastInvoiceDate: "2026-04-08", lastInvoiceNumber: "INV-44104" },
  { sku: "Dab510MYLR", name: "Dab 510 Mylar Bag", category: PROCESSING, subcategory: "Mylar Bag", unit: "EA", currentInventory: 39800, onOrder: 0, averageDailyUsage: 470, costPerUnit: 0.36, leadTimeDays: 30, lastInvoiceDate: "2026-03-21", lastInvoiceNumber: "INV-43788" },
  { sku: "DABJARMYLR", name: "Dab Jar Mylar Outer Bag", category: PROCESSING, subcategory: "Mylar Bag", unit: "EA", currentInventory: 88410, onOrder: 0, averageDailyUsage: 540, costPerUnit: 0.34, leadTimeDays: 30, lastInvoiceDate: "2026-03-21", lastInvoiceNumber: "INV-43788" },
  { sku: "DABAIOMYLR", name: "Dab AIO Mylar Pouch", category: PROCESSING, subcategory: "Mylar Bag", unit: "EA", currentInventory: 6420, onOrder: 0, averageDailyUsage: 260, costPerUnit: 0.39, leadTimeDays: 30, lastInvoiceDate: "2026-03-21", lastInvoiceNumber: "INV-43788" },

  // --- Mylar bag SKUs for finished flower ---
  { sku: "Mylar101", name: "Mylar Bag 1g Standard", category: PACKAGING, subcategory: "Mylar Bag", unit: "EA", currentInventory: 211000, onOrder: 0, averageDailyUsage: 4100, costPerUnit: 0.12, leadTimeDays: 30, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },
  { sku: "Mylar103", name: "Mylar Bag 3.5g Standard", category: PACKAGING, subcategory: "Mylar Bag", unit: "EA", currentInventory: 32800, onOrder: 0, averageDailyUsage: 5200, costPerUnit: 0.15, leadTimeDays: 30, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },
  { sku: "Mylar104", name: "Mylar Bag 7g Standard", category: PACKAGING, subcategory: "Mylar Bag", unit: "EA", currentInventory: 9800, onOrder: 30000, averageDailyUsage: 1850, costPerUnit: 0.19, leadTimeDays: 30, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },
  { sku: "Mylar112", name: "Mylar Bag 14g Standard", category: PACKAGING, subcategory: "Mylar Bag", unit: "EA", currentInventory: 64000, onOrder: 0, averageDailyUsage: 720, costPerUnit: 0.24, leadTimeDays: 30, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },
  { sku: "FMYLAR1", name: "Flower Mylar 1g Premium", category: PACKAGING, subcategory: "Mylar Bag", unit: "EA", currentInventory: 122000, onOrder: 0, averageDailyUsage: 980, costPerUnit: 0.17, leadTimeDays: 30, lastInvoiceDate: "2026-03-15", lastInvoiceNumber: "INV-43662" },
  { sku: "FMYLAR2", name: "Flower Mylar 3.5g Premium", category: PACKAGING, subcategory: "Mylar Bag", unit: "EA", currentInventory: 71400, onOrder: 0, averageDailyUsage: 1240, costPerUnit: 0.20, leadTimeDays: 30, lastInvoiceDate: "2026-03-15", lastInvoiceNumber: "INV-43662" },
  { sku: "FMYLAR3", name: "Flower Mylar 7g Premium", category: PACKAGING, subcategory: "Mylar Bag", unit: "EA", currentInventory: 18900, onOrder: 0, averageDailyUsage: 660, costPerUnit: 0.23, leadTimeDays: 30, lastInvoiceDate: "2026-03-15", lastInvoiceNumber: "INV-43662" },
  { sku: "FMYLAR4", name: "Flower Mylar 14g Premium", category: PACKAGING, subcategory: "Mylar Bag", unit: "EA", currentInventory: 7800, onOrder: 0, averageDailyUsage: 230, costPerUnit: 0.28, leadTimeDays: 30, lastInvoiceDate: "2026-03-15", lastInvoiceNumber: "INV-43662" },

  // --- Glass jars + lids ---
  { sku: "Jar200", name: "Glass Jar 2oz Wide-Mouth", category: PACKAGING, subcategory: "Glass Jar", unit: "CS", currentInventory: 4200, onOrder: 0, averageDailyUsage: 60, costPerUnit: 1.85, leadTimeDays: 45, lastInvoiceDate: "2026-02-28", lastInvoiceNumber: "INV-43321" },
  { sku: "Jar300", name: "Glass Jar 3oz Wide-Mouth", category: PACKAGING, subcategory: "Glass Jar", unit: "CS", currentInventory: 1380, onOrder: 0, averageDailyUsage: 38, costPerUnit: 2.10, leadTimeDays: 45, lastInvoiceDate: "2026-02-28", lastInvoiceNumber: "INV-43321" },
  { sku: "Jarlid100", name: "Jar Lid 53mm CR Black", category: PACKAGING, subcategory: "Lid", unit: "EA", currentInventory: 96400, onOrder: 0, averageDailyUsage: 720, costPerUnit: 0.14, leadTimeDays: 30, lastInvoiceDate: "2026-03-21", lastInvoiceNumber: "INV-43788" },
  { sku: "Jarlid108", name: "Jar Lid 63mm CR Black", category: PACKAGING, subcategory: "Lid", unit: "EA", currentInventory: 12800, onOrder: 0, averageDailyUsage: 410, costPerUnit: 0.17, leadTimeDays: 30, lastInvoiceDate: "2026-03-21", lastInvoiceNumber: "INV-43788" },
  { sku: "Jarlid112", name: "Jar Lid 70mm CR Black", category: PACKAGING, subcategory: "Lid", unit: "EA", currentInventory: 28800, onOrder: 0, averageDailyUsage: 290, costPerUnit: 0.19, leadTimeDays: 30, lastInvoiceDate: "2026-03-21", lastInvoiceNumber: "INV-43788" },

  // --- Cartridge SKUs ---
  { sku: "Cartridge101", name: "Vape Cartridge 0.5g CCELL", category: PROCESSING, subcategory: "Vape Cartridge", unit: "EA", currentInventory: 24800, onOrder: 10000, averageDailyUsage: 540, costPerUnit: 1.95, leadTimeDays: 45, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },
  { sku: "Cartridge102", name: "Vape Cartridge 1g CCELL", category: PROCESSING, subcategory: "Vape Cartridge", unit: "EA", currentInventory: 8200, onOrder: 0, averageDailyUsage: 480, costPerUnit: 2.40, leadTimeDays: 45, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },
  { sku: "Cartridge103", name: "Vape Cartridge 1g Ceramic", category: PROCESSING, subcategory: "Vape Cartridge", unit: "EA", currentInventory: 5600, onOrder: 0, averageDailyUsage: 380, costPerUnit: 3.10, leadTimeDays: 45, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },
  { sku: "Cartridge104", name: "Vape Cartridge AIO Disposable", category: PROCESSING, subcategory: "Vape Cartridge", unit: "EA", currentInventory: 16200, onOrder: 0, averageDailyUsage: 290, costPerUnit: 4.50, leadTimeDays: 60, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },
  { sku: "Cartridge105", name: "Vape Cartridge 0.3g Mini", category: PROCESSING, subcategory: "Vape Cartridge", unit: "EA", currentInventory: 41200, onOrder: 0, averageDailyUsage: 220, costPerUnit: 1.55, leadTimeDays: 45, lastInvoiceDate: "2026-04-12", lastInvoiceNumber: "INV-44182" },

  // --- Finished goods (50 unit / pre-roll style) ---
  { sku: "50BLACKBERRY", name: "Blackberry Kush 50ct Pre-Roll Box", category: PROPAGATION, subcategory: "Finished Goods", unit: "EA", currentInventory: 980, onOrder: 0, averageDailyUsage: 14, costPerUnit: 1.20, leadTimeDays: 21, lastInvoiceDate: "2026-04-01", lastInvoiceNumber: "INV-43912" },
  { sku: "50BLUESLUSH", name: "Blue Slushie 50ct Pre-Roll Box", category: PROPAGATION, subcategory: "Finished Goods", unit: "EA", currentInventory: 240, onOrder: 0, averageDailyUsage: 12, costPerUnit: 1.20, leadTimeDays: 21, lastInvoiceDate: "2026-04-01", lastInvoiceNumber: "INV-43912" },
  { sku: "50GUSHERS", name: "Gushers 50ct Pre-Roll Box", category: PROPAGATION, subcategory: "Finished Goods", unit: "EA", currentInventory: 1820, onOrder: 0, averageDailyUsage: 18, costPerUnit: 1.20, leadTimeDays: 21, lastInvoiceDate: "2026-04-01", lastInvoiceNumber: "INV-43912" },
  { sku: "50OGKUSH", name: "OG Kush 50ct Pre-Roll Box", category: PROPAGATION, subcategory: "Finished Goods", unit: "EA", currentInventory: 4200, onOrder: 0, averageDailyUsage: 22, costPerUnit: 1.20, leadTimeDays: 21, lastInvoiceDate: "2026-04-01", lastInvoiceNumber: "INV-43912" },

  // --- Grow / propagation supplies ---
  { sku: "GROW-CLONE-72", name: "Clone Tray 72-Cell", category: GROW, subcategory: "Tray", unit: "EA", currentInventory: 880, onOrder: 0, averageDailyUsage: 12, costPerUnit: 3.40, leadTimeDays: 21, lastInvoiceDate: "2026-03-08", lastInvoiceNumber: "INV-43522" }
];

export const mockInventory: InventorySku[] = enrichInventory(RAW);

// Build 90 days of usage history. Sum daily burn across all SKUs with a
// realistic dip on Sundays and a slow upward drift over time.
export function buildMockUsageHistory(daysBack = 90): UsageHistoryPoint[] {
  const baseDaily = mockInventory.reduce((sum, s) => sum + s.averageDailyUsage, 0);
  const baseValue = mockInventory.reduce((sum, s) => sum + s.averageDailyUsage * s.costPerUnit, 0);

  const points: UsageHistoryPoint[] = [];
  const today = new Date();
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dow = d.getDay();
    // Slight weekly cycle (Sat/Sun lower) and a deterministic noise term.
    const weekly = dow === 0 ? 0.62 : dow === 6 ? 0.78 : 1.0;
    const drift = 1 + (daysBack - i) * 0.0015;
    const noise = 0.92 + (Math.sin(i * 1.7) + 1) * 0.08;
    const factor = weekly * drift * noise;
    points.push({
      date: d.toISOString().slice(0, 10),
      totalUsage: Math.round(baseDaily * factor),
      totalValue: Number((baseValue * factor).toFixed(2))
    });
  }
  return points;
}

export const mockUsageHistory = buildMockUsageHistory();
