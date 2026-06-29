'use client'

import { useEffect } from 'react'
import { useGymStore } from '@/store/gymStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fetchInitialData = useGymStore((state) => state.fetchInitialData)
  const dbConnected = useGymStore((state) => state.dbConnected)

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {!dbConnected && (
          <div className="bg-red-50 border-b border-red-200 px-8 py-3 text-red-700 text-xs font-semibold flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span><strong>Database Offline:</strong> The system is currently running in local offline mode. Check your local PostgreSQL instance or environment variables. Changes will not be saved.</span>
            </div>
            <button 
              onClick={() => fetchInitialData()}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 active:scale-95 text-red-800 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
