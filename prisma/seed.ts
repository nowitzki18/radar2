import { PrismaClient } from '@prisma/client'
import { subDays, subHours } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.metric.deleteMany()
  await prisma.alert.deleteMany()
  await prisma.campaignSettings.deleteMany()
  await prisma.alertRule.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.globalSettings.deleteMany()

  // Create global settings
  await prisma.globalSettings.create({
    data: {
      slackEnabled: false,
      emailEnabled: false,
      inAppEnabled: true,
    },
  })

  // Create campaigns
  const campaigns = await Promise.all([
    prisma.campaign.create({
      data: {
        name: 'Summer Sale 2024',
        status: 'active',
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Black Friday Promo',
        status: 'active',
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Holiday Campaign',
        status: 'active',
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'New Product Launch',
        status: 'paused',
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Brand Awareness',
        status: 'active',
      },
    }),
  ])

  // Create campaign settings
  for (const campaign of campaigns) {
    await prisma.campaignSettings.create({
      data: {
        campaignId: campaign.id,
        ctrSensitivity: 0.2,
        cpcSensitivity: 0.2,
        roasSensitivity: 0.2,
        conversionSensitivity: 0.2,
        bounceSensitivity: 0.2,
        spendSensitivity: 0.2,
      },
    })
  }

  // Generate metrics with anomalies
  const now = new Date()
  const metrics: any[] = []
  const alerts: any[] = []

  for (const campaign of campaigns) {
    // Generate 30 days of hourly data
    for (let day = 0; day < 30; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = subDays(subHours(now, hour), day)
        
        // Base values with some variation
        const baseCtr = 2.5 + Math.random() * 1.5
        const baseCpc = 0.5 + Math.random() * 0.3
        const baseRoas = 3.0 + Math.random() * 1.5
        const baseConversions = Math.floor(10 + Math.random() * 20)
        const baseBounce = 30 + Math.random() * 20
        const baseSpend = 100 + Math.random() * 200

        // Introduce anomalies randomly (10% chance)
        const isAnomaly = Math.random() < 0.1
        let anomalyType: string | null = null
        let ctr = baseCtr
        let cpc = baseCpc
        let roas = baseRoas
        let conversions = baseConversions
        let bounceRate = baseBounce
        let spend = baseSpend

        if (isAnomaly) {
          const anomalyKind = Math.floor(Math.random() * 6)
          switch (anomalyKind) {
            case 0: // Low CTR
              ctr = baseCtr * 0.3
              anomalyType = 'ctr_low'
              break
            case 1: // High CPC
              cpc = baseCpc * 2.5
              anomalyType = 'cpc_high'
              break
            case 2: // Low ROAS
              roas = baseRoas * 0.4
              anomalyType = 'roas_low'
              break
            case 3: // Low conversions
              conversions = Math.floor(baseConversions * 0.2)
              anomalyType = 'conversions_low'
              break
            case 4: // High bounce
              bounceRate = baseBounce * 1.8
              anomalyType = 'bounce_high'
              break
            case 5: // High spend
              spend = baseSpend * 2.2
              anomalyType = 'spend_high'
              break
          }
        }

        metrics.push({
          campaignId: campaign.id,
          timestamp,
          ctr,
          cpc,
          roas,
          conversions,
          bounceRate,
          spend,
          isAnomaly,
          anomalyType,
        })

        // Create alerts for recent anomalies (last 7 days)
        if (isAnomaly && day < 7) {
          let severity = 'warning'
          let message = ''
          let metric = ''
          let value = 0
          let threshold = 0

          switch (anomalyType) {
            case 'ctr_low':
              severity = 'critical'
              message = `CTR dropped significantly to ${ctr.toFixed(2)}%`
              metric = 'ctr'
              value = ctr
              threshold = baseCtr * 0.7
              break
            case 'cpc_high':
              severity = 'warning'
              message = `CPC increased to $${cpc.toFixed(2)}`
              metric = 'cpc'
              value = cpc
              threshold = baseCpc * 1.5
              break
            case 'roas_low':
              severity = 'critical'
              message = `ROAS dropped to ${roas.toFixed(2)}x`
              metric = 'roas'
              value = roas
              threshold = baseRoas * 0.7
              break
            case 'conversions_low':
              severity = 'warning'
              message = `Conversions dropped to ${conversions}`
              metric = 'conversions'
              value = conversions
              threshold = baseConversions * 0.5
              break
            case 'bounce_high':
              severity = 'info'
              message = `Bounce rate increased to ${bounceRate.toFixed(1)}%`
              metric = 'bounceRate'
              value = bounceRate
              threshold = baseBounce * 1.3
              break
            case 'spend_high':
              severity = 'warning'
              message = `Spend increased to $${spend.toFixed(2)}`
              metric = 'spend'
              value = spend
              threshold = baseSpend * 1.5
              break
          }

          // Randomly set some alerts as resolved or dismissed
          let status = 'open'
          let resolvedAt = null
          let dismissedAt = null
          if (Math.random() < 0.3) {
            status = Math.random() < 0.5 ? 'resolved' : 'dismissed'
            if (status === 'resolved') {
              resolvedAt = new Date(timestamp.getTime() + Math.random() * 86400000)
            } else {
              dismissedAt = new Date(timestamp.getTime() + Math.random() * 86400000)
            }
          }

          alerts.push({
            campaignId: campaign.id,
            severity,
            status,
            metric,
            message,
            value,
            threshold,
            resolvedAt,
            dismissedAt,
            suggestions: JSON.stringify([
              'Review targeting parameters',
              'Check ad creative performance',
              'Consider adjusting bid strategy',
              'Analyze competitor activity',
            ]),
          })
        }
      }
    }
  }

  // Insert metrics in batches
  for (let i = 0; i < metrics.length; i += 100) {
    await prisma.metric.createMany({
      data: metrics.slice(i, i + 100),
    })
  }

  // Insert alerts
  for (const alert of alerts) {
    await prisma.alert.create({
      data: alert,
    })
  }

  // Create some alert rules
  await prisma.alertRule.createMany({
    data: [
      {
        name: 'Low ROAS Alert',
        metric: 'roas',
        operator: 'lt',
        threshold: 1.5,
        severity: 'critical',
        enabled: true,
      },
      {
        name: 'High CPC Alert',
        metric: 'cpc',
        operator: 'gt',
        threshold: 1.0,
        severity: 'warning',
        enabled: true,
      },
      {
        name: 'Low CTR Alert',
        metric: 'ctr',
        operator: 'lt',
        threshold: 1.0,
        severity: 'warning',
        enabled: true,
      },
    ],
  })

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

