import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    let settings = await prisma.campaignSettings.findUnique({
      where: { campaignId: params.id },
    })

    if (!settings) {
      settings = await prisma.campaignSettings.create({
        data: {
          campaignId: params.id,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching campaign settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    let settings = await prisma.campaignSettings.findUnique({
      where: { campaignId: params.id },
    })

    if (settings) {
      settings = await prisma.campaignSettings.update({
        where: { campaignId: params.id },
        data: body,
      })
    } else {
      settings = await prisma.campaignSettings.create({
        data: {
          campaignId: params.id,
          ...body,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating campaign settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

