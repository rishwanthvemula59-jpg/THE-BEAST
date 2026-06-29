import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 1 }
    })

    if (!settings) {
      // Create defaults if not found
      settings = await prisma.settings.create({
        data: {
          id: 1,
          gymName: "The Fitness Gym",
          email: "support@fitnessgym.com",
          phone: "+1 (555) 999-8888",
          address: "123 Main St, New York, NY"
        }
      })
    }

    return NextResponse.json({ data: settings })
  } catch (error: any) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gymName, email, phone, address } = body

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        gymName,
        email,
        phone,
        address
      },
      create: {
        id: 1,
        gymName: gymName || "The Fitness Gym",
        email: email || "support@fitnessgym.com",
        phone: phone || "+1 (555) 999-8888",
        address: address || "123 Main St, New York, NY"
      }
    })

    return NextResponse.json({ data: settings })
  } catch (error: any) {
    console.error('Failed to save settings:', error)
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 })
  }
}
