import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { NotificationProvider } from '../hooks/useNotifications'
import ProfileModal from './ProfileModal'
import NotificationCenter, { NotificationBell } from './NotificationCenter'
import { getHubConfig } from './HealthHub'
import { LayoutDashboard, Utensils, Calculator, Droplets, Dumbbell, Brain, LogOut, Menu, X, Apple, Moon, Sun, MessageCircle, IndianRupee, AlertTriangle, MapPin, ChevronDown, ChevronRight, Heart, User } from 'lucide-react'

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/food', icon: Utensils, label: 'Food Tracking' },
  { to: '/app/bmi', icon: Calculator, label: 'BMI Calculator' },
  { to: '/app/water', icon: Droplets, label: 'Water Intake' },
  { to: '/app/exercise', icon: Dumbbell, label: 'Exercise' },
  { to: '/app/recommendations', icon: Brain, label: 'AI Recommendations' },
]

const staticAiTools = [
  { to: '/app/chatbot', icon: MessageCircle, label: 'NutriAI Chatbot' },
  { to: '/app/budget-planner', icon: IndianRupee, label: 'Budget Diet Planner' },
  { to: '/app/deficiency', icon: AlertTriangle, label: 'Deficiency Detector' },
  { to: '/app/local-foods', icon: MapPin, label: 'Local Food Discovery' },
]

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiToolsOpen, setAiToolsOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const hubConfig = getHubConfig(profile?.gender as any)
  const aiTools = [
    ...staticAiTools.slice(0, 3),
    { to: '/app/womens-health', icon: Heart, label: hubConfig.hubName },
    ...staticAiTools.slice(3),
  ]

  const handleSignOut = async () => {
    setProfileDropdownOpen(false)
    await signOut()
    navigate('/')
  }

  const openProfileModal = () => {
    setProfileDropdownOpen(false)
    setProfileModalOpen(true)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User'
  const displayEmail = user?.email || ''
  const avatarLetter = displayName.charAt(0).toUpperCase()

  return (
    <>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <NavLink to="/" className="flex items-center gap-2">
            <Apple className="w-8 h-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">NutriAI</span>
          </NavLink>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 flex flex-col">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? darkMode
                        ? 'bg-green-600/20 text-green-400 font-medium'
                        : 'bg-green-50 text-green-700 font-medium'
                      : darkMode
                        ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}

            <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setAiToolsOpen(!aiToolsOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${
                  darkMode
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5" />
                  <span className="font-medium">AI Tools</span>
                </div>
                {aiToolsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {aiToolsOpen && (
                <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                  {aiTools.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                          isActive
                            ? darkMode
                              ? 'bg-green-600/20 text-green-400 font-medium'
                              : 'bg-green-50 text-green-700 font-medium'
                            : darkMode
                              ? 'text-gray-500 hover:bg-gray-700 hover:text-white'
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </div>


        </nav>

        <div className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className={`sticky top-0 z-40 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:hidden flex justify-center">
              <div className="flex items-center gap-2">
                <Apple className="w-6 h-6 text-green-600" />
                <span className="font-bold text-gray-900 dark:text-white">NutriAI</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-between flex-1">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI-Powered Nutrition Analyzer
              </h1>

              {/* Right section: Back to Home + Dark Mode + Notifications + Profile */}
              <div className="flex items-center gap-3">
                {/* Back to Home — preserved exactly */}
                <NavLink to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  Back to Home
                </NavLink>

                {/* Divider */}
                <span className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

                {/* Notification Bell */}
                <NotificationBell />

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Profile section */}
                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen((v) => !v)}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ring-2 ring-green-100 dark:ring-green-900">
                        {avatarLetter}
                      </div>
                      {/* Name + Email */}
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{displayName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{displayEmail}</div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-50 animate-dropdown">
                        {/* Header card */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-base ring-2 ring-green-100 dark:ring-green-900">
                              {avatarLetter}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{displayEmail}</div>
                            </div>
                          </div>
                        </div>
                        {/* Menu items */}
                        <div className="py-1">
                          <button
                            onClick={openProfileModal}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                          >
                            <User className="w-4 h-4" /> My Profile
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="w-6 lg:hidden" />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <div className="animate-fadeIn">
            <Outlet context={{ darkMode }} />
          </div>
        </main>
      </div>

      {/* Profile Modal */}
      {profileModalOpen && <ProfileModal onClose={() => setProfileModalOpen(false)} />}

      {/* Notification Center */}
      <NotificationCenter />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>

    {/* Notification Center */}
    <NotificationCenter />
    </>
  )
}

export default DashboardLayout
