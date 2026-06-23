import { Link } from 'react-router-dom'
import { Calculator, Brain, Activity, TrendingUp, Search, Sparkles, ChevronRight } from 'lucide-react'
import { isMobileApp } from '../lib/mobile'

const aiTools = [
  {
    title: 'BMI Calculator',
    description: 'Calculate your Body Mass Index and get personalized health insights',
    icon: Calculator,
    path: '/bmi',
    color: 'from-blue-500 to-cyan-500',
    features: ['BMI Calculation', 'Health Status', 'Ideal Weight']
  },
  {
    title: 'AI Nutrition Chatbot',
    description: 'Get personalized diet recommendations powered by AI',
    icon: Brain,
    path: '/chatbot',
    color: 'from-purple-500 to-pink-500',
    features: ['24/7 Available', 'Personalized Plans', 'Instant Answers']
  },
  {
    title: 'Exercise Guide',
    description: 'Smart workout recommendations based on your goals',
    icon: Activity,
    path: '/exercise',
    color: 'from-orange-500 to-red-500',
    features: ['Workout Plans', 'Calorie Tracking', 'Progress Monitor']
  },
  {
    title: 'Deficiency Detector',
    description: 'Analyze your diet for potential nutrient deficiencies',
    icon: Search,
    path: '/deficiency',
    color: 'from-green-500 to-emerald-500',
    features: ['Nutrient Analysis', 'Food Suggestions', 'Health Alerts']
  },
  {
    title: 'Budget Diet Planner',
    description: 'Plan healthy meals within your budget',
    icon: TrendingUp,
    path: '/budget-planner',
    color: 'from-yellow-500 to-orange-500',
    features: ['Budget Friendly', 'Meal Plans', 'Shopping Lists']
  }
]

export default function AITools() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 text-white">
        <div className="px-4 pt-12 pb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-2xl font-bold">AI Tools</h1>
          </div>
          <p className="text-white/80 text-sm">
            Powerful AI-driven tools to optimize your health journey
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="px-4 -mt-4">
        <div className="space-y-4">
          {aiTools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="block bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="flex">
                {/* Icon Section */}
                <div className={`w-24 flex-shrink-0 bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
                  <tool.icon className="w-10 h-10 text-white" />
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {tool.title}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {tool.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tool.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mt-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            AI Insights Today
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">5</div>
              <div className="text-xs text-gray-400">Tools Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">12</div>
              <div className="text-xs text-gray-400">Insights</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">89%</div>
              <div className="text-xs text-gray-400">Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
