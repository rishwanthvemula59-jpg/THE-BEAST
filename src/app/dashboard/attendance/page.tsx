'use client'

import { useState } from 'react'
import { useGymStore, Member } from '@/store/gymStore'
import { motion } from 'framer-motion'
import {
  UserCheck,
  Search,
  Check,
  Clock,
  Calendar,
  Users
} from 'lucide-react'

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
}

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
}

export default function AttendancePage() {
  const { members, attendance, markAttendance } = useGymStore()

  // State controls
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [logSearchQuery, setLogSearchQuery] = useState('')
  const [logDateFilter, setLogDateFilter] = useState('')

  const todayStr = new Date().toISOString().split('T')[0]

  // Stats calculation
  const totalCheckedInToday = attendance.filter((a) => a.date === todayStr).length
  const activeMembersCount = members.filter((m) => m.status === 'active' || m.status === 'expiring').length
  const turnoutPercent = activeMembersCount > 0 ? Math.round((totalCheckedInToday / activeMembersCount) * 100) : 0

  // Filter members list for manual check-in search
  const searchableMembers = members.filter((member) =>
    member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
  )

  // Filter historical attendance logs
  const filteredLogs = attendance.filter((record) => {
    const matchesName = record.memberName.toLowerCase().includes(logSearchQuery.toLowerCase())
    const matchesDate = !logDateFilter || record.date === logDateFilter
    return matchesName && matchesDate
  })

  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 font-bold font-sans'
      case 'expiring': return 'text-yellow-600 font-bold font-sans'
      case 'expired': return 'text-red-500 font-bold font-sans'
      default: return 'text-slate-400 font-semibold font-sans'
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-8 space-y-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5 font-display">Attendance</h1>
        <p className="text-slate-500 text-sm">Track and log gym attendance and daily member check-ins.</p>
      </motion.div>

      {/* Attendance Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Checked In Today */}
        <div className="card-hover border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 font-sans">Checked In Today</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-display">{totalCheckedInToday}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100/30">
              <UserCheck className="text-green-600" size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-400 font-sans uppercase tracking-wider">
            Total entries logged for today
          </div>
        </div>

        {/* Turnout Percentage */}
        <div className="card-hover border-l-4 border-l-primary-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 font-sans">Turnout Rate</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-display">{turnoutPercent}%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100/30">
              <Users className="text-primary-500" size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-400 font-sans uppercase tracking-wider">
            Based on {activeMembersCount} active members
          </div>
        </div>

        {/* Current Date */}
        <div className="card-hover border-l-4 border-l-slate-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 font-sans">Log Date</p>
              <h3 className="text-2xl font-extrabold text-slate-900 leading-8 font-display">
                {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200/50">
              <Calendar className="text-slate-500" size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-400 font-sans uppercase tracking-wider">
            Current timezone tracking
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Manual Check-in Panel (Left Column) */}
        <div className="card flex flex-col h-[540px]">
          <h2 className="text-lg font-bold text-slate-900 mb-1 font-display">Mark Check-in</h2>
          <p className="text-xs text-slate-500 mb-4">Search member by name/email and click check-in to log their attendance today.</p>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search members..."
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
            {searchableMembers.map((member) => {
              const isChecked = attendance.some((a) => a.memberId === member.id && a.date === todayStr)
              const isAllowed = member.status === 'active' || member.status === 'expiring'
              
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-150/60 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all duration-150"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-slate-800 font-bold text-xs truncate">{member.name}</p>
                    <p className="text-[9px] text-slate-500 font-bold capitalize mt-0.5 font-sans">
                      {member.membershipType} Plan • <span className={getStatusColor(member.status)}>{member.status}</span>
                    </p>
                  </div>
                  {isChecked ? (
                    <span className="text-green-600 text-xs font-semibold flex items-center gap-1 shrink-0 font-sans">
                      <Check size={14} /> Checked
                    </span>
                  ) : !isAllowed ? (
                    <span className="text-red-500 text-[9px] font-extrabold uppercase border border-red-100 bg-red-50 px-2 py-0.5 rounded shrink-0 font-sans">
                      Denied
                    </span>
                  ) : (
                    <button
                      onClick={() => markAttendance(member.id)}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-all shrink-0 shadow-sm shadow-green-500/10 active:scale-95 font-sans"
                    >
                      Check In
                    </button>
                  )}
                </div>
              )
            })}
            {searchableMembers.length === 0 && (
              <p className="text-center text-slate-400 py-12 text-xs font-semibold font-sans">No members found.</p>
            )}
          </div>
        </div>

        {/* History Log Table (Right 2 Columns) */}
        <div className="lg:col-span-2 card flex flex-col h-[540px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 font-display">Check-in Logs</h2>
            <div className="flex gap-2">
              {/* Log Search */}
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Filter logs by name..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                />
              </div>
              {/* Date Filter */}
              <div className="relative">
                <input
                  type="date"
                  value={logDateFilter}
                  onChange={(e) => setLogDateFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 text-xs focus:outline-none focus:bg-white focus:border-primary-500 transition-colors font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[10px] font-bold bg-slate-50/50 uppercase tracking-wider font-sans">
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Check-in Date</th>
                  <th className="py-3 px-4">Log Time</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((record) => (
                  <tr key={record.id} className="text-xs hover:bg-slate-50/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{record.memberName}</td>
                    <td className="py-3 px-4 text-slate-600 font-bold font-sans">{record.date}</td>
                    <td className="py-3 px-4 text-slate-500 font-bold font-sans">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-primary-500" />
                        {record.time}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider font-sans bg-green-50 text-green-700 border border-green-100 shadow-sm shadow-green-500/5">
                        Present
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-slate-400 text-xs font-semibold font-sans">
                      No check-in logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
