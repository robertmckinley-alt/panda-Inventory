"use client";

import { useState } from "react";
import { RefreshCw, Download, Send } from "lucide-react";

export function HeaderActions() {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState<string | null>(null);

  async function onSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setSynced(`Synced ${data.snapshot?.inventory?.length ?? 0} SKUs`);
        setTimeout(() => window.location.reload(), 600);
      } else {
        setSynced(`Sync failed (${res.status})`);
      }
    } catch (e) {
      setSynced("Sync error");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {synced ? (
        <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
          {synced}
        </span>
      ) : null}
      <a
        href="/api/export?filter=critical"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-2 rounded-md transition"
        style={{
          background: "transparent",
          color: "var(--accent)",
          border: "1px solid var(--accent)"
        }}
      >
        <Download className="w-3.5 h-3.5" />
        Export critical
      </a>
      <button
        onClick={onSync}
        disabled={syncing}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-2 rounded-md transition disabled:opacity-60"
        style={{ background: "var(--accent)", color: "var(--on-accent)" }}
      >
        <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Syncing..." : "Sync now"}
      </button>
    </div>
  );
}

export function SendAlertsButton() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function onSend() {
    setSending(true);
    try {
      const res = await fetch("/api/alerts", { method: "POST" });
      const data = await res.json();
      setResult(data.emailResult?.sent ? "Alerts dispatched" : data.emailResult?.reason ?? "Done");
    } catch (e) {
      setResult("Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {result ? (
        <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
          {result}
        </span>
      ) : null}
      <button
        onClick={onSend}
        disabled={sending}
        title="Sends to: tylerm@growopfarms.com, doviatt@growopfarms.com, charles@finishedgoods.com, luke@finishedgoods.com"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-2 rounded-md transition disabled:opacity-60"
        style={{ background: "var(--accent)", color: "var(--on-accent)" }}
      >
        <Send className="w-3.5 h-3.5" />
        {sending ? "Sending..." : "Send email alerts"}
      </button>
    </div>
  );
}
