import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../lib/supabase'
import { callGemini, buildNutritionSystemPrompt, isGeminiConfigured, GeminiMessage } from '../lib/gemini'
import { Send, Bot, User, Trash2, Sparkles, MessageCircle, Loader2, Utensils, Brain, Flame, Target, Droplets, Info, ChevronDown, ChevronUp, Leaf, Zap, CheckCircle2, XCircle, Lightbulb } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  language?: 'en' | 'ta' | 'tanglish'
  metadata?: {
    calories?: number
    protein?: number
    carbs?: number
    fats?: number
    fiber?: number
    foods?: ParsedFood[]
    recommendation?: boolean
  }
}

interface ParsedFood {
  name: string
  nameTa?: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
  servingSize: string
  confidence: 'high' | 'medium' | 'low'
}

interface ChatSession {
  id: string
  user_id: string
  messages: any[]
  created_at: string
  updated_at: string
}

interface FoodDBEntry {
  id: string
  name: string
  name_ta?: string
  category: string
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
  serving_size: string
  calories_per_serving: number
  protein_per_serving: number
  carbs_per_serving: number
  fats_per_serving: number
  fiber_per_serving: number
}

// ─── Language Detection ──────────────────────────────────────────────────────

function detectLanguage(message: string): 'en' | 'ta' | 'tanglish' {
  const tamilScript = /[\u0B80-\u0BFF]/
  if (tamilScript.test(message)) return 'ta'

  const tanglishPatterns = [
    /\b(idli|dosa|sambar|rasam|chapati|pongal|vada|bajji|murukku|payasam|poriyal|kuzhambu|kootu|upma|appam|parotta|kali|koozh)\b/i,
    /\b(sapda|saapadu|sapadu|sapida|tinnu|thinna|unnu|unna|kudi|kudika|kudukka)\b/i,
    /\b(calories|calorie)\b.*\b(enna|ethana|yethana|yenna|evlo|evalo)\b/i,
    /\b(romba|rumba|nalla|nallatha|ketta|kettatha|sari|sariya|sariyana|thevai|theriyuma)\b/i,
    /\b(1\s*(idli|dosa|vada|parotta|chapati))\b/i,
    /\b(nee|naan|naanga|unga|ungal|avanga|ivanga|ennoda|unoda)\b/i,
  ]
  const tanglishScore = tanglishPatterns.filter(p => p.test(message)).length
  if (tanglishScore >= 1) return 'tanglish'

  return 'en'
}

// ─── Food Name Normalization ─────────────────────────────────────────────────

const FOOD_ALIASES: Record<string, string[]> = {
  'idli': ['idli', 'idly', 'idlis', 'idlys'],
  'dosa': ['dosa', 'dosai', 'dosas'],
  'sambar': ['sambar', 'sambhar'],
  'rasam': ['rasam'],
  'chapati': ['chapati', 'chapathi', 'roti', 'chapatti', 'chapatis'],
  'pongal': ['pongal'],
  'vada': ['vada', 'vadai', 'vadais'],
  'bajji': ['bajji', 'bhajji', 'bajjis'],
  'murukku': ['murukku', 'murukkus'],
  'payasam': ['payasam', 'payasams'],
  'poriyal': ['poriyal', 'poriyals'],
  'kuzhambu': ['kuzhambu', 'kulambu'],
  'kootu': ['kootu', 'kootus'],
  'upma': ['upma', 'uppuma'],
  'appam': ['appam', 'appams'],
  'parotta': ['parotta', 'parotas'],
  'rice': ['rice', 'chawal', 'arisi', 'sadam', 'sorru'],
  'dal': ['dal', 'paruppu', 'dhal', 'lentil'],
  'chicken': ['chicken', 'kozhi'],
  'fish': ['fish', 'meen'],
  'egg': ['egg', 'eggs', 'muttai', 'mutta'],
  'milk': ['milk', 'paal', 'pal'],
  'curd': ['curd', 'yogurt', 'thayir', 'thayiru'],
  'buttermilk': ['buttermilk', 'moor', 'mor', 'neer mor'],
  'banana': ['banana', 'vazhaipazham'],
  'apple': ['apple'],
  'orange': ['orange'],
  'grapes': ['grapes'],
  'carrot': ['carrot'],
  'spinach': ['spinach', 'keerai'],
  'tomato': ['tomato', 'thakkali'],
  'potato': ['potato', 'urulaikilangu'],
  'onion': ['onion', 'vengayam'],
  'bread': ['bread', 'double roti'],
  'butter': ['butter', 'vennai'],
  'ghee': ['ghee', 'nei', 'ney'],
  'coffee': ['coffee', 'kaapi'],
  'tea': ['tea', 'chai'],
  'poori': ['poori', 'pooris'],
  'biryani': ['biryani', 'biriyani'],
  'fried rice': ['fried rice'],
  'noodles': ['noodles'],
  'pizza': ['pizza'],
  'burger': ['burger'],
  'samosa': ['samosa'],
  'chips': ['chips'],
  'chocolate': ['chocolate'],
  'ice cream': ['ice cream'],
  'juice': ['juice'],
  'water': ['water', 'thanneer'],
  'paneer': ['paneer', 'panner'],
  'gobi': ['gobi', 'cauliflower'],
  'cabbage': ['cabbage'],
  'beetroot': ['beetroot'],
  'brinjal': ['brinjal', 'eggplant', 'kathiri'],
  'ladies finger': ['ladies finger', 'okra', 'vendakkai'],
  'coconut': ['coconut', 'thengai'],
  'peanut': ['peanut', 'groundnut', 'verkadalai'],
  'almond': ['almond', 'badam'],
  'cashew': ['cashew', 'mundhiri'],
  'dates': ['dates', 'perichampazham'],
  'mango': ['mango', 'maambalam'],
}

const UNIT_ALIASES: Record<string, string[]> = {
  'piece': ['piece', 'pieces', 'pcs', 'pc'],
  'bowl': ['bowl', 'bowls', 'cup', 'cups', 'katori'],
  'plate': ['plate', 'plates'],
  'serving': ['serving', 'servings', 'portion', 'portions'],
  'glass': ['glass', 'glasses', 'tumbler'],
  'slice': ['slice', 'slices'],
  'spoon': ['spoon', 'spoons', 'tbsp', 'tsp', 'tablespoon', 'teaspoon'],
  'kg': ['kg', 'kilo', 'kilogram'],
  'g': ['g', 'gram', 'grams', 'gm'],
  'ml': ['ml', 'milliliter', 'milliliters'],
  'l': ['l', 'litre', 'liter'],
  'pack': ['pack', 'packet', 'packets'],
  'bottle': ['bottle', 'bottles'],
  'handful': ['handful', 'handfuls'],
}

const QUANTITY_WORDS: Record<string, number> = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'half': 0.5, 'quarter': 0.25,
  'onnu': 1, 'rendu': 2, 'moonu': 3, 'naalu': 4, 'anju': 5,
}

function normalizeFoodName(input: string): string | null {
  const lower = input.toLowerCase().trim()
  for (const [canonical, aliases] of Object.entries(FOOD_ALIASES)) {
    if (aliases.includes(lower)) return canonical
  }
  return null
}

function normalizeUnit(input: string): string | null {
  const lower = input.toLowerCase().trim()
  for (const [canonical, aliases] of Object.entries(UNIT_ALIASES)) {
    if (aliases.includes(lower)) return canonical
  }
  return null
}

function parseQuantity(text: string): { quantity: number; unit: string; remaining: string } {
  const patterns = [
    /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+(?:of\s+)?(.+)/i,
    /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s*(.+)/i,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const num = parseFloat(match[1])
      if (!isNaN(num)) {
        const unit = normalizeUnit(match[2]) || match[2].toLowerCase()
        return { quantity: num, unit, remaining: match[3].trim() }
      }
    }
  }
  for (const [word, val] of Object.entries(QUANTITY_WORDS)) {
    const regex = new RegExp(`^(\\b${word}\\b)\\s+(.+)`, 'i')
    const match = text.match(regex)
    if (match) return { quantity: val, unit: 'piece', remaining: match[2].trim() }
  }
  const reverseMatch = text.match(/^([a-zA-Z\s]+)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]*)$/)
  if (reverseMatch) {
    const num = parseFloat(reverseMatch[2])
    if (!isNaN(num)) {
      return { quantity: num, unit: normalizeUnit(reverseMatch[3]) || reverseMatch[3] || 'piece', remaining: reverseMatch[1].trim() }
    }
  }
  return { quantity: 1, unit: 'piece', remaining: text.trim() }
}

function parseFoodItems(message: string): ParsedFood[] {
  const foods: ParsedFood[] = []
  const segments = message.split(/[,;]+|\band\b|\b&\b|\bwith\b|\bplus\b|\bathu\b|\bum\b/i)
  for (const segment of segments) {
    const trimmed = segment.trim()
    if (!trimmed) continue
    const { quantity, unit, remaining } = parseQuantity(trimmed)
    const normalized = normalizeFoodName(remaining)
    if (normalized) {
      foods.push({ name: normalized, quantity, unit, calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, servingSize: '', confidence: 'high' })
    } else {
      for (const [canonical, aliases] of Object.entries(FOOD_ALIASES)) {
        for (const alias of aliases) {
          if (remaining.toLowerCase().includes(alias)) {
            foods.push({ name: canonical, quantity, unit, calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, servingSize: '', confidence: 'medium' })
            break
          }
        }
      }
    }
  }
  return foods
}

function isFoodLogQuery(message: string): boolean {
  const patterns = [
    /\b(i ate|i had|i consumed|today i|morning i|afternoon i|evening i|night i)\b/i,
    /\b(sapten|thinitten|unnitten|kudichen|saapida)\b/i,
    /\b(ate|had|consumed|drank)\b.*\b(rice|dosa|idli|chapati|sambar|dal|chicken|fish|egg|milk|curd|coffee|tea)\b/i,
  ]
  return patterns.some(p => p.test(message))
}

// ─── Structured Response Renderer ────────────────────────────────────────────

interface ParsedResponse {
  title: string
  summary: string
  foodsToEat: string[]
  foodsToAvoid: string[]
  dailyTips: string[]
  raw: string
  isStructured: boolean
}

function parseStructuredResponse(content: string): ParsedResponse {
  const titleMatch = content.match(/\*\*(.+?)\*\*/)
  const title = titleMatch ? titleMatch[1].replace(/:$/, '').trim() : ''

  const eatMatch = content.match(/\*\*Foods? to Eat[:\s]*\*\*\s*\n([\s\S]*?)(?=\*\*Foods? to Avoid|\*\*Daily Tips|$)/i)
  const avoidMatch = content.match(/\*\*Foods? to Avoid[:\s]*\*\*\s*\n([\s\S]*?)(?=\*\*Daily Tips|$)/i)
  const tipsMatch = content.match(/\*\*Daily Tips[:\s]*\*\*\s*\n([\s\S]*?)$/i)

  function extractBullets(block: string | undefined): string[] {
    if (!block) return []
    return block
      .split('\n')
      .map(l => l.replace(/^[•\-\*]\s*/, '').trim())
      .filter(l => l.length > 0)
  }

  const foodsToEat = extractBullets(eatMatch?.[1])
  const foodsToAvoid = extractBullets(avoidMatch?.[1])
  const dailyTips = extractBullets(tipsMatch?.[1])

  // Extract summary: text between the title line and the first section header
  let summary = ''
  if (titleMatch) {
    const afterTitle = content.slice(content.indexOf(titleMatch[0]) + titleMatch[0].length).trim()
    const nextSection = afterTitle.search(/\*\*Foods? to (Eat|Avoid)|Daily Tips/i)
    summary = (nextSection > -1 ? afterTitle.slice(0, nextSection) : afterTitle).trim()
  }

  const isStructured = Boolean(title && (foodsToEat.length > 0 || dailyTips.length > 0))

  return { title, summary, foodsToEat, foodsToAvoid, dailyTips, raw: content, isStructured }
}

function StructuredMessage({ content }: { content: string }) {
  const parsed = parseStructuredResponse(content)

  if (!parsed.isStructured) {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
  }

  return (
    <div className="space-y-3 text-sm">
      {/* Title */}
      {parsed.title && (
        <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">{parsed.title}</h3>
      )}

      {/* Summary */}
      {parsed.summary && (
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{parsed.summary}</p>
      )}

      {/* Foods to Eat */}
      {parsed.foodsToEat.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="font-semibold text-green-700 dark:text-green-400">Foods to Eat</span>
          </div>
          <ul className="space-y-1 pl-5">
            {parsed.foodsToEat.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mt-0.5 select-none">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Foods to Avoid */}
      {parsed.foodsToAvoid.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="font-semibold text-red-700 dark:text-red-400">Foods to Avoid</span>
          </div>
          <ul className="space-y-1 pl-5">
            {parsed.foodsToAvoid.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-red-500 mt-0.5 select-none">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Daily Tips */}
      {parsed.dailyTips.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="font-semibold text-amber-700 dark:text-amber-400">Daily Tips</span>
          </div>
          <ul className="space-y-1 pl-5">
            {parsed.dailyTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-amber-500 mt-0.5 select-none">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NutriAIChatbot() {
  const { profile, user } = useAuth()
  const { darkMode } = useTheme()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [foodDB, setFoodDB] = useState<FoodDBEntry[]>([])
  const [tamilFoodDB, setTamilFoodDB] = useState<FoodDBEntry[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [geminiReady] = useState(isGeminiConfigured)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { loadFoodDatabases() }, [])
  useEffect(() => { if (user) loadChatHistory() }, [user])
  useEffect(() => { scrollToBottom() }, [messages])

  async function loadFoodDatabases() {
    try {
      const { data: regularFoods } = await supabase.from('food_database').select('*').order('name')
      const mappedRegular = (regularFoods || []).map(f => ({
        id: f.id, name: f.name, category: f.category,
        calories: f.calories_per_serving, protein: f.protein_per_serving,
        carbs: f.carbs_per_serving, fats: f.fats_per_serving,
        fiber: f.fiber_per_serving || 0, serving_size: f.serving_size,
        calories_per_serving: f.calories_per_serving, protein_per_serving: f.protein_per_serving,
        carbs_per_serving: f.carbs_per_serving, fats_per_serving: f.fats_per_serving,
        fiber_per_serving: f.fiber_per_serving || 0,
      }))

      const { data: tamilFoods } = await supabase.from('tamil_nadu_foods').select('*').order('name')
      const mappedTamil = (tamilFoods || []).map(f => ({
        id: f.id, name: f.name, name_ta: f.name_ta, category: f.category,
        calories: f.calories, protein: f.protein, carbs: f.carbs,
        fats: f.fats, fiber: f.fiber, serving_size: f.serving_size,
        calories_per_serving: f.calories, protein_per_serving: f.protein,
        carbs_per_serving: f.carbs, fats_per_serving: f.fats, fiber_per_serving: f.fiber,
      }))

      setFoodDB(mappedRegular)
      setTamilFoodDB(mappedTamil)
    } catch (error) {
      console.error('Error loading food databases:', error)
    }
  }

  async function loadChatHistory() {
    try {
      const { data, error } = await supabase
        .from('chat_sessions').select('*')
        .eq('user_id', user?.id).order('updated_at', { ascending: false }).limit(10)
      if (error) throw error
      if (data && data.length > 0 && data[0].messages?.length > 0) {
        setMessages(data[0].messages.map((m: any) => ({
          id: m.id || Date.now().toString() + Math.random(),
          role: m.role, content: m.content,
          timestamp: new Date(m.timestamp || Date.now()),
          language: m.language, metadata: m.metadata,
        })))
      } else {
        addWelcomeMessage()
      }
    } catch {
      addWelcomeMessage()
    }
  }

  function addWelcomeMessage() {
    const firstName = profile?.full_name?.split(' ')[0] || 'there'
    setMessages([{
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: `Hello ${firstName}! I'm your Smart NutriAI Assistant powered by Google Gemini.

I can help you with:
- Calorie & nutrition analysis for any food
- Personalized diet plans (weight loss, weight gain, maintenance)
- Tamil Nadu & Indian food nutrition
- Health condition diets (diabetes, BP, heart, pregnancy)
- Nutritional deficiency guidance
- Daily food tracking & macros

I understand English, Tamil, and Tanglish (Tamil in English script).

How can I help you today?

---

வணக்கம் ${firstName}! நான் Google Gemini மூலம் இயக்கப்படும் NutriAI உதவியாளர்.

ஆங்கிலம், தமிழ், அல்லது டாங்க்ளிஷ்-ல் கேளுங்கள் — நான் பதில் சொல்கிறேன்!`,
      timestamp: new Date(),
      language: 'en',
    }])
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function getFoodFromDB(name: string): FoodDBEntry | null {
    const normalized = normalizeFoodName(name)
    if (!normalized) return null
    const tamilMatch = tamilFoodDB.find(f =>
      normalizeFoodName(f.name) === normalized || f.name.toLowerCase().includes(normalized) || normalized.includes(f.name.toLowerCase())
    )
    if (tamilMatch) return tamilMatch
    return foodDB.find(f =>
      normalizeFoodName(f.name) === normalized || f.name.toLowerCase().includes(normalized) || normalized.includes(f.name.toLowerCase())
    ) || null
  }

  async function getTodaysFoodLog() {
    if (!user) return { records: [], total: { calories: 0, protein: 0, carbs: 0, fats: 0 } }
    const today = new Date().toISOString().split('T')[0]
    try {
      const { data } = await supabase.from('food_records').select('*').eq('user_id', user.id).eq('date', today)
      const records = data || []
      const total = records.reduce((acc, r) => ({
        calories: acc.calories + Number(r.calories || 0),
        protein: acc.protein + Number(r.protein || 0),
        carbs: acc.carbs + Number(r.carbohydrates || 0),
        fats: acc.fats + Number(r.fats || 0),
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 })
      return { records, total }
    } catch {
      return { records: [], total: { calories: 0, protein: 0, carbs: 0, fats: 0 } }
    }
  }

  async function calculateCaloriesFromFoods(foods: ParsedFood[]) {
    const total = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    const enriched: ParsedFood[] = []
    for (const food of foods) {
      const dbFood = getFoodFromDB(food.name)
      if (dbFood) {
        const m = food.quantity
        const enrichedFood = {
          ...food,
          calories: Math.round(dbFood.calories * m),
          protein: Math.round(dbFood.protein * m * 10) / 10,
          carbs: Math.round(dbFood.carbs * m * 10) / 10,
          fats: Math.round(dbFood.fats * m * 10) / 10,
          fiber: Math.round(dbFood.fiber * m * 10) / 10,
          servingSize: dbFood.serving_size,
          name: dbFood.name,
          nameTa: dbFood.name_ta,
        }
        enriched.push(enrichedFood)
        total.calories += enrichedFood.calories
        total.protein += enrichedFood.protein
        total.carbs += enrichedFood.carbs
        total.fats += enrichedFood.fats
        total.fiber += enrichedFood.fiber
      } else {
        enriched.push(food)
      }
    }
    return { foods: enriched, total }
  }

  function buildGeminiHistory(chatMessages: ChatMessage[]): GeminiMessage[] {
    return chatMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-20)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }))
  }

  async function generateResponse(message: string, history: ChatMessage[]): Promise<{ content: string; metadata?: ChatMessage['metadata'] }> {
    // Fast-path: if message describes specific food intake, enrich with DB data and send to Gemini with context
    let dbContext = ''
    let metadata: ChatMessage['metadata'] | undefined

    if (isFoodLogQuery(message)) {
      const parsedFoods = parseFoodItems(message)
      if (parsedFoods.length > 0) {
        const { foods: enriched, total } = await calculateCaloriesFromFoods(parsedFoods)
        const recognized = enriched.filter(f => f.calories > 0)
        if (recognized.length > 0) {
          metadata = { calories: total.calories, protein: total.protein, carbs: total.carbs, fats: total.fats, fiber: total.fiber, foods: enriched }
          dbContext = `\n\n[Database lookup results for this message:\n${recognized.map(f => `• ${f.quantity} ${f.unit} ${f.name}: ${f.calories} kcal, P:${f.protein}g, C:${f.carbs}g, F:${f.fats}g, Fiber:${f.fiber}g`).join('\n')}\nTotal: ${total.calories} kcal, P:${total.protein.toFixed(1)}g, C:${total.carbs.toFixed(1)}g, F:${total.fats.toFixed(1)}g\nUse these exact numbers in your response.]`
        }
      }
    }

    const { total: todayTotal } = await getTodaysFoodLog()

    const systemPrompt = buildNutritionSystemPrompt({
      name: profile?.full_name?.split(' ')[0] || undefined,
      weight: profile?.weight || undefined,
      height: profile?.height || undefined,
      age: profile?.age || undefined,
      gender: profile?.gender || undefined,
      goal: profile?.goal || undefined,
      activityLevel: profile?.activity_level || undefined,
      dailyCalorieGoal: profile?.daily_calorie_goal || undefined,
      todayCalories: todayTotal.calories,
      todayProtein: todayTotal.protein,
      todayCarbs: todayTotal.carbs,
      todayFats: todayTotal.fats,
    })

    const geminiHistory = buildGeminiHistory(history.slice(0, -1))
    const messageWithContext = message + dbContext

    const { content, error } = await callGemini(messageWithContext, geminiHistory, systemPrompt)

    if (error) {
      const lang = detectLanguage(message)
      const errMsg = lang === 'ta'
        ? `மன்னிக்கவும், தற்போது AI சேவையில் பிரச்சனை உள்ளது. ${error}`
        : lang === 'tanglish'
          ? `Sorry, ippovaikku AI service la problem irukku. ${error}`
          : `Sorry, there was an issue reaching the AI service. ${error}`
      return { content: errMsg }
    }

    return { content, metadata }
  }

  async function sendMessage() {
    if (!input.trim() || loading || !user) return

    setLoading(true)
    setShowSuggestions(false)

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      language: detectLanguage(input),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')

    let response: { content: string; metadata?: ChatMessage['metadata'] }
    try {
      response = await generateResponse(userMessage.content, updatedMessages)
    } catch {
      response = { content: 'Sorry, an unexpected error occurred. Please try again.' }
    }

    const assistantMessage: ChatMessage = {
      id: 'assistant-' + Date.now(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      language: detectLanguage(userMessage.content),
      metadata: response.metadata,
    }

    const finalMessages = [...updatedMessages, assistantMessage]
    setMessages(finalMessages)
    await saveChatSession(finalMessages)
    setLoading(false)
  }

  async function saveChatSession(chatMessages: ChatMessage[]) {
    if (!user) return
    try {
      const sessionData = {
        user_id: user.id,
        messages: chatMessages.map(m => ({
          id: m.id, role: m.role, content: m.content,
          timestamp: m.timestamp.toISOString(),
          language: m.language, metadata: m.metadata,
        })),
        updated_at: new Date().toISOString(),
      }
      const { data: existing } = await supabase.from('chat_sessions').select('id').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1)
      if (existing && existing.length > 0) {
        await supabase.from('chat_sessions').update(sessionData).eq('id', existing[0].id)
      } else {
        await supabase.from('chat_sessions').insert([sessionData])
      }
    } catch (error) {
      console.error('Error saving chat:', error)
    }
  }

  async function clearChat() {
    if (!user) return
    try {
      await supabase.from('chat_sessions').delete().eq('user_id', user.id)
      addWelcomeMessage()
    } catch (error) {
      console.error('Error clearing chat:', error)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickSuggestions = [
    { en: 'I ate 2 idlis, 1 dosa, 1 cup sambar', ta: 'Naan 2 idli, 1 dosa, 1 cup sambar thinitten', icon: Utensils },
    { en: 'How many calories in 1 parotta?', ta: '1 parotta la evalo calories?', icon: Flame },
    { en: 'Tips for weight loss', ta: 'Weight loss ku tips kudu', icon: Target },
    { en: 'What should I eat for protein?', ta: 'Protein ku enna sapdalam?', icon: Brain },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Smart NutriAI
              {geminiReady && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-semibold">
                  <Zap className="w-2.5 h-2.5" /> Gemini
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
              <span className="text-xs">EN | TA | Tanglish</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
            title={showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
          >
            {showSuggestions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          <button
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            title="Clear chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Gemini not configured warning */}
      {!geminiReady && (
        <div className="mb-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm flex items-start gap-2">
          <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Gemini API key not configured. Add <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">VITE_GEMINI_API_KEY</code> to your <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">.env</code> file to enable AI responses.</span>
        </div>
      )}

      {/* Quick Suggestions */}
      {showSuggestions && messages.length <= 2 && (
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickSuggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => { setInput(s.en); inputRef.current?.focus() }}
              className="flex items-center gap-2 px-3 py-2 text-left text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 transition text-gray-700 dark:text-gray-300"
            >
              <s.icon className="w-4 h-4 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">{s.en}</div>
                <div className="truncate text-[10px] text-gray-400 dark:text-gray-500 italic">{s.ta}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="max-w-[85%]">
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                }`}>
                  {/* Nutrition metadata cards */}
                  {msg.metadata && msg.role === 'assistant' && (msg.metadata.calories !== undefined || msg.metadata.foods) && (
                    <div className="mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {msg.metadata.calories !== undefined && (
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <div>
                            <div className="text-xs font-bold text-orange-600 dark:text-orange-400">{Math.round(msg.metadata.calories)}</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">kcal</div>
                          </div>
                        </div>
                      )}
                      {msg.metadata.protein !== undefined && (
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <Target className="w-3.5 h-3.5 text-red-500" />
                          <div>
                            <div className="text-xs font-bold text-red-600 dark:text-red-400">{msg.metadata.protein.toFixed(1)}g</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">Protein</div>
                          </div>
                        </div>
                      )}
                      {msg.metadata.carbs !== undefined && (
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <Droplets className="w-3.5 h-3.5 text-blue-500" />
                          <div>
                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{msg.metadata.carbs.toFixed(1)}g</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">Carbs</div>
                          </div>
                        </div>
                      )}
                      {msg.metadata.fats !== undefined && (
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                          <Info className="w-3.5 h-3.5 text-yellow-500" />
                          <div>
                            <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{msg.metadata.fats.toFixed(1)}g</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">Fats</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Food items list */}
                  {msg.metadata?.foods && msg.metadata.foods.filter(f => f.calories > 0).length > 0 && (
                    <div className="mb-3 space-y-1">
                      {msg.metadata.foods.filter(f => f.calories > 0).map((food, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <Leaf className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="font-medium">{food.quantity} {food.unit}</span>
                          <span className="text-gray-500 dark:text-gray-400">{food.nameTa || food.name}</span>
                          <span className="text-orange-500 dark:text-orange-400 font-semibold ml-auto">{food.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <StructuredMessage content={msg.content} />
                </div>
                <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-green-200 text-right mr-2' : 'text-gray-400 ml-2'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="mt-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask in English, Tamil, or Tanglish..."
              className={`w-full px-4 py-3 pr-12 rounded-xl border resize-none ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
              rows={2}
              disabled={loading}
            />
            <div className="absolute right-3 top-3 text-gray-300 dark:text-gray-600">
              <MessageCircle className="w-5 h-5" />
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim() || !user}
            className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-lg shadow-green-500/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center flex items-center justify-center gap-1">
          <Brain className="w-3 h-3" />
          NutriAI provides general nutrition information. Consult a healthcare professional for medical advice.
        </p>
      </div>
    </div>
  )
}
