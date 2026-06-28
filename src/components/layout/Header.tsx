'use client'

import { Bell, Search, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  return (
    <header className="bg-white border-b border-slate-100 px-8 py-4 z-30">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search members, check-ins..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 transition-colors text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 ml-4">
          <button className="relative p-2 rounded-lg hover:bg-slate-50 text-slate-550 transition-colors border border-transparent hover:border-slate-100" onClick={async () => {
            try {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
              router.replace('/login');
            } catch (e) { console.error('Logout failed', e); }
          }}>
            <Bell size={18} className="text-slate-500" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary-500 rounded-full" />
          </button>

          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-650 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors border border-slate-200">
            <User size={18} className="text-slate-600" />
          </div>
        </div>
      </div>
    </header>
  )
}
