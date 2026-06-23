import { useState } from 'react'
import { useNotifications, IconFromName, Notification, Achievement } from '../hooks/useNotifications'
import { X, Bell, Check, Trash2, Trophy, Clock, Settings, ChevronLeft } from 'lucide-react'

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function AchievementModal({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60] animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-8 text-center relative overflow-hidden">
        {/* Confetti-like decorations */}
        <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute top-8 right-6 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
        <div className="absolute bottom-12 left-8 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
        <div className="absolute bottom-8 right-4 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />

        <div className="relative">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg animate-bounce">
            <IconFromName name={achievement.icon || 'trophy'} className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Achievement Unlocked!</h2>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-1">{achievement.achievement_name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{achievement.description}</p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  )
}

function NotificationCard({ notification, onMarkRead, onDelete }: {
  notification: Notification
  onMarkRead: () => void
  onDelete: () => void
}) {
  const unreadStyles = notification.read
    ? 'bg-gray-50 dark:bg-gray-800/50'
    : 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500'

  const iconBgColors: Record<string, string> = {
    goal_achieved: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    water_reminder: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    meal_reminder: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    exercise_reminder: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    food_log_reminder: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    daily_summary: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    achievement: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    streak: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  }

  return (
    <div className={`p-4 rounded-xl mb-2 ${unreadStyles} transition-all`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${iconBgColors[notification.type] || 'bg-gray-100 dark:bg-gray-700'}`}>
          <IconFromName name={notification.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{notification.title}</h4>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(notification.created_at)}
            </span>
            {!notification.read && (
              <button
                onClick={onMarkRead}
                className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark as read
              </button>
            )}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function AchievementsTab({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="space-y-3">
      {achievements.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No achievements yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Complete goals to earn badges!</p>
        </div>
      ) : (
        achievements.map(achievement => (
          <div
            key={achievement.id}
            className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <IconFromName name={achievement.icon || 'trophy'} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{achievement.achievement_name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Earned {new Date(achievement.earned_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default function NotificationCenter() {
  const {
    notifications,
    achievements,
    unreadCount,
    showNotificationCenter,
    setShowNotificationCenter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    currentAchievement,
    showAchievement,
    loading,
  } = useNotifications()

  const [activeTab, setActiveTab] = useState<'notifications' | 'achievements'>('notifications')

  if (!showNotificationCenter) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-50 animate-fadeIn"
        onClick={() => setShowNotificationCenter(false)}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col animate-slideIn">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotificationCenter(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === 'notifications'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === 'achievements'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
              {achievements.length > 0 && (
                <span className="text-xs text-gray-400">({achievements.length})</span>
              )}
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'notifications' ? (
            notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">We'll notify you when something happens!</p>
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                />
              ))
            )
          ) : (
            <AchievementsTab achievements={achievements} />
          )}
        </div>
      </div>

      {/* Achievement Modal */}
      {currentAchievement && (
        <AchievementModal
          achievement={currentAchievement}
          onClose={() => showAchievement(null)}
        />
      )}
    </>
  )
}

export function NotificationBell() {
  const { unreadCount, setShowNotificationCenter } = useNotifications()

  return (
    <button
      onClick={() => setShowNotificationCenter(true)}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
