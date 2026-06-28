import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { id: 'asc' }
    })
    return NextResponse.json({ data: members })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, status, membershipType, expiryDate } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 })
    }

    // Check if email already registered
    const existing = await prisma.member.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const joinDate = new Date().toISOString().split('T')[0]

    const newMember = await prisma.member.create({
      data: {
        name,
        email,
        phone: phone || '',
        status: status || 'active',
        joinDate,
        expiryDate: expiryDate || '',
        membershipType: membershipType || 'Monthly'
      }
    })

    return NextResponse.json({ data: newMember }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
  }
}
