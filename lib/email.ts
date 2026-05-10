import type { InventorySku } from "./types";

const DEFAULT_RECIPIENTS = [
  "tylerm@growopfarms.com",
  "doviatt@growopfarms.com",
  "charles@finishedgoods.com",
  "luke@finishedgoods.com"
];

export const ALERT_RECIPIENTS_DEFAULT = DEFAULT_RECIPIENTS;

function resolveRecipients() {
  const raw = process.env.ALERT_TO_EMAILS;
  if (!raw) return [...DEFAULT_RECIPIENTS];
  const list = raw.split(",").map((x) => x.trim()).filter(Boolean);
  return list.length ? list : [...DEFAULT_RECIPIENTS];
}

function urgencyEmoji(days: number) {
  if (days < 30) return "🔴";
  if (days < 60) return "🟠";
  return "🟡";
}

function buildHtml(skus: InventorySku[]) {
  const rows = skus
    .map((s) => {
      const reorder = s.recommendedReorderQty.toLocaleString();
      const value = `$${s.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      const onHand = s.currentInventory.toLocaleString();
      return `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#0f172a">${s.sku}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#0f172a">${s.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;color:#0f172a;font-variant-numeric:tabular-nums">${s.daysRemaining.toFixed(1)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;color:#0f172a;font-variant-numeric:tabular-nums">${onHand}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;color:#0f172a;font-variant-numeric:tabular-nums">${reorder}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;color:#0f172a;font-variant-numeric:tabular-nums">${value}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;text-align:center">${urgencyEmoji(s.daysRemaining)}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
  <html><body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a">
    <div style="max-width:760px;margin:0 auto;padding:32px 24px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <div style="width:8px;height:8px;border-radius:999px;background:#ef4444"></div>
        <span style="font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#991b1b">Reorder alert</span>
      </div>
      <h1 style="margin:0 0 6px 0;font-size:22px;color:#0f172a">${skus.length} SKU${skus.length === 1 ? "" : "s"} below 90 days of cover</h1>
      <p style="margin:0 0 24px 0;font-size:14px;color:#475569">Generated ${new Date().toLocaleString()}. Recommended reorder quantities target 120 days plus lead time.</p>

      <table cellpadding="0" cellspacing="0" style="width:100%;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;border-collapse:separate;overflow:hidden">
        <thead>
          <tr style="background:#f1f5f9">
            <th align="left" style="padding:10px 12px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#475569">SKU</th>
            <th align="left" style="padding:10px 12px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#475569">Description</th>
            <th align="right" style="padding:10px 12px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#475569">Days left</th>
            <th align="right" style="padding:10px 12px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#475569">On hand</th>
            <th align="right" style="padding:10px 12px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#475569">Reorder PO</th>
            <th align="right" style="padding:10px 12px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#475569">Value on hand</th>
            <th align="center" style="padding:10px 12px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#475569">Urgency</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <p style="margin:24px 0 0 0;font-size:12px;color:#64748b">This message was generated automatically by the Packaging Inventory Control System.</p>
    </div>
  </body></html>`;
}

type SendArgs = { from: string; to: string[]; subject: string; html: string };

async function sendViaResend(args: SendArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY missing." };
  }
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const result = await resend.emails.send(args);
  return { sent: true, provider: "resend" as const, result };
}

async function sendViaGmail(args: SendArgs) {
  const user = process.env.GMAIL_USER;
  if (!user) return { sent: false, reason: "GMAIL_USER missing." };

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const appPassword = process.env.GMAIL_APP_PASSWORD;

  // Prefer OAuth2 if its env vars are present; fall back to App Password.
  const useOAuth2 = Boolean(clientId && clientSecret && refreshToken);
  if (!useOAuth2 && !appPassword) {
    return {
      sent: false,
      reason:
        "Gmail provider selected but no auth credentials found. Set GMAIL_APP_PASSWORD, or GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET + GMAIL_REFRESH_TOKEN."
    };
  }

  const nodemailer = await import("nodemailer");

  const auth = useOAuth2
    ? {
        type: "OAuth2" as const,
        user,
        clientId: clientId!,
        clientSecret: clientSecret!,
        refreshToken: refreshToken!
      }
    : { user, pass: appPassword! };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: auth as never
  });

  const result = await transporter.sendMail({
    from: args.from,
    to: args.to.join(", "),
    subject: args.subject,
    html: args.html
  });

  return { sent: true, provider: "gmail" as const, result: { id: result.messageId, accepted: result.accepted } };
}

export async function sendReorderAlerts(criticalSkus: InventorySku[]) {
  if (!criticalSkus.length) {
    return { sent: false, reason: "No SKUs below the 90-day threshold." };
  }

  const provider = (process.env.EMAIL_PROVIDER || "gmail").toLowerCase();
  const to = resolveRecipients();
  const from =
    process.env.ALERT_FROM_EMAIL ||
    (provider === "gmail" ? process.env.GMAIL_USER : undefined);

  if (!from) {
    return {
      sent: false,
      reason:
        "No From address. Set ALERT_FROM_EMAIL (or GMAIL_USER when EMAIL_PROVIDER=gmail).",
      preview: { recipients: to, subject: `Packaging Reorder Alert · ${criticalSkus.length} SKU(s) below 90 days` }
    };
  }

  const html = buildHtml(criticalSkus);
  const subject = `Packaging Reorder Alert · ${criticalSkus.length} SKU${criticalSkus.length === 1 ? "" : "s"} below 90 days`;
  const args: SendArgs = { from, to, subject, html };

  try {
    if (provider === "gmail") return await sendViaGmail(args);
    return await sendViaResend(args);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { sent: false, provider, reason: `Email transport error: ${message}` };
  }
}
