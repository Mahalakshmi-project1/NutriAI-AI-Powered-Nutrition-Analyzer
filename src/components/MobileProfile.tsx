import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import {
  User, Mail, Phone, MapPin, Target, Activity, TrendingUp, ChevronRight,
  Calendar, Scale, Ruler, Heart, Settings, Bell, LogOut, Edit2, Check,
  Moon, Sun, Droplets
} from 'lucide-react'
import { isMobileApp, requestNotificationPermission, scheduleWaterReminders, scheduleMealReminders, scheduleExerciseReminders, scheduleDailyHealthTip, getPreference, setPreference } from '../lib/mobile'

interface ProfileData {
  full_name: string
  email: string
  phone?: string
  location?: string
  date_of_birth?: string
  gender?: string
  height?: number
  weight?: number
  target_weight?: number
  activity_level?: string
  health_goals?: string[]
  dietary_preferences?: string[]
}

export default function MobileProfile() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [editing, setEditing] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
    loadPreferences()
  }, [user])

  async function loadProfile() {
    if (!user) return

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile({
        full_name: data.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: data.phone || '',
        location: data.location || '',
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        height: data.height || 170,
        weight: data.weight || 70,
        target_weight: data.target_weight || 65,
        activity_level: data.activity_level || 'moderate',
        health_goals: data.health_goals || ['weight_loss'],
        dietary_preferences: data.dietary_preferences || []
      })
    }
  }

  async function loadPreferences() {
    const darkModePref = await getPreference('dark_mode')
    setDarkMode(darkModePref === 'true')

    const notifPref = await getPreference('notifications_enabled')
    setNotificationsEnabled(notifPref === 'true')
  }

  async function handleNotificationToggle() {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission()
      if (granted) {
        await scheduleWaterReminders(8)
        await scheduleMealReminders()
        await scheduleExerciseReminders(18)
        await scheduleDailyHealthTip()
        setNotificationsEnabled(true)
        await setPreference('notifications_enabled', 'true')
      }
    } else {
      setNotificationsEnabled(false)
      await setPreference('notifications_enabled', 'false')
    }
  }

  async function handleDarkModeToggle() {
    const newValue = !darkMode
    setDarkMode(newValue)
    await setPreference('dark_mode', String(newValue))
    document.documentElement.classList.toggle('dark', newValue)
  }

  async function handleSaveProfile() {
    if (!user || !profile) return

    setSaving(true)
    try {
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          location: profile.location,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          target_weight: profile.target_weight,
          activity_level: profile.activity_level,
          health_goals: profile.health_goals,
          updated_at: new Date().toISOString()
        })

      setEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const genderOptions = ['Male', 'Female', 'Prefer not to say']
  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary' },
    { value: 'light', label: 'Lightly Active' },
    { value: 'moderate', label: 'Moderately Active' },
    { value: 'very_active', label: 'Very Active' }
  ]
  const goalOptions = [
    { value: 'weight_loss', label: 'Weight Loss', icon: TrendingUp },
    { value: 'muscle_gain', label: 'Muscle Gain', icon: Activity },
    { value: 'maintenance', label: 'Maintenance', icon: Target },
    { value: 'improve_health', label: 'Improve Health', icon: Heart }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 text-white">
        <div className="px-4 pt-12 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
            <button
              onClick={() => setEditing(!editing)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              {editing ? <Check className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              {editing ? (
                <input
                  type="text"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(p => p ? { ...p, full_name: e.target.value } : null)}
                  className="w-full bg-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                  placeholder="Your Name"
                />
              ) : (
                <h2 className="text-xl font-semibold">{profile?.full_name}</h2>
              )}
              <p className="text-white/70 flex items-center gap-1 mt-1">
                <Mail className="w-4 h-4" />
                {profile?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex bg-white/10 mx-4 -mb-6 rounded-xl p-4">
          <div className="flex-1 text-center border-r border-white/20">
            <div className="text-2xl font-bold">{profile?.height || '--'}</div>
            <div className="text-xs text-white/70">Height (cm)</div>
          </div>
          <div className="flex-1 text-center border-r border-white/20">
            <div className="text-2xl font-bold">{profile?.weight || '--'}</div>
            <div className="text-xs text-white/70">Weight (kg)</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold">{profile?.target_weight || '--'}</div>
            <div className="text-xs text-white/70">Target (kg)</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-10 space-y-4">
        {/* Personal Details Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-green-500" />
              Personal Details
            </h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {/* Phone */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">Phone</span>
              </div>
              {editing ? (
                <input
                  type="tel"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile(p => p ? { ...p, phone: e.target.value } : null)}
                  className="w-40 text-right bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-gray-900 dark:text-white"
                  placeholder="+91..."
                />
              ) : (
                <span className="text-gray-900 dark:text-white">{profile?.phone || 'Not set'}</span>
              )}
            </div>

            {/* Location */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">Location</span>
              </div>
              {editing ? (
                <input
                  type="text"
                  value={profile?.location || ''}
                  onChange={(e) => setProfile(p => p ? { ...p, location: e.target.value } : null)}
                  className="w-40 text-right bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-gray-900 dark:text-white"
                  placeholder="City"
                />
              ) : (
                <span className="text-gray-900 dark:text-white">{profile?.location || 'Not set'}</span>
              )}
            </div>

            {/* Date of Birth */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">Date of Birth</span>
              </div>
              {editing ? (
                <input
                  type="date"
                  value={profile?.date_of_birth || ''}
                  onChange={(e) => setProfile(p => p ? { ...p, date_of_birth: e.target.value } : null)}
                  className="w-40 text-right bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-gray-900 dark:text-white"
                />
              ) : (
                <span className="text-gray-900 dark:text-white">{profile?.date_of_birth || 'Not set'}</span>
              )}
            </div>

            {/* Gender */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">Gender</span>
              </div>
              {editing ? (
                <select
                  value={profile?.gender || ''}
                  onChange={(e) => setProfile(p => p ? { ...p, gender: e.target.value } : null)}
                  className="w-40 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-gray-900 dark:text-white"
                >
                  <option value="">Select</option>
                  {genderOptions.map(g => (
                    <option key={g} value={g.toLowerCase()}>{g}</option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-900 dark:text-white capitalize">{profile?.gender || 'Not set'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Health Goals Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              Health Goals
            </h3>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {goalOptions.map(goal => (
                <button
                  key={goal.value}
                  onClick={() => editing && setProfile(p => {
                    if (!p) return null
                    const goals = p.health_goals || []
                    const newGoals = goals.includes(goal.value)
                      ? goals.filter(g => g !== goal.value)
                      : [...goals, goal.value]
                    return { ...p, health_goals: newGoals }
                  })}
                  className={`p-3 rounded-lg flex flex-col items-center gap-2 transition ${
                    profile?.health_goals?.includes(goal.value)
                      ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-500'
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
                  } ${editing ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <goal.icon className={`w-6 h-6 ${
                    profile?.health_goals?.includes(goal.value) ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm ${
                    profile?.health_goals?.includes(goal.value)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}>{goal.label}</span>
                </button>
              ))}
            </div>

            {/* Activity Level */}
            <div className="mt-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Activity Level</label>
              {editing ? (
                <select
                  value={profile?.activity_level || 'moderate'}
                  onChange={(e) => setProfile(p => p ? { ...p, activity_level: e.target.value } : null)}
                  className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                >
                  {activityLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              ) : (
                <div className="text-gray-900 dark:text-white capitalize">
                  {activityLevels.find(l => l.value === profile?.activity_level)?.label || 'Moderately Active'}
                </div>
              )}
            </div>

            {/* Height/Weight Inputs */}
            {editing && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Height (cm)</label>
                  <input
                    type="number"
                    value={profile?.height || ''}
                    onChange={(e) => setProfile(p => p ? { ...p, height: Number(e.target.value) } : null)}
                    className="w-full bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Weight (kg)</label>
                  <input
                    type="number"
                    value={profile?.weight || ''}
                    onChange={(e) => setProfile(p => p ? { ...p, weight: Number(e.target.value) } : null)}
                    className="w-full bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Target (kg)</label>
                  <input
                    type="number"
                    value={profile?.target_weight || ''}
                    onChange={(e) => setProfile(p => p ? { ...p, target_weight: Number(e.target.value) } : null)}
                    className="w-full bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-green-500" />
              App Settings
            </h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {/* Push Notifications */}
            {isMobileApp() && (
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">Push Notifications</span>
                </div>
                <button
                  onClick={handleNotificationToggle}
                  className={`w-12 h-7 rounded-full transition ${
                    notificationsEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            )}

            {/* Dark Mode */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-gray-400" />}
                <span className="text-gray-600 dark:text-gray-300">Dark Mode</span>
              </div>
              <button
                onClick={handleDarkModeToggle}
                className={`w-12 h-7 rounded-full transition ${
                  darkMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {editing && (
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        )}

        {/* Sign Out */}
        <button
          onClick={signOut}
          className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
