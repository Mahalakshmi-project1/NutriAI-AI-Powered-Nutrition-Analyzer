import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useNotifications } from '../hooks/useNotifications'
import { FoodRecord, WaterIntake, ExerciseRecord, BMIHistory } from '../types/database'
import { Flame, Target, Droplets, Activity, TrendingUp, Calendar, Apple, Award, ChevronRight, Download, Trophy, CheckCircle, Star, Sparkles, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getHubConfig } from './HealthHub'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

interface GoalAchievement {
  date: string
  goal_met: boolean
  calories_consumed: number
}

export default function Dashboard() {
  const { profile } = useAuth()
  const { darkMode } = useTheme()
  const { checkAndCreateNotifications } = useNotifications()
  const [foodRecords, setFoodRecords] = useState<FoodRecord[]>([])
  const [waterIntake, setWaterIntake] = useState<WaterIntake | null>(null)
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecord[]>([])
  const [bmiHistory, setBmiHistory] = useState<BMIHistory[]>([])
  const [weeklyData, setWeeklyData] = useState<number[]>([])
  const [goalAchievements, setGoalAchievements] = useState<GoalAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const hasCheckedNotifications = useRef(false)

  const today = new Date().toISOString().split('T')[0]
  const calorieGoal = profile?.daily_calorie_goal || 2000
  const proteinGoal = Math.round((profile?.weight || 70) * 1.6)
  const carbGoal = Math.round(calorieGoal * 0.5 / 4)
  const fatGoal = Math.round(calorieGoal * 0.25 / 9)

  useEffect(() => {
    if (profile) {
      fetchDashboardData()
    }
  }, [profile])

  async function fetchDashboardData() {
    try {
      const { data: foods } = await supabase
        .from('food_records')
        .select('*')
        .eq('user_id', profile?.user_id)
        .eq('date', today)
        .order('created_at', { ascending: true })

      const { data: water } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', profile?.user_id)
        .eq('date', today)
        .maybeSingle()

      const { data: exercises } = await supabase
        .from('exercise_records')
        .select('*')
        .eq('user_id', profile?.user_id)
        .eq('date', today)

      const { data: bmi } = await supabase
        .from('bmi_history')
        .select('*')
        .eq('user_id', profile?.user_id)
        .order('created_at', { ascending: false })
        .limit(7)

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { data: weeklyFoods } = await supabase
        .from('food_records')
        .select('date, calories')
        .eq('user_id', profile?.user_id)
        .gte('date', weekAgo.toISOString().split('T')[0])

      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      const { data: monthlyFoods } = await supabase
        .from('food_records')
        .select('date, calories')
        .eq('user_id', profile?.user_id)
        .gte('date', monthAgo.toISOString().split('T')[0])

      setFoodRecords(foods || [])
      setWaterIntake(water)
      setExerciseRecords(exercises || [])
      setBmiHistory(bmi || [])

      const dailyCalories: Record<string, number> = {}
      ;(weeklyFoods || []).forEach((f) => {
        dailyCalories[f.date] = (dailyCalories[f.date] || 0) + Number(f.calories)
      })

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split('T')[0]
      })
      setWeeklyData(last7Days.map((d) => dailyCalories[d] || 0))

      const monthlyCalories: Record<string, number> = {}
      ;(monthlyFoods || []).forEach((f) => {
        monthlyCalories[f.date] = (monthlyCalories[f.date] || 0) + Number(f.calories)
      })

      const achievements: GoalAchievement[] = Object.entries(monthlyCalories).map(([date, calories]) => ({
        date,
        goal_met: calories >= calorieGoal,
        calories_consumed: calories
      }))
      setGoalAchievements(achievements)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check for goal achievements and create notifications
  useEffect(() => {
    if (!loading && profile && !hasCheckedNotifications.current) {
      hasCheckedNotifications.current = true
      checkAndCreateNotifications()
    }
  }, [loading, profile, checkAndCreateNotifications])

  const totalCalories = foodRecords.reduce((sum, f) => sum + Number(f.calories), 0)
  const totalProtein = foodRecords.reduce((sum, f) => sum + Number(f.protein), 0)
  const totalCarbs = foodRecords.reduce((sum, f) => sum + Number(f.carbohydrates), 0)
  const totalFats = foodRecords.reduce((sum, f) => sum + Number(f.fats), 0)
  const caloriesBurned = exerciseRecords.reduce((sum, e) => sum + e.calories_burned, 0)
  const netCalories = totalCalories - caloriesBurned

  const calorieProgress = calorieGoal > 0 ? Math.min(100, Math.round((totalCalories / calorieGoal) * 100)) : 0
  const proteinProgress = proteinGoal > 0 ? Math.min(100, Math.round((totalProtein / proteinGoal) * 100)) : 0
  const carbProgress = carbGoal > 0 ? Math.min(100, Math.round((totalCarbs / carbGoal) * 100)) : 0
  const fatProgress = fatGoal > 0 ? Math.min(100, Math.round((totalFats / fatGoal) * 100)) : 0
  const waterProgress = Math.min(100, Math.round(((waterIntake?.glasses || 0) / 8) * 100))

  const nutritionScore = Math.round((proteinProgress + calorieProgress) / 2)

  const currentBMI = bmiHistory[0]

  const dailyGoalAchieved = totalCalories >= calorieGoal
  const weeklyAchievements = goalAchievements.filter(a => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(a.date) >= weekAgo && a.goal_met
  }).length
  const monthlyAchievements = goalAchievements.filter(a => a.goal_met).length
  const achievementRate = goalAchievements.length > 0
    ? Math.round((monthlyAchievements / goalAchievements.length) * 100)
    : 0

  const remainingCalories = Math.max(0, calorieGoal - totalCalories + caloriesBurned)

  function exportToPDF() {
    const doc = new jsPDF()
    const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    doc.setFontSize(22)
    doc.setTextColor(22, 163, 74)
    doc.text('NutriAI Dashboard Report', 20, 20)
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${todayDate}`, 20, 30)
    doc.text(`User: ${profile?.full_name || 'User'}`, 20, 38)

    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Daily Nutrition Summary', 20, 55)

    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Consumed', 'Goal', 'Progress']],
      body: [
        ['Calories', `${Math.round(totalCalories)} kcal`, `${calorieGoal} kcal`, `${calorieProgress}%`],
        ['Protein', `${Math.round(totalProtein)} g`, `${proteinGoal} g`, `${proteinProgress}%`],
        ['Carbohydrates', `${Math.round(totalCarbs)} g`, `${carbGoal} g`, `${carbProgress}%`],
        ['Fats', `${Math.round(totalFats)} g`, `${fatGoal} g`, `${fatProgress}%`],
        ['Water', `${waterIntake?.glasses || 0} glasses`, '8 glasses', `${waterProgress}%`],
        ['Exercise Burned', `${caloriesBurned} kcal`, '-', '-'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
    })

    const finalY = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(16)
    doc.text("Today's Meals", 20, finalY)

    if (foodRecords.length > 0) {
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Food', 'Meal', 'Quantity', 'Calories', 'Protein']],
        body: foodRecords.map(f => [
          f.food_name,
          f.meal_type,
          `${f.quantity} ${f.serving_unit}`,
          `${Math.round(Number(f.calories))} kcal`,
          `${Math.round(Number(f.protein))} g`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] },
      })
    } else {
      doc.setFontSize(11)
      doc.setTextColor(150, 150, 150)
      doc.text('No food logged today', 20, finalY + 10)
    }

    const weeklyY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : finalY + 30
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Weekly Calorie Trend', 20, weeklyY)

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    })

    autoTable(doc, {
      startY: weeklyY + 5,
      head: [['Day', 'Calories']],
      body: weekDays.map((day, i) => [day, `${weeklyData[i]} kcal`]),
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
    })

    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text('Generated by NutriAI - AI-Powered Nutrition Analyzer', 20, pageHeight - 10)

    doc.save(`NutriAI_Report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const chartData = {
    labels: Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toLocaleDateString('en-US', { weekday: 'short' })
    }),
    datasets: [{
      label: 'Calories',
      data: weeklyData,
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22, 163, 74, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointBackgroundColor: '#16a34a',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }],
  }

  const macrosData = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [{
      data: [totalProtein * 4, totalCarbs * 4, totalFats * 9],
      backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your nutrition overview for today</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Daily Goal Achievement Card */}
      {dailyGoalAchieved ? (
        <div className="bg-gradient-to-r from-green-500 to-emerald-400 rounded-2xl p-6 text-white animate-pulse-subtle">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Trophy className="w-10 h-10" />
            </div>
            <div>
              <div className="text-lg opacity-90">Daily Goal Achieved!</div>
              <div className="text-3xl font-bold flex items-center gap-2">
                <CheckCircle className="w-8 h-8" /> Congratulations!
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4" />
            You've reached your daily calorie goal of {calorieGoal} kcal. Keep up the great work!
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{weeklyAchievements}</div>
              <div className="text-sm opacity-80">This Week</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{monthlyAchievements}</div>
              <div className="text-sm opacity-80">This Month</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{achievementRate}%</div>
              <div className="text-sm opacity-80">Success Rate</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm opacity-80">Today's Nutrition Score</div>
                <div className="text-4xl font-bold">{nutritionScore}%</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">Daily Goal</div>
              <div className="text-2xl font-bold">{calorieGoal} kcal</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${calorieProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span>{totalCalories} consumed</span>
              <span>{remainingCalories} remaining</span>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Badges Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyAchievements}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Weekly Goals Met</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyAchievements}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Goals Met</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{achievementRate}%</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Achievement Rate</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<Flame className="w-6 h-6" />} label="Calories" value={Math.round(totalCalories)} goal={calorieGoal} unit="kcal" color="orange" progress={calorieProgress} darkMode={darkMode} />
        <StatsCard icon={<Target className="w-6 h-6" />} label="Protein" value={Math.round(totalProtein)} goal={proteinGoal} unit="g" color="red" progress={proteinProgress} darkMode={darkMode} />
        <StatsCard icon={<Droplets className="w-6 h-6" />} label="Water" value={waterIntake?.glasses || 0} goal={8} unit="glasses" color="blue" progress={waterProgress} darkMode={darkMode} />
        <StatsCard icon={<Activity className="w-6 h-6" />} label="Burned" value={caloriesBurned} unit="kcal" color="green" progress={0} darkMode={darkMode} />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Daily Progress</h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Calories</span>
                <span className={`font-semibold ${calorieProgress >= 100 ? 'text-green-600' : calorieProgress > 80 ? 'text-yellow-600' : 'text-gray-900 dark:text-white'}`}>
                  {Math.round(totalCalories)} / {calorieGoal} kcal ({calorieProgress}%)
                </span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${calorieProgress >= 100 ? 'bg-green-500' : calorieProgress > 80 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, calorieProgress)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Protein</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{Math.round(totalProtein)} / {proteinGoal} g</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, proteinProgress)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Carbohydrates</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{Math.round(totalCarbs)} / {carbGoal} g</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, carbProgress)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Fats</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">{Math.round(totalFats)} / {fatGoal} g</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, fatProgress)}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(netCalories)}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Net Calories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{remainingCalories}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Remaining</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${currentBMI ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                {currentBMI?.bmi || '--'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Current BMI</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Macro Distribution</h2>
          <div className="aspect-square max-w-[180px] mx-auto">
            <Doughnut data={macrosData} options={{ responsive: true, maintainAspectRatio: true, cutout: '60%', plugins: { legend: { display: false } } }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-1" />
              <div className="font-medium text-gray-900 dark:text-white">{Math.round(totalProtein)}g</div>
              <div className="text-gray-500 dark:text-gray-400">Protein</div>
            </div>
            <div>
              <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-1" />
              <div className="font-medium text-gray-900 dark:text-white">{Math.round(totalCarbs)}g</div>
              <div className="text-gray-500 dark:text-gray-400">Carbs</div>
            </div>
            <div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 mx-auto mb-1" />
              <div className="font-medium text-gray-900 dark:text-white">{Math.round(totalFats)}g</div>
              <div className="text-gray-500 dark:text-gray-400">Fats</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Calorie Trend</h2>
          {weeklyData.reduce((a, b) => a + b, 0) > 0 && (
            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4" />
              On Track
            </div>
          )}
        </div>
        {weeklyData.reduce((a, b) => a + b, 0) > 0 ? (
          <div className="h-64">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: darkMode ? '#374151' : '#f3f4f6' }, ticks: { callback: (v) => `${v} kcal`, color: darkMode ? '#9ca3af' : '#6b7280' } }, x: { grid: { display: false }, ticks: { color: darkMode ? '#9ca3af' : '#6b7280' } } } }} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No data for this week yet</p>
              <p className="text-sm">Start logging your meals!</p>
            </div>
          </div>
        )}
      </div>

      {/* Today's Meals */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Meals</h2>
          <Link to="/app/food" className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1 hover:underline">
            Add Food <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {foodRecords.length === 0 ? (
          <div className="text-center py-8">
            <Apple className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 mb-1">No food logged today</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Start tracking to see your progress</p>
          </div>
        ) : (
          <div className="space-y-3">
            {foodRecords.slice(0, 5).map((food) => (
              <div key={food.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${food.meal_type === 'breakfast' ? 'bg-yellow-100 dark:bg-yellow-900/30' : food.meal_type === 'lunch' ? 'bg-orange-100 dark:bg-orange-900/30' : food.meal_type === 'dinner' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                    {food.meal_type === 'breakfast' ? '🌅' : food.meal_type === 'lunch' ? '☀️' : food.meal_type === 'dinner' ? '🌙' : '🍎'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{food.food_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{food.quantity} {food.serving_unit} • {food.meal_type}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600 dark:text-green-400">{Math.round(Number(food.calories))} kcal</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">P:{Math.round(Number(food.protein))}g</div>
                </div>
              </div>
            ))}
            {foodRecords.length > 5 && (
              <Link to="/app/food" className="block text-center py-2 text-sm text-green-600 dark:text-green-400 font-medium hover:underline">
                View all {foodRecords.length} items →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Health Hub Banner */}
      {(() => {
        const hub = getHubConfig(profile?.gender as any)
        return (
          <Link to="/app/womens-health"
            className={`block rounded-xl border p-4 ${hub.accentBg} ${hub.accentBorder} hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${hub.iconBg} rounded-lg`}>
                  <Heart className={`w-5 h-5 ${hub.iconColor}`} />
                </div>
                <div>
                  <p className={`font-semibold ${hub.accentText}`}>Welcome to your {hub.hubName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{hub.tagline}</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${hub.accentText} flex-shrink-0`} />
            </div>
          </Link>
        )
      })()}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction to="/app/food" icon={<Apple className="w-6 h-6" />} label="Log Food" color="green" darkMode={darkMode} />
        <QuickAction to="/app/water" icon={<Droplets className="w-6 h-6" />} label="Water" color="blue" darkMode={darkMode} />
        <QuickAction to="/app/exercise" icon={<Activity className="w-6 h-6" />} label="Exercise" color="orange" darkMode={darkMode} />
        <QuickAction to="/app/bmi" icon={<Target className="w-6 h-6" />} label="BMI" color="purple" darkMode={darkMode} />
      </div>
    </div>
  )
}

function StatsCard({ icon, label, value, goal, unit, color, progress, darkMode }: {
  icon: React.ReactNode; label: string; value: number; goal?: number; unit: string; color: 'orange' | 'red' | 'blue' | 'green'; progress: number; darkMode?: boolean
}) {
  const bgColors = { orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${bgColors[color]}`}>{icon}</div>
        {goal && progress > 0 && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${progress >= 100 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : progress >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
            {progress}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      </div>
      {goal && <div className="mt-2 flex justify-between text-xs text-gray-400 dark:text-gray-500"><span>Goal: {goal} {unit}</span></div>}
    </div>
  )
}

function QuickAction({ to, icon, label, color, darkMode }: { to: string; icon: React.ReactNode; label: string; color: 'green' | 'blue' | 'orange' | 'purple'; darkMode?: boolean }) {
  const colors = {
    green: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  }

  return (
    <Link to={to} className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${colors[color]}`}>
      {icon}
      <span className="mt-2 text-sm font-medium">{label}</span>
    </Link>
  )
}
