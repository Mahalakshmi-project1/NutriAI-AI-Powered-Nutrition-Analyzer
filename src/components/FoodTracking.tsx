import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { FoodRecord, FoodDatabase } from '../types/database'
import { Plus, Search, Edit2, Trash2, X, Utensils, Clock, Flame, AlertCircle, Loader2, Minus, ToggleLeft, ToggleRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export default function FoodTracking() {
  const { profile } = useAuth()
  const { darkMode } = useTheme()
  const [foodRecords, setFoodRecords] = useState<FoodRecord[]>([])
  const [foodDatabase, setFoodDatabase] = useState<FoodDatabase[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFood, setEditingFood] = useState<FoodRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchResults, setSearchResults] = useState<FoodDatabase[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [quantityError, setQuantityError] = useState('')
  const [decimalMode, setDecimalMode] = useState(false)

  const [formData, setFormData] = useState({
    food_name: '', quantity: 1, serving_unit: 'serving', calories: 0, protein: 0,
    carbohydrates: 0, fats: 0, fiber: 0, meal_type: 'breakfast' as typeof mealTypes[number],
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => { fetchFoodRecords(); fetchFoodDatabase() }, [selectedDate])

  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = foodDatabase.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(results.slice(0, 10))
    } else {
      setSearchResults([])
    }
  }, [searchQuery, foodDatabase])

  async function fetchFoodRecords() {
    try {
      const { data } = await supabase.from('food_records').select('*').eq('user_id', profile?.user_id).eq('date', selectedDate).order('created_at', { ascending: true })
      setFoodRecords(data || [])
    } catch (error) {
      console.error('Error fetching food records:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchFoodDatabase() {
    try {
      const { data } = await supabase.from('food_database').select('*').order('name', { ascending: true })
      setFoodDatabase(data || [])
    } catch (error) {
      console.error('Error fetching food database:', error)
    }
  }

  function selectFoodFromDatabase(food: FoodDatabase) {
    setFormData({
      ...formData,
      food_name: food.name, serving_unit: food.serving_size,
      calories: food.calories_per_serving, protein: food.protein_per_serving,
      carbohydrates: food.carbs_per_serving, fats: food.fats_per_serving, fiber: food.fiber_per_serving || 0,
    })
    setSearchQuery('')
    setSearchResults([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || submitting) return
    setSubmitting(true)

    try {
      const data = {
        user_id: profile.user_id,
        ...formData,
        quantity: Number(formData.quantity),
        calories: Number(formData.calories) * Number(formData.quantity),
        protein: Number(formData.protein) * Number(formData.quantity),
        carbohydrates: Number(formData.carbohydrates) * Number(formData.quantity),
        fats: Number(formData.fats) * Number(formData.quantity),
        fiber: Number(formData.fiber) * Number(formData.quantity),
      }

      if (editingFood) {
        await supabase.from('food_records').update(data).eq('id', editingFood.id)
      } else {
        await supabase.from('food_records').insert(data)
      }

      setShowModal(false)
      resetForm()
      fetchFoodRecords()
    } catch (error) {
      console.error('Error saving food record:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this food record?')) return
    try {
      await supabase.from('food_records').delete().eq('id', id)
      fetchFoodRecords()
    } catch (error) {
      console.error('Error deleting food record:', error)
    }
  }

  function openEditModal(food: FoodRecord) {
    setEditingFood(food)
    const qty = Number(food.quantity)
    // Auto-detect if quantity was decimal
    const isDecimal = !Number.isInteger(qty)
    setDecimalMode(isDecimal || qty < 1)
    setQuantityError('')
    setFormData({
      food_name: food.food_name, quantity: qty, serving_unit: food.serving_unit,
      calories: Number(food.calories) / qty, protein: Number(food.protein) / qty,
      carbohydrates: Number(food.carbohydrates) / qty, fats: Number(food.fats) / qty,
      fiber: Number(food.fiber || 0) / qty, meal_type: food.meal_type, date: food.date,
    })
    setShowModal(true)
  }

  function resetForm() {
    setFormData({
      food_name: '', quantity: 1, serving_unit: 'serving', calories: 0, protein: 0,
      carbohydrates: 0, fats: 0, fiber: 0, meal_type: 'breakfast', date: selectedDate,
    })
    setEditingFood(null)
    setSearchQuery('')
    setQuantityError('')
  }

  function handleQuantityChange(value: number) {
    if (decimalMode) {
      // Decimal mode: allow decimals with minimum 0.1
      const validValue = Math.max(0.1, value)
      setFormData({ ...formData, quantity: validValue })
      setQuantityError('')
    } else {
      // Whole number mode: only allow positive integers
      if (value < 1) {
        setQuantityError('Please enter a valid quantity (minimum 1)')
      } else if (!Number.isInteger(value)) {
        setQuantityError('Please enter a whole number (or enable Decimal Mode)')
      } else {
        setQuantityError('')
      }
      const validValue = Math.max(1, Math.floor(value))
      setFormData({ ...formData, quantity: validValue })
    }
  }

  function incrementQuantity() {
    const newValue = decimalMode ? formData.quantity + 0.5 : formData.quantity + 1
    setFormData({ ...formData, quantity: newValue })
    setQuantityError('')
  }

  function decrementQuantity() {
    const minimum = decimalMode ? 0.1 : 1
    const decrement = decimalMode ? 0.5 : 1
    const newValue = Math.max(minimum, formData.quantity - decrement)
    setFormData({ ...formData, quantity: newValue })
    setQuantityError('')
  }

  const foodsByMeal = mealTypes.reduce((acc, meal) => {
    acc[meal] = foodRecords.filter((f) => f.meal_type === meal)
    return acc
  }, {} as Record<typeof mealTypes[number], FoodRecord[]>)

  // Calculate totals
  const totalCalories = foodRecords.reduce((sum, f) => sum + Number(f.calories), 0)
  const totalProtein = foodRecords.reduce((sum, f) => sum + Number(f.protein), 0)
  const totalCarbs = foodRecords.reduce((sum, f) => sum + Number(f.carbohydrates), 0)
  const totalFats = foodRecords.reduce((sum, f) => sum + Number(f.fats), 0)

  const calorieGoal = profile?.daily_calorie_goal || 2000
  const calorieProgress = calorieGoal > 0 ? Math.round((totalCalories / calorieGoal) * 100) : 0
  const remainingCalories = Math.max(0, calorieGoal - totalCalories)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food Tracking</h1>
          <p className="text-gray-500 dark:text-gray-400">Log and manage your daily food intake</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={() => { resetForm(); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            <Plus className="w-5 h-5" /> Add Food
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Calories" value={Math.round(totalCalories)} goal={calorieGoal} unit="kcal" color="orange" progress={calorieProgress} darkMode={darkMode} />
        <SummaryCard label="Protein" value={Math.round(totalProtein)} goal={Math.round((profile?.weight || 70) * 1.6)} unit="g" color="red" darkMode={darkMode} />
        <SummaryCard label="Carbs" value={Math.round(totalCarbs)} goal={200} unit="g" color="blue" darkMode={darkMode} />
        <SummaryCard label="Fats" value={Math.round(totalFats)} goal={65} unit="g" color="yellow" darkMode={darkMode} />
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Goal Progress</span>
          <span className={`text-sm font-semibold ${calorieProgress > 100 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {calorieProgress}% of {calorieGoal} kcal
          </span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${calorieProgress > 100 ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(100, calorieProgress)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Remaining: {remainingCalories} kcal</span>
          <span>{foodRecords.length} items logged</span>
        </div>
      </div>

      {/* Food List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : foodRecords.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No food logged</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Start tracking your nutrition</p>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
            <Plus className="w-5 h-5" /> Add Food
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {mealTypes.map((meal) => foodsByMeal[meal].length > 0 && (
            <div key={meal} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{meal}</h3>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {foodsByMeal[meal].reduce((sum, f) => sum + Number(f.calories), 0).toFixed(0)} kcal
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {foodsByMeal[meal].map((food) => (
                  <div key={food.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{food.food_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{food.quantity} {food.serving_unit}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-green-600 dark:text-green-400">{Math.round(Number(food.calories))} kcal</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          P:{Math.round(Number(food.protein))}g • C:{Math.round(Number(food.carbohydrates))}g • F:{Math.round(Number(food.fats))}g
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(food)} className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(food.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingFood ? 'Edit Food' : 'Add Food'}</h2>
              <button onClick={() => { setShowModal(false); resetForm() }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Search Foods */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Foods</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search food database..." autoFocus
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                    {searchResults.map((food) => (
                      <button
                        key={food.id} type="button" onClick={() => selectFoodFromDatabase(food)}
                        className="w-full px-4 py-2 text-left hover:bg-green-50 dark:hover:bg-green-900/20 flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{food.name}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({food.category})</span>
                        </div>
                        <span className="text-sm text-green-600 dark:text-green-400">{food.calories_per_serving} kcal</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Food Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Food Name *</label>
                <input
                  type="text" value={formData.food_name} onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                  placeholder="e.g., Banana, Dal Tadka"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Meal Type & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meal *</label>
                  <select
                    value={formData.meal_type} onChange={(e) => setFormData({ ...formData, meal_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {mealTypes.map((m) => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date *</label>
                  <input
                    type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity *</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={decrementQuantity}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleQuantityChange(Number(e.target.value))}
                      min={decimalMode ? 0.1 : 1}
                      step={decimalMode ? 0.1 : 1}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center ${
                        quantityError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={incrementQuantity}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {quantityError && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {quantityError}
                    </p>
                  )}
                  {/* Decimal mode toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setDecimalMode(!decimalMode)
                      if (!decimalMode) {
                        // Switching to decimal mode
                        setQuantityError('')
                      } else {
                        // Switching to whole number mode - round down if needed
                        const rounded = Math.max(1, Math.floor(formData.quantity))
                        setFormData({ ...formData, quantity: rounded })
                        setQuantityError('')
                      }
                    }}
                    className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {decimalMode ? (
                      <ToggleRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    <span>{decimalMode ? 'Decimal Mode' : 'Whole Number Mode'}</span>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Serving Unit *</label>
                  <input
                    type="text" value={formData.serving_unit} onChange={(e) => setFormData({ ...formData, serving_unit: e.target.value })}
                    placeholder="e.g., cup, piece, tbsp"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Nutrients per serving */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Flame className="w-4 h-4 inline mr-1 text-orange-500" />
                    Calories (per serving) *
                  </label>
                  <input
                    type="number" value={formData.calories} onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Protein (g) *</label>
                  <input
                    type="number" value={formData.protein} onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                    min="0" step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Carbs (g) *</label>
                  <input
                    type="number" value={formData.carbohydrates} onChange={(e) => setFormData({ ...formData, carbohydrates: Number(e.target.value) })}
                    min="0" step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fat (g) *</label>
                  <input
                    type="number" value={formData.fats} onChange={(e) => setFormData({ ...formData, fats: Number(e.target.value) })}
                    min="0" step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Total Preview */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">Total (with {formData.quantity}x quantity)</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div><span className="font-bold text-green-700 dark:text-green-400">{Math.round(formData.calories * formData.quantity)}</span><span className="text-xs text-gray-500 dark:text-gray-400 ml-1">kcal</span></div>
                  <div><span className="font-bold text-red-700 dark:text-red-400">{Math.round(formData.protein * formData.quantity)}</span><span className="text-xs text-gray-500 dark:text-gray-400 ml-1">g P</span></div>
                  <div><span className="font-bold text-blue-700 dark:text-blue-400">{Math.round(formData.carbohydrates * formData.quantity)}</span><span className="text-xs text-gray-500 dark:text-gray-400 ml-1">g C</span></div>
                  <div><span className="font-bold text-yellow-700 dark:text-yellow-400">{Math.round(formData.fats * formData.quantity)}</span><span className="text-xs text-gray-500 dark:text-gray-400 ml-1">g F</span></div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button" onClick={() => { setShowModal(false); resetForm() }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingFood ? 'Update' : 'Add Food'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, goal, unit, color, progress, darkMode }: {
  label: string
  value: number
  goal: number
  unit: string
  color: 'orange' | 'red' | 'blue' | 'yellow'
  progress?: number
  darkMode?: boolean
}) {
  const colors = {
    orange: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20',
    red: 'border-red-400 bg-red-50 dark:bg-red-900/20',
    blue: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
    yellow: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  }
  const textColors = {
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
  }

  return (
    <div className={`p-4 rounded-xl border-l-4 ${colors[color]}`}>
      <div className={`text-2xl font-bold ${textColors[color]}`}>{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{unit}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
      {progress !== undefined && (
        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${progress > 100 ? 'bg-red-400' : 'bg-green-500'}`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </div>
  )
}
