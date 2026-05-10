import { mockInventory, mockUsageHistory } from "@/lib/mock-data";
import { buildSnapshot } from "@/lib/inventory-engine";
import { getLatestSnapshot } from "@/lib/storage";
import { InventoryTable } from "@/components/InventoryTable";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function SkusPage() {
  const stored = await getLatestSnapshot().catch(() => null);
  const snapshot = stored ?? buildSnapshot(mockInventory, mockUsageHistory, []);

  return (
    <main className="px-6 lg:px-10 py-6 lg:py-8 max-w-[1480px] mx-auto">
      <PageHeader
        eyebrow="Inventory"
        title="All SKUs"
        subtitle={`${snapshot.inventory.length} packaging SKUs · last synced ${new Date(snapshot.generatedAt).toLocaleString()}`}
      />
      <div className="mt-6">
        <InventoryTable inventory={snapshot.inventory} />
      </div>
    </main>
  );
}
