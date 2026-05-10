import { google, drive_v3, sheets_v4 } from "googleapis";
import { parse } from "csv-parse/sync";

/**
 * Google Drive + Sheets ingestion.
 *
 * Setup:
 *   1. Create a Google Cloud service account and download the JSON key.
 *   2. Share the inventory Sheet (DRIVE_INVENTORY_FILE_ID) and the invoice
 *      folder (DRIVE_INVOICE_FOLDER_ID) with the service account email
 *      (Viewer access is sufficient).
 *   3. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
 *      in Vercel. Newlines in the private key must be escaped as \n.
 */

function buildAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google service account credentials.");
  }
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/spreadsheets.readonly"
    ]
  });
}

export function getDriveClient(): drive_v3.Drive {
  return google.drive({ version: "v3", auth: buildAuth() });
}

export function getSheetsClient(): sheets_v4.Sheets {
  return google.sheets({ version: "v4", auth: buildAuth() });
}

export type InventoryRow = {
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  unit: "EA" | "CS";
  currentInventory: number;
  onOrder: number;
  averageDailyUsage: number;
  leadTimeDays: number;
};

/**
 * Pull rows from the "Finished Goods Reorder Report WIP" sheet plus the
 * "90 Burn Rate" sheet, then merge the daily burn rate column.
 */
export async function fetchInventoryFromSheet(): Promise<InventoryRow[]> {
  const fileId = process.env.DRIVE_INVENTORY_FILE_ID;
  if (!fileId) throw new Error("Missing DRIVE_INVENTORY_FILE_ID.");
  const sheets = getSheetsClient();

  const [reorderRes, burnRes] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId: fileId,
      range: "'Finished Goods Reorder Report WIP'!A1:Z2000"
    }),
    sheets.spreadsheets.values.get({
      spreadsheetId: fileId,
      range: "'90 Burn Rate'!A1:Z2000"
    })
  ]);

  const reorderRows = reorderRes.data.values ?? [];
  const burnRows = burnRes.data.values ?? [];
  if (!reorderRows.length) return [];

  const reorderHeader = reorderRows[0].map((h) => String(h).trim().toLowerCase());
  const burnHeader = burnRows[0]?.map((h) => String(h).trim().toLowerCase()) ?? [];

  const idx = (header: string[], ...candidates: string[]) => {
    for (const c of candidates) {
      const i = header.findIndex((h) => h === c.toLowerCase());
      if (i >= 0) return i;
    }
    return -1;
  };

  const rIdx = {
    sku: idx(reorderHeader, "item code", "sku"),
    name: idx(reorderHeader, "description", "name"),
    cat: idx(reorderHeader, "category-a", "department", "category"),
    subcat: idx(reorderHeader, "category-b", "subcategory"),
    unit: idx(reorderHeader, "unit", "uom"),
    inStock: idx(reorderHeader, "in-stock", "in stock", "on hand"),
    reserved: idx(reorderHeader, "reserved"),
    onOrder: idx(reorderHeader, "on order", "on-order"),
    leadTime: idx(reorderHeader, "lead time", "lead time days")
  };

  const burnMap = new Map<string, number>();
  if (burnRows.length) {
    const skuI = idx(burnHeader, "item code", "sku");
    const burnI = idx(burnHeader, "daily burn rate", "burn rate");
    for (let i = 1; i < burnRows.length; i++) {
      const row = burnRows[i];
      const sku = String(row[skuI] ?? "").trim();
      const rate = parseNumber(row[burnI]);
      if (sku) burnMap.set(sku.toUpperCase(), rate);
    }
  }

  const rows: InventoryRow[] = [];
  for (let i = 1; i < reorderRows.length; i++) {
    const row = reorderRows[i];
    const sku = String(row[rIdx.sku] ?? "").trim();
    if (!sku) continue;
    const inStock = parseNumber(row[rIdx.inStock]);
    const reserved = parseNumber(row[rIdx.reserved]);
    rows.push({
      sku,
      name: String(row[rIdx.name] ?? "").trim(),
      category: String(row[rIdx.cat] ?? "").trim() || "UNCATEGORIZED",
      subcategory: String(row[rIdx.subcat] ?? "").trim(),
      unit: ((row[rIdx.unit] ?? "EA") as string).toUpperCase().includes("CS") ? "CS" : "EA",
      currentInventory: Math.max(0, inStock - reserved),
      onOrder: parseNumber(row[rIdx.onOrder]),
      averageDailyUsage: burnMap.get(sku.toUpperCase()) ?? 0,
      leadTimeDays: rIdx.leadTime >= 0 ? parseNumber(row[rIdx.leadTime]) || 30 : 30
    });
  }
  return rows;
}

export type InvoiceCostEntry = {
  sku: string;
  costPerUnit: number;
  invoiceDate: string;
  invoiceNumber: string;
};

/**
 * Walk the invoice folder, parse every CSV, and return the LATEST cost per
 * SKU keyed by sku (uppercased).
 */
export async function fetchInvoiceCostMap(): Promise<Map<string, InvoiceCostEntry>> {
  const folderId = process.env.DRIVE_INVOICE_FOLDER_ID;
  if (!folderId) throw new Error("Missing DRIVE_INVOICE_FOLDER_ID.");
  const drive = getDriveClient();

  const list = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false and (mimeType='text/csv' or name contains '.csv')`,
    fields: "files(id, name, modifiedTime)",
    orderBy: "modifiedTime desc",
    pageSize: 200
  });

  const costMap = new Map<string, InvoiceCostEntry>();
  for (const file of list.data.files ?? []) {
    if (!file.id) continue;
    try {
      const res = await drive.files.get(
        { fileId: file.id, alt: "media" },
        { responseType: "text" }
      );
      const text = typeof res.data === "string" ? res.data : "";
      const records = parse(text, { columns: true, skip_empty_lines: true, trim: true });
      const invoiceDate = file.modifiedTime?.slice(0, 10) ?? "";
      const invoiceNumber = (file.name ?? "").replace(/\.csv$/i, "");
      for (const row of records as Record<string, string>[]) {
        const sku = (row["Item Code"] ?? row["SKU"] ?? row["item code"] ?? "").toString().trim();
        if (!sku) continue;
        const cost = parseNumber(row["Unit Cost"] ?? row["Cost"] ?? row["unit cost"]);
        if (!cost) continue;
        const key = sku.toUpperCase();
        const existing = costMap.get(key);
        if (!existing || (existing.invoiceDate < invoiceDate)) {
          costMap.set(key, { sku, costPerUnit: cost, invoiceDate, invoiceNumber });
        }
      }
    } catch (err) {
      console.warn("Failed to parse invoice", file.name, err);
    }
  }
  return costMap;
}

function parseNumber(input: unknown): number {
  if (input == null) return 0;
  const s = String(input).replace(/[,$\s]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
