'use client'

import { useState, useEffect } from 'react'
import { useGymStore } from '@/store/gymStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Mail, CheckCircle } from 'lucide-react'

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

const tabContentVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } }
}

export default function SettingsPage() {
  const { settings, updateSettings, sendMessage } = useGymStore()

  // Local form state
  const [formData, setFormData] = useState({
    gymName: '',
    email: '',
    phone: '',
    address: '',
  })

  const [activeSection, setActiveSection] = useState('general')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Sync state on load
  useEffect(() => {
    if (settings) {
      setFormData({
        gymName: settings.gymName,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
      })
    }
  }, [settings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings(formData)

    // Send a message notification about settings update
    sendMessage({
      title: 'Gym Settings Updated',
      content: `Gym configuration settings were updated successfully.`,
      type: 'announcement',
      recipient: 'All Members'
    })

    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
    }, 3000)
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5 font-display">Settings</h1>
        <p className="text-slate-500 text-sm">Configure and manage your gym details and system preferences.</p>
      </motion.div>

      {/* Settings Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2 h-fit">
          {[
            { icon: Mail, label: 'General Gym Info', id: 'general' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider transition-all border active:scale-98 ${
                  activeSection === item.id
                    ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/10'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm shadow-slate-100/50'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Main Configuration Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* General Section */}
            {activeSection === 'general' && (
              <motion.div
                key="general"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="card"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6 font-display">General Gym Details</h2>

                <form onSubmit={handleSave} className="space-y-5">
                  {/* Gym Name */}
                  <div>
                    <label className="block text-slate-655 text-xs font-semibold mb-1.5">Gym Name / Brand</label>
                    <input
                      type="text"
                      name="gymName"
                      required
                      value={formData.gymName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-slate-655 text-xs font-semibold mb-1.5">Public Support Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-slate-655 text-xs font-semibold mb-1.5">Contact Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-slate-655 text-xs font-semibold mb-1.5">Gym Physical Address</label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 text-xs transition-colors"
                    />
                  </div>

                  {/* Save and Toast feedback */}
                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="submit"
                      className="btn-primary flex items-center gap-2 text-xs py-2.5 px-6 shadow-md shadow-primary-500/10 font-sans tracking-wide uppercase font-bold"
                    >
                      <Save size={16} />
                      Save Configuration
                    </button>

                    {saveSuccess && (
                      <span className="text-green-600 text-xs font-bold flex items-center gap-1.5 animate-fade-in font-sans">
                        <CheckCircle size={14} className="text-green-600" />
                        Settings updated successfully!
                      </span>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
