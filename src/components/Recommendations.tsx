import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { FoodRecord, NutritionRecommendation } from '../types/database'
import { Brain, Lightbulb, Target, Apple, Beef, Salad, RefreshCw, AlertCircle, CheckCircle, IndianRupee, TrendingUp, Activity, Heart, Zap } from 'lucide-react'

interface AnalysisResult {
  bmi: { bmi: number; category: string } | null
  calorieStatus: 'under' | 'optimal' | 'over'
  recommendations: string[]
  mealSuggestions: string[]
  macroBalance: { protein: number; carbs: number; fats: number }
  dailyTips: string[]
  indianFoods: string[]
  exerciseTips: string[]
}

const INDIAN_FOOD_BY_BMI: Record<string, { foods: string[], tips: string[] }> = {
  'Underweight': {
    foods: [
      'Dal Tadka with Ghee - High protein and healthy fats',
      'Paneer Butter Masala - Rich in protein and calcium',
      'Almond Halwa - Energy-dense nutritious sweet',
      'Rajma Chawal - Complete protein combination',
      'Besan Ladoo - Protein and calorie rich snack',
      'Mango Lassi - Calorie and protein rich drink',
    ],
    tips: [
      'Eat 5-6 smaller meals throughout the day',
      'Add ghee to your dal and sabzi for extra calories',
      'Include nuts like almonds and cashews daily',
      'Choose whole milk and dairy products',
    ]
  },
  'Normal Weight': {
    foods: [
      'Grilled Fish Curry - Lean protein with omega-3',
      'Mix Vegetable Dal - Balanced nutrition',
      'Quinoa Khichdi - High protein grain alternative',
      'Sprouted Moong Salad - High fiber protein snack',
      'Palak Paneer - Iron and calcium rich',
      'Curd Rice with Pomegranate - Probiotic meal',
    ],
    tips: [
      'Maintain your balanced diet',
      'Include variety of vegetables daily',
      'Drink 8-10 glasses of water',
      'Practice portion control',
    ]
  },
  'Overweight': {
    foods: [
      'Tandoori Chicken - High protein, low fat',
      'Mixed Vegetable Raita - Low calorie, probiotic',
      'Moong Dal Soup - High protein, low calorie',
      'Grilled Fish Tikka - Omega-3 rich, lean protein',
      'Palak Soup - Low calorie, high iron',
      'Dalia Upma - High fiber, complex carbs',
    ],
    tips: [
      'Reduce portion sizes by 20%',
      'Avoid fried foods and sweets',
      'Include more fiber-rich vegetables',
      'Replace rice with millets occasionally',
      'Walk for 30 minutes after dinner',
    ]
  },
  'Obese Class I': {
    foods: [
      'Grilled Chicken Salad - Low calorie protein',
      'Lauki (Bottle Gourd) Sabzi - Very low calorie',
      'Methi (Fenugreek) Thepla - Fiber rich',
      'Sprouted Moong Chaat - High fiber protein',
      'Tomato and Cucumber Salad - Negative calorie food',
      'Oats Idli - Low glycemic breakfast',
    ],
    tips: [
      'Strictly avoid refined carbs (maida, white rice)',
      'Practice intermittent fasting (16:8)',
      'Replace dinner with soup and salad',
      'Exercise minimum 45 minutes daily',
      'Monitor portion sizes strictly',
    ]
  },
  'Obese Class II': {
    foods: [
      'Lauki Juice - Detoxifying, very low calorie',
      'Grilled Fish with Lemon - Pure protein',
      'Karela (Bitter Gourd) Sabzi - Sugar regulation',
      'Sprouted Moong - Complete plant protein',
      'Roasted Chana - High protein snack',
      'Cucumber Raita - Hydrating and filling',
    ],
    tips: [
      'Consult a dietitian for personalized plan',
      'Consider medical supervision for weight loss',
      'Track every calorie consumed',
      'Avoid eating after 7 PM',
      'Include strength training along with cardio',
    ]
  },
  'Obese Class III': {
    foods: [
      'Clear Vegetable Soup - Minimal calories',
      'Grilled Protein (Chicken/Fish) - No added fat',
      'Steamed Vegetables - No oil cooking',
      'Green Leafy Vegetables - Volume eating',
      'Protein Shakes with Water - Meal replacement',
      'Detox Green Juice - Nutrient dense',
    ],
    tips: [
      'Medical supervision essential',
      'Work with healthcare team',
      'Very low calorie diet may be needed',
      'Monitor blood sugar and blood pressure',
      'Physical therapy for safe exercise',
    ]
  }
}

export default function AIRecommendations() {
  const { profile } = useAuth()
  const [recommendations, setRecommendations] = useState<NutritionRecommendation[]>([])
  const [todayFoods, setTodayFoods] = useState<FoodRecord[]>([])
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => { if (profile) { fetchData() } }, [profile])

  async function fetchData() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: foods } = await supabase.from('food_records').select('*').eq('user_id', profile?.user_id).eq('date', today)
      const { data: recs } = await supabase.from('nutrition_recommendations').select('*').eq('user_id', profile?.user_id).order('created_at', { ascending: false }).limit(10)
      setTodayFoods(foods || [])
      setRecommendations(recs || [])
      if (foods && foods.length > 0) { performAnalysis(foods) }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  function performAnalysis(foods: FoodRecord[]) {
    const totalCalories = foods.reduce((sum, f) => sum + Number(f.calories), 0)
    const totalProtein = foods.reduce((sum, f) => sum + Number(f.protein), 0)
    const totalCarbs = foods.reduce((sum, f) => sum + Number(f.carbohydrates), 0)
    const totalFats = foods.reduce((sum, f) => sum + Number(f.fats), 0)

    const calorieGoal = profile?.daily_calorie_goal || 2000

    let bmiResult = null
    let bmiCategory = 'Normal Weight'
    if (profile?.weight && profile?.height) {
      const heightInMeters = profile.height / 100
      const bmi = profile.weight / (heightInMeters * heightInMeters)
      bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal Weight' : bmi < 30 ? 'Overweight' : bmi < 35 ? 'Obese Class I' : bmi < 40 ? 'Obese Class II' : 'Obese Class III'
      bmiResult = { bmi: Math.round(bmi * 10) / 10, category: bmiCategory }
    }

    const caloriePercent = (totalCalories / calorieGoal) * 100
    const calorieStatus: 'under' | 'optimal' | 'over' = caloriePercent < 80 ? 'under' : caloriePercent > 110 ? 'over' : 'optimal'

    const recommendations: string[] = []
    if (bmiResult) {
      if (bmiResult.category === 'Underweight') recommendations.push('Increase caloric intake with nutrient-dense whole foods')
      else if (bmiResult.category.includes('Obese')) recommendations.push('Focus on calorie deficit with adequate protein intake')
      else if (bmiResult.category === 'Overweight') recommendations.push('Reduce daily calories by 300-500 kcal through portion control')
      else recommendations.push('Maintain your excellent balanced diet approach')
    }
    if (calorieStatus === 'under') recommendations.push('Add a nutritious snack or increase portion sizes')
    else if (calorieStatus === 'over') recommendations.push('Consider replacing one meal with a lighter option')

    const hour = new Date().getHours()
    const mealSuggestions: string[] = []
    if (hour < 10) { mealSuggestions.push('Breakfast: Oats Upma with peanuts and vegetables'); mealSuggestions.push('Mid-morning: Fruit with chana') }
    else if (hour < 14) { mealSuggestions.push('Lunch: Roti + Dal + Sabzi + Curd'); mealSuggestions.push('Add a fresh salad for fiber') }
    else if (hour < 18) { mealSuggestions.push('Snack: Roasted makhana or fruits'); mealSuggestions.push('Evening: Green tea with limited sugar') }
    else { mealSuggestions.push('Dinner: Light khichdi or soup'); mealSuggestions.push('Avoid heavy meals and desserts after 8 PM') }

    const totalMacros = totalProtein * 4 + totalCarbs * 4 + totalFats * 9
    const macroBalance = {
      protein: totalMacros > 0 ? Math.round((totalProtein * 4 / totalMacros) * 100) : 25,
      carbs: totalMacros > 0 ? Math.round((totalCarbs * 4 / totalMacros) * 100) : 50,
      fats: totalMacros > 0 ? Math.round((totalFats * 9 / totalMacros) * 100) : 25,
    }

    const dailyTips = [
      'Drink warm water with lemon in the morning',
      'Include protein in every meal',
      'Eat mindfully without distractions',
      'Take a short walk after meals',
      'Avoid processed and packaged foods',
    ]

    const indianFoodData = INDIAN_FOOD_BY_BMI[bmiCategory] || INDIAN_FOOD_BY_BMI['Normal Weight']
    const indianFoods = indianFoodData.foods
    const exerciseTips = [
      bmiCategory === 'Underweight' ? 'Focus on strength training to build muscle mass' : 'Include 150 minutes of moderate exercise weekly',
      'Practice yoga for flexibility and stress reduction',
      'Take 8000-10000 steps daily',
      'Include both cardio and strength exercises',
    ]

    setAnalysis({ bmi: bmiResult, calorieStatus, recommendations, mealSuggestions, macroBalance, dailyTips, indianFoods, exerciseTips })
  }

  async function generateRecommendations() {
    if (!profile || !analysis) return
    setAnalyzing(true)

    try {
      await supabase.from('nutrition_recommendations').insert({
        user_id: profile.user_id, recommendation_type: 'diet',
        title: analysis.bmi ? `${analysis.bmi.category} (BMI: ${analysis.bmi.bmi}) - Indian Diet Plan` : 'Daily Nutrition Plan',
        description: [...analysis.recommendations.slice(0, 3), ...analysis.indianFoods.slice(0, 3)].join('. '),
        suggested_foods: analysis.indianFoods.slice(0, 5),
      })
      fetchData()
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return (<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Nutrition Recommendations</h1>
          <p className="text-gray-600">Personalized Indian diet suggestions based on your data</p>
        </div>
        <button onClick={generateRecommendations} disabled={analyzing || !analysis} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition">
          {analyzing ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Analyzing...</>) : (<><Brain className="w-5 h-5" />Generate New Analysis</>)}
        </button>
      </div>

      {todayFoods.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No food data available</h3>
          <p className="text-gray-500 mb-4">Log some food items to receive personalized recommendations</p>
        </div>
      ) : analysis && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg"><Target className="w-6 h-6 text-blue-600" /></div>
                <h2 className="font-semibold text-gray-900">BMI Analysis</h2>
              </div>
              {analysis.bmi ? (
                <div>
                  <div className="text-4xl font-bold text-blue-600">{analysis.bmi.bmi}</div>
                  <div className="text-gray-600 mt-1">{analysis.bmi.category}</div>
                  <div className="mt-4 text-sm text-gray-500">{profile?.weight} kg, {profile?.height} cm</div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600 font-medium">Healthy BMI Range</div>
                    <div className="text-sm text-blue-700">18.5 - 24.9</div>
                  </div>
                </div>
              ) : (<div className="text-gray-500">Update your profile with height and weight</div>)}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg"><Zap className="w-6 h-6 text-orange-600" /></div>
                <h2 className="font-semibold text-gray-900">Calorie Intake</h2>
              </div>
              <div className="flex items-center gap-3">
                {analysis.calorieStatus === 'under' && <AlertCircle className="w-8 h-8 text-yellow-500" />}
                {analysis.calorieStatus === 'optimal' && <CheckCircle className="w-8 h-8 text-green-500" />}
                {analysis.calorieStatus === 'over' && <AlertCircle className="w-8 h-8 text-red-500" />}
                <div><div className="text-lg font-semibold capitalize">{analysis.calorieStatus}</div><div className="text-sm text-gray-500">Daily target progress</div></div>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${analysis.calorieStatus === 'over' ? 'bg-red-500' : analysis.calorieStatus === 'optimal' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: '70%' }} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg"><Salad className="w-6 h-6 text-green-600" /></div>
                <h2 className="font-semibold text-gray-900">Macro Balance</h2>
              </div>
              <div className="space-y-3">
                {[{ label: 'Protein', value: analysis.macroBalance.protein, ideal: '20-30%', color: 'red' },
                  { label: 'Carbs', value: analysis.macroBalance.carbs, ideal: '45-55%', color: 'blue' },
                  { label: 'Fats', value: analysis.macroBalance.fats, ideal: '20-30%', color: 'yellow' }].map((m) => (
                  <div key={m.label}>
                    <div className="flex items-center justify-between text-sm"><span className="text-gray-600">{m.label}</span><span className="font-medium">{m.value}% <span className="text-gray-400">({m.ideal})</span></span></div>
                    <div className="h-2 bg-gray-100 rounded-full mt-1"><div className={`h-full rounded-full bg-${m.color}-500`} style={{ width: `${Math.min(m.value, 100)}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4"><IndianRupee className="w-6 h-6" /><h2 className="font-semibold text-lg">Recommended Indian Foods for {analysis.bmi?.category || 'Your BMI'}</h2></div>
            <div className="grid md:grid-cols-2 gap-3">
              {analysis.indianFoods.map((food, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg backdrop-blur">
                  <CheckCircle className="w-5 h-5 text-green-200 flex-shrink-0 mt-0.5" />
                  <div className="text-green-50 text-sm">{food}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg"><Lightbulb className="w-6 h-6 text-purple-600" /></div>
                <h2 className="font-semibold text-gray-900">Diet Recommendations</h2>
              </div>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium flex-shrink-0">{i + 1}</div>
                    <div className="text-gray-700">{rec}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg"><Beef className="w-6 h-6 text-orange-600" /></div>
                <h2 className="font-semibold text-gray-900">Meal Suggestions</h2>
              </div>
              <div className="space-y-3">
                {analysis.mealSuggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="text-gray-700">{suggestion}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg"><Activity className="w-6 h-6 text-red-600" /></div>
              <h2 className="font-semibold text-gray-900">Exercise Tips for {analysis.bmi?.category || 'Your Goals'}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {analysis.exerciseTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <Heart className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-gray-700">{tip}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4"><Lightbulb className="w-6 h-6" /><h2 className="font-semibold">Today's Health Tips</h2></div>
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.dailyTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm flex-shrink-0">{i + 1}</div>
                  <div className="text-blue-50">{tip}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4"><RefreshCw className="w-5 h-5 text-gray-400" /><h2 className="font-semibold text-gray-900">Previous Recommendations</h2></div>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{rec.title}</span>
                  <span className="text-sm text-gray-500">{new Date(rec.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600">{rec.description}</p>
                {rec.suggested_foods && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rec.suggested_foods.map((food, i) => (<span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">{food}</span>))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
