# Packaging Inventory Control System

Production-ready Next.js (App Router) inventory dashboard for packaging SKUs. Pulls daily from a Google Sheet, matches invoice pricing, calculates days-of-cover, dispatches reorder alerts, and renders an executive dashboard.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS · Inter / JetBrains Mono
- Recharts
- `@vercel/kv` (with in-memory fallback) for daily snapshot storage
- `googleapis` for Drive + Sheets ingestion
- `csv-parse` / `csv-stringify`
- Resend for HTML email alerts
- Vercel Cron for daily sync

## Pages

| Path       | Purpose                                                         |
| ---------- | --------------------------------------------------------------- |
| `/`        | KPI dashboard, charts, daily summary, SKU preview table         |
| `/skus`    | Full sortable / filterable / searchable SKU table + CSV export  |
| `/alerts`  | Critical reorder alert cards with one-click "Send email alerts" |

## API

| Method | Path                                | Notes                                                                                         |
| ------ | ----------------------------------- | --------------------------------------------------------------------------------------------- |
| GET    | `/api/sync`                         | Pulls Drive sheet + invoice CSVs, builds cost map, persists snapshot, sends critical alerts. Protected by `CRON_SECRET`. Hit by Vercel Cron daily at 06:00 UTC. |
| POST   | `/api/alerts`                       | Manually re-dispatches the critical alert email                                               |
| GET    | `/api/export?filter=all\|critical\|warning\|healthy` | CSV download of SKUs                                                          |
| GET    | `/api/skus`                         | Returns the latest snapshot JSON                                                              |

## Formulas

```ts
daysRemaining = currentInventory / averageDailyUsage

status = daysRemaining < 90 ? "critical"
       : daysRemaining < 120 ? "warning"
       : "healthy"

recommendedReorderQty = max(
  0,
  ceil(averageDailyUsage * (TARGET_DAYS + leadTimeDays) - (currentInventory + onOrder))
)
```

`TARGET_DAYS` defaults to 120 and is overridable via env.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The dashboard renders against seeded mock SKUs out of the box. Drop in real Google + Resend + KV credentials and the same routes start serving live data.

## Required env

```
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY    # \n-escaped
DRIVE_INVENTORY_FILE_ID               # the master spreadsheet
DRIVE_INVOICE_FOLDER_ID               # folder of invoice CSVs

EMAIL_PROVIDER                        # "resend" (default) or "gmail"
RESEND_API_KEY                        # if EMAIL_PROVIDER=resend
GMAIL_USER                            # if EMAIL_PROVIDER=gmail
GMAIL_APP_PASSWORD                    # if Gmail App Password auth
GMAIL_CLIENT_ID                       # if Gmail OAuth2 (preferred when present)
GMAIL_CLIENT_SECRET
GMAIL_REFRESH_TOKEN
ALERT_FROM_EMAIL                      # defaults to GMAIL_USER for Gmail
ALERT_TO_EMAILS                       # comma-separated; defaults to the four team addresses

CRON_SECRET
KV_REST_API_URL
KV_REST_API_TOKEN
TARGET_DAYS=120
```

### Default alert recipients

If `ALERT_TO_EMAILS` is unset, the system sends to the four team defaults hardcoded in `lib/email.ts`:

- tylerm@growopfarms.com
- doviatt@growopfarms.com
- charles@finishedgoods.com
- luke@finishedgoods.com

## Email providers

The transport is selected by `EMAIL_PROVIDER`. Resend remains fully working as a fallback.

### Gmail — App Password (simplest)

1. The sending account must have **2-Step Verification** enabled. Go to Google Account → Security → 2-Step Verification → turn on.
2. On the same Security page, open **App passwords**, generate one for "Mail / Other (Inventory Alerts)", and copy the 16-character code.
3. Set env vars:
   ```
   EMAIL_PROVIDER=gmail
   GMAIL_USER=alerts@growopfarms.com
   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
   ALERT_FROM_EMAIL=alerts@growopfarms.com   # optional; defaults to GMAIL_USER
   ```

### Gmail — OAuth2 (preferred for production)

If `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, and `GMAIL_REFRESH_TOKEN` are all set, OAuth2 is used and the App Password is ignored.

1. In **Google Cloud Console**, create or select a project.
2. Enable the Gmail API.
3. Create an **OAuth 2.0 Client ID** (Application type: Web application). Add `https://developers.google.com/oauthplayground` as an authorized redirect URI for issuing the refresh token.
4. In the OAuth consent screen, add the scope `https://mail.google.com/`.
5. Use the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) with your client ID/secret to grant the scope and exchange for a refresh token.
6. Set env vars:
   ```
   EMAIL_PROVIDER=gmail
   GMAIL_USER=alerts@growopfarms.com
   GMAIL_CLIENT_ID=...
   GMAIL_CLIENT_SECRET=...
   GMAIL_REFRESH_TOKEN=...
   ```

### Workspace domain sending

To send `From: alerts@growopfarms.com` (or any other address on a Google Workspace domain), the Workspace admin must either (a) make that mailbox a real Workspace user, or (b) explicitly allow that sender as an alias / approved sender on the authenticating account. Without one of those, Gmail will rewrite the From header to the authenticating mailbox.

### Resend (fallback)

```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxx
ALERT_FROM_EMAIL=alerts@yourdomain.com   # must be on a verified Resend domain
```

Share the Sheet and invoice folder with the service account email (Viewer access).

## Cron

`vercel.json` hits `/api/sync` daily at `0 6 * * *`. Configure `CRON_SECRET` in Vercel and the project will reject any other caller.

## Deploy

1. Push to GitHub.
2. Import in Vercel.
3. Add the env vars above.
4. Deploy. Cron + alerts go live immediately.
