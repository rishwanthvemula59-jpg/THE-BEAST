import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const messages = await prisma.messageAlert.findMany({
      orderBy: { id: 'desc' }
    })
    return NextResponse.json({ data: messages })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages outbox logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, type, recipient } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and Content are required' }, { status: 400 })
    }

    const dateStr = new Date().toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

    const newMessage = await prisma.messageAlert.create({
      data: {
        title,
        content,
        type: type || 'announcement',
        recipient: recipient || 'All Members',
        date: dateStr
      }
    })

    return NextResponse.json({ data: newMessage }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log notification message' }, { status: 500 })
  }
}
