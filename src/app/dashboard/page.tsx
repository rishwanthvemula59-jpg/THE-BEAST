'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGymStore, Member } from '@/store/gymStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Plus,
  Check,
  Bell,
  Clock,
  ArrowRight,
  Sparkles,
  Send,
  CalendarCheck,
  X
} from 'lucide-react'

// Framer Motion Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
}

const modalVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: 'spring', duration: 0.3 } }
}

export default function Dashboard() {
  const {
    members,
    attendance,
    messages,
    addMember,
    markAttendance,
    sendMessage,
    updateMember
  } = useGymStore()

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)

  // Add Member form state
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as const,
    membershipType: 'Monthly' as const,
    expiryDate: ''
  })

  // Attendance search state
  const [attendanceSearch, setAttendanceSearch] = useState('')

  // Compose Alert form state
  const [alertForm, setAlertForm] = useState({
    title: '',
    content: '',
    type: 'announcement' as const,
    recipient: 'All Members'
  })

  const todayStr = new Date().toISOString().split('T')[0]

  // Stats calculation
  const totalMembers = members.length
  const todayAttendance = attendance.filter((a) => a.date === todayStr).length
  const activeMemberships = members.filter((m) => m.status === 'active' || m.status === 'expiring').length
  const expiredMembers = members.filter((m) => m.status === 'expired').length
  const expiringMembers = members.filter((m) => m.status === 'expiring').length

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberForm.name || !newMemberForm.email) return

    let finalExpiry = newMemberForm.expiryDate
    if (!finalExpiry) {
      const d = new Date()
      d.setMonth(d.getMonth() + 1)
      finalExpiry = d.toISOString().split('T')[0]
    }

    addMember({
      name: newMemberForm.name,
      email: newMemberForm.email,
      phone: newMemberForm.phone || '+1 (555) 000-0000',
      status: newMemberForm.status,
      membershipType: newMemberForm.membershipType,
      expiryDate: finalExpiry
    })

    setNewMemberForm({
      name: '',
      email: '',
      phone: '',
      status: 'active',
      membershipType: 'Monthly',
      expiryDate: ''
    })
    setIsAddModalOpen(false)
  }

  const handleMarkAttendance = (memberId: number) => {
    markAttendance(memberId)
    setIsAttendanceModalOpen(false)
    setAttendanceSearch('')
  }

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault()
    if (!alertForm.title || !alertForm.content) return

    sendMessage({
      title: alertForm.title,
      content: alertForm.content,
      type: alertForm.type,
      recipient: alertForm.recipient
    })

    // Determine WhatsApp number and redirect
    let waPhone = ''
    if (alertForm.recipient === 'All Members' ||
        alertForm.recipient === 'Active Members' ||
        alertForm.recipient === 'Expired Members') {
      waPhone = '916281042207'
    } else {
      const targetMember = members.find(m => m.name === alertForm.recipient)
      if (targetMember) {
        const digits = targetMember.phone.replace(/[^0-9]/g, '')
        waPhone = digits.length === 10 ? `91${digits}` : digits
      }
    }

    if (waPhone) {
      const waText = encodeURIComponent(`*${alertForm.title}*\n\n${alertForm.content}`)
      window.open(`https://wa.me/${waPhone}?text=${waText}`, '_blank', 'noopener,noreferrer')
    }

    setAlertForm({
      title: '',
      content: '',
      type: 'announcement',
      recipient: 'All Members'
    })
    setIsAlertModalOpen(false)
  }

  const handleQuickRenew = (memberId: number) => {
    const nextExpiry = new Date()
    nextExpiry.setMonth(nextExpiry.getMonth() + 3)
    updateMember(memberId, {
      status: 'active',
      expiryDate: nextExpiry.toISOString().split('T')[0]
    })
    
    sendMessage({
      title: 'Membership Renewed',
      content: `Membership renewed successfully for 3 months.`,
      type: 'announcement',
      recipient: members.find(m => m.id === memberId)?.name || 'Member'
    })
  }

  const activeCount = members.filter((m) => m.status === 'active').length
  const expiredCount = members.filter((m) => m.status === 'expired').length
  const expiringCount = members.filter((m) => m.status === 'expiring').length
  const inactiveCount = members.filter((m) => m.status === 'inactive').length

  const getPercent = (count: number) => {
    if (totalMembers === 0) return 0
    return Math.round((count / totalMembers) * 100)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-8 space-y-8 max-w-7xl mx-auto"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200/60 bg-white shadow-md shadow-slate-100 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Gym Logo" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1 font-display">Welcome back, Admin!</h1>
                <p className="text-slate-500 text-sm font-medium">Gym overview and real-time operations dashboard.</p>
              </div>
            </div>
            <button onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            }} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">Logout</button>
          </div>
        <div className="bg-white/80 border border-slate-150/80 px-4 py-2.5 rounded-xl flex items-center gap-2 text-slate-600 shadow-sm shadow-slate-100/50 backdrop-blur-md self-start md:self-center">
          <Clock size={16} className="text-primary-500 shrink-0" />
          <span className="font-bold text-xs text-slate-700 font-sans tracking-wide">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </motion.div>

      {/* Stats Cards (5 cols) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Members */}
        <div className="card-hover border-l-4 border-l-primary-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 font-sans">Total Members</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-display">{totalMembers}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100/30">
              <Users className="text-primary-500" size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
            <span className="text-green-500 text-[10px] font-bold bg-green-50 px-1.5 py-0.5 rounded-md">100%</span>
            <span className="text-slate-400 text-[10px] font-semibold">registered registry</span>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="card-hover border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 font-sans">Today Check-ins</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-display">{todayAttendance}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100/30">
              <UserCheck className="text-green-500" size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
            <span className="text-green-500 text-[10px] font-bold bg-green-50 px-1.5 py-0.5 rounded-md">
              {getPercent(todayAttendance)}%
            </span>
            <span className="text-slate-400 text-[10px] font-semibold">active turnout today</span>
          </div>
        </div>

        {/* Active Memberships */}
        <div className="card-hover border-l-4 border-l-sky-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 font-sans">Active Accounts</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-display">{activeMemberships}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100/30">
              <Check className="text-sky-500" size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
            <span className="text-sky-500 text-[10px] font-bold bg-sky-50 px-1.5 py-0.5 rounded-md">
              {getPercent(activeMemberships)}%
            </span>
            <span className="text-slate-400 text-[10px] font-semibold">active subscriptions</span>
          </div>
        </div>

        {/* Expired Members */}
        <div className="card-hover border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 font-sans">Expired Passes</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-display">{expiredMembers}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100/30">
              <UserX className="text-red-500" size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
            <span className="text-red-500 text-[10px] font-bold bg-red-50 px-1.5 py-0.5 rounded-md">
              {getPercent(expiredMembers)}%
            </span>
            <span className="text-slate-400 text-[10px] font-semibold">un-renewed accounts</span>
          </div>
        </div>

        {/* Expiring Members */}
        <div className="card-hover border-l-4 border-l-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 font-sans">Expiring Soon</p>
              <h3 className="text-3xl font-extrabold text-slate-900 font-display">{expiringMembers}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0 border border-yellow-100/30">
              <AlertTriangle className="text-yellow-600" size={18} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
            <span className="text-yellow-600 text-[10px] font-bold bg-yellow-50 px-1.5 py-0.5 rounded-md">
              {getPercent(expiringMembers)}%
            </span>
            <span className="text-slate-400 text-[10px] font-semibold">expires in 7 days</span>
          </div>
        </div>
      </motion.div>

      {/* Main Grid Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Links & Status Breakdown (Left/Center) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Links Panel */}
          <div className="card border-t border-t-primary-500/10">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-primary-500" size={18} />
              <h2 className="text-lg font-bold text-slate-900 font-display">Quick Operations</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Add Member Link */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex flex-col items-center justify-center p-6 bg-slate-50/50 border border-slate-200/80 rounded-2xl hover:bg-white hover:border-primary-400 hover:shadow-[0_8px_30px_rgb(241,245,249,0.9)] hover:ring-4 hover:ring-primary-500/5 transition-all duration-250 group text-center active:scale-98"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md shadow-primary-500/15">
                  <Plus size={20} />
                </div>
                <h3 className="text-slate-850 font-bold text-sm mb-1 font-display">Add Member</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Create Profile</p>
              </button>

              {/* Mark Attendance Link */}
              <button
                onClick={() => setIsAttendanceModalOpen(true)}
                className="flex flex-col items-center justify-center p-6 bg-slate-50/50 border border-slate-200/80 rounded-2xl hover:bg-white hover:border-green-400 hover:shadow-[0_8px_30px_rgb(241,245,249,0.9)] hover:ring-4 hover:ring-green-500/5 transition-all duration-250 group text-center active:scale-98"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md shadow-green-500/15">
                  <CalendarCheck size={20} />
                </div>
                <h3 className="text-slate-850 font-bold text-sm mb-1 font-display">Check In</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Mark Attendance</p>
              </button>

              {/* Send Alert Link */}
              <button
                onClick={() => setIsAlertModalOpen(true)}
                className="flex flex-col items-center justify-center p-6 bg-slate-50/50 border border-slate-200/80 rounded-2xl hover:bg-white hover:border-yellow-500 hover:shadow-[0_8px_30px_rgb(241,245,249,0.9)] hover:ring-4 hover:ring-yellow-500/5 transition-all duration-250 group text-center active:scale-98"
              >
                <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md shadow-yellow-500/15">
                  <Bell size={20} />
                </div>
                <h3 className="text-slate-850 font-bold text-sm mb-1 font-display">Compose Message</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Send Notification</p>
              </button>
            </div>
          </div>

          {/* Members Status Breakdown */}
          <div className="card">
            <h2 className="text-lg font-bold text-slate-900 mb-6 font-display">Registry Demographics</h2>
            <div className="space-y-5">
              {/* Active */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-green-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Active Memberships
                  </span>
                  <span className="text-slate-800 font-bold">{activeCount} ({getPercent(activeCount)}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500 rounded-full" style={{ width: `${getPercent(activeCount)}%` }} />
                </div>
              </div>

              {/* Expiring */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-yellow-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Expiring Soon (Within 7 Days)
                  </span>
                  <span className="text-slate-800 font-bold">{expiringCount} ({getPercent(expiringCount)}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500 rounded-full" style={{ width: `${getPercent(expiringCount)}%` }} />
                </div>
              </div>

              {/* Expired */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-red-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Expired Contracts
                  </span>
                  <span className="text-slate-800 font-bold">{expiredCount} ({getPercent(expiredCount)}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500 rounded-full" style={{ width: `${getPercent(expiredCount)}%` }} />
                </div>
              </div>

              {/* Inactive */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Suspended / Inactive
                  </span>
                  <span className="text-slate-800 font-bold">{inactiveCount} ({getPercent(inactiveCount)}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-slate-400 to-slate-500 transition-all duration-500 rounded-full" style={{ width: `${getPercent(inactiveCount)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Activity / Expirations Sidebar (Right) */}
        <div className="space-y-8">
          {/* Recent Check-ins today */}
          <div className="card flex flex-col h-[340px]">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 font-display">
              <Clock className="text-green-500" size={18} />
              Recent Check-ins
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {attendance.filter(a => a.date === todayStr).length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs font-medium font-sans">
                  No check-ins logged today.
                </div>
              ) : (
                attendance
                  .filter((a) => a.date === todayStr)
                  .map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-150/60 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all duration-150">
                      <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
                        <Check size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-800 font-bold text-xs truncate">{log.memberName}</p>
                        <p className="text-slate-400 text-[10px] font-semibold flex items-center gap-1 mt-0.5 font-sans">
                          <Clock size={10} />
                          Checked in: {log.time}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Expiring Memberships / Upcoming Renewals */}
          <div className="card flex flex-col h-[360px]">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 font-display">
              <AlertTriangle className="text-yellow-600" size={18} />
              Upcoming Renewals
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {members.filter(m => m.status === 'expiring').length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs font-medium font-sans">
                  No memberships expiring.
                </div>
              ) : (
                members
                  .filter((m) => m.status === 'expiring')
                  .map((member) => (
                    <div key={member.id} className="p-3.5 bg-slate-50/50 border border-slate-150/60 rounded-xl space-y-3 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all duration-150">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-slate-800 font-bold text-xs truncate">{member.name}</p>
                          <p className="text-slate-500 text-[9px] font-bold mt-0.5 uppercase tracking-wider font-sans">Expires: {member.expiryDate}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-yellow-50 text-yellow-600 border border-yellow-100 font-sans">
                          {member.membershipType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                        <button
                          onClick={() => handleQuickRenew(member.id)}
                          className="flex-1 text-center py-1.5 bg-primary-500 text-white rounded-lg text-[10px] font-bold hover:bg-primary-600 transition-colors shadow-sm shadow-primary-500/10 active:scale-95"
                        >
                          Renew (3 Months)
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Inline Modal: Add Member */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="bg-white/95 border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-950 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl font-bold text-slate-900 mb-4 font-display">Add Gym Member</h2>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@example.com"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 987-6543"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Membership Plan</label>
                    <select
                      value={newMemberForm.membershipType}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, membershipType: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250/60 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Status</label>
                    <select
                      value={newMemberForm.status}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, status: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250/60 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="expiring">Expiring Soon</option>
                      <option value="expired">Expired</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={newMemberForm.expiryDate}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, expiryDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250/60 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn-primary text-sm py-3 mt-4"
                >
                  Create Member Profile
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inline Modal: Mark Attendance */}
      <AnimatePresence>
        {isAttendanceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="bg-white/95 border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <button
                onClick={() => setIsAttendanceModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-955 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl font-bold text-slate-900 mb-1 font-display">Mark Check-in</h2>
              <p className="text-xs text-slate-500 mb-4">Select an active gym member to check them in for today.</p>
              
              <input
                type="text"
                placeholder="Search member by name..."
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-xs mb-4 transition-colors"
              />

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] scrollbar-thin">
                {members
                  .filter((m) => m.name.toLowerCase().includes(attendanceSearch.toLowerCase()))
                  .map((m) => {
                    const isChecked = attendance.some(a => a.memberId === m.id && a.date === todayStr)
                    const canCheckIn = m.status === 'active' || m.status === 'expiring'
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-150"
                      >
                        <div>
                          <p className="text-slate-800 font-bold text-xs">{m.name}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 font-sans">{m.membershipType} Plan • {m.status}</p>
                        </div>
                        {isChecked ? (
                          <span className="text-green-600 text-xs font-semibold flex items-center gap-1 font-sans">
                            <Check size={14} /> Checked
                          </span>
                        ) : !canCheckIn ? (
                          <span className="text-red-500 text-[9px] font-extrabold uppercase px-2 py-0.5 bg-red-50 border border-red-100 rounded-md font-sans">
                            {m.status}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkAttendance(m.id)}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors shadow-sm shadow-green-500/10 active:scale-95 font-sans"
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    )
                  })}
                {members.filter((m) => m.name.toLowerCase().includes(attendanceSearch.toLowerCase())).length === 0 && (
                  <p className="text-center text-slate-400 py-10 text-xs font-semibold">No members found.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inline Modal: Send Alert */}
      <AnimatePresence>
        {isAlertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="bg-white/95 border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-955 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl font-bold text-slate-900 mb-1 font-display">Compose Message</h2>
              <p className="text-xs text-slate-500 mb-4">Send a broadcast alert or direct reminder notification.</p>

              <form onSubmit={handleSendAlert} className="space-y-4">
                <div>
                  <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Notification Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule Update or Class Change"
                    value={alertForm.title}
                    onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250/60 rounded-xl text-slate-850 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Recipients Group</label>
                  <select
                    value={alertForm.recipient}
                    onChange={(e) => setAlertForm({ ...alertForm, recipient: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250/60 rounded-xl text-slate-850 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                  >
                    <option value="All Members">All Registered Members</option>
                    <option value="Active Members">Active Members Only</option>
                    <option value="Expired Members">Expired Members Only</option>
                    {members.map(m => (
                      <option key={m.id} value={m.name}>Direct: {m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Alert Category</label>
                  <select
                    value={alertForm.type}
                    onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250/60 rounded-xl text-slate-850 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                  >
                    <option value="announcement">Announcement (Info)</option>
                    <option value="reminder">Reminder (Subscription)</option>
                    <option value="alert">Critical Alert (Warning)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Message Content</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your announcement or reminder message here..."
                    value={alertForm.content}
                    onChange={(e) => setAlertForm({ ...alertForm, content: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250/60 rounded-xl text-slate-850 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-xs resize-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn-primary text-xs py-3 mt-4 flex items-center justify-center gap-2 shadow-md shadow-primary-500/10 font-sans"
                >
                  <Send size={16} />
                  {alertForm.recipient !== 'All Members' &&
                   alertForm.recipient !== 'Active Members' &&
                   alertForm.recipient !== 'Expired Members'
                    ? 'Send & Redirect to WhatsApp'
                    : 'Broadcast & Redirect to WhatsApp'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
