'use client'

const data = [
  { name: 'Jan', revenue: 4000, members: 240 },
  { name: 'Feb', revenue: 3000, members: 221 },
  { name: 'Mar', revenue: 2000, members: 229 },
  { name: 'Apr', revenue: 2780, members: 200 },
  { name: 'May', revenue: 1890, members: 229 },
  { name: 'Jun', revenue: 2390, members: 200 },
  { name: 'Jul', revenue: 3490, members: 210 },
]

const maxRevenue = Math.max(...data.map(d => d.revenue))
const maxMembers = Math.max(...data.map(d => d.members))

export function RevenueChart() {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-6">Revenue Overview</h2>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-dark-300 font-medium">{item.name}</span>
              <span className="text-white font-semibold">${item.revenue / 1000}K</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500"
                  style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                />
              </div>
              <div className="w-20 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(item.members / maxMembers) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary-500" />
          <span className="text-dark-300">Revenue ($)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-dark-300">New Members</span>
        </div>
      </div>
    </div>
  )
}
