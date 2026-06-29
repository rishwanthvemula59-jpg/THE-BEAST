'use client'

import { useState } from 'react'
import { useGymStore, Member } from '@/store/gymStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  X,
  CreditCard,
  User,
  Trash2,
  Edit2
} from 'lucide-react'

const getWhatsAppLink = (phone: string) => {
  const digits = phone.replace(/[^0-9]/g, '')
  if (digits.length === 10) {
    return `https://wa.me/91${digits}`
  }
  return `https://wa.me/${digits}`
}

// Framer Motion Variants
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 }
  }
}

const rowVariants = {
  hidden: { opacity: 0, x: -5 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } }
}

const modalVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: 'spring', duration: 0.3 } }
}

export default function MembersPage() {
  const { members, addMember, updateMember, sendMessage } = useGymStore()

  // State controls
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Member['status']>('all')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [renewMonths, setRenewMonths] = useState(1)

  // Add Member form state
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as Member['status'],
    membershipType: 'Monthly' as Member['membershipType'],
    expiryDate: ''
  })

  // Edit / Renewal form state in detail modal
  const [isEditMode, setIsEditMode] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Member>>({})
  const [addError, setAddError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  // Handle addition
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.name || !addForm.email) return
    setAddError(null)
    setAddLoading(true)

    let finalExpiry = addForm.expiryDate
    if (!finalExpiry) {
      const d = new Date()
      d.setMonth(d.getMonth() + 1)
      finalExpiry = d.toISOString().split('T')[0]
    }

    try {
      await addMember({
        name: addForm.name,
        email: addForm.email,
        phone: addForm.phone || '+1 (555) 000-0000',
        status: addForm.status,
        membershipType: addForm.membershipType,
        expiryDate: finalExpiry
      })

      setAddForm({
        name: '',
        email: '',
        phone: '',
        status: 'active',
        membershipType: 'Monthly',
        expiryDate: ''
      })
      setIsAddModalOpen(false)
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to create member'
      setAddError(msg)
    } finally {
      setAddLoading(false)
    }
  }

  // Handle updates
  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember || !editForm.name || !editForm.email) return
    setEditError(null)
    setEditLoading(true)

    try {
      await updateMember(selectedMember.id, editForm)
      
      try {
        await sendMessage({
          title: 'Member Profile Updated',
          content: `Member profile was updated by the administrator.`,
          type: 'announcement',
          recipient: editForm.name || selectedMember.name
        })
      } catch (sendErr) {
        console.error('Failed to send profile update message notification', sendErr)
      }

      setSelectedMember({
        ...selectedMember,
        ...editForm
      } as Member)
      setIsEditMode(false)
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to update member'
      setEditError(msg)
    } finally {
      setEditLoading(false)
    }
  }

  // Handle direct renewal
  const handleRenewMember = async (member: Member, months: number = 1) => {
    setEditError(null)
    setEditLoading(true)

    const newExpDate = new Date()
    newExpDate.setMonth(newExpDate.getMonth() + months)
    const expiryStr = newExpDate.toISOString().split('T')[0]
    
    let membershipType = member.membershipType
    if (months === 1) membershipType = 'Monthly'
    else if (months === 3) membershipType = 'Quarterly'
    else if (months === 12) membershipType = 'Annual'

    try {
      await updateMember(member.id, {
        status: 'active',
        expiryDate: expiryStr,
        membershipType
      })
      
      try {
        await sendMessage({
          title: 'Subscription Extended',
          content: `Membership plan renewed. New expiry date: ${expiryStr}.`,
          type: 'reminder',
          recipient: member.name
        })
      } catch (sendErr) {
        console.error('Failed to send renewal message notification', sendErr)
      }

      setSelectedMember({
        ...member,
        status: 'active',
        expiryDate: expiryStr,
        membershipType
      })
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to renew member'
      setEditError(msg)
    } finally {
      setEditLoading(false)
    }
  }

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
    
    const matchesFilter = statusFilter === 'all' || member.status === statusFilter
    
    return matchesSearch && matchesFilter
  })

  const getStatusStyle = (status: Member['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border border-green-100'
      case 'expiring':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-100'
      case 'expired':
        return 'bg-red-50 text-red-700 border border-red-100'
      case 'inactive':
        return 'bg-slate-100 text-slate-650 border border-slate-200'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5 font-display">Gym Members</h1>
          <p className="text-slate-500 text-sm">View and organize gym membership database records.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center gap-2 self-start sm:self-center shadow-md shadow-primary-500/10 font-sans text-xs uppercase font-bold tracking-wider py-2.5"
        >
          <Plus size={16} />
          Add Gym Member
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-250/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 text-xs transition-colors shadow-sm shadow-slate-100/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'expiring', 'expired', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-150 ${
                statusFilter === status
                  ? 'bg-primary-500 text-white border-primary-500 shadow shadow-primary-500/10'
                  : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm shadow-slate-100/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid/List */}
      <div className="card overflow-hidden border-slate-200/50 shadow-[0_8px_30px_rgb(241,245,249,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left bg-slate-50/50 font-sans">
                <th className="py-4 px-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Member</th>
                <th className="py-4 px-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Contact Info</th>
                <th className="py-4 px-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="py-4 px-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Membership Plan</th>
                <th className="py-4 px-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Expiry Date</th>
                <th className="py-4 px-6 text-slate-400 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
              </tr>
            </thead>
            <motion.tbody
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-slate-100"
            >
              {filteredMembers.map((member) => (
                <motion.tr
                  key={member.id}
                  variants={rowVariants}
                  className="hover:bg-slate-50/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-650 flex items-center justify-center font-bold text-sm border border-primary-100 shadow-sm shadow-primary-500/5">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-slate-800 font-bold text-sm">{member.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold font-sans uppercase tracking-wider">Joined: {member.joinDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        <span className="text-xs truncate max-w-[180px] font-semibold">{member.email}</span>
                      </div>
                      <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-primary-500 transition-colors">
                        <Phone size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold">{member.phone}</span>
                      </a>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider font-sans ${getStatusStyle(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs font-sans">
                      <CreditCard size={14} className="text-primary-500" />
                      {member.membershipType}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 text-xs font-bold font-sans">
                    {member.expiryDate}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        setSelectedMember(member)
                        setEditForm(member)
                        setIsEditMode(false)
                      }}
                      className="px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-primary-500 hover:text-white rounded-lg text-xs font-bold border border-slate-200 hover:border-primary-500 transition-all duration-150 shadow-sm active:scale-95"
                    >
                      View Profile
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 text-xs font-semibold">
                    No members match your current query or filters.
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Modal: View & Update Member Details */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="bg-white/95 border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-950 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Profile Intro */}
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-5">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-650 flex items-center justify-center text-xl font-bold border border-primary-100">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">{selectedMember.name}</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-sans">Registry ID: #{selectedMember.id} • Joined: {selectedMember.joinDate}</p>
                </div>
              </div>

              {/* Edit Mode vs Read Details */}
              {!isEditMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans">Current Status</p>
                      <p className="text-xs font-bold mt-1 uppercase tracking-wider font-sans">
                        <span className={selectedMember.status === 'active' ? 'text-green-600' : selectedMember.status === 'expiring' ? 'text-yellow-600' : selectedMember.status === 'expired' ? 'text-red-500' : 'text-slate-500'}>
                          {selectedMember.status}
                        </span>
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans">Active Plan</p>
                      <p className="text-xs font-bold text-slate-800 mt-1 font-sans">{selectedMember.membershipType}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-650">
                      <Mail size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate font-semibold">{selectedMember.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-650 mt-1.5">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        <span className="font-semibold">{selectedMember.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`tel:${selectedMember.phone}`}
                          className="px-2 py-0.5 bg-slate-105 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded text-[9px] font-bold transition-colors font-sans uppercase tracking-wider"
                          title="Call"
                        >
                          Call
                        </a>
                        <a
                          href={getWhatsAppLink(selectedMember.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 bg-green-50 hover:bg-green-105 border border-green-200 text-green-700 rounded text-[9px] font-bold transition-colors font-sans uppercase tracking-wider"
                          title="WhatsApp"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-650 mt-1.5">
                      <Calendar size={14} className="text-slate-400 shrink-0" />
                      <span className="font-semibold font-sans">Membership Expiry: <strong className="text-slate-900 font-bold">{selectedMember.expiryDate}</strong></span>
                    </div>
                  </div>

                  {editError && (
                    <p className="text-[10px] text-red-500 font-bold bg-red-50 border border-red-100 rounded-lg p-2.5 mt-2">
                      ⚠️ {editError}
                    </p>
                  )}
                  <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 font-sans">Renewal Plan</label>
                        <select
                          value={renewMonths}
                          onChange={(e) => setRenewMonths(parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 transition-colors font-semibold"
                        >
                          <option value={1}>1 Month Extension</option>
                          <option value={3}>Quarterly (3 Months)</option>
                          <option value={12}>Annual (12 Months)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditMode(true)
                          setEditForm(selectedMember)
                          setEditError(null)
                        }}
                        className="flex-1 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Edit2 size={12} /> Edit Profile
                      </button>
                      <button
                        onClick={() => handleRenewMember(selectedMember, renewMonths)}
                        disabled={editLoading}
                        className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-primary-500/10 active:scale-95 disabled:opacity-50"
                      >
                        {editLoading ? 'Renewing...' : 'Renew'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateMember} className="space-y-4">
                  <div>
                    <label className="block text-slate-655 text-xs font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-primary-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-655 text-xs font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-primary-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-655 text-xs font-semibold mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-primary-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-655 text-xs font-semibold mb-1">Membership Plan</label>
                      <select
                        value={editForm.membershipType || 'Monthly'}
                        onChange={(e) => setEditForm({ ...editForm, membershipType: e.target.value as any })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-primary-500 transition-colors"
                      >
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annual">Annual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-655 text-xs font-semibold mb-1">Status</label>
                      <select
                        value={editForm.status || 'active'}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-primary-500 transition-colors"
                      >
                        <option value="active">Active</option>
                        <option value="expiring">Expiring Soon</option>
                        <option value="expired">Expired</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-655 text-xs font-semibold mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={editForm.expiryDate || ''}
                      onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-primary-500 transition-colors"
                    />
                  </div>

                  {editError && (
                    <p className="text-[10px] text-red-500 font-bold bg-red-50 border border-red-100 rounded-lg p-2.5">
                      ⚠️ {editError}
                    </p>
                  )}
                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditMode(false)
                        setEditError(null)
                      }}
                      className="flex-1 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
                    >
                      {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add New Member Form */}
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
                  <label className="block text-slate-655 text-xs font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-655 text-xs font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@example.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-655 text-xs font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 987-6543"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 text-sm transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-655 text-xs font-semibold mb-1">Membership Plan</label>
                    <select
                      value={addForm.membershipType}
                      onChange={(e) => setAddForm({ ...addForm, membershipType: e.target.value as any })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 text-sm transition-colors"
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-655 text-xs font-semibold mb-1">Status</label>
                    <select
                      value={addForm.status}
                      onChange={(e) => setAddForm({ ...addForm, status: e.target.value as any })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 text-sm transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="expiring">Expiring Soon</option>
                      <option value="expired">Expired</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-655 text-xs font-semibold mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={addForm.expiryDate}
                    onChange={(e) => setAddForm({ ...addForm, expiryDate: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 text-sm transition-colors"
                  />
                </div>
                {addError && (
                  <p className="text-xs text-red-500 font-bold bg-red-50 border border-red-100 rounded-lg p-2.5">
                    ⚠️ {addError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full btn-primary text-sm py-2.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addLoading ? 'Creating...' : 'Create Member Profile'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
