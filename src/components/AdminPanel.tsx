import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { FoodDatabase } from '../types/database'
import { Shield, Users, Apple, BarChart3, Plus, Edit2, Trash2, X, Search } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

interface DashboardStats {
  totalUsers: number
  totalFoodsLogged: number
  avgDailyCalories: number
  topFoods: { name: string; count: number }[]
  categoryBreakdown: { category: string; count: number }[]
}

export default function AdminPanel() {
  const { profile } = useAuth()
  const [foodDatabase, setFoodDatabase] = useState<FoodDatabase[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFood, setEditingFood] = useState<FoodDatabase | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    name: '', category: 'Proteins', calories_per_serving: 0, protein_per_serving: 0,
    carbs_per_serving: 0, fats_per_serving: 0, fiber_per_serving: 0, serving_size: '1 serving',
  })

  const categories = ['Fruits', 'Vegetables', 'Proteins', 'Grains', 'Dairy', 'Nuts & Seeds', 'Snacks']

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const { data: foods } = await supabase.from('food_database').select('*').order('name', { ascending: true })
      setFoodDatabase(foods || [])

      const { data: allRecords } = await supabase.from('food_records').select('calories, date')
      const { data: allProfiles } = await supabase.from('user_profiles').select('user_id')

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentRecords = (allRecords || [])

      const totalCalories = recentRecords.reduce((sum, r) => sum + Number(r.calories), 0)
      const uniqueDays = [...new Set(recentRecords.map((r) => r.date))].length
      const avgDailyCalories = uniqueDays > 0 ? totalCalories / uniqueDays : 0

      const categoryCounts: Record<string, number> = {}
      ;(foods || []).forEach((f) => { categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1 })

      setStats({
        totalUsers: allProfiles?.length || 0,
        totalFoodsLogged: allRecords?.length || 0,
        avgDailyCalories: Math.round(avgDailyCalories),
        topFoods: [],
        categoryBreakdown: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })),
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingFood) {
        await supabase.from('food_database').update(formData).eq('id', editingFood.id)
      } else {
        await supabase.from('food_database').insert(formData)
      }
      setShowModal(false); resetForm(); fetchData()
    } catch (error) {
      console.error('Error saving food:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this food from the database?')) return
    try {
      await supabase.from('food_database').delete().eq('id', id)
      fetchData()
    } catch (error) {
      console.error('Error deleting food:', error)
    }
  }

  function openEditModal(food: FoodDatabase) {
    setEditingFood(food)
    setFormData({
      name: food.name, category: food.category, calories_per_serving: Number(food.calories_per_serving),
      protein_per_serving: Number(food.protein_per_serving), carbs_per_serving: Number(food.carbs_per_serving),
      fats_per_serving: Number(food.fats_per_serving), fiber_per_serving: Number(food.fiber_per_serving || 0),
      serving_size: food.serving_size,
    })
    setShowModal(true)
  }

  function resetForm() {
    setFormData({ name: '', category: 'Proteins', calories_per_serving: 0, protein_per_serving: 0, carbs_per_serving: 0, fats_per_serving: 0, fiber_per_serving: 0, serving_size: '1 serving' })
    setEditingFood(null)
  }

  const filteredFoods = foodDatabase.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.category.toLowerCase().includes(searchQuery.toLowerCase()))

  const categoryChartData = {
    labels: stats?.categoryBreakdown.map((c) => c.category) || [],
    datasets: [{ data: stats?.categoryBreakdown.map((c) => c.count) || [], backgroundColor: ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#ec4899', '#6b7280'] }],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">Manage food database and view analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
            <div><div className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</div><div className="text-sm text-gray-500">Total Users</div></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><Apple className="w-6 h-6 text-green-600" /></div>
            <div><div className="text-2xl font-bold text-gray-900">{stats?.totalFoodsLogged || 0}</div><div className="text-sm text-gray-500">Foods Logged</div></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><BarChart3 className="w-6 h-6 text-orange-600" /></div>
            <div><div className="text-2xl font-bold text-gray-900">{stats?.avgDailyCalories ? Math.round(stats.avgDailyCalories / 1000) : 0}k</div><div className="text-sm text-gray-500">Avg Daily Cal</div></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Shield className="w-6 h-6 text-purple-600" /></div>
            <div><div className="text-2xl font-bold text-gray-900">{foodDatabase.length}</div><div className="text-sm text-gray-500">Foods in DB</div></div>
          </div>
        </div>
      </div>

      {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Food Database Categories</h2>
          <div className="h-64 flex items-center justify-center">
            <div className="w-64">
              <Doughnut data={categoryChartData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Food Database</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search foods..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <button onClick={() => { resetForm(); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">
              <Plus className="w-5 h-5" /> Add Food
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Category</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Serving</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Calories</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Protein</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredFoods.map((food) => (
                <tr key={food.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{food.name}</td>
                  <td className="px-4 py-3 text-gray-600">{food.category}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{food.serving_size}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{food.calories_per_serving}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{food.protein_per_serving}g</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEditModal(food)} className="p-1 text-gray-400 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(food.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingFood ? 'Edit Food' : 'Add Food to Database'}</h2>
              <button onClick={() => { setShowModal(false); resetForm() }} className="p-2 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Food Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Category *</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">{categories.map((c) => (<option key={c} value={c}>{c}</option>))}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Serving Size *</label><input type="text" value={formData.serving_size} onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })} placeholder="e.g., 1 cup, 100g" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Calories *</label><input type="number" value={formData.calories_per_serving} onChange={(e) => setFormData({ ...formData, calories_per_serving: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Protein (g) *</label><input type="number" value={formData.protein_per_serving} onChange={(e) => setFormData({ ...formData, protein_per_serving: Number(e.target.value) })} step="0.1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Carbs (g) *</label><input type="number" value={formData.carbs_per_serving} onChange={(e) => setFormData({ ...formData, carbs_per_serving: Number(e.target.value) })} step="0.1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Fats (g) *</label><input type="number" value={formData.fats_per_serving} onChange={(e) => setFormData({ ...formData, fats_per_serving: Number(e.target.value) })} step="0.1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required /></div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">{editingFood ? 'Update' : 'Add Food'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
