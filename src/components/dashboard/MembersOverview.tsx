'use client'

const data = [
  { name: 'Active', value: 948, color: '#10b981' },
  { name: 'Inactive', value: 180, color: '#ef4444' },
  { name: 'Trial', value: 120, color: '#f59e0b' },
]

const total = data.reduce((sum, item) => sum + item.value, 0)

export function MembersOverview() {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-6">Members Status</h2>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-dark-300">{item.name}</span>
              </div>
              <span className="text-white font-semibold">{item.value}</span>
            </div>
            <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full"
                style={{ width: `${(item.value / total) * 100}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="text-xs text-dark-400">{Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
