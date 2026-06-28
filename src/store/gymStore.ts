'use client'

import { create } from 'zustand'
import axios from 'axios'

export interface Member {
  id: number
  name: string
  email: string
  phone: string
  status: 'active' | 'expired' | 'expiring' | 'inactive'
  membershipType: 'Monthly' | 'Quarterly' | 'Annual' | 'Weekly'
  joinDate: string
  expiryDate: string
}

export interface AttendanceRecord {
  id: number
  memberId: number
  memberName: string
  date: string // YYYY-MM-DD
  time: string // HH:MM AM/PM
  status: 'present' | 'absent'
}

export interface MessageAlert {
  id: number
  title: string
  content: string
  type: 'alert' | 'announcement' | 'reminder'
  recipient: string
  date: string
}

export interface GymSettings {
  gymName: string
  email: string
  phone: string
  address: string
}

interface GymState {
  members: Member[]
  attendance: AttendanceRecord[]
  messages: MessageAlert[]
  settings: GymSettings
  fetchInitialData: () => Promise<void>
  addMember: (member: Omit<Member, 'id' | 'joinDate'>) => Promise<void>
  updateMember: (id: number, member: Partial<Member>) => Promise<void>
  updateMemberStatus: (id: number, status: Member['status']) => Promise<void>
  markAttendance: (memberId: number) => Promise<void>
  sendMessage: (msg: Omit<MessageAlert, 'id' | 'date'>) => Promise<void>
  updateSettings: (settings: Partial<GymSettings>) => Promise<void>
}

export const useGymStore = create<GymState>((set) => ({
  members: [],
  attendance: [],
  messages: [],
  settings: {
    gymName: 'The Fitness Gym',
    email: 'support@fitnessgym.com',
    phone: '+1 (555) 999-8888',
    address: '123 Main St, New York, NY',
  },
  
  fetchInitialData: async () => {
    try {
      const [membersRes, attendanceRes, messagesRes, settingsRes] = await Promise.all([
        axios.get('/api/members'),
        axios.get('/api/attendance'),
        axios.get('/api/messages'),
        axios.get('/api/settings')
      ])

      set({
        members: membersRes.data.data || [],
        attendance: attendanceRes.data.data || [],
        messages: messagesRes.data.data || [],
        settings: settingsRes.data.data || {
          gymName: 'The Fitness Gym',
          email: 'support@fitnessgym.com',
          phone: '+1 (555) 999-8888',
          address: '123 Main St, New York, NY',
        }
      })
    } catch (error) {
      console.error('Failed to load initial database settings', error)
    }
  },

  addMember: async (member) => {
    try {
      const res = await axios.post('/api/members', member)
      const newMember = res.data.data
      set((state) => ({ members: [...state.members, newMember] }))
    } catch (error) {
      console.error('Failed to create member record', error)
    }
  },

  updateMember: async (id, updatedFields) => {
    try {
      const res = await axios.put(`/api/members/${id}`, updatedFields)
      const updated = res.data.data
      set((state) => ({
        members: state.members.map((m) => (m.id === id ? updated : m))
      }))
    } catch (error) {
      console.error('Failed to update member profile', error)
    }
  },

  updateMemberStatus: async (id, status) => {
    try {
      const res = await axios.put(`/api/members/${id}`, { status })
      const updated = res.data.data
      set((state) => ({
        members: state.members.map((m) => (m.id === id ? updated : m))
      }))
    } catch (error) {
      console.error('Failed to update member status', error)
    }
  },

  markAttendance: async (memberId) => {
    try {
      const res = await axios.post('/api/attendance', { memberId })
      const newRecord = res.data.data
      set((state) => ({
        attendance: [newRecord, ...state.attendance]
      }))
    } catch (error) {
      console.error('Failed to log attendance check-in', error)
    }
  },

  sendMessage: async (msg) => {
    try {
      const res = await axios.post('/api/messages', msg)
      const newMessage = res.data.data
      set((state) => ({
        messages: [newMessage, ...state.messages]
      }))
    } catch (error) {
      console.error('Failed to record broadcast alert log', error)
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const res = await axios.post('/api/settings', newSettings)
      const updated = res.data.data
      set({ settings: updated })
    } catch (error) {
      console.error('Failed to update gym configurations settings', error)
    }
  }
}))
