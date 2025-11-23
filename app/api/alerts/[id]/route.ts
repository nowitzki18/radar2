import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        campaign: true,
      },
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error fetching alert:', error)
    return NextResponse.json({ error: 'Failed to fetch alert' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, resolvedBy } = body

    const updateData: any = { status }
    if (status === 'resolved') {
      updateData.resolvedAt = new Date()
      updateData.resolvedBy = resolvedBy || 'system'
    } else if (status === 'dismissed') {
      updateData.dismissedAt = new Date()
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}

