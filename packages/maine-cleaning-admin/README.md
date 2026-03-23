# Maine Cleaning Admin Dashboard

Full-featured admin dashboard for **The Maine Cleaning Company**.

## Features

| Feature | Description |
|---|---|
| **Intake Requests** | Receives form submissions from WW.MaineCleaning.Company via webhook |
| **Quote Builder** | Create & send quotes via Email and/or SMS with line-item pricing |
| **Client Management** | Track all clients with history, notes, and frequency |
| **Schedule / Calendar** | Week-view calendar + list view for all jobs |
| **Templates** | Reusable email/SMS templates with variable interpolation |
| **Automations** | No-code workflow builder (e.g. "on intake received → send welcome email") |
| **Integrations** | Google Calendar, Square, ConnectTeam, Twilio, SendGrid |

## Integrations

### Google Calendar
- Auto-create calendar events when jobs are scheduled
- Sync updates & cancellations
- **Setup:** Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com)

### Square
- Create quotes as Square Estimates
- Auto-generate invoices from completed jobs
- Accept online payments via Square
- Square Payroll for cleaner wages
- **Setup:** Get API key at [Square Developer Dashboard](https://developer.squareup.com)

### ConnectTeam
- Push jobs as shifts to your cleaning crew
- Cleaners view schedule, clock in/out, and complete jobs in the app
- **Setup:** Get API key from ConnectTeam Settings → Integrations → API

### Email (SendGrid / SMTP)
- Welcome emails, quote delivery, reminders, invoices
- Fully templated with variable substitution

### SMS (Twilio)
- Quote notifications, appointment reminders, payment links
- **Setup:** Get credentials at [Twilio Console](https://console.twilio.com)

## Quick Start

```bash
cd packages/maine-cleaning-admin

# 1. Copy env file
cp .env.example .env
# Edit .env with your credentials

# 2. Install dependencies
yarn install

# 3. Set up database
npx prisma db push
npx prisma db seed

# 4. Run development server
yarn dev
# Opens at http://localhost:3100
```

## Receiving Intake Requests

Configure your website (WW.MaineCleaning.Company) to POST to:

```
POST https://your-domain/api/intake
Headers:
  Content-Type: application/json
  X-Webhook-Secret: <INTAKE_WEBHOOK_SECRET>

Body:
{
  "firstName": "Emily",
  "lastName": "Watson",
  "email": "emily@example.com",
  "phone": "(207) 555-0123",
  "address": "88 Ocean Avenue",
  "city": "Bar Harbor",
  "state": "ME",
  "zip": "04609",
  "serviceType": "deep",      // standard | deep | move-in-out | commercial
  "frequency": "one-time",    // one-time | weekly | bi-weekly | monthly
  "bedrooms": 3,
  "bathrooms": 2,
  "sqft": 1800,
  "preferredDate": "2024-04-01",
  "notes": "Moving in next month"
}
```

## Environment Variables

See [.env.example](.env.example) for all required variables.

## Database

Uses SQLite by default (swap `DATABASE_URL` to PostgreSQL for production):

```bash
# Reset and seed
npx prisma db push --force-reset
npx prisma db seed

# View data
npx prisma studio
```
