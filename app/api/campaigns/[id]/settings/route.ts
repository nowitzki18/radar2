import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let settings = await prisma.campaignSettings.findUnique({
      where: { campaignId: id },
    })

    if (!settings) {
      settings = await prisma.campaignSettings.create({
        data: {
          campaignId: id,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    let settings = await prisma.campaignSettings.findUnique({
      where: { campaignId: id },
    })

    if (settings) {
      settings = await prisma.campaignSettings.update({
        where: { campaignId: id },
        data: body,
      })
    } else {
      settings = await prisma.campaignSettings.create({
        data: {
          campaignId: id,
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

