'use client'

import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react'

const activities = [
  { id: 1, type: 'new-member', message: 'New member joined', detail: 'John Smith', time: '2 hours ago', icon: UserPlus },
  { id: 2, type: 'payment', message: 'Payment received', detail: '$50.00', time: '4 hours ago', icon: CheckCircle },
  { id: 3, type: 'alert', message: 'Class capacity reached', detail: 'Boxing Basics', time: '6 hours ago', icon: AlertCircle },
  { id: 4, type: 'new-member', message: 'New member joined', detail: 'Emma Davis', time: '1 day ago', icon: UserPlus },
]

export function RecentActivity() {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          const colors = {
            'new-member': 'text-primary-400',
            'payment': 'text-green-400',
            'alert': 'text-yellow-400',
          }
          return (
            <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-dark-700 last:border-b-0">
              <div className={`p-2 rounded-lg bg-dark-700 ${colors[activity.type as keyof typeof colors]}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{activity.message}</p>
                <p className="text-dark-400 text-sm">{activity.detail}</p>
              </div>
              <span className="text-dark-400 text-xs">{activity.time}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
