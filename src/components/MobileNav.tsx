import { NavLink, useLocation } from 'react-router-dom'
import { Home, LayoutDashboard, Brain, Heart, User } from 'lucide-react'
import { isMobileApp } from '../lib/mobile'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/ai-tools', icon: Brain, label: 'AI Tools' },
  { path: '/health-hub', icon: Heart, label: 'Health Hub' },
  { path: '/profile', icon: User, label: 'Profile' }
]

export default function MobileNav() {
  const location = useLocation()

  if (!isMobileApp()) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path))

          return (
            <NavLink
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors ${
                isActive
                  ? 'text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-medium' : ''}`}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
