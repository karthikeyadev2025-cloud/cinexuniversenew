import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Bell, Globe, Moon, CreditCard, LogOut, Save, Check, ChevronRight } from 'lucide-react'
import { useRoleStore } from '../stores/roleStore'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'Telugu' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const user = useRoleStore((s) => s.user)
  const isAuthenticated = useRoleStore((s) => s.isAuthenticated)
  const logout = useRoleStore((s) => s.logout)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'language' | 'billing'>('profile')
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [language, setLanguage] = useState('en')
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-[#060606] flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-[#A3A3A3] font-inter text-lg mb-4">Please sign in to view your settings</p>
          <button onClick={() => navigate('/login')} className="btn-primary px-6 py-3">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const tabs = [
    { key: 'profile' as const, label: 'Profile', icon: User },
    { key: 'notifications' as const, label: 'Notifications', icon: Bell },
    { key: 'language' as const, label: 'Language', icon: Globe },
    { key: 'billing' as const, label: 'Billing', icon: CreditCard },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#060606] text-[#F0F0F0] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-cinzel text-2xl font-bold text-white mb-1">Settings</h1>
          <p className="font-inter text-sm text-[#888888]">Manage your account, preferences, and subscription</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[#111111] border border-[#242424] rounded-xl overflow-hidden">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left font-inter text-sm transition-all ${
                    activeTab === t.key
                      ? 'bg-[rgba(212,168,83,0.08)] text-[#D4A853] border-l-2 border-[#D4A853]'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-[#181818]'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </button>
              ))}
              <div className="border-t border-[#242424]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left font-inter text-sm text-[#E74C3C] hover:bg-[#181818] transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-[#111111] border border-[#242424] rounded-xl p-6">
                <h2 className="font-space-grotesk text-lg font-semibold text-white mb-6">Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-inter text-xs text-[#6B6B6B] uppercase mb-1.5">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4A853]"
                    />
                  </div>
                  <div>
                    <label className="block font-inter text-xs text-[#6B6B6B] uppercase mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4A853]"
                    />
                  </div>
                  <div>
                    <label className="block font-inter text-xs text-[#6B6B6B] uppercase mb-1.5">Role</label>
                    <input
                      type="text"
                      value={user?.role || 'user'}
                      disabled
                      className="w-full bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-[#888888] outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-[#D4A853] text-[#060606] px-4 py-2.5 rounded-lg font-inter text-sm font-medium hover:bg-[#c49a48] transition-colors"
                      >
                        <Save className="w-4 h-4" /> Save Changes
                      </button>
                      {saved && <span className="text-sm text-[#27AE60] flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-[#111111] border border-[#242424] rounded-xl p-6">
                <h2 className="font-space-grotesk text-lg font-semibold text-white mb-6">Notifications</h2>
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
                    <div>
                      <p className="font-inter text-sm text-white">Email Notifications</p>
                      <p className="font-inter text-xs text-[#6B6B6B]">Receive updates about your projects</p>
                    </div>
                    <button
                      onClick={() => setEmailNotif(!emailNotif)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${emailNotif ? 'bg-[#D4A853]' : 'bg-[#333333]'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${emailNotif ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
                    <div>
                      <p className="font-inter text-sm text-white">Push Notifications</p>
                      <p className="font-inter text-xs text-[#6B6B6B]">Browser alerts for important events</p>
                    </div>
                    <button
                      onClick={() => setPushNotif(!pushNotif)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${pushNotif ? 'bg-[#D4A853]' : 'bg-[#333333]'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${pushNotif ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'language' && (
              <div className="bg-[#111111] border border-[#242424] rounded-xl p-6">
                <h2 className="font-space-grotesk text-lg font-semibold text-white mb-6">Language & Region</h2>
                <div className="space-y-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                        language === lang.code
                          ? 'border-[#D4A853]/40 bg-[rgba(212,168,83,0.04)]'
                          : 'border-[#242424] hover:border-[#333333]'
                      }`}
                    >
                      <span className="font-inter text-sm text-white">{lang.label}</span>
                      {language === lang.code && <Check className="w-4 h-4 text-[#D4A853]" />}
                    </button>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-[#1a1a1a]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-inter text-sm text-white">Dark Mode</p>
                      <p className="font-inter text-xs text-[#6B6B6B]">Always on for Cinex Universe</p>
                    </div>
                    <Moon className="w-5 h-5 text-[#D4A853]" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="bg-[#111111] border border-[#242424] rounded-xl p-6">
                <h2 className="font-space-grotesk text-lg font-semibold text-white mb-6">Billing</h2>
                <div className="bg-[#0D0D0D] border border-[#242424] rounded-lg p-5 mb-6">
                  <p className="font-inter text-xs text-[#6B6B6B] uppercase mb-1">Current Plan</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-space-grotesk text-lg font-semibold text-white">Starter</p>
                      <p className="font-inter text-sm text-[#888888]">Free forever</p>
                    </div>
                    <Link to="/pricing" className="text-[#D4A853] font-inter text-sm hover:underline">Upgrade</Link>
                  </div>
                </div>
                <p className="font-inter text-sm text-[#6B6B6B] text-center">Payment history will appear here once you upgrade to a paid plan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
