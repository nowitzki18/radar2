import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        _count: {
          select: {
            alerts: {
              where: {
                status: 'open',
              },
            },
          },
        },
        alerts: {
          where: {
            status: 'open',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate health scores
    const campaignsWithScores = campaigns.map((campaign) => {
      const criticalAlerts = campaign.alerts.filter((a) => a.severity === 'critical').length
      const warningAlerts = campaign.alerts.filter((a) => a.severity === 'warning').length
      const infoAlerts = campaign.alerts.filter((a) => a.severity === 'info').length

      // Health score: 100 - (critical * 20 + warning * 10 + info * 5)
      const healthScore = Math.max(
        0,
        100 - criticalAlerts * 20 - warningAlerts * 10 - infoAlerts * 5
      )

      return {
        ...campaign,
        healthScore,
        alertCount: campaign._count.alerts,
        latestAlert: campaign.alerts[0] || null,
      }
    })

    return NextResponse.json(campaignsWithScores)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}

