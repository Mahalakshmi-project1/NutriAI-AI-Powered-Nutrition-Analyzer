import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { BMIHistory } from '../types/database'
import { Scale, TrendingDown, TrendingUp, Minus, Info, Calculator, ArrowRight, Leaf, AlertTriangle } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Link } from 'react-router-dom'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function BMICalculator() {
  const { profile } = useAuth()
  const [bmiHistory, setBmiHistory] = useState<BMIHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [height, setHeight] = useState(profile?.height?.toString() || '')
  const [weight, setWeight] = useState(profile?.weight?.toString() || '')
  const [result, setResult] = useState<{ bmi: number; category: string } | null>(null)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    if (profile) {
      fetchBMIHistory()
      setHeight(profile.height?.toString() || '')
      setWeight(profile.weight?.toString() || '')
    }
  }, [profile])

  async function fetchBMIHistory() {
    try {
      const { data } = await supabase.from('bmi_history').select('*').eq('user_id', profile?.user_id).order('created_at', { ascending: true }).limit(30)
      setBmiHistory(data || [])
    } catch (error) {
      console.error('Error fetching BMI history:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateBMI(weight: number, height: number): { bmi: number; category: string } {
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    let category: string

    if (bmi < 16) category = 'Severely Underweight'
    else if (bmi < 18.5) category = 'Underweight'
    else if (bmi < 25) category = 'Normal'
    else if (bmi < 30) category = 'Overweight'
    else if (bmi < 35) category = 'Obese I'
    else if (bmi < 40) category = 'Obese II'
    else category = 'Obese III'

    return { bmi: Math.round(bmi * 10) / 10, category }
  }

  async function calculateAndSave() {
    const heightNum = parseFloat(height)
    const weightNum = parseFloat(weight)

    if (!heightNum || !weightNum || heightNum <= 0 || weightNum <= 0) return
    setCalculating(true)

    const bmiResult = calculateBMI(weightNum, heightNum)
    setResult(bmiResult)

    try {
      await supabase.from('bmi_history').insert({
        user_id: profile?.user_id, height: heightNum, weight: weightNum,
        bmi: bmiResult.bmi, category: bmiResult.category,
      })
      fetchBMIHistory()
    } catch (error) {
      console.error('Error saving BMI:', error)
    } finally {
      setCalculating(false)
    }
  }

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'text-blue-500'
    if (bmi < 25) return 'text-green-500'
    if (bmi < 30) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getBMIBgColor = (bmi: number) => {
    if (bmi < 18.5) return 'bg-blue-50 border-blue-200'
    if (bmi < 25) return 'bg-green-50 border-green-200'
    if (bmi < 30) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getBMIPosition = (bmi: number) => {
    const minBMI = 15, maxBMI = 40
    const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmi))
    return ((clampedBMI - minBMI) / (maxBMI - minBMI)) * 100
  }

  const getRecommendations = (category: string): { diet: string[]; tips: string[]; foods: string[] } => {
    const recommendations = {
      'Severely Underweight': {
        diet: [
          'Increase caloric intake by 500-750 calories per day',
          'Focus on protein-rich foods for muscle building',
          'Eat 5-6 smaller meals throughout the day',
        ],
        tips: [
          'Include healthy fats like ghee, nuts, and avocado',
          'Add protein supplements if needed',
          'Strength training exercises to build muscle mass',
        ],
        foods: ['Paneer Butter Masala', 'Dal Makhani', 'Badam Milk', 'Ghee Rice', 'Cashew Curry', 'Banana Shake'],
      },
      'Underweight': {
        diet: [
          'Increase daily calories by 300-500',
          'Prioritize protein and complex carbs',
          'Include nutrient-dense snacks',
        ],
        tips: [
          'Never skip breakfast - have a hearty meal',
          'Add cheese, nuts to your regular meals',
          'Combine cardio with strength training',
        ],
        foods: ['Rajma Chawal', 'Paneer Tikka', 'Mixed Nuts', 'Whole Milk', 'Roti with Ghee', 'Sprouts Salad'],
      },
      'Normal': {
        diet: [
          'Maintain balanced nutrition',
          'Continue current healthy habits',
          'Focus on variety and moderation',
        ],
        tips: [
          'Eat a rainbow of fruits and vegetables',
          'Stay hydrated - drink 8 glasses of water',
          'Exercise 30 minutes daily',
          'Get 7-8 hours of quality sleep',
        ],
        foods: ['Dal Tadka', 'Vegetable Biryani', 'Curd Rice', 'Palak Paneer', 'Roti with Sabzi', 'Fresh Fruits'],
      },
      'Overweight': {
        diet: [
          'Reduce daily calories by 300-500',
          'Increase protein and fiber intake',
          'Limit processed and sugary foods',
        ],
        tips: [
          'Start meals with a glass of water',
          'Use smaller plates for portion control',
          'Walk 10,000 steps daily',
          'Avoid eating late at night',
        ],
        foods: ['Moong Dal', 'Grilled Chicken', 'Vegetable Soup', 'Brown Rice', 'Oats Upma', 'Green Salad'],
      },
      'Obese I': {
        diet: [
          'Create a 500-750 calorie deficit daily',
          'Focus on vegetables and lean proteins',
          'Eliminate refined carbs and sugars',
        ],
        tips: [
          'Consider intermittent fasting (16:8)',
          'Track every meal and snack',
          'Cardio exercises 45 minutes daily',
          'Consult a healthcare professional',
        ],
        foods: ['Lauki (Bottle Gourd)', 'Methi Paratha (low oil)', 'Dal Soup', 'Grilled Fish', 'Vegetable Raita', 'Millet Roti'],
      },
      'Obese II': {
        diet: [
          'Strict calorie monitoring required',
          'Medical supervision recommended',
          'Very low processed food intake',
        ],
        tips: [
          'Seek professional dietary guidance',
          'Consider medical weight loss support',
          'Start with low-impact exercises',
          'Monitor blood sugar and pressure',
        ],
        foods: ['Steamed Vegetables', 'Moong Dal Khichdi', 'Lauki Juice', 'Sprouts', 'Grilled Vegetables', 'Herbal Tea'],
      },
      'Obese III': {
        diet: [
          'Medical weight management program recommended',
          'Work closely with healthcare team',
          'Very structured meal planning',
        ],
        tips: [
          'Consult doctor before starting exercise',
          'Consider bariatric surgery evaluation',
          'Monitor all health markers regularly',
          'Psychological support may help',
        ],
        foods: ['Clear Soups', 'Steamed Greens', 'Lean Protein (measured)', 'Boiled Vegetables', 'Green Tea', 'Fiber-rich foods'],
      },
    }

    const key = Object.keys(recommendations).find(k => category.includes(k)) || 'Normal'
    return recommendations[key as keyof typeof recommendations]
  }

  const chartData = {
    labels: bmiHistory.map((h) => new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'BMI', data: bmiHistory.map((h) => h.bmi),
      borderColor: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.1)',
      fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#16a34a',
    }],
  }

  const latestBMI = bmiHistory[bmiHistory.length - 1]
  const previousBMI = bmiHistory[bmiHistory.length - 2]
  const bmiChange = latestBMI && previousBMI ? latestBMI.bmi - previousBMI.bmi : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">BMI Calculator</h1>
        <p className="text-gray-500">Calculate your Body Mass Index and get personalized recommendations</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calculator */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-xl"><Calculator className="w-6 h-6 text-green-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Calculate Your BMI</h2>
              <p className="text-sm text-gray-500">Enter your measurements below</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
              <input
                type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g., 175" min="50" max="250"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 70" min="20" max="500" step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <button
              onClick={calculateAndSave}
              disabled={!height || !weight || calculating}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {calculating ? 'Calculating...' : 'Calculate BMI'}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`mt-6 p-5 rounded-xl border ${getBMIBgColor(result.bmi)} animate-fadeIn`}>
              <div className="text-center mb-4">
                <div className={`text-5xl font-bold ${getBMIColor(result.bmi)}`}>{result.bmi}</div>
                <div className="text-lg font-medium text-gray-700 mt-1">{result.category}</div>
              </div>

              {/* BMI Scale */}
              <div className="mt-4">
                <div className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500 relative">
                  <div
                    className="absolute w-4 h-6 bg-white border-2 border-gray-800 rounded -top-1.5 transform -translate-x-1/2 shadow-md"
                    style={{ left: `${getBMIPosition(result.bmi)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Diet Recommendations */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg"><Info className="w-5 h-5 text-orange-600" /></div>
                  <h2 className="font-semibold text-gray-900">Diet Recommendations</h2>
                </div>
                <div className="space-y-2">
                  {getRecommendations(result.category).diet.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Tips */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg"><Leaf className="w-5 h-5 text-blue-600" /></div>
                  <h2 className="font-semibold text-gray-900">Health Tips</h2>
                </div>
                <div className="space-y-2">
                  {getRecommendations(result.category).tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-medium flex-shrink-0">{i + 1}</span>
                      <span className="text-gray-700 text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Foods */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🍛</span>
                  <h2 className="font-semibold text-gray-900">Suggested Indian Foods</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getRecommendations(result.category).foods.map((food, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-green-700 shadow-sm">
                      {food}
                    </span>
                  ))}
                </div>
                <Link to="/app/food" className="mt-4 inline-flex items-center gap-1 text-sm text-green-600 font-medium hover:underline">
                  Log these foods <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Scale className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Enter your height and weight to see personalized recommendations</p>
            </div>
          )}
        </div>
      </div>

      {/* BMI History Chart */}
      {bmiHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl"><TrendingUp className="w-6 h-6 text-green-600" /></div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">BMI History</h2>
                <p className="text-sm text-gray-500">Track your progress over time</p>
              </div>
            </div>
            {latestBMI && bmiChange !== null && bmiChange !== 0 && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                bmiChange < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {bmiChange < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                {bmiChange > 0 ? '+' : ''}{bmiChange.toFixed(1)}
              </div>
            )}
          </div>

          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: false, suggestedMin: 15, suggestedMax: 35, grid: { color: '#f3f4f6' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>

          {/* Recent Entries */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3">Recent Entries</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bmiHistory.slice(-6).reverse().map((entry) => (
                <div key={entry.id} className={`p-3 rounded-lg border ${getBMIBgColor(entry.bmi)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{entry.weight} kg</div>
                      <div className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getBMIColor(entry.bmi)}`}>{entry.bmi}</div>
                      <div className="text-xs text-gray-500">{entry.category}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
