import { NextResponse } from 'next/server'

export async function GET() {
  const dashboardData = {
    stats: {
      totalMembers: 1248,
      classesToday: 8,
      revenue: 24850,
      memberGrowth: 18,
    },
    revenueData: [
      { month: 'Jan', revenue: 4000, members: 240 },
      { month: 'Feb', revenue: 3000, members: 221 },
      { month: 'Mar', revenue: 2000, members: 229 },
      { month: 'Apr', revenue: 2780, members: 200 },
      { month: 'May', revenue: 1890, members: 229 },
      { month: 'Jun', revenue: 2390, members: 200 },
      { month: 'Jul', revenue: 3490, members: 210 },
    ],
    membersStatus: {
      active: 948,
      inactive: 180,
      trial: 120,
    },
  }

  return NextResponse.json(dashboardData)
}
