'use client'

import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react'

const stats = [
  {
    icon: Users,
    label: 'Total Members',
    value: '1,248',
    change: '+12.5%',
  },
  {
    icon: Activity,
    label: 'Classes Today',
    value: '8',
    change: '+2 from yesterday',
  },
  {
    icon: DollarSign,
    label: 'Revenue (This Month)',
    value: '$24,850',
    change: '+8.2%',
  },
  {
    icon: TrendingUp,
    label: 'Member Growth',
    value: '18%',
    change: 'vs. last month',
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-sm mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center">
                <Icon className="text-primary-400" size={24} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-dark-700">
              <p className="text-primary-400 text-sm font-medium">{stat.change}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
