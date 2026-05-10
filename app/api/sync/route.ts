import { NextRequest, NextResponse } from "next/server";
import { runDailySync } from "@/lib/sync";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await runDailySync();
    return NextResponse.json({
      ok: true,
      source: result.source,
      newlyCritical: result.newlyCritical,
      emailResult: result.emailResult,
      snapshot: {
        date: result.snapshot.date,
        generatedAt: result.snapshot.generatedAt,
        inventory: result.snapshot.inventory,
        summary: result.snapshot.summary
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Sync failed" },
      { status: 500 }
    );
  }
}
