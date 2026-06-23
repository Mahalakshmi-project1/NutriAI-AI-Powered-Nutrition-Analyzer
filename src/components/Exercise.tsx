import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ExerciseRecord } from '../types/database'
import { Dumbbell, Plus, Edit2, Trash2, X, Flame, Clock, Calendar, Target, TrendingUp } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const exerciseTypes = [
  { name: 'Running', caloriesPerMin: 10, icon: '🏃', category: 'Cardio' },
  { name: 'Cycling', caloriesPerMin: 8, icon: '🚴', category: 'Cardio' },
  { name: 'Swimming', caloriesPerMin: 11, icon: '🏊', category: 'Cardio' },
  { name: 'Weight Training', caloriesPerMin: 6, icon: '🏋️', category: 'Strength' },
  { name: 'Yoga', caloriesPerMin: 4, icon: '🧘', category: 'Flexibility' },
  { name: 'Walking', caloriesPerMin: 4, icon: '🚶', category: 'Cardio' },
  { name: 'HIIT', caloriesPerMin: 12, icon: '💪', category: 'HIIT' },
  { name: 'Dance', caloriesPerMin: 7, icon: '💃', category: 'Cardio' },
  { name: 'Cricket', caloriesPerMin: 5, icon: '🏏', category: 'Sports' },
  { name: 'Badminton', caloriesPerMin: 6, icon: '🏸', category: 'Sports' },
]

export default function ExerciseTracker() {
  const { profile } = useAuth()
  const [exercises, setExercises] = useState<ExerciseRecord[]>([])
  const [weeklyExercises, setWeeklyExercises] = useState<ExerciseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingExercise, setEditingExercise] = useState<ExerciseRecord | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    exercise_type: 'Running', duration: 30, calories_burned: 300,
    date: new Date().toISOString().split('T')[0], notes: '',
  })

  useEffect(() => {
    if (profile) { fetchExercises(); fetchWeekly() }
  }, [selectedDate, profile])

  function calculateCalories(exerciseType: string, duration: number): number {
    const exercise = exerciseTypes.find((e) => e.name === exerciseType)
    return exercise ? Math.round(exercise.caloriesPerMin * duration) : 100
  }

  async function fetchExercises() {
    try {
      const { data } = await supabase.from('exercise_records').select('*').eq('user_id', profile?.user_id).eq('date', selectedDate).order('created_at', { ascending: true })
      setExercises(data || [])
    } catch (error) {
      console.error('Error fetching exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchWeekly() {
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { data } = await supabase.from('exercise_records').select('*').eq('user_id', profile?.user_id).gte('date', weekAgo.toISOString().split('T')[0]).order('date', { ascending: true })
      setWeeklyExercises(data || [])
    } catch (error) {
      console.error('Error fetching weekly:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || submitting) return
    setSubmitting(true)

    try {
      const data = {
        user_id: profile.user_id, exercise_type: formData.exercise_type,
        duration: Number(formData.duration), calories_burned: Number(formData.calories_burned),
        date: formData.date, notes: formData.notes || null,
      }

      if (editingExercise) {
        await supabase.from('exercise_records').update(data).eq('id', editingExercise.id)
      } else {
        await supabase.from('exercise_records').insert(data)
      }

      setShowModal(false); resetForm(); fetchExercises(); fetchWeekly()
    } catch (error) {
      console.error('Error saving exercise:', error)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this exercise record?')) return
    try {
      await supabase.from('exercise_records').delete().eq('id', id)
      fetchExercises(); fetchWeekly()
    } catch (error) {
      console.error('Error deleting exercise:', error)
    }
  }

  function openEditModal(exercise: ExerciseRecord) {
    setEditingExercise(exercise)
    setFormData({
      exercise_type: exercise.exercise_type, duration: exercise.duration,
      calories_burned: exercise.calories_burned, date: exercise.date, notes: exercise.notes || '',
    })
    setShowModal(true)
  }

  function resetForm() {
    setFormData({ exercise_type: 'Running', duration: 30, calories_burned: 300, date: selectedDate, notes: '' })
    setEditingExercise(null)
  }

  const totalCalories = exercises.reduce((sum, e) => sum + e.calories_burned, 0)
  const totalDuration = exercises.reduce((sum, e) => sum + e.duration, 0)

  // Weekly stats
  const weeklyCalories = weeklyExercises.reduce((sum, e) => sum + e.calories_burned, 0)
  const weeklyDuration = weeklyExercises.reduce((sum, e) => sum + e.duration, 0)

  // Weekly chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const dailyData = last7Days.map((day) => {
    const dayExercises = weeklyExercises.filter((e) => e.date === day)
    return dayExercises.reduce((sum, e) => sum + e.calories_burned, 0)
  })

  const chartData = {
    labels: last7Days.map((d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [{
      label: 'Calories Burned',
      data: dailyData,
      backgroundColor: '#16a34a',
      borderRadius: 8,
    }],
  }

  // Exercise type distribution
  const typeCounts: Record<string, number> = {}
  weeklyExercises.forEach((e) => {
    typeCounts[e.exercise_type] = (typeCounts[e.exercise_type] || 0) + e.calories_burned
  })
  const pieData = {
    labels: Object.keys(typeCounts),
    datasets: [{
      data: Object.values(typeCounts),
      backgroundColor: ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    }],
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercise Tracker</h1>
          <p className="text-gray-500">Log workouts and track your fitness progress</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
          <button onClick={() => { resetForm(); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
            <Plus className="w-5 h-5" /> Add
          </button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 rounded-xl"><Flame className="w-6 h-6 text-orange-600" /></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalCalories}</div>
              <div className="text-sm text-gray-500">Calories Burned</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl"><Clock className="w-6 h-6 text-blue-600" /></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalDuration}</div>
              <div className="text-sm text-gray-500">Minutes Active</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-xl"><Target className="w-6 h-6 text-green-600" /></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{exercises.length}</div>
              <div className="text-sm text-gray-500">Workouts</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-xl"><TrendingUp className="w-6 h-6 text-purple-600" /></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{weeklyCalories}</div>
              <div className="text-sm text-gray-500">Weekly Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Charts */}
      {weeklyExercises.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Weekly Calories Burned</h2>
            <div className="h-48">
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Exercise Distribution</h2>
            <div className="h-48 flex items-center justify-center">
              <div className="w-48">
                <Doughnut data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Exercises */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>
      ) : exercises.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No exercises logged</h3>
          <p className="text-gray-500 mb-4">Track your workouts to see progress</p>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
            <Plus className="w-5 h-5" /> Log Exercise
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{exerciseTypes.find((e) => e.name === exercise.exercise_type)?.icon || '🏃'}</div>
                  <div>
                    <div className="font-medium text-gray-900">{exercise.exercise_type}</div>
                    <div className="text-sm text-gray-500">{exercise.duration} minutes{exercise.notes && ` • ${exercise.notes}`}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-orange-600">{exercise.calories_burned} kcal</div>
                    <div className="text-xs text-gray-500">burned</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(exercise)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(exercise.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Add</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {exerciseTypes.slice(0, 8).map((exercise) => (
            <button
              key={exercise.name}
              onClick={() => {
                setFormData({
                  ...formData,
                  exercise_type: exercise.name,
                  duration: 30,
                  calories_burned: calculateCalories(exercise.name, 30),
                })
                setShowModal(true)
              }}
              className="p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition text-left"
            >
              <div className="text-2xl mb-1">{exercise.icon}</div>
              <div className="font-medium text-gray-900 text-sm">{exercise.name}</div>
              <div className="text-xs text-gray-500">{exercise.caloriesPerMin} cal/min</div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full animate-fadeIn">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingExercise ? 'Edit Exercise' : 'Log Exercise'}</h2>
              <button onClick={() => { setShowModal(false); resetForm() }} className="p-2 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exercise Type</label>
                <select
                  value={formData.exercise_type}
                  onChange={(e) => {
                    const calories = calculateCalories(e.target.value, formData.duration)
                    setFormData({ ...formData, exercise_type: e.target.value, calories_burned: calories })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                >
                  {exerciseTypes.map((e) => (
                    <option key={e.name} value={e.name}>{e.icon} {e.name} ({e.caloriesPerMin} cal/min)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                  <input
                    type="number" value={formData.duration}
                    onChange={(e) => {
                      const duration = Number(e.target.value)
                      setFormData({ ...formData, duration, calories_burned: calculateCalories(formData.exercise_type, duration) })
                    }}
                    min="1" max="300"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                  <input
                    type="number" value={formData.calories_burned}
                    onChange={(e) => setFormData({ ...formData, calories_burned: Number(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date" value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                <input
                  type="text" value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g., Morning workout, felt great!"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="px-4 py-2 text-gray-600 font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                  {editingExercise ? 'Update' : 'Log Exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
