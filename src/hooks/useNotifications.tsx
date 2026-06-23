import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { Bell, Droplets, Utensils, Dumbbell, Trophy, Star, Flame, Award, Clock, Sparkles, TrendingUp } from 'lucide-react'

export interface Notification {
  id: string
  user_id: string
  type: 'goal_achieved' | 'water_reminder' | 'meal_reminder' | 'exercise_reminder' | 'food_log_reminder' | 'daily_summary' | 'achievement' | 'streak'
  title: string
  message: string
  icon: string
  read: boolean
  data: Record<string, any>
  created_at: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_type: 'goal_achiver' | 'hydration_champion' | 'fitness_star' | 'healthy_eating_streak' | 'first_goal' | 'week_streak' | 'month_streak'
  achievement_name: string
  description: string
  icon: string
  earned_at: string
  metadata: Record<string, any>
}

interface NotificationContextType {
  notifications: Notification[]
  achievements: Achievement[]
  unreadCount: number
  showNotificationCenter: boolean
  setShowNotificationCenter: (show: boolean) => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  createNotification: (notification: Omit<Notification, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  checkAndCreateNotifications: () => Promise<void>
  showAchievement: (achievement: Achievement | null) => void
  currentAchievement: Achievement | null
  loading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  bell: Bell,
  droplets: Droplets,
  utensils: Utensils,
  dumbbell: Dumbbell,
  trophy: Trophy,
  star: Star,
  flame: Flame,
  award: Award,
  clock: Clock,
  sparkles: Sparkles,
  trending: TrendingUp,
}

export function IconFromName({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  const IconComponent = iconComponents[name] || Bell
  return <IconComponent className={className} />
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)
  const [loading, setLoading] = useState(true)

  const unreadCount = notifications.filter(n => !n.read).length

  const fetchNotifications = useCallback(async () => {
    if (!profile?.user_id) return
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false })
        .limit(50)
      setNotifications((data as Notification[]) || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [profile?.user_id])

  const fetchAchievements = useCallback(async () => {
    if (!profile?.user_id) return
    try {
      const { data } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('earned_at', { ascending: false })
      setAchievements((data as Achievement[]) || [])
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }, [profile?.user_id])

  useEffect(() => {
    if (profile) {
      fetchNotifications()
      fetchAchievements()
    }
  }, [profile, fetchNotifications, fetchAchievements])

  // Real-time subscription for notifications
  useEffect(() => {
    if (!profile?.user_id) return

    const channel = supabase
      .channel(`notifications:${profile.user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.user_id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.user_id])

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!profile?.user_id) return
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', profile.user_id)
        .eq('read', false)
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const createNotification = async (notification: Omit<Notification, 'id' | 'user_id' | 'created_at'>) => {
    if (!profile?.user_id) return
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: profile.user_id,
          ...notification,
        })
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  const createAchievement = useCallback(async (achievement: Omit<Achievement, 'id' | 'user_id' | 'earned_at'>) => {
    if (!profile?.user_id) return null
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: profile.user_id,
          ...achievement,
        }, {
          onConflict: 'user_id,achievement_type'
        })
        .select()
        .single()

      if (!error && data) {
        setAchievements(prev => {
          const exists = prev.find(a => a.achievement_type === achievement.achievement_type)
          if (exists) {
            return prev.map(a => a.achievement_type === achievement.achievement_type ? data as Achievement : a)
          }
          return [data as Achievement, ...prev]
        })
        setCurrentAchievement(data as Achievement)

        // Create notification for achievement
        await createNotification({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: achievement.achievement_name,
          icon: achievement.icon || 'trophy',
          read: false,
          data: { achievement_type: achievement.achievement_type },
        })

        return data as Achievement
      }
    } catch (error) {
      console.error('Error creating achievement:', error)
    }
    return null
  }, [profile?.user_id])

  const showAchievement = (achievement: Achievement | null) => {
    setCurrentAchievement(achievement)
  }

  // Check goals and create notifications
  const checkAndCreateNotifications = useCallback(async () => {
    if (!profile?.user_id) return

    const today = new Date().toISOString().split('T')[0]

    try {
      // Fetch today's data
      const { data: foodData } = await supabase
        .from('food_records')
        .select('calories')
        .eq('user_id', profile.user_id)
        .eq('date', today)

      const { data: waterData } = await supabase
        .from('water_intake')
        .select('glasses')
        .eq('user_id', profile.user_id)
        .eq('date', today)
        .maybeSingle()

      const { data: exerciseData } = await supabase
        .from('exercise_records')
        .select('duration_minutes')
        .eq('user_id', profile.user_id)
        .eq('date', today)

      const calorieGoal = profile?.daily_calorie_goal || 2000
      const totalCalories = (foodData || []).reduce((sum, f) => sum + Number(f.calories), 0)
      const waterGlasses = waterData?.glasses || 0
      const exerciseMinutes = (exerciseData || []).reduce((sum, e) => sum + e.duration_minutes, 0)

      const calorieProgress = calorieGoal > 0 ? Math.round((totalCalories / calorieGoal) * 100) : 0

      // Check for goal achievements (only notify once per day per goal type)
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('type')
        .eq('user_id', profile.user_id)
        .eq('type', 'goal_achieved')
        .gte('created_at', todayStart.toISOString())

      const alreadyNotified = existingNotifications?.some(n =>
        n.type === 'goal_achieved'
      )

      // Calorie goal achieved
      if (calorieProgress >= 100 && !alreadyNotified) {
        await createNotification({
          type: 'goal_achieved',
          title: 'Goal Achieved!',
          message: `Congratulations! You've reached your daily calorie goal of ${calorieGoal} kcal.`,
          icon: 'flame',
          read: false,
          data: { goalType: 'calories', value: totalCalories, target: calorieGoal },
        })

        // Check if this is first goal
        if (achievements.length === 0) {
          await createAchievement({
            achievement_type: 'first_goal',
            achievement_name: 'First Goal Achieved',
            description: 'You reached your first nutrition goal!',
            icon: 'star',
            metadata: { date: today },
          })
        }
      }

      // Water goal achieved
      if (waterGlasses >= 8) {
        const { data: waterNotified } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', profile.user_id)
          .eq('type', 'goal_achieved')
          .gte('created_at', todayStart.toISOString())
          .contains('data', { goalType: 'water' })

        if (!waterNotified?.length) {
          await createNotification({
            type: 'goal_achieved',
            title: 'Hydration Champion!',
            message: 'You drank 8 glasses of water today!',
            icon: 'droplets',
            read: false,
            data: { goalType: 'water', value: waterGlasses, target: 8 },
          })
        }
      }

      // Exercise goal check (30 min daily)
      if (exerciseMinutes >= 30) {
        const { data: exerciseNotified } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', profile.user_id)
          .eq('type', 'goal_achieved')
          .gte('created_at', todayStart.toISOString())
          .contains('data', { goalType: 'exercise' })

        if (!exerciseNotified?.length) {
          await createNotification({
            type: 'goal_achieved',
            title: 'Fitness Star!',
            message: `You exercised for ${exerciseMinutes} minutes today!`,
            icon: 'dumbbell',
            read: false,
            data: { goalType: 'exercise', value: exerciseMinutes, target: 30 },
          })
        }
      }

      // Create reminders based on time
      const now = new Date()
      const hour = now.getHours()

      // Water reminder (every 2 hours)
      if (waterGlasses < 8 && hour >= 8 && hour <= 22) {
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
        const { data: recentWaterReminder } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', profile.user_id)
          .eq('type', 'water_reminder')
          .gte('created_at', twoHoursAgo.toISOString())

        if (!recentWaterReminder?.length) {
          await createNotification({
            type: 'water_reminder',
            title: 'Water Reminder',
            message: `Stay hydrated! You've had ${waterGlasses}/8 glasses today.`,
            icon: 'droplets',
            read: false,
            data: { glasses: waterGlasses },
          })
        }
      }

      // Meal reminders
      if (hour >= 7 && hour <= 9) {
        // Breakfast reminder
        const breakfastLogged = (foodData || []).some(f => true) // Simplified check
        const { data: breakfastReminder } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', profile.user_id)
          .eq('type', 'meal_reminder')
          .gte('created_at', todayStart.toISOString())
          .contains('data', { meal: 'breakfast' })

        if (!breakfastReminder?.length && !breakfastLogged) {
          await createNotification({
            type: 'meal_reminder',
            title: 'Breakfast Reminder',
            message: "Don't forget to log your breakfast!",
            icon: 'utensils',
            read: false,
            data: { meal: 'breakfast' },
          })
        }
      }

      // Exercise reminder (if no exercise by 6 PM)
      if (hour >= 18 && exerciseMinutes === 0) {
        const { data: exerciseReminder } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', profile.user_id)
          .eq('type', 'exercise_reminder')
          .gte('created_at', todayStart.toISOString())

        if (!exerciseReminder?.length) {
          await createNotification({
            type: 'exercise_reminder',
            title: 'Exercise Reminder',
            message: "You haven't logged any exercise today. Even a short walk counts!",
            icon: 'dumbbell',
            read: false,
            data: {},
          })
        }
      }

    } catch (error) {
      console.error('Error checking notifications:', error)
    }
  }, [profile, achievements.length, createAchievement])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        achievements,
        unreadCount,
        showNotificationCenter,
        setShowNotificationCenter,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        createNotification,
        checkAndCreateNotifications,
        showAchievement,
        currentAchievement,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
