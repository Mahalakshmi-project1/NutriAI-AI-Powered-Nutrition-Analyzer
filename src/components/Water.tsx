import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { WaterIntake as WaterIntakeType } from '../types/database'
import { Droplets, Plus, Minus, Calendar, Target, CheckCircle, TrendingUp } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function WaterIntake() {
  const { profile } = useAuth()
  const [waterIntake, setWaterIntake] = useState<WaterIntakeType | null>(null)
  const [waterHistory, setWaterHistory] = useState<{ date: string; glasses: number }[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const GLASS_SIZE = 250
  const DAILY_GOAL = 8

  useEffect(() => {
    if (profile) { fetchWaterIntake(); fetchHistory() }
  }, [selectedDate, profile])

  async function fetchWaterIntake() {
    try {
      const { data } = await supabase.from('water_intake').select('*').eq('user_id', profile?.user_id).eq('date', selectedDate).maybeSingle()
      setWaterIntake(data)
    } catch (error) {
      console.error('Error fetching water intake:', error)
    }
  }

  async function fetchHistory() {
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { data } = await supabase
        .from('water_intake')
        .select('date, glasses')
        .eq('user_id', profile?.user_id)
        .gte('date', weekAgo.toISOString().split('T')[0])
        .order('date', { ascending: true })
      setWaterHistory(data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  async function updateWaterIntake(delta: number) {
    const newGlasses = Math.max(0, Math.min(20, (waterIntake?.glasses || 0) + delta))

    try {
      if (waterIntake) {
        const { data } = await supabase.from('water_intake').update({ glasses: newGlasses }).eq('id', waterIntake.id).select().single()
        setWaterIntake(data)
      } else {
        const { data } = await supabase.from('water_intake').insert({ user_id: profile?.user_id, date: selectedDate, glasses: newGlasses }).select().single()
        setWaterIntake(data)
      }
      fetchHistory()
    } catch (error) {
      console.error('Error updating water intake:', error)
    }
  }

  const glasses = waterIntake?.glasses || 0
  const progress = (glasses / DAILY_GOAL) * 100
  const totalMl = glasses * GLASS_SIZE

  const chartData = {
    labels: waterHistory.map((h) => new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [{
      label: 'Glasses',
      data: waterHistory.map((h) => h.glasses),
      backgroundColor: waterHistory.map((h) => h.glasses >= DAILY_GOAL ? '#16a34a' : '#3b82f6'),
      borderRadius: 8,
    }],
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Water Intake</h1>
          <p className="text-gray-500">Track your daily hydration</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
      </div>

      {/* Main Tracker */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="max-w-md mx-auto">
          {/* Progress Ring */}
          <div className="flex justify-center mb-8">
            <div className="relative w-64 h-64">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="12" fill="none" className="text-blue-100" />
                <circle
                  cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="12" fill="none"
                  strokeDasharray={`${Math.min(progress, 100) * 6.91} 691`}
                  className={`${glasses >= DAILY_GOAL ? 'text-green-500' : 'text-blue-500'} transition-all duration-500`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Droplets className={`w-12 h-12 ${glasses >= DAILY_GOAL ? 'text-green-500' : 'text-blue-500'} mb-2`} />
                <div className="text-5xl font-bold text-gray-900">{glasses}</div>
                <div className="text-gray-500">of {DAILY_GOAL} glasses</div>
                <div className="text-sm font-medium text-blue-600 mt-1">{totalMl} ml</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => updateWaterIntake(-1)} disabled={glasses <= 0}
              className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-8 h-8" />
            </button>
            <button
              onClick={() => updateWaterIntake(1)} disabled={glasses >= 20}
              className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Plus className="w-10 h-10" />
            </button>
            <button
              onClick={() => updateWaterIntake(2)} disabled={glasses >= 20}
              className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl font-bold">+2</span>
            </button>
          </div>

          {/* Achievement */}
          {glasses >= DAILY_GOAL && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl text-center animate-fadeIn">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-green-700">Daily Goal Achieved!</div>
              <div className="text-sm text-green-600">Great job staying hydrated today!</div>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Chart */}
      {waterHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Weekly Progress</h2>
            </div>
            <span className="text-sm text-gray-500">Goal: {DAILY_GOAL} glasses/day</span>
          </div>
          <div className="h-48">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, max: Math.max(DAILY_GOAL + 2, ...waterHistory.map(h => h.glasses)) },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Hydration Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Hydration Tips</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Start Your Day Right', desc: 'Drink a glass of water first thing in the morning' },
            { title: 'Before Meals', desc: 'Have a glass 30 minutes before each meal' },
            { title: 'Keep It Close', desc: 'Keep a water bottle at your desk or in your bag' },
            { title: 'Set Reminders', desc: 'Use phone reminders every hour to drink water' },
            { title: 'Add Natural Flavor', desc: 'Add lemon, cucumber, or mint for variety' },
            { title: 'Eat Water-Rich Foods', desc: 'Include watermelon, cucumber, oranges in your diet' },
          ].map((tip, i) => (
            <div key={i} className="bg-white/80 rounded-lg p-3">
              <div className="font-medium text-gray-900">{tip.title}</div>
              <div className="text-sm text-gray-600">{tip.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
