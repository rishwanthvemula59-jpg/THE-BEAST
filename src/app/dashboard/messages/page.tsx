'use client'

import { useState } from 'react'
import { useGymStore, MessageAlert } from '@/store/gymStore'
import { motion } from 'framer-motion'
import {
  Send,
  Bell,
  MessageSquare,
  AlertTriangle,
  Info,
  Calendar,
  Users,
  Search,
  CheckCircle,
  Inbox
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
  hidden: { y: 12, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
}

export default function MessagesPage() {
  const { members, messages, sendMessage } = useGymStore()

  // Form State
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'announcement' as MessageAlert['type'],
    recipient: 'All Members'
  })

  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | MessageAlert['type']>('all')
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendLoading, setSendLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.content) return
    setSendError(null)
    setSendLoading(true)

    try {
      await sendMessage({
        title: form.title,
        content: form.content,
        type: form.type,
        recipient: form.recipient
      })

      // Determine WhatsApp number and redirect
      let waPhone = ''
      if (form.recipient === 'All Members' ||
          form.recipient === 'Active Members' ||
          form.recipient === 'Expired Members' ||
          form.recipient === 'Inactive Members') {
        waPhone = '916281042207'
      } else {
        const targetMember = members.find(m => m.name === form.recipient)
        if (targetMember) {
          const digits = targetMember.phone.replace(/[^0-9]/g, '')
          waPhone = digits.length === 10 ? `91${digits}` : digits
        }
      }

      if (waPhone) {
        const waText = encodeURIComponent(`*${form.title}*\n\n${form.content}`)
        window.open(`https://wa.me/${waPhone}?text=${waText}`, '_blank', 'noopener,noreferrer')
      }

      setForm({
        title: '',
        content: '',
        type: 'announcement',
        recipient: 'All Members'
      })
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to log notification message'
      setSendError(msg)
    } finally {
      setSendLoading(false)
    }
  }

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.recipient.toLowerCase().includes(searchQuery.toLowerCase())
      
    const matchesType = typeFilter === 'all' || msg.type === typeFilter

    return matchesSearch && matchesType
  })

  const getAlertIcon = (type: MessageAlert['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle size={16} className="text-yellow-600" />
      case 'reminder':
        return <Bell size={16} className="text-purple-600" />
      case 'announcement':
      default:
        return <Info size={16} className="text-sky-605" />
    }
  }

  const getTypeStyle = (type: MessageAlert['type']) => {
    switch (type) {
      case 'alert':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-100/50 shadow-sm shadow-yellow-500/5'
      case 'reminder':
        return 'bg-purple-50 text-purple-750 border border-purple-100/50 shadow-sm shadow-purple-500/5'
      case 'announcement':
      default:
        return 'bg-sky-50 text-sky-700 border border-sky-100/50 shadow-sm shadow-sky-500/5'
    }
  }

  const getLeftBorderColor = (type: MessageAlert['type']) => {
    switch (type) {
      case 'alert': return 'border-l-yellow-500'
      case 'reminder': return 'border-l-purple-500'
      case 'announcement':
      default: return 'border-l-sky-500'
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5 font-display">Messages & Alerts</h1>
        <p className="text-slate-500 text-sm">Broadcast updates and send direct reminders to gym members.</p>
      </motion.div>

      {/* Main Content Split */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compose Panel (Left Column) */}
        <div className="card h-fit">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 font-display">
            <MessageSquare size={20} className="text-primary-500 animate-pulse" />
            Compose Message
          </h2>
          
          <form onSubmit={handleSend} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Subject / Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Schedule Update or Renewal Reminder"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-855 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
              />
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Recipients Group</label>
              <select
                value={form.recipient}
                onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-855 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors font-semibold"
              >
                <option value="All Members">All Registered Members</option>
                <option value="Active Members">Active Members Only</option>
                <option value="Expired Members">Expired Members Only</option>
                <option value="Inactive Members">Inactive Members Only</option>
                {members.map((m) => (
                  <option key={m.id} value={m.name}>Direct: {m.name}</option>
                ))}
              </select>
            </div>

            {/* Message Type */}
            <div>
              <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1.5 font-sans">Category Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['announcement', 'reminder', 'alert'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, type })}
                    className={`py-2 px-3 rounded-lg text-[9px] font-bold uppercase border transition-all duration-150 ${
                      form.type === type
                        ? type === 'announcement' ? 'bg-sky-55 text-sky-700 border-sky-305 shadow shadow-sky-500/5' : type === 'reminder' ? 'bg-purple-55 text-purple-700 border-purple-305 shadow shadow-purple-500/5' : 'bg-yellow-55 text-yellow-700 border-yellow-305 shadow shadow-yellow-500/5'
                        : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-sm shadow-slate-100/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">Message Content</label>
              <textarea
                required
                rows={5}
                placeholder="Type your message description here..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-855 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-xs resize-none transition-colors"
              />
            </div>

            {sendError && (
              <p className="text-[10px] text-red-500 font-bold bg-red-50 border border-red-100 rounded-lg p-2.5">
                ⚠️ {sendError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={sendLoading}
              className="w-full btn-primary text-xs py-3 mt-4 flex items-center justify-center gap-2 shadow-md shadow-primary-500/10 font-sans tracking-wide disabled:opacity-50"
            >
              <Send size={16} />
              {sendLoading ? 'Sending...' : (form.recipient !== 'All Members' &&
               form.recipient !== 'Active Members' &&
               form.recipient !== 'Expired Members' &&
               form.recipient !== 'Inactive Members'
                ? 'Send & Redirect to WhatsApp'
                : 'Broadcast & Redirect to WhatsApp')}
            </button>
          </form>
        </div>

        {/* History Log Panel (Right 2 Columns) */}
        <div className="lg:col-span-2 card flex flex-col h-[600px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                <Inbox size={20} className="text-primary-500" />
                Notification Outbox
              </h2>
              <p className="text-[10px] text-slate-400 font-bold font-sans uppercase tracking-wider mt-0.5">Total Broadcasts: {messages.length}</p>
            </div>

            <div className="flex gap-2">
              {/* Filter by Type */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 transition-colors font-semibold"
              >
                <option value="all">All Types</option>
                <option value="announcement">Announcements</option>
                <option value="reminder">Reminders</option>
                <option value="alert">Critical Alerts</option>
              </select>

              {/* Search Log */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-xs w-44 transition-colors font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 bg-slate-50/20 rounded-xl border border-slate-150 border-l-4 ${getLeftBorderColor(msg.type)} flex items-start gap-4 hover:border-slate-200 hover:bg-slate-50/50 transition-colors`}
              >
                {/* Visual Category Indicator */}
                <div className={`p-2.5 rounded-lg shrink-0 ${getTypeStyle(msg.type)}`}>
                  {getAlertIcon(msg.type)}
                </div>

                {/* Message Body */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-slate-850 font-bold text-sm truncate font-display">{msg.title}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold font-sans uppercase tracking-wider shrink-0 mt-0.5 sm:mt-0">
                      <Calendar size={11} />
                      {msg.date}
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-xs font-semibold whitespace-pre-line leading-relaxed">{msg.content}</p>

                  <div className="pt-2 border-t border-slate-200/50 flex items-center gap-4 text-[9px] text-slate-400 font-bold font-sans uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Users size={12} className="text-slate-400" />
                      Recipient: <strong className="text-slate-800">{msg.recipient}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle size={12} className="text-green-600" />
                      Status: <strong className="text-green-600">Delivered</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredMessages.length === 0 && (
              <div className="text-center py-20 text-slate-400 text-xs font-semibold font-sans">
                No notification logs match your query.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
