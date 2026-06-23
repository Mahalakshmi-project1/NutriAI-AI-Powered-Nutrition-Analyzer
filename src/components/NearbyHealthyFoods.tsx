import { useState, useMemo, useCallback } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { callGemini, isGeminiConfigured } from '../lib/gemini'
import {
  Heart, Search, Loader2, Sparkles, MapPin, X,
  TrendingDown, TrendingUp, Beef, Wheat, Droplets, Zap, AlertCircle,
} from 'lucide-react'
import FoodDetailModal, { FoodDetail } from './FoodDetailModal'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TamilFood {
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
}

interface DetectedLocation {
  city: string | null
  district: string | null
  state: string | null
  lat: number
  lon: number
}

export type ActiveSource = DetectedLocation | string | null

// ─── Neighbor districts map ───────────────────────────────────────────────────

const NEIGHBORS: Record<string, string[]> = {
  coimbatore:    ['tiruppur', 'erode', 'nilgiris', 'palakkad'],
  tiruppur:      ['coimbatore', 'erode', 'dindigul'],
  erode:         ['coimbatore', 'tiruppur', 'namakkal', 'salem', 'karur'],
  salem:         ['erode', 'namakkal', 'dharmapuri', 'krishnagiri'],
  namakkal:      ['erode', 'salem', 'karur', 'tiruchirappalli'],
  karur:         ['namakkal', 'erode', 'tiruchirappalli', 'dindigul'],
  madurai:       ['dindigul', 'sivagangai', 'virudhunagar', 'theni'],
  dindigul:      ['madurai', 'karur', 'tiruchirappalli', 'theni'],
  theni:         ['madurai', 'dindigul', 'virudhunagar'],
  virudhunagar:  ['madurai', 'sivagangai', 'ramanathapuram', 'thoothukudi'],
  sivagangai:    ['madurai', 'ramanathapuram', 'virudhunagar'],
  ramanathapuram:['sivagangai', 'virudhunagar', 'thoothukudi'],
  tirunelveli:   ['thoothukudi', 'tenkasi', 'kanyakumari'],
  thoothukudi:   ['tirunelveli', 'ramanathapuram', 'kanyakumari'],
  kanyakumari:   ['tirunelveli', 'thoothukudi'],
  tiruchirappalli:['karur', 'namakkal', 'perambalur', 'ariyalur', 'thanjavur', 'dindigul'],
  thanjavur:     ['tiruchirappalli', 'tiruvarur', 'nagapattinam', 'ariyalur'],
  tiruvarur:     ['thanjavur', 'nagapattinam', 'tiruchirappalli'],
  nagapattinam:  ['tiruvarur', 'thanjavur', 'cuddalore'],
  perambalur:    ['tiruchirappalli', 'ariyalur', 'cuddalore'],
  ariyalur:      ['tiruchirappalli', 'perambalur', 'thanjavur'],
  chennai:       ['kanchipuram', 'thiruvallur', 'chengalpattu'],
  thiruvallur:   ['chennai', 'kanchipuram', 'vellore'],
  kanchipuram:   ['chennai', 'thiruvallur', 'chengalpattu', 'vellore'],
  chengalpattu:  ['chennai', 'kanchipuram', 'villupuram'],
  vellore:       ['thiruvallur', 'kanchipuram', 'tiruvannamalai', 'ranipet'],
  tiruvannamalai:['vellore', 'villupuram', 'dharmapuri'],
  villupuram:    ['chengalpattu', 'tiruvannamalai', 'cuddalore'],
  cuddalore:     ['villupuram', 'nagapattinam', 'perambalur'],
  dharmapuri:    ['salem', 'krishnagiri', 'tiruvannamalai'],
  krishnagiri:   ['dharmapuri', 'salem'],
  nilgiris:      ['coimbatore', 'erode'],
}

// ─── District → food names (exact DB names) ───────────────────────────────────

const DISTRICT_FOODS: Record<string, string[]> = {
  coimbatore:    ['Kambu Koozh', 'Kambu Roti', 'Ragi Kali', 'Ragi Dosa', 'Idli', 'Pongal', 'Ven Pongal', 'Avial', 'Kootu', 'Buttermilk'],
  tiruppur:      ['Kambu Koozh', 'Kambu Roti', 'Ragi Kali', 'Idli', 'Dosa', 'Pongal', 'Poriyal', 'Avial', 'Sambar', 'Buttermilk'],
  erode:         ['Kambu Koozh', 'Ragi Kali', 'Idli', 'Dosa', 'Ven Pongal', 'Sambar', 'Avial', 'Kootu', 'Poriyal', 'Filter Coffee'],
  salem:         ['Kambu Roti', 'Ragi Kali', 'Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Avial', 'Poriyal', 'Murukku'],
  namakkal:      ['Idli', 'Dosa', 'Pongal', 'Ven Pongal', 'Sambar', 'Rasam', 'Kootu', 'Poriyal', 'Avial', 'Buttermilk'],
  karur:         ['Kambu Koozh', 'Ragi Kali', 'Idli', 'Pongal', 'Sambar', 'Rasam', 'Mor Kuzhambu', 'Puli Kuzhambu', 'Kootu', 'Buttermilk'],
  madurai:       ['Idli', 'Dosa', 'Masala Dosa', 'Parotta', 'Vadai', 'Sambar', 'Puli Kuzhambu', 'Mor Kuzhambu', 'Mutton Curry', 'Filter Coffee'],
  dindigul:      ['Idli', 'Dosa', 'Parotta', 'Vadai', 'Sambar', 'Chicken Biryani', 'Mutton Curry', 'Rasam', 'Poriyal', 'Buttermilk'],
  theni:         ['Idli', 'Dosa', 'Ragi Kali', 'Kambu Koozh', 'Avial', 'Poriyal', 'Sambar', 'Rasam', 'Kootu', 'Buttermilk'],
  virudhunagar:  ['Idli', 'Dosa', 'Vadai', 'Parotta', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Murukku', 'Sundal'],
  tirunelveli:   ['Idli', 'Halwa', 'Dosa', 'Rasam', 'Pepper Rasam', 'Sambar', 'Poriyal', 'Kootu', 'Murukku', 'Jangiri'],
  thoothukudi:   ['Idli', 'Halwa', 'Dosa', 'Rasam', 'Sambar', 'Fish Curry', 'Prawn Masala', 'Poriyal', 'Kootu', 'Sundal'],
  kanyakumari:   ['Idli', 'Dosa', 'Puttu', 'Appam', 'Fish Curry', 'Avial', 'Sambar', 'Rasam', 'Kootu', 'Tender Coconut'],
  sivagangai:    ['Idli', 'Dosa', 'Vadai', 'Parotta', 'Sambar', 'Puli Kuzhambu', 'Mor Kuzhambu', 'Rasam', 'Kootu', 'Buttermilk'],
  ramanathapuram:['Idli', 'Dosa', 'Appam', 'Puttu', 'Fish Curry', 'Prawn Masala', 'Rasam', 'Sambar', 'Poriyal', 'Tender Coconut'],
  tiruchirappalli:['Idli', 'Dosa', 'Ven Pongal', 'Sambar', 'Rasam', 'Pepper Rasam', 'Poriyal', 'Kootu', 'Sambar Rice', 'Curd Rice'],
  perambalur:    ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Avial', 'Sambar Rice', 'Buttermilk'],
  ariyalur:      ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Avial', 'Rasam Rice', 'Buttermilk'],
  thanjavur:     ['Idli', 'Dosa', 'Ven Pongal', 'Sambar Rice', 'Rasam Rice', 'Curd Rice', 'Kootu', 'Poriyal', 'Avial', 'Pongal'],
  tiruvarur:     ['Idli', 'Dosa', 'Ven Pongal', 'Sambar Rice', 'Rasam', 'Curd Rice', 'Kootu', 'Poriyal', 'Sambar', 'Buttermilk'],
  nagapattinam:  ['Idli', 'Dosa', 'Fish Curry', 'Prawn Masala', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Curd Rice', 'Tender Coconut'],
  chennai:       ['Idli', 'Dosa', 'Masala Dosa', 'Vadai', 'Sambar', 'Rasam', 'Filter Coffee', 'Pongal', 'Curd Rice', 'Bajji'],
  kanchipuram:   ['Idli', 'Dosa', 'Ven Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Avial', 'Curd Rice', 'Filter Coffee'],
  thiruvallur:   ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Curd Rice', 'Avial', 'Filter Coffee'],
  chengalpattu:  ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Curd Rice', 'Kootu', 'Avial', 'Filter Coffee'],
  vellore:       ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Kambu Roti', 'Curd Rice', 'Filter Coffee'],
  tiruvannamalai:['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Avial', 'Kambu Koozh', 'Buttermilk'],
  villupuram:    ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Avial', 'Lemon Rice', 'Buttermilk'],
  cuddalore:     ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Fish Curry', 'Poriyal', 'Kootu', 'Curd Rice', 'Buttermilk'],
  krishnagiri:   ['Idli', 'Dosa', 'Ragi Kali', 'Ragi Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Buttermilk'],
  dharmapuri:    ['Idli', 'Dosa', 'Ragi Kali', 'Kambu Koozh', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Buttermilk'],
  nilgiris:      ['Idli', 'Dosa', 'Oats Idli', 'Avial', 'Poriyal', 'Kootu', 'Sambar', 'Rasam', 'Vegetable Soup', 'Buttermilk'],
}

function foodNamesForDistrict(key: string): string[] {
  if (DISTRICT_FOODS[key]) return DISTRICT_FOODS[key]
  const hit = Object.keys(DISTRICT_FOODS).find(k => key.includes(k) || k.includes(key))
  return hit ? DISTRICT_FOODS[hit] : []
}

function districtKeyFromSource(src: ActiveSource): string {
  if (!src) return ''
  if (typeof src === 'string') return src.trim().toLowerCase()
  const candidates = [src.district, src.city].filter((v): v is string => Boolean(v))
  for (const c of candidates) {
    const k = c.trim().toLowerCase()
    if (DISTRICT_FOODS[k]) return k
    const hit = Object.keys(DISTRICT_FOODS).find(dk => k.includes(dk) || dk.includes(k))
    if (hit) return hit
  }
  return ''
}

// ─── Health tags ─────────────────────────────────────────────────────────────

type TagKey = 'weight_loss' | 'weight_gain' | 'high_protein' | 'high_fiber' | 'iron_rich' | 'diabetes_friendly' | 'pcos_friendly'

const TAG_META: Record<TagKey, { label: string; cls: string; icon: React.ReactNode }> = {
  weight_loss:       { label: 'Best for Weight Loss', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: <TrendingDown className="w-3 h-3" /> },
  weight_gain:       { label: 'Best for Weight Gain', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',         icon: <TrendingUp className="w-3 h-3" />   },
  high_protein:      { label: 'High Protein',         cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',             icon: <Beef className="w-3 h-3" />        },
  high_fiber:        { label: 'High Fiber',           cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',         icon: <Wheat className="w-3 h-3" />       },
  iron_rich:         { label: 'Iron Rich',            cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',                 icon: <Zap className="w-3 h-3" />         },
  diabetes_friendly: { label: 'Diabetes Friendly',   cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',             icon: <Droplets className="w-3 h-3" />    },
  pcos_friendly:     { label: 'PCOS Friendly',        cls: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',             icon: <Heart className="w-3 h-3" />       },
}

const IRON_RICH_FOODS = ['Agathi Keerai', 'Murungai Keerai', 'Manathakkali Keerai', 'Methi', 'Palak', 'Ponnanganni Keerai', 'Sirukeerai', 'Ragi Kali', 'Kambu Koozh', 'Kollu Soup', 'Sundal', 'Sundal (Chana)', 'Sprouts Salad', 'Rajma', 'Chana Dal']
const DIABETES_FRIENDLY = ['Ragi Kali', 'Ragi Dosa', 'Kambu Koozh', 'Kambu Roti', 'Kuthiraivali Rice', 'Varagu Rice', 'Samai Rice', 'Thinai Upma', 'Oats Idli', 'Kollu Soup', 'Kootu', 'Poriyal', 'Rasam', 'Pepper Rasam', 'Vegetable Soup', 'Buttermilk', 'Mor Kuzhambu', 'Sprouts Salad']
const PCOS_FRIENDLY = ['Ragi Kali', 'Ragi Dosa', 'Kambu Koozh', 'Methi', 'Murungai Keerai', 'Agathi Keerai', 'Ponnanganni Keerai', 'Kollu Soup', 'Sprouts Salad', 'Kootu', 'Avial', 'Sundal', 'Oats Idli', 'Kuthiraivali Rice', 'Samai Rice']

function tagsForFood(f: TamilFood): TagKey[] {
  const tags: TagKey[] = []
  if (f.calories <= 120 && (f.fiber >= 2 || f.protein >= 3)) tags.push('weight_loss')
  if (f.calories >= 180 || f.fats >= 7) tags.push('weight_gain')
  if (f.protein >= 5) tags.push('high_protein')
  if (f.fiber >= 3) tags.push('high_fiber')
  if (IRON_RICH_FOODS.includes(f.name)) tags.push('iron_rich')
  if (DIABETES_FRIENDLY.includes(f.name)) tags.push('diabetes_friendly')
  if (PCOS_FRIENDLY.includes(f.name)) tags.push('pcos_friendly')
  return tags
}

// ─── Static enrichment data ───────────────────────────────────────────────────

const FOOD_ENRICHMENT: Record<string, Partial<FoodDetail>> = {
  'Idli': {
    ingredients: ['Idli rice', 'Urad dal', 'Salt', 'Water'],
    preparationMethod: 'Soak rice and urad dal separately for 4–6 hours, grind to a smooth batter, ferment overnight, then steam in idli moulds for 10–12 minutes.',
    vitaminsAndMinerals: ['Vitamin B12', 'Iron', 'Calcium', 'Phosphorus'],
    healthBenefits: ['Easy to digest due to fermentation', 'Low in fat and calories', 'Good source of carbohydrates for energy', 'Probiotic properties support gut health'],
    recommendedFrequency: '3–5 times per week',
    allergens: ['Contains gluten-free (rice-based)', 'Check urad dal for legume sensitivity'],
  },
  'Dosa': {
    ingredients: ['Idli rice', 'Urad dal', 'Fenugreek seeds', 'Salt', 'Oil'],
    preparationMethod: 'Fermented rice-lentil batter spread thin on a hot griddle and cooked until crisp. Served with sambar and chutneys.',
    vitaminsAndMinerals: ['B Vitamins', 'Iron', 'Calcium', 'Phosphorus'],
    healthBenefits: ['Fermented food improves gut health', 'Good energy source', 'Low in saturated fat', 'Provides essential amino acids'],
    recommendedFrequency: '3–4 times per week',
    allergens: ['Suitable for most diets', 'Not suitable for those with severe legume allergy'],
  },
  'Sambar': {
    ingredients: ['Toor dal', 'Tamarind', 'Tomatoes', 'Mixed vegetables', 'Sambar powder', 'Mustard seeds', 'Curry leaves', 'Asafoetida'],
    preparationMethod: 'Cook toor dal until soft, add tamarind extract, tomatoes, vegetables, and sambar powder. Temper with mustard seeds, curry leaves, and asafoetida.',
    vitaminsAndMinerals: ['Vitamin C', 'Iron', 'Folate', 'Vitamin A', 'Potassium'],
    healthBenefits: ['High in protein from lentils', 'Rich in vegetables for micronutrients', 'Tamarind aids digestion', 'Anti-inflammatory spices'],
    recommendedFrequency: 'Daily',
    allergens: ['Contains asafoetida (not suitable for those with gluten sensitivity in some forms)'],
  },
  'Rasam': {
    ingredients: ['Tamarind', 'Tomatoes', 'Pepper', 'Cumin', 'Garlic', 'Curry leaves', 'Mustard seeds', 'Toor dal (optional)'],
    preparationMethod: 'Boil tamarind extract with tomatoes and spices, add tempered mustard seeds and curry leaves. Simmer until aromatic.',
    vitaminsAndMinerals: ['Vitamin C', 'Iron', 'Manganese', 'Zinc'],
    healthBenefits: ['Aids digestion', 'Anti-inflammatory due to pepper', 'Boosts immunity', 'Natural remedy for cold and cough'],
    recommendedFrequency: 'Daily with meals',
    allergens: ['Generally allergen-free', 'Very low calorie'],
  },
  'Ragi Kali': {
    ingredients: ['Ragi flour', 'Water', 'Salt'],
    preparationMethod: 'Boil water with salt, gradually add ragi flour while stirring constantly. Cook until it forms a smooth, thick ball.',
    vitaminsAndMinerals: ['Calcium', 'Iron', 'Vitamin B3', 'Phosphorus', 'Magnesium'],
    healthBenefits: ['Excellent source of calcium for bone health', 'Low glycaemic index ideal for diabetics', 'High in dietary fiber', 'Keeps you full for longer'],
    recommendedFrequency: '3–4 times per week',
    allergens: ['Gluten-free', 'Suitable for diabetics and weight management'],
  },
  'Kambu Koozh': {
    ingredients: ['Pearl millet (kambu) flour', 'Buttermilk', 'Onion', 'Green chilli', 'Salt'],
    preparationMethod: 'Mix kambu flour into boiling water and cook to a porridge. Cool, dilute with buttermilk, and serve with raw onion and green chilli.',
    vitaminsAndMinerals: ['Iron', 'Zinc', 'Magnesium', 'B Vitamins', 'Calcium'],
    healthBenefits: ['Cooling properties, ideal for summer', 'Rich in iron, good for anaemia', 'Low glycaemic index', 'Probiotic from buttermilk supports gut health'],
    recommendedFrequency: '3–5 times per week',
    allergens: ['Gluten-free', 'Avoid if lactose intolerant (contains buttermilk)'],
  },
  'Avial': {
    ingredients: ['Mixed vegetables', 'Coconut', 'Green chillies', 'Cumin', 'Curd', 'Curry leaves', 'Coconut oil'],
    preparationMethod: 'Cook mixed vegetables, grind coconut with cumin and green chillies to a paste, mix into vegetables, add curd and finish with curry leaves in coconut oil.',
    vitaminsAndMinerals: ['Vitamin A', 'Vitamin C', 'Potassium', 'Manganese', 'Fiber'],
    healthBenefits: ['High in vegetables for vitamins and minerals', 'Coconut provides healthy medium-chain fats', 'Curd adds probiotics', 'Great for digestive health'],
    recommendedFrequency: '3–4 times per week',
    allergens: ['Contains coconut', 'Contains dairy (curd)'],
  },
  'Pongal': {
    ingredients: ['Raw rice', 'Moong dal', 'Ghee', 'Pepper', 'Cumin', 'Cashews', 'Ginger', 'Curry leaves'],
    preparationMethod: 'Cook rice and moong dal together until soft and mushy. Temper with ghee, pepper, cumin, ginger, and curry leaves. Top with fried cashews.',
    vitaminsAndMinerals: ['B Vitamins', 'Protein', 'Phosphorus', 'Magnesium'],
    healthBenefits: ['Easy to digest', 'Good source of protein and carbs', 'Digestive spices like pepper and ginger', 'Warming and nourishing'],
    recommendedFrequency: '2–3 times per week',
    allergens: ['Contains ghee (dairy)', 'Contains tree nuts (cashews)'],
  },
  'Ven Pongal': {
    ingredients: ['Raw rice', 'Moong dal', 'Ghee', 'Black pepper', 'Cumin', 'Ginger', 'Cashews', 'Curry leaves'],
    preparationMethod: 'Cook rice and moong dal together until very soft. Generously temper with ghee, coarsely ground pepper, cumin, ginger, and curry leaves.',
    vitaminsAndMinerals: ['B Vitamins', 'Protein', 'Phosphorus', 'Magnesium'],
    healthBenefits: ['Easily digestible one-pot meal', 'Moong dal provides plant protein', 'Digestive spices aid gut health', 'Nourishing for convalescence'],
    recommendedFrequency: '2–3 times per week',
    allergens: ['Contains ghee (dairy)', 'Contains cashews (tree nuts)'],
  },
  'Kootu': {
    ingredients: ['Vegetables (raw banana, yam, or greens)', 'Chana dal or moong dal', 'Coconut', 'Cumin', 'Pepper', 'Dry red chilli', 'Mustard seeds', 'Curry leaves'],
    preparationMethod: 'Cook vegetables and dal, grind coconut with cumin and pepper, mix into the cooked vegetables, temper with mustard seeds and curry leaves.',
    vitaminsAndMinerals: ['Protein', 'Fiber', 'Iron', 'Potassium', 'Vitamin C'],
    healthBenefits: ['High protein from dal', 'Fiber-rich for digestive health', 'Low in fat', 'Good source of minerals'],
    recommendedFrequency: 'Daily with meals',
    allergens: ['Contains coconut', 'Legume-based, may cause sensitivity in some'],
  },
  'Poriyal': {
    ingredients: ['Vegetable of choice', 'Mustard seeds', 'Dry red chilli', 'Curry leaves', 'Grated coconut', 'Oil', 'Salt'],
    preparationMethod: 'Sauté mustard seeds and red chilli in oil, add chopped vegetables, cook covered until tender, finish with grated coconut.',
    vitaminsAndMinerals: ['Vitamins vary by vegetable', 'Fiber', 'Potassium', 'Antioxidants'],
    healthBenefits: ['High in dietary fiber', 'Low in calories', 'Versatile micronutrient source based on vegetable used', 'Minimal oil cooking method'],
    recommendedFrequency: 'Daily with meals',
    allergens: ['Contains coconut'],
  },
  'Buttermilk': {
    ingredients: ['Curd (yogurt)', 'Water', 'Salt', 'Green chilli', 'Ginger', 'Curry leaves (optional)', 'Asafoetida'],
    preparationMethod: 'Blend curd with water, salt, green chilli, ginger, and asafoetida until smooth.',
    vitaminsAndMinerals: ['Calcium', 'Vitamin B12', 'Potassium', 'Phosphorus', 'Riboflavin'],
    healthBenefits: ['Probiotic-rich for gut health', 'Excellent cooling drink', 'Aids digestion', 'Good source of calcium'],
    recommendedFrequency: 'Daily, especially in summer',
    allergens: ['Contains dairy — avoid if lactose intolerant'],
  },
  'Curd Rice': {
    ingredients: ['Cooked rice', 'Curd', 'Milk', 'Ginger', 'Green chilli', 'Mustard seeds', 'Curry leaves', 'Pomegranate seeds (optional)'],
    preparationMethod: 'Mix well-cooked rice with curd and milk. Temper with mustard seeds, curry leaves, ginger, and green chilli. Garnish with pomegranate.',
    vitaminsAndMinerals: ['Calcium', 'Vitamin B12', 'Probiotics', 'Phosphorus'],
    healthBenefits: ['Cooling and soothing', 'Probiotic from curd aids digestion', 'Easy to digest', 'Ideal during illness or summer'],
    recommendedFrequency: '3–5 times per week',
    allergens: ['Contains dairy'],
  },
  'Fish Curry': {
    ingredients: ['Fish', 'Tamarind', 'Tomatoes', 'Onion', 'Ginger-garlic', 'Chilli powder', 'Coriander powder', 'Coconut milk', 'Curry leaves', 'Sesame oil'],
    preparationMethod: 'Fry onions and spices in sesame oil, add tamarind and tomatoes, cook down, add fish pieces and coconut milk, simmer until fish is cooked through.',
    vitaminsAndMinerals: ['Omega-3 fatty acids', 'Vitamin D', 'Vitamin B12', 'Iodine', 'Selenium'],
    healthBenefits: ['Rich in omega-3 for heart and brain health', 'High-quality protein', 'Vitamin D from fish', 'Iodine supports thyroid function'],
    recommendedFrequency: '2–3 times per week',
    allergens: ['Contains fish (allergen)', 'Contains coconut'],
  },
  'Vadai': {
    ingredients: ['Urad dal', 'Black pepper', 'Cumin', 'Ginger', 'Green chilli', 'Curry leaves', 'Oil for frying'],
    preparationMethod: 'Soak and grind urad dal to fluffy batter, mix spices, shape into rings, deep-fry until golden.',
    vitaminsAndMinerals: ['Protein', 'Iron', 'Calcium', 'B Vitamins'],
    healthBenefits: ['High in plant protein', 'Source of iron', 'Traditional festive snack', 'Good source of energy'],
    recommendedFrequency: '1–2 times per week (fried food — moderation)',
    allergens: ['Deep fried — limit for heart conditions', 'Legume-based'],
  },
  'Oats Idli': {
    ingredients: ['Rolled oats', 'Sooji (rava)', 'Curd', 'Vegetables', 'Mustard seeds', 'Curry leaves', 'Baking soda'],
    preparationMethod: 'Mix oats, sooji, and curd to a batter, add tempered vegetables, steam in idli moulds for 10–12 minutes.',
    vitaminsAndMinerals: ['Beta-glucan', 'Iron', 'B Vitamins', 'Manganese', 'Phosphorus'],
    healthBenefits: ['High in soluble fiber (beta-glucan) for cholesterol reduction', 'Good for diabetes management', 'Low glycaemic index', 'Quick and nutritious breakfast'],
    recommendedFrequency: '3–5 times per week',
    allergens: ['Contains gluten (oats and sooji)', 'Contains dairy (curd)'],
  },
  'Pepper Rasam': {
    ingredients: ['Tamarind', 'Black pepper', 'Cumin', 'Garlic', 'Tomatoes', 'Dry red chilli', 'Mustard seeds', 'Curry leaves'],
    preparationMethod: 'Grind pepper and cumin to a coarse powder, boil with tamarind, tomatoes, and garlic. Temper with mustard seeds and curry leaves.',
    vitaminsAndMinerals: ['Vitamin C', 'Manganese', 'Iron', 'Piperine'],
    healthBenefits: ['Piperine in pepper enhances nutrient absorption', 'Excellent for respiratory health', 'Boosts immunity', 'Anti-inflammatory properties'],
    recommendedFrequency: '3–5 times per week',
    allergens: ['Generally allergen-free'],
  },
  'Kollu Soup': {
    ingredients: ['Horse gram (kollu)', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Pepper', 'Cumin', 'Curry leaves'],
    preparationMethod: 'Soak and pressure-cook horse gram, blend with sautéed onion, tomato, and spices, simmer to a thick soup.',
    vitaminsAndMinerals: ['Iron', 'Protein', 'Folate', 'Phosphorus', 'Potassium'],
    healthBenefits: ['High protein and iron', 'Excellent for weight loss', 'Supports kidney health', 'Traditional remedy for kidney stones'],
    recommendedFrequency: '2–3 times per week',
    allergens: ['Legume — may cause gas/bloating in some individuals'],
  },
  'Sprouts Salad': {
    ingredients: ['Mixed sprouts (moong, chana)', 'Tomato', 'Onion', 'Cucumber', 'Lemon juice', 'Chaat masala', 'Green chilli'],
    preparationMethod: 'Sprout legumes for 1–2 days. Mix with chopped vegetables, lemon juice, and spices. Serve fresh.',
    vitaminsAndMinerals: ['Vitamin C', 'Folate', 'Iron', 'Protein', 'Zinc'],
    healthBenefits: ['Sprouting enhances nutrient bioavailability', 'Excellent plant-based protein', 'Rich in antioxidants', 'Aids weight management'],
    recommendedFrequency: '4–5 times per week',
    allergens: ['Legume-based', 'Gluten-free'],
  },
}

function enrichFood(food: TamilFood, district: string, aiRec: string | null): FoodDetail {
  const e = FOOD_ENRICHMENT[food.name] || {}
  return {
    ...food,
    district: district,
    healthBenefits: e.healthBenefits ?? ['Traditional regional food with balanced nutrition.'],
    ingredients: e.ingredients ?? [],
    preparationMethod: e.preparationMethod ?? 'Traditional preparation method varies by household and region.',
    vitaminsAndMinerals: e.vitaminsAndMinerals ?? [],
    recommendedFrequency: e.recommendedFrequency ?? 'As part of a balanced diet',
    allergens: e.allergens ?? ['Consult a healthcare provider if you have known food allergies.'],
    aiRecommendation: aiRec,
  }
}

// ─── AI helper ───────────────────────────────────────────────────────────────

function buildAiPromptForFood(food: TamilFood, profile: { age?: number; gender?: string; weight?: number; height?: number; goal?: string } | null): string {
  if (!profile) return ''
  const bmi = profile.height && profile.weight
    ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
    : null
  const parts = [
    `Food: ${food.name} (${food.calories} kcal, ${food.protein}g protein, ${food.carbs}g carbs, ${food.fats}g fat, ${food.fiber}g fiber)`,
    profile.age ? `Age: ${profile.age}` : null,
    profile.gender ? `Gender: ${profile.gender}` : null,
    bmi ? `BMI: ${bmi}` : null,
    profile.goal ? `Goal: ${profile.goal === 'lose' ? 'weight loss' : profile.goal === 'gain' ? 'weight gain' : 'maintenance'}` : null,
  ].filter(Boolean).join(', ')
  return `Given this user profile: ${parts}. Write ONE sentence (max 20 words) explaining if this food is suitable or recommended for them. Be specific and practical.`
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  allFoods: TamilFood[]
  activeSource: ActiveSource
  locationLabel: string | null
}

export default function NearbyHealthyFoods({ allFoods, activeSource, locationLabel }: Props) {
  const { darkMode } = useTheme()
  const { profile } = useAuth()

  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<TagKey | null>(null)
  const [modalFood, setModalFood] = useState<FoodDetail | null>(null)
  const [aiRecs, setAiRecs] = useState<Record<string, string>>({})
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiGenerated, setAiGenerated] = useState(false)

  // Gather foods from current + neighboring districts, dedupe, rank by nutrition score.
  const nearbyFoods = useMemo(() => {
    const districtKey = districtKeyFromSource(activeSource)
    if (!districtKey) return []

    const neighbors = NEIGHBORS[districtKey] ?? []
    const allKeys = [districtKey, ...neighbors]
    const nameSet = new Set<string>()
    allKeys.forEach(k => foodNamesForDistrict(k).forEach(n => nameSet.add(n)))

    return Array.from(nameSet)
      .map(name => allFoods.find(f => f.name === name))
      .filter((f): f is TamilFood => Boolean(f))
      .map(f => ({
        food: f,
        score: f.protein * 2.5 + f.fiber * 2 - Math.max(0, f.fats - 5) * 0.5 - Math.max(0, f.calories - 200) * 0.02,
      }))
      .sort((a, b) => b.score - a.score)
      .map(s => s.food)
  }, [activeSource, allFoods])

  const districtKey = districtKeyFromSource(activeSource)

  // Filter by search + tag
  const filtered = useMemo(() => {
    let list = nearbyFoods
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        (f.description ?? '').toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        districtKey.includes(q) ||
        (NEIGHBORS[districtKey] ?? []).some(n => n.includes(q)) ||
        tagsForFood(f).some(t => TAG_META[t].label.toLowerCase().includes(q))
      )
    }
    if (activeTag) {
      list = list.filter(f => tagsForFood(f).includes(activeTag))
    }
    return list
  }, [nearbyFoods, search, activeTag, districtKey])

  // Generate AI recommendations for all visible foods at once
  const generateAiRecs = useCallback(async () => {
    if (!isGeminiConfigured() || !profile || aiLoading) return
    setAiLoading(true)
    setAiError(null)

    const toProcess = filtered.slice(0, 12).filter(f => !aiRecs[f.id])
    const systemPrompt = 'You are a concise nutrition advisor. Answer only with the single sentence requested — no preamble, no extra lines.'

    const results: Record<string, string> = {}
    await Promise.allSettled(
      toProcess.map(async food => {
        const prompt = buildAiPromptForFood(food, profile)
        if (!prompt) return
        const res = await callGemini(prompt, [], systemPrompt)
        if (!res.error && res.content) results[food.id] = res.content.trim()
      })
    )

    setAiRecs(prev => ({ ...prev, ...results }))
    setAiLoading(false)
    setAiGenerated(true)
    if (Object.keys(results).length === 0) setAiError('Could not generate recommendations. Check your Gemini API key.')
  }, [filtered, profile, aiRecs, aiLoading])

  const openModal = (food: TamilFood) => {
    setModalFood(enrichFood(food, districtKey || locationLabel || 'Tamil Nadu', aiRecs[food.id] ?? null))
  }

  if (nearbyFoods.length === 0) return null

  return (
    <>
      <section className="space-y-4">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 dark:text-rose-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Nearby Healthy Foods
            </h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>{filtered.length}</span>
          </div>
          {locationLabel && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-green-500" />
              Healthy foods from <span className="font-medium text-green-600 dark:text-green-400 ml-1">{locationLabel} &amp; nearby areas</span>
            </p>
          )}
        </div>

        {/* Search bar */}
        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by food name, district, or health benefit…"
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
            </button>
          )}
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TAG_META) as TagKey[]).map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(prev => prev === tag ? null : tag)}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition ${
                activeTag === tag
                  ? TAG_META[tag].cls + ' ring-2 ring-offset-1 ring-current'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {TAG_META[tag].icon}
              {TAG_META[tag].label}
            </button>
          ))}
        </div>

        {/* AI recommendation button */}
        {isGeminiConfigured() && profile && !aiGenerated && (
          <div className={`flex items-center justify-between gap-3 p-4 rounded-xl border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">AI Recommendations</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Get personalized tips based on your BMI{profile.weight && profile.height ? ` (${(profile.weight / ((profile.height / 100) ** 2)).toFixed(1)})` : ''} and goal.
                </p>
              </div>
            </div>
            <button
              onClick={generateAiRecs}
              disabled={aiLoading}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {aiLoading ? 'Analyzing…' : 'Get recommendations'}
            </button>
          </div>
        )}

        {aiError && (
          <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
            darkMode ? 'bg-rose-900/20 text-rose-300' : 'bg-rose-50 text-rose-700'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{aiError}</span>
          </div>
        )}

        {/* Food cards grid */}
        {filtered.length === 0 ? (
          <div className={`rounded-xl border p-8 text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <Search className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No foods match your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(food => {
              const tags = tagsForFood(food)
              const enrich = FOOD_ENRICHMENT[food.name]
              const rec = aiRecs[food.id]
              return (
                <div
                  key={food.id}
                  className={`flex flex-col rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                    darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col flex-1 p-4 gap-3">
                    {/* Name + region + calorie badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{food.name}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-400">
                            {(districtKey || 'Tamil Nadu').charAt(0).toUpperCase() + (districtKey || 'Tamil Nadu').slice(1)} region
                          </span>
                        </div>
                      </div>
                      <div className={`shrink-0 text-right px-2.5 py-1.5 rounded-lg ${
                        darkMode ? 'bg-orange-900/20' : 'bg-orange-50'
                      }`}>
                        <div className="text-base font-bold text-orange-600 dark:text-orange-400 leading-none">{food.calories}</div>
                        <div className="text-xs text-gray-500 mt-0.5">kcal</div>
                      </div>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      <div className={`py-1.5 rounded-lg text-center ${darkMode ? 'bg-rose-900/20' : 'bg-rose-50'}`}>
                        <div className="font-semibold text-rose-600 dark:text-rose-400">{food.protein}g</div>
                        <div className="text-gray-500">Protein</div>
                      </div>
                      <div className={`py-1.5 rounded-lg text-center ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                        <div className="font-semibold text-blue-600 dark:text-blue-400">{food.carbs}g</div>
                        <div className="text-gray-500">Carbs</div>
                      </div>
                      <div className={`py-1.5 rounded-lg text-center ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
                        <div className="font-semibold text-amber-600 dark:text-amber-400">{food.fats}g</div>
                        <div className="text-gray-500">Fats</div>
                      </div>
                    </div>

                    {/* Health tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map(tag => (
                          <span key={tag} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${TAG_META[tag].cls}`}>
                            {TAG_META[tag].icon}
                            {TAG_META[tag].label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* AI recommendation snippet */}
                    {rec && (
                      <div className={`flex items-start gap-1.5 p-2.5 rounded-lg text-xs leading-relaxed ${
                        darkMode ? 'bg-green-900/15 text-green-300' : 'bg-green-50 text-green-800'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-500" />
                        <span>{rec}</span>
                      </div>
                    )}

                    {/* Health benefit snippet */}
                    {!rec && (enrich?.healthBenefits?.[0]) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {enrich.healthBenefits[0]}
                      </p>
                    )}

                    {/* Divider */}
                    <div className={`border-t ${ darkMode ? 'border-gray-700' : 'border-gray-100' }`} />

                    {/* View details */}
                    <button
                      onClick={() => openModal(food)}
                      className="mt-auto w-full py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 active:scale-95 transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Detail modal */}
      {modalFood && (
        <FoodDetailModal food={modalFood} onClose={() => setModalFood(null)} />
      )}
    </>
  )
}
