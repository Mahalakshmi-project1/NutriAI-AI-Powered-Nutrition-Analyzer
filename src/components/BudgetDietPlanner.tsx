import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { IndianRupee, RefreshCw, Apple, Utensils, Coffee, Cookie, Info } from 'lucide-react'

interface MealPlan {
  name: string
  portion: string
  calories: number
  protein: number
  carbs: number
  fats: number
  estimatedCost: number
}

interface DayPlan {
  breakfast: MealPlan[]
  lunch: MealPlan[]
  dinner: MealPlan[]
  snacks: MealPlan[]
  totalCost: number
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFats: number
}

const BUDGET_OPTIONS = [
  { value: 50, label: '₹50/day', description: 'Bare minimum' },
  { value: 100, label: '₹100/day', description: 'Standard' },
  { value: 150, label: '₹150/day', description: 'Balanced' },
  { value: 200, label: '₹200/day', description: 'Premium' },
]

const MEAL_DATABASE: Record<string, Record<string, MealPlan[]>> = {
  breakfast: {
    budget: [
      { name: 'Idli (2 pieces) + Sambar', portion: '2 idli, 100g sambar', calories: 150, protein: 4, carbs: 26, fats: 3, estimatedCost: 10 },
      { name: 'Upma (1 bowl)', portion: '1 medium bowl', calories: 200, protein: 5, carbs: 35, fats: 5, estimatedCost: 12 },
      { name: 'Poha (1 bowl)', portion: '1 medium bowl', calories: 180, protein: 4, carbs: 30, fats: 4, estimatedCost: 10 },
      { name: 'Dosa (1 plain) + Chutney', portion: '1 dosa, 20g chutney', calories: 130, protein: 3, carbs: 18, fats: 5, estimatedCost: 15 },
      { name: 'Rava Kesari (1 bowl)', portion: '1 small bowl', calories: 220, protein: 3, carbs: 38, fats: 7, estimatedCost: 12 },
    ],
    standard: [
      { name: 'Idli (3 pieces) + Sambar + Chutney', portion: '3 idli, 100g sambar, 20g chutney', calories: 250, protein: 6, carbs: 36, fats: 5, estimatedCost: 20 },
      { name: 'Masala Dosa (1 piece)', portion: '1 dosa with potato masala', calories: 300, protein: 7, carbs: 48, fats: 10, estimatedCost: 25 },
      { name: 'Pongal (1 bowl) + Chutney', portion: '1 bowl, 20g chutney', calories: 280, protein: 7, carbs: 42, fats: 9, estimatedCost: 20 },
      { name: 'Rava Upma (1 bowl) + Chutney', portion: '1 bowl, 20g chutney', calories: 250, protein: 6, carbs: 42, fats: 6, estimatedCost: 18 },
      { name: 'Bread (2 slices) + Peanut Butter', portion: '2 bread + 15g peanut butter', calories: 280, protein: 8, carbs: 35, fats: 12, estimatedCost: 20 },
    ],
    balanced: [
      { name: 'Ghee Pongal (1 bowl) + Vadai (1)', portion: '1 bowl pongal + 1 medu vadai', calories: 380, protein: 10, carbs: 48, fats: 15, estimatedCost: 35 },
      { name: 'Set Dosa (3 pieces) + Kurma', portion: '3 dosa + 100g veg kurma', calories: 400, protein: 12, carbs: 55, fats: 14, estimatedCost: 40 },
      { name: 'Masala Dosa + Chutney + Sambar', portion: '1 dosa + 30g chutney + 100g sambar', calories: 350, protein: 8, carbs: 50, fats: 12, estimatedCost: 30 },
      { name: 'Oats Porridge (1 bowl) + Fruits', portion: '1 bowl + 1 banana', calories: 280, protein: 8, carbs: 45, fats: 6, estimatedCost: 25 },
      { name: 'Chapati (2) + Dal + Pickle', portion: '2 chapati + 100g dal + 10g pickle', calories: 320, protein: 10, carbs: 48, fats: 8, estimatedCost: 22 },
    ],
    premium: [
      { name: 'Ghee Pongal + Vadai (2) + Coffee', portion: '1 bowl + 2 vadai + 1 coffee', calories: 480, protein: 14, carbs: 58, fats: 20, estimatedCost: 50 },
      { name: 'Appam (3 pieces) + Stew', portion: '3 appam + 150g veg stew', calories: 420, protein: 12, carbs: 60, fats: 15, estimatedCost: 45 },
      { name: 'Masala Dosa + Idli (2) + Chutney + Sambar', portion: '1 dosa + 2 idli + chutney + sambar', calories: 450, protein: 11, carbs: 62, fats: 16, estimatedCost: 45 },
      { name: 'Bread (2) + Peanut Butter + Banana + Milk', portion: '2 bread + 15g PB + 1 banana + 200ml milk', calories: 450, protein: 14, carbs: 55, fats: 18, estimatedCost: 40 },
      { name: 'Pongal (1 bowl) + Poori (2) + Masala', portion: '1 bowl + 2 poori + 100g masala', calories: 520, protein: 13, carbs: 68, fats: 22, estimatedCost: 48 },
    ],
  },
  lunch: {
    budget: [
      { name: 'Rice (1 cup) + Dal + Vegetable Curry', portion: '1 cup rice + 100g dal + 100g veg', calories: 400, protein: 14, carbs: 70, fats: 10, estimatedCost: 20 },
      { name: 'Curd Rice (1 bowl)', portion: '1 medium bowl', calories: 280, protein: 6, carbs: 50, fats: 6, estimatedCost: 15 },
      { name: 'Lemon Rice (1 bowl)', portion: '1 medium bowl', calories: 260, protein: 5, carbs: 48, fats: 8, estimatedCost: 15 },
      { name: 'Rice (1 cup) + Rasam + Pickle', portion: '1 cup rice + 100g rasam + 10g pickle', calories: 250, protein: 5, carbs: 52, fats: 4, estimatedCost: 12 },
      { name: 'Sambar Rice (1 bowl)', portion: '1 medium bowl', calories: 300, protein: 8, carbs: 52, fats: 6, estimatedCost: 18 },
    ],
    standard: [
      { name: 'Rice (1 cup) + Sambar + 2 Veg + Curd', portion: '1 cup rice + 100g sambar + 2 veg + 100g curd', calories: 500, protein: 15, carbs: 80, fats: 14, estimatedCost: 35 },
      { name: 'Veg Pulao (1 plate) + Raita', portion: '1 plate + 100g raita', calories: 420, protein: 10, carbs: 65, fats: 12, estimatedCost: 35 },
      { name: 'Rice + Dal + Egg Curry (2 eggs) + Veg', portion: '1 cup rice + 100g dal + 2 eggs + 100g veg', calories: 550, protein: 22, carbs: 70, fats: 16, estimatedCost: 35 },
      { name: 'Chapati (2) + Paneer Curry (100g) + Salad', portion: '2 chapati + 100g paneer curry + salad', calories: 480, protein: 18, carbs: 55, fats: 18, estimatedCost: 40 },
      { name: 'Rice + Sambar + Rasam + Kootu + Curd', portion: '1 cup rice + 100g sambar + 100g rasam + 100g kootu + 100g curd', calories: 520, protein: 16, carbs: 78, fats: 14, estimatedCost: 38 },
    ],
    balanced: [
      { name: 'Full Veg Meals (rice, sambar, rasam, 2 veg, papad, curd, pickle)', portion: '1 full plate', calories: 600, protein: 18, carbs: 85, fats: 16, estimatedCost: 50 },
      { name: 'Rice + Dal + Chicken Curry (100g) + Veg + Curd', portion: '1 cup rice + 100g dal + 100g chicken + 100g veg + 100g curd', calories: 650, protein: 30, carbs: 70, fats: 18, estimatedCost: 60 },
      { name: 'Veg Biryani (1 plate) + Raita + Salad', portion: '1 plate + 100g raita + salad', calories: 500, protein: 14, carbs: 75, fats: 16, estimatedCost: 50 },
      { name: 'Rice + Fish Curry (100g) + Sambar + Veg', portion: '1 cup rice + 100g fish + 100g sambar + 100g veg', calories: 580, protein: 28, carbs: 65, fats: 18, estimatedCost: 55 },
      { name: 'Chapati (3) + Dal + Paneer Curry (100g) + Salad', portion: '3 chapati + 100g dal + 100g paneer + salad', calories: 560, protein: 22, carbs: 62, fats: 20, estimatedCost: 52 },
    ],
    premium: [
      { name: 'Chicken Biryani (1 plate) + Raita + Salad', portion: '1 plate + 100g raita + salad', calories: 700, protein: 35, carbs: 80, fats: 22, estimatedCost: 80 },
      { name: 'Full Non-Veg Meals (rice, sambar, chicken, fish, 2 veg, curd, papad)', portion: '1 full plate', calories: 750, protein: 40, carbs: 75, fats: 24, estimatedCost: 85 },
      { name: 'Chapati (3) + Paneer Butter Masala (150g) + Dal + Rice + Salad', portion: '3 chapati + 150g paneer + 100g dal + 1 cup rice + salad', calories: 720, protein: 28, carbs: 80, fats: 26, estimatedCost: 70 },
      { name: 'Rice + Mutton Curry (100g) + Veg + Dal + Curd', portion: '1 cup rice + 100g mutton + 100g veg + 100g dal + 100g curd', calories: 680, protein: 32, carbs: 65, fats: 22, estimatedCost: 80 },
      { name: 'Fish Meals (rice, sambar, fish fry, 2 veg, curd, papad)', portion: '1 full plate', calories: 650, protein: 35, carbs: 70, fats: 20, estimatedCost: 75 },
    ],
  },
  dinner: {
    budget: [
      { name: 'Chapati (2) + Dal (1 cup)', portion: '2 chapati + 100g dal', calories: 320, protein: 12, carbs: 50, fats: 8, estimatedCost: 18 },
      { name: 'Ragi Kali (1 serving) + Sambar', portion: '1 serving + 100g sambar', calories: 200, protein: 5, carbs: 38, fats: 3, estimatedCost: 15 },
      { name: 'Kambu Koozh (1 bowl)', portion: '1 medium bowl', calories: 180, protein: 4, carbs: 35, fats: 2, estimatedCost: 10 },
      { name: 'Curd Rice (1 bowl) + Pickle', portion: '1 bowl + 10g pickle', calories: 300, protein: 6, carbs: 52, fats: 7, estimatedCost: 15 },
      { name: 'Dosa (1 plain) + Sambar', portion: '1 dosa + 100g sambar', calories: 180, protein: 5, carbs: 28, fats: 5, estimatedCost: 15 },
    ],
    standard: [
      { name: 'Parotta (2) + Kurma (veg)', portion: '2 parotta + 100g veg kurma', calories: 450, protein: 10, carbs: 55, fats: 20, estimatedCost: 35 },
      { name: 'Dosa (2) + Sambar + Chutney', portion: '2 dosa + 100g sambar + 20g chutney', calories: 320, protein: 10, carbs: 50, fats: 8, estimatedCost: 30 },
      { name: 'Chapati (3) + Vegetable Kurma + Dal', portion: '3 chapati + 100g kurma + 100g dal', calories: 420, protein: 14, carbs: 60, fats: 14, estimatedCost: 35 },
      { name: 'Rice (1 cup) + Dal + Veg + Curd', portion: '1 cup rice + 100g dal + 100g veg + 100g curd', calories: 380, protein: 12, carbs: 65, fats: 10, estimatedCost: 30 },
      { name: 'Idli (3) + Sambar + Chutney', portion: '3 idli + 100g sambar + 20g chutney', calories: 250, protein: 6, carbs: 36, fats: 5, estimatedCost: 22 },
    ],
    balanced: [
      { name: 'Rice (1 cup) + Sambar + Rasam + 2 Veg + Curd + Papad', portion: '1 cup rice + 100g sambar + 100g rasam + 2 veg + 100g curd + 1 papad', calories: 520, protein: 16, carbs: 75, fats: 14, estimatedCost: 45 },
      { name: 'Chapati (3) + Paneer Curry (100g) + Dal + Salad', portion: '3 chapati + 100g paneer + 100g dal + salad', calories: 560, protein: 20, carbs: 65, fats: 20, estimatedCost: 50 },
      { name: 'Dosa (2) + Idli (2) + Sambar + Chutney', portion: '2 dosa + 2 idli + 100g sambar + 20g chutney', calories: 480, protein: 14, carbs: 68, fats: 14, estimatedCost: 40 },
      { name: 'Rice + Egg Curry (2 eggs) + Veg + Sambar', portion: '1 cup rice + 2 eggs + 100g veg + 100g sambar', calories: 520, protein: 20, carbs: 68, fats: 14, estimatedCost: 40 },
      { name: 'Ragi Mudde (2) + Sambar + Veg', portion: '2 ragi mudde + 100g sambar + 100g veg', calories: 380, protein: 10, carbs: 65, fats: 8, estimatedCost: 35 },
    ],
    premium: [
      { name: 'Chicken Curry (100g) + Rice (1 cup) + Dal + Salad', portion: '100g chicken + 1 cup rice + 100g dal + salad', calories: 580, protein: 35, carbs: 60, fats: 18, estimatedCost: 65 },
      { name: 'Fish Fry (2 pieces, 150g) + Rice (1 cup) + Sambar + Veg', portion: '150g fish + 1 cup rice + 100g sambar + 100g veg', calories: 620, protein: 32, carbs: 65, fats: 20, estimatedCost: 70 },
      { name: 'Chapati (3) + Paneer Butter Masala (150g) + Dal + Rice + Salad', portion: '3 chapati + 150g paneer + 100g dal + 1 cup rice + salad', calories: 720, protein: 28, carbs: 80, fats: 26, estimatedCost: 65 },
      { name: 'Biryani (1 plate) + Raita + Salad', portion: '1 plate + 100g raita + salad', calories: 600, protein: 22, carbs: 75, fats: 18, estimatedCost: 55 },
      { name: 'Rice + Mutton Curry (100g) + Dal + Veg + Curd', portion: '1 cup rice + 100g mutton + 100g dal + 100g veg + 100g curd', calories: 640, protein: 30, carbs: 62, fats: 20, estimatedCost: 72 },
    ],
  },
  snacks: {
    budget: [
      { name: 'Banana (1 medium)', portion: '1 medium banana', calories: 105, protein: 1, carbs: 27, fats: 0, estimatedCost: 10 },
      { name: 'Peanuts (30g, roasted)', portion: '30g', calories: 170, protein: 7, carbs: 6, fats: 14, estimatedCost: 8 },
      { name: 'Buttermilk (1 glass)', portion: '1 glass (200ml)', calories: 40, protein: 2, carbs: 4, fats: 2, estimatedCost: 8 },
      { name: 'Murukku (2 pieces)', portion: '2 pieces', calories: 100, protein: 2, carbs: 14, fats: 5, estimatedCost: 10 },
      { name: 'Tea (1 cup)', portion: '1 cup with milk', calories: 80, protein: 2, carbs: 8, fats: 4, estimatedCost: 8 },
    ],
    standard: [
      { name: 'Samosa (1 piece)', portion: '1 piece', calories: 130, protein: 3, carbs: 15, fats: 7, estimatedCost: 15 },
      { name: 'Vadai (1 piece)', portion: '1 medu vadai', calories: 100, protein: 4, carbs: 11, fats: 5, estimatedCost: 12 },
      { name: 'Bajji (2 pieces)', portion: '2 pieces', calories: 110, protein: 2, carbs: 14, fats: 6, estimatedCost: 15 },
      { name: 'Fruit (Apple/Orange)', portion: '1 medium fruit', calories: 60, protein: 0, carbs: 15, fats: 0, estimatedCost: 15 },
      { name: 'Peanut Chikki (1 piece)', portion: '1 small piece', calories: 140, protein: 4, carbs: 16, fats: 7, estimatedCost: 12 },
    ],
    balanced: [
      { name: 'Mixed Dry Fruits (30g)', portion: '30g (almonds, cashews, raisins)', calories: 175, protein: 5, carbs: 20, fats: 10, estimatedCost: 30 },
      { name: 'Paneer Tikka (100g)', portion: '100g grilled paneer', calories: 280, protein: 18, carbs: 8, fats: 20, estimatedCost: 40 },
      { name: 'Fruit Milkshake (1 glass)', portion: '1 glass (250ml)', calories: 250, protein: 8, carbs: 40, fats: 8, estimatedCost: 35 },
      { name: 'Sprouts (1 cup)', portion: '1 cup mixed sprouts', calories: 120, protein: 8, carbs: 20, fats: 2, estimatedCost: 20 },
      { name: 'Boiled Egg (1) + Banana', portion: '1 egg + 1 banana', calories: 170, protein: 7, carbs: 28, fats: 6, estimatedCost: 18 },
    ],
    premium: [
      { name: 'Mixed Dry Fruits (40g)', portion: '40g (almonds, cashews, walnuts, raisins)', calories: 230, protein: 6, carbs: 25, fats: 14, estimatedCost: 40 },
      { name: 'Paneer Tikka (150g)', portion: '150g grilled paneer', calories: 420, protein: 27, carbs: 12, fats: 30, estimatedCost: 50 },
      { name: 'Fruit Milkshake (1 glass) + Nuts', portion: '1 glass + 15g nuts', calories: 350, protein: 10, carbs: 45, fats: 15, estimatedCost: 45 },
      { name: 'Sprouts (1 cup) + Lemon + Onion', portion: '1 cup mixed sprouts with lemon and onion', calories: 140, protein: 9, carbs: 22, fats: 3, estimatedCost: 25 },
      { name: 'Boiled Egg (2) + Fruits + Nuts', portion: '2 eggs + 1 apple + 20g nuts', calories: 320, protein: 14, carbs: 30, fats: 18, estimatedCost: 40 },
    ],
  },
}

function getCategory(budget: number): string {
  if (budget <= 50) return 'budget'
  if (budget <= 100) return 'standard'
  if (budget <= 150) return 'balanced'
  return 'premium'
}

function getRandomMeals(budget: number): DayPlan {
  const category = getCategory(budget)

  const pickRandom = (arr: MealPlan[]) => arr[Math.floor(Math.random() * arr.length)]

  const breakfast = [pickRandom(MEAL_DATABASE.breakfast[category])]
  const lunch = [pickRandom(MEAL_DATABASE.lunch[category])]
  const dinner = [pickRandom(MEAL_DATABASE.dinner[category])]
  const snacks = [pickRandom(MEAL_DATABASE.snacks[category])]

  let allMeals = [...breakfast, ...lunch, ...dinner, ...snacks]
  let currentCost = allMeals.reduce((sum, m) => sum + m.estimatedCost, 0)

  // If we have budget left, add extra snack items
  const snackPool = MEAL_DATABASE.snacks[category]
  while (currentCost < budget * 0.85 && snacks.length < 3) {
    const extra = pickRandom(snackPool)
    snacks.push(extra)
    currentCost = [...breakfast, ...lunch, ...dinner, ...snacks].reduce((sum, m) => sum + m.estimatedCost, 0)
  }

  // Recalculate totals
  allMeals = [...breakfast, ...lunch, ...dinner, ...snacks]

  return {
    breakfast,
    lunch,
    dinner,
    snacks,
    totalCost: allMeals.reduce((sum, m) => sum + m.estimatedCost, 0),
    totalCalories: allMeals.reduce((sum, m) => sum + m.calories, 0),
    totalProtein: allMeals.reduce((sum, m) => sum + m.protein, 0),
    totalCarbs: allMeals.reduce((sum, m) => sum + m.carbs, 0),
    totalFats: allMeals.reduce((sum, m) => sum + m.fats, 0),
  }
}

export default function BudgetDietPlanner() {
  const { darkMode } = useTheme()
  const [selectedBudget, setSelectedBudget] = useState(100)
  const [customBudget, setCustomBudget] = useState('')
  const [mealPlan, setMealPlan] = useState<DayPlan | null>(null)
  const [generating, setGenerating] = useState(false)

  function generatePlan() {
    setGenerating(true)
    setTimeout(() => {
      const budget = customBudget ? parseInt(customBudget) : selectedBudget
      const plan = getRandomMeals(budget)
      setMealPlan(plan)
      setGenerating(false)
    }, 800)
  }

  function MealCard({ title, meals, icon }: { title: string; meals: MealPlan[]; icon: React.ReactNode }) {
    return (
      <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            title === 'Breakfast' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
            title === 'Lunch' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
            title === 'Dinner' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
            'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
          }`}>
            {icon}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="space-y-3">
          {meals.map((meal, idx) => (
            <div key={idx} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{meal.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{meal.portion}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600 dark:text-green-400">₹{meal.estimatedCost}</div>
                  <div className="text-xs text-gray-500">{meal.calories} kcal</div>
                </div>
              </div>
              <div className="mt-2 flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>P: {meal.protein}g</span>
                <span>C: {meal.carbs}g</span>
                <span>F: {meal.fats}g</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Budget Diet Planner</h1>
        <p className="text-gray-500 dark:text-gray-400">Get a complete day's meal plan within your budget</p>
      </div>

      <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-green-600" />
          Select Your Daily Budget
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {BUDGET_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSelectedBudget(option.value)
                setCustomBudget('')
              }}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                selectedBudget === option.value && !customBudget
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : darkMode
                    ? 'border-gray-700 hover:border-gray-600'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl font-bold text-gray-900 dark:text-white">{option.label}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{option.description}</div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Or enter custom amount:</span>
          <div className="relative flex-1 max-w-[150px]">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={customBudget}
              onChange={(e) => setCustomBudget(e.target.value)}
              placeholder="Custom"
              className={`w-full pl-8 pr-3 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>
        </div>

        <button
          onClick={generatePlan}
          disabled={generating}
          className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Generate Meal Plan
            </>
          )}
        </button>
      </div>

      {mealPlan && (
        <div className="space-y-4">
          <div className={`rounded-xl p-4 ${darkMode ? 'bg-gradient-to-r from-green-800 to-emerald-800' : 'bg-gradient-to-r from-green-600 to-emerald-500'} text-white`}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold">₹{mealPlan.totalCost}</div>
                <div className="text-sm opacity-80">Estimated Cost</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{mealPlan.totalCalories}</div>
                <div className="text-sm opacity-80">Calories</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{mealPlan.totalProtein}g</div>
                <div className="text-sm opacity-80">Protein</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{mealPlan.totalCarbs}g</div>
                <div className="text-sm opacity-80">Carbs</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{mealPlan.totalFats}g</div>
                <div className="text-sm opacity-80">Fats</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <MealCard title="Breakfast" meals={mealPlan.breakfast} icon={<Coffee className="w-4 h-4" />} />
            <MealCard title="Lunch" meals={mealPlan.lunch} icon={<Utensils className="w-4 h-4" />} />
            <MealCard title="Dinner" meals={mealPlan.dinner} icon={<Apple className="w-4 h-4" />} />
            <MealCard title="Snacks" meals={mealPlan.snacks} icon={<Cookie className="w-4 h-4" />} />
          </div>

          <div className={`rounded-lg p-3 ${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border flex items-start gap-2`}>
            <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Prices are realistic estimates based on Indian home cooking and budget street food costs (2024-2025). Actual prices may vary by location and market rates.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
