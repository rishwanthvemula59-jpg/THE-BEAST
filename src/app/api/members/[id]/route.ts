import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID parameter' }, { status: 400 })
    }

    const body = await request.json()
    const { id: _, ...updateData } = body

    const updated = await prisma.member.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}
