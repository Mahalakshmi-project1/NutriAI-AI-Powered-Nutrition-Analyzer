import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
  notifications: boolean
  toggleNotifications: () => void
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
  toastMessage: { message: string; type: 'success' | 'error' | 'info' } | null
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('nutriai_dark_mode')
    return saved === 'true'
  })
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('nutriai_notifications')
    return saved !== 'false'
  })
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const { profile } = useAuth()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('nutriai_dark_mode', String(darkMode))

    if (profile) {
      supabase.from('user_profiles').update({ dark_mode: darkMode }).eq('user_id', profile.user_id).then()
    }
  }, [darkMode, profile])

  useEffect(() => {
    localStorage.setItem('nutriai_notifications', String(notifications))

    if (profile) {
      supabase.from('user_profiles').update({ notifications_enabled: notifications }).eq('user_id', profile.user_id).then()
    }
  }, [notifications, profile])

  useEffect(() => {
    if (profile) {
      supabase.from('user_profiles').select('dark_mode, notifications_enabled').eq('user_id', profile.user_id).maybeSingle().then(({ data }) => {
        if (data) {
          if (data.dark_mode !== null) setDarkMode(data.dark_mode)
          if (data.notifications_enabled !== null) setNotifications(data.notifications_enabled)
        }
      })
    }
  }, [profile])

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  const toggleNotifications = () => {
    setNotifications(prev => {
      const newValue = !prev
      showToast(newValue ? 'Notifications Enabled' : 'Notifications Disabled', 'success')
      return newValue
    })
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, notifications, toggleNotifications, showToast, toastMessage }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
