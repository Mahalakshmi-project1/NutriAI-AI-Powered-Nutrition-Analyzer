import { useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { X, Flame, Target, Droplets, Info, Leaf, AlertTriangle, Clock, MapPin, Sparkles } from 'lucide-react'

export interface FoodDetail {
  id: string
  name: string
  name_ta: string | null
  category: string
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
  serving_size: string
  description: string | null
  district: string
  healthBenefits: string[]
  ingredients: string[]
  preparationMethod: string
  vitaminsAndMinerals: string[]
  recommendedFrequency: string
  allergens: string[]
  aiRecommendation: string | null
}

interface Props {
  food: FoodDetail
  onClose: () => void
}

export default function FoodDetailModal({ food, onClose }: Props) {
  const { darkMode } = useTheme()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const macros = [
    { label: 'Calories', value: `${food.calories}`, unit: 'kcal', cls: 'text-orange-600 dark:text-orange-400', bg: darkMode ? 'bg-orange-900/20' : 'bg-orange-50' },
    { label: 'Protein',  value: `${food.protein}g`,  cls: 'text-rose-600 dark:text-rose-400',   bg: darkMode ? 'bg-rose-900/20'   : 'bg-rose-50'   },
    { label: 'Carbs',    value: `${food.carbs}g`,     cls: 'text-blue-600 dark:text-blue-400',   bg: darkMode ? 'bg-blue-900/20'   : 'bg-blue-50'   },
    { label: 'Fats',     value: `${food.fats}g`,      cls: 'text-amber-600 dark:text-amber-400', bg: darkMode ? 'bg-amber-900/20'  : 'bg-amber-50'  },
    { label: 'Fiber',    value: `${food.fiber}g`,     cls: 'text-green-600 dark:text-green-400', bg: darkMode ? 'bg-green-900/20'  : 'bg-green-50'  },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className={`relative w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>

        {/* Header */}
        <div className={`sticky top-0 z-10 px-5 py-4 border-b flex items-start justify-between gap-3 ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
        }`}>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{food.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'
              }`}>{food.category}</span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />{food.district}
              </span>
              <span className="text-xs text-gray-400">{food.serving_size}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`shrink-0 p-2 rounded-xl transition ${
              darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* AI recommendation */}
          {food.aiRecommendation && (
            <div className={`flex items-start gap-3 p-3.5 rounded-xl ${
              darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
            }`}>
              <Sparkles className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">{food.aiRecommendation}</p>
            </div>
          )}

          {/* Description */}
          {food.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{food.description}</p>
          )}

          {/* Macros grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Nutritional Information</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {macros.map(m => (
                <div key={m.label} className={`p-3 rounded-xl text-center ${m.bg}`}>
                  <div className={`text-lg font-bold ${m.cls}`}>{m.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Vitamins & Minerals */}
          {food.vitaminsAndMinerals.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-green-500" /> Vitamins & Minerals
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {food.vitaminsAndMinerals.map(v => (
                  <span key={v} className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                  }`}>{v}</span>
                ))}
              </div>
            </div>
          )}

          {/* Health benefits */}
          {food.healthBenefits.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-500" /> Health Benefits
              </h3>
              <ul className="space-y-1.5">
                {food.healthBenefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-green-500 shrink-0 mt-0.5">•</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ingredients */}
          {food.ingredients.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" /> Ingredients
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {food.ingredients.map(ing => (
                  <span key={ing} className={`text-xs px-2.5 py-1 rounded-full ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>{ing}</span>
                ))}
              </div>
            </div>
          )}

          {/* Preparation */}
          {food.preparationMethod && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-purple-500" /> Traditional Preparation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{food.preparationMethod}</p>
            </div>
          )}

          {/* Frequency + Allergens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {food.recommendedFrequency && (
              <div className={`p-3.5 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Recommended Frequency</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{food.recommendedFrequency}</p>
              </div>
            )}
            {food.allergens.length > 0 && (
              <div className={`p-3.5 rounded-xl ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Dietary Cautions</span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">{food.allergens.join(', ')}</p>
              </div>
            )}
          </div>

          <div className="pb-2" />
        </div>
      </div>
    </div>
  )
}
