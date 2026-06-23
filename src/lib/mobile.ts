import localforage from 'localforage'

// Initialize localforage for offline storage
localforage.config({
  name: 'NutriAI',
  storeName: 'offline_data',
  description: 'Offline storage for NutriAI app'
})

// Check if running as native mobile app (Capacitor)
// Safe check that doesn't require @capacitor/core import
let _isNativeApp: boolean | null = null

export function isMobileApp(): boolean {
  if (_isNativeApp === null) {
    // Check for Capacitor native platform indicator
    _isNativeApp = typeof window !== 'undefined' &&
      'Capacitor' in window &&
      (window as any).Capacitor?.isNativePlatform?.() === true
  }
  return _isNativeApp
}

export function getPlatform(): string {
  if (!isMobileApp()) return 'web'

  try {
    return (window as any).Capacitor?.getPlatform?.() || 'web'
  } catch {
    return 'web'
  }
}

// Splash Screen - Safe wrapper
export async function hideSplashScreen(): Promise<void> {
  if (!isMobileApp()) return

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch (error) {
    console.log('Splash screen not available:', error)
  }
}

// Notification Types
export interface NotificationSchedule {
  id: number
  title: string
  body: string
  schedule: Date
  recurring?: boolean
  extra?: Record<string, any>
}

// Request notification permissions - Safe wrapper
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isMobileApp()) return false

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const permission = await LocalNotifications.requestPermissions()
    return permission.display === 'granted'
  } catch (error) {
    console.error('Notification permission error:', error)
    return false
  }
}

// Schedule notification - Safe wrapper
export async function scheduleNotification(notification: NotificationSchedule): Promise<void> {
  if (!isMobileApp()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.schedule({
      notifications: [{
        id: notification.id,
        title: notification.title,
        body: notification.body,
        schedule: { at: notification.schedule },
        sound: 'default',
        extra: notification.extra || {}
      }]
    })
    console.log('Notification scheduled:', notification.id)
  } catch (error) {
    console.error('Schedule notification error:', error)
  }
}

// Cancel all notifications - Safe wrapper
export async function cancelAllNotifications(): Promise<void> {
  if (!isMobileApp()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map(n => ({ id: n.id }))
      })
    }
  } catch (error) {
    console.error('Cancel notifications error:', error)
  }
}

// Schedule daily water reminders
export async function scheduleWaterReminders(glassesPerDay: number = 8): Promise<void> {
  if (!isMobileApp()) return

  const notifications: any[] = []
  const now = new Date()
  const startHour = 8
  const endHour = 22
  const interval = (endHour - startHour) / glassesPerDay

  for (let i = 0; i < glassesPerDay; i++) {
    const scheduleTime = new Date()
    scheduleTime.setHours(startHour + Math.floor(i * interval), 0, 0, 0)

    if (scheduleTime > now) {
      notifications.push({
        id: 1000 + i,
        title: 'Water Reminder',
        body: 'Time to drink a glass of water! Stay hydrated for better health.',
        schedule: { at: scheduleTime },
        sound: 'default',
        extra: { type: 'water', glass: i + 1 }
      })
    }
  }

  if (notifications.length > 0) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await LocalNotifications.schedule({ notifications })
    } catch (error) {
      console.error('Schedule water reminders error:', error)
    }
  }
}

// Schedule meal reminders
export async function scheduleMealReminders(): Promise<void> {
  if (!isMobileApp()) return

  const meals = [
    { id: 2001, title: 'Breakfast Time', body: 'Start your day with a healthy breakfast!', hour: 8 },
    { id: 2002, title: 'Lunch Time', body: 'Time for a nutritious lunch!', hour: 12 },
    { id: 2003, title: 'Snack Time', body: 'Have a healthy snack to keep your energy up!', hour: 16 },
    { id: 2004, title: 'Dinner Time', body: 'End your day with a balanced dinner!', hour: 19 }
  ]

  const now = new Date()
  const notifications: any[] = []

  for (const meal of meals) {
    const scheduleTime = new Date()
    scheduleTime.setHours(meal.hour, 0, 0, 0)

    if (scheduleTime > now) {
      notifications.push({
        id: meal.id,
        title: meal.title,
        body: meal.body,
        schedule: { at: scheduleTime },
        sound: 'default',
        extra: { type: 'meal', meal: meal.title }
      })
    }
  }

  if (notifications.length > 0) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await LocalNotifications.schedule({ notifications })
    } catch (error) {
      console.error('Schedule meal reminders error:', error)
    }
  }
}

// Schedule exercise reminder
export async function scheduleExerciseReminders(preferredTime: number = 18): Promise<void> {
  if (!isMobileApp()) return

  const now = new Date()
  const scheduleTime = new Date()
  scheduleTime.setHours(preferredTime, 0, 0, 0)

  if (scheduleTime > now) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await LocalNotifications.schedule({
        notifications: [{
          id: 3001,
          title: 'Exercise Time!',
          body: 'Time for your daily workout. Keep moving towards your health goals!',
          schedule: { at: scheduleTime },
          sound: 'default',
          extra: { type: 'exercise' }
        }]
      })
    } catch (error) {
      console.error('Schedule exercise reminders error:', error)
    }
  }
}

// Schedule daily health tip
export async function scheduleDailyHealthTip(): Promise<void> {
  if (!isMobileApp()) return

  const tips = [
    'Drinking warm lemon water in the morning aids digestion.',
    'Include protein in every meal for sustained energy.',
    'A 10-minute walk after meals helps regulate blood sugar.',
    'Eating colorful vegetables ensures diverse nutrients.',
    'Proper sleep is essential for weight management.'
  ]

  const now = new Date()
  const scheduleTime = new Date()
  scheduleTime.setHours(9, 0, 0, 0)

  if (scheduleTime > now) {
    const randomTip = tips[Math.floor(Math.random() * tips.length)]
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await LocalNotifications.schedule({
        notifications: [{
          id: 4001,
          title: 'Health Tip of the Day',
          body: randomTip,
          schedule: { at: scheduleTime },
          sound: 'default',
          extra: { type: 'health_tip' }
        }]
      })
    } catch (error) {
      console.error('Schedule health tip error:', error)
    }
  }
}

// Offline Storage Types
export interface OfflineFoodLog {
  id: string
  user_id: string
  food_id: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  meal_type: string
  date: string
  synced: boolean
  created_at: string
}

export interface OfflineWaterLog {
  id: string
  user_id: string
  glasses: number
  date: string
  synced: boolean
  created_at: string
}

export interface OfflineExerciseLog {
  id: string
  user_id: string
  exercise_name: string
  duration_minutes: number
  calories_burned: number
  date: string
  synced: boolean
  created_at: string
}

// Save food log offline
export async function saveFoodLogOffline(log: Omit<OfflineFoodLog, 'synced' | 'created_at'>): Promise<OfflineFoodLog> {
  const offlineLog: OfflineFoodLog = {
    ...log,
    synced: false,
    created_at: new Date().toISOString()
  }

  const logs = await getOfflineFoodLogs()
  logs.push(offlineLog)
  await localforage.setItem('offline_food_logs', logs)

  return offlineLog
}

// Get offline food logs
export async function getOfflineFoodLogs(): Promise<OfflineFoodLog[]> {
  const logs = await localforage.getItem<OfflineFoodLog[]>('offline_food_logs')
  return logs || []
}

// Save water log offline
export async function saveWaterLogOffline(log: Omit<OfflineWaterLog, 'synced' | 'created_at'>): Promise<OfflineWaterLog> {
  const offlineLog: OfflineWaterLog = {
    ...log,
    synced: false,
    created_at: new Date().toISOString()
  }

  const logs = await getOfflineWaterLogs()
  logs.push(offlineLog)
  await localforage.setItem('offline_water_logs', logs)

  return offlineLog
}

// Get offline water logs
export async function getOfflineWaterLogs(): Promise<OfflineWaterLog[]> {
  const logs = await localforage.getItem<OfflineWaterLog[]>('offline_water_logs')
  return logs || []
}

// Save exercise log offline
export async function saveExerciseLogOffline(log: Omit<OfflineExerciseLog, 'synced' | 'created_at'>): Promise<OfflineExerciseLog> {
  const offlineLog: OfflineExerciseLog = {
    ...log,
    synced: false,
    created_at: new Date().toISOString()
  }

  const logs = await getOfflineExerciseLogs()
  logs.push(offlineLog)
  await localforage.setItem('offline_exercise_logs', logs)

  return offlineLog
}

// Get offline exercise logs
export async function getOfflineExerciseLogs(): Promise<OfflineExerciseLog[]> {
  const logs = await localforage.getItem<OfflineExerciseLog[]>('offline_exercise_logs')
  return logs || []
}

// Mark logs as synced
export async function markLogsSynced(type: 'food' | 'water' | 'exercise', ids: string[]): Promise<void> {
  const storageKey = `offline_${type}_logs`
  const logs = await localforage.getItem<any[]>(storageKey) || []

  const updatedLogs = logs.map(log => {
    if (ids.includes(log.id)) {
      return { ...log, synced: true }
    }
    return log
  })

  await localforage.setItem(storageKey, updatedLogs)
}

// Clear synced logs
export async function clearSyncedLogs(): Promise<void> {
  const keys = ['offline_food_logs', 'offline_water_logs', 'offline_exercise_logs']

  for (const key of keys) {
    const logs = await localforage.getItem<any[]>(key) || []
    const unsyncedLogs = logs.filter(log => !log.synced)
    await localforage.setItem(key, unsyncedLogs)
  }
}

// Check online status
export function isOnline(): boolean {
  return navigator.onLine
}

// Preferences storage - Safe wrapper
export async function setPreference(key: string, value: string): Promise<void> {
  if (isMobileApp()) {
    try {
      const { Preferences } = await import('@capacitor/preferences')
      await Preferences.set({ key, value })
    } catch {
      // Fallback to localStorage
      localStorage.setItem(`nutriai_${key}`, value)
    }
  } else {
    localStorage.setItem(`nutriai_${key}`, value)
  }
}

export async function getPreference(key: string): Promise<string | null> {
  if (isMobileApp()) {
    try {
      const { Preferences } = await import('@capacitor/preferences')
      const { value } = await Preferences.get({ key })
      return value
    } catch {
      // Fallback to localStorage
      return localStorage.getItem(`nutriai_${key}`)
    }
  } else {
    return localStorage.getItem(`nutriai_${key}`)
  }
}

export async function removePreference(key: string): Promise<void> {
  if (isMobileApp()) {
    try {
      const { Preferences } = await import('@capacitor/preferences')
      await Preferences.remove({ key })
    } catch {
      localStorage.removeItem(`nutriai_${key}`)
    }
  } else {
    localStorage.removeItem(`nutriai_${key}`)
  }
}
