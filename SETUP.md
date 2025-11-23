# Quick Setup Guide

## Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. **Seed Database**
   ```bash
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## What Gets Seeded

- **5 Campaigns** with various statuses
- **30 days of hourly metrics** per campaign (720 data points each)
- **Random anomalies** (10% chance) across all metrics
- **Active alerts** for recent anomalies (last 7 days)
- **Default sensitivity settings** for each campaign
- **Sample alert rules** for common scenarios

## Database Location

The SQLite database is created at `prisma/dev.db` after running `npm run db:push`.

## Troubleshooting

### Database Issues
If you encounter database errors:
```bash
# Delete the database and recreate
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Port Already in Use
If port 3000 is in use, Next.js will automatically use the next available port.

### Build Errors
Make sure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Explore the dashboard to see portfolio health scores
2. Click on any campaign to view detailed metrics and charts
3. Check the Alerts page to see all active alerts
4. Configure settings for notifications and alert rules

