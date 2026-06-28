'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Users,
  UserCheck,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Dumbbell,
} from 'lucide-react'
import { useGymStore } from '@/store/gymStore'

const menuItems = [
  { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Members', href: '/dashboard/members' },
  { icon: UserCheck, label: 'Attendance', href: '/dashboard/attendance' },
  { icon: MessageSquare, label: 'Messages & Alerts', href: '/dashboard/messages' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const settings = useGymStore((state) => state.settings)

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-slate-200 text-slate-700"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static top-0 left-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 z-40`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 bg-white shadow-sm">
              <img src="/logo.png" alt="Gym Logo" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-base font-bold text-slate-900 leading-tight truncate" title={settings.gymName}>
                {settings.gymName}
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Gym Management</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon size={20} className={active ? 'text-white' : 'text-slate-500'} />
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 font-medium">
            <LogOut size={20} className="text-slate-500" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
