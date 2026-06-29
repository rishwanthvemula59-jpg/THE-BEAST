import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const attendance = await prisma.attendance.findMany({
      orderBy: { id: 'desc' }
    })
    return NextResponse.json({ data: attendance })
  } catch (error: any) {
    console.error('Failed to fetch attendance:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch attendance logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId } = body

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const todayStr = new Date().toISOString().split('T')[0]
    
    // Check if already checked in today
    const existing = await prisma.attendance.findFirst({
      where: {
        memberId,
        date: todayStr
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Member already checked in today' }, { status: 400 })
    }

    const timeStr = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    })

    const record = await prisma.attendance.create({
      data: {
        memberId,
        memberName: member.name,
        date: todayStr,
        time: timeStr,
        status: 'present'
      }
    })

    return NextResponse.json({ data: record }, { status: 201 })
  } catch (error: any) {
    console.error('Failed to log attendance check-in:', error)
    return NextResponse.json({ error: error.message || 'Failed to log attendance check-in' }, { status: 500 })
  }
}
