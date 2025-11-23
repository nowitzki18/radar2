import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      where: {
        status: 'open',
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alert feed:', error)
    return NextResponse.json({ error: 'Failed to fetch alert feed' }, { status: 500 })
  }
}

