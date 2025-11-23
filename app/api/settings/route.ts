import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let settings = await prisma.globalSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: {
          slackEnabled: false,
          emailEnabled: false,
          inAppEnabled: true,
        },
      })
    }

    const rules = await prisma.alertRule.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ settings, rules })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { settings, rules } = body

    let globalSettings = await prisma.globalSettings.findFirst()
    
    if (settings) {
      if (globalSettings) {
        globalSettings = await prisma.globalSettings.update({
          where: { id: globalSettings.id },
          data: settings,
        })
      } else {
        globalSettings = await prisma.globalSettings.create({
          data: settings,
        })
      }
    }

    if (rules) {
      for (const rule of rules) {
        if (rule.id) {
          await prisma.alertRule.update({
            where: { id: rule.id },
            data: rule,
          })
        } else {
          await prisma.alertRule.create({
            data: rule,
          })
        }
      }
    }

    return NextResponse.json({ settings: globalSettings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

