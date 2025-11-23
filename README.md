# Ad Performance Radar

A full-stack, deployable web application for campaign-agnostic ad performance anomaly alerting system built with Next.js, TypeScript, TailwindCSS, and Prisma + SQLite.

## Features

- **Dashboard**: Portfolio-level health scores, campaign cards, and live alert feed
- **Campaign Details**: Time-series charts for CTR, CPC, ROAS, conversions, bounce rate, and spend with anomaly indicators
- **Alerts Management**: Filterable alert log with detail view and resolution workflow
- **Settings**: Notification toggles (Slack, Email, In-App), sensitivity controls, and manual alert rules
- **AI Suggestions**: Rule-based suggestions engine mapped to anomaly patterns

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Prisma + SQLite
- **Charts**: Recharts
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npm run db:generate
npm run db:push
```

3. Seed the database with dummy data:
```bash
npm run db:seed
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── campaign/[id]/    # Campaign detail page
│   ├── alerts/           # Alerts page
│   ├── dashboard/        # Dashboard page
│   ├── settings/         # Settings page
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
├── lib/                  # Utilities and Prisma client
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── public/               # Static assets
```

## Database Schema

- **Campaign**: Campaign information
- **Metric**: Time-series performance metrics with anomaly flags
- **Alert**: Generated alerts with severity and status
- **CampaignSettings**: Per-campaign sensitivity settings
- **GlobalSettings**: Global notification settings
- **AlertRule**: Custom alert rules

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and configure the build
4. The SQLite database will be created on first run
5. Run the seed script after deployment (or set up a migration)

Note: For production, consider using a managed database like PostgreSQL instead of SQLite.

## Features in Detail

### Health Scores
Calculated based on active alert count and severity:
- Critical alerts: -20 points each
- Warning alerts: -10 points each
- Info alerts: -5 points each
- Score range: 0-100

### Anomaly Detection
The seed script generates anomalies randomly (10% chance) across different metric types:
- Low CTR
- High CPC
- Low ROAS
- Low conversions
- High bounce rate
- High spend

### Alert Resolution
Alerts can be:
- **Open**: Active and unresolved
- **Resolved**: Manually marked as fixed
- **Dismissed**: Manually dismissed

## License

MIT

