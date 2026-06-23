import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  Heart, Droplets, Baby, Activity, Sparkles, AlertTriangle,
  CheckCircle, XCircle, Apple, Coffee, Utensils, Moon, Sun, Info,
  TrendingUp, Target, BookOpen, Dumbbell, Timer, Flame,
  Wind, PersonStanding, Zap, Brain, Shield, Leaf,
  Scale, HeartPulse, User
} from 'lucide-react'

// ─── shared types ────────────────────────────────────────────────────────────
type Gender = 'female' | 'male' | 'transgender' | 'other'

interface Question {
  id: string
  question: string
  options?: string[]
  type: 'select' | 'multiselect' | 'number' | 'text'
}

interface AnalysisResult {
  summary: string
  foodsToEat: string[]
  foodsToAvoid: string[]
  hydrationTips: string[]
  mealPlan: { meal: string; items: string[] }[]
  additionalTips: string[]
}

// ─── helper: derive hub config from gender ───────────────────────────────────
export function getHubConfig(gender: Gender | undefined | null) {
  switch (gender) {
    case 'male':
      return {
        hubName: "Men's Health Hub",
        tagline: 'Nutrition & fitness tailored for men',
        accentFrom: 'from-blue-600',
        accentTo: 'to-cyan-500',
        accentBg: 'bg-blue-50 dark:bg-blue-900/20',
        accentBorder: 'border-blue-200 dark:border-blue-800',
        accentText: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
      }
    case 'transgender':
      return {
        hubName: 'Transgender Wellness Hub',
        tagline: 'Inclusive wellness support for your journey',
        accentFrom: 'from-teal-600',
        accentTo: 'to-emerald-500',
        accentBg: 'bg-teal-50 dark:bg-teal-900/20',
        accentBorder: 'border-teal-200 dark:border-teal-800',
        accentText: 'text-teal-600 dark:text-teal-400',
        iconBg: 'bg-teal-100 dark:bg-teal-900/30',
        iconColor: 'text-teal-600 dark:text-teal-400',
      }
    default:
      return {
        hubName: "Women's Health Hub",
        tagline: 'Personalized nutrition guidance for every stage of life',
        accentFrom: 'from-green-600',
        accentTo: 'to-emerald-500',
        accentBg: 'bg-pink-50 dark:bg-pink-900/20',
        accentBorder: 'border-pink-200 dark:border-pink-800',
        accentText: 'text-pink-600 dark:text-pink-400',
        iconBg: 'bg-pink-100 dark:bg-pink-900/30',
        iconColor: 'text-pink-600 dark:text-pink-400',
      }
  }
}

// ─── question banks ───────────────────────────────────────────────────────────
const PERIOD_QUESTIONS: Question[] = [
  { id: 'cycle_day', question: 'What day of your cycle are you currently on?', type: 'number' },
  { id: 'symptoms', question: 'Which symptoms are you experiencing?', options: ['Cramps', 'Bloating', 'Fatigue', 'Mood swings', 'Headaches', 'Back pain', 'Acne', 'Breast tenderness'], type: 'multiselect' },
  { id: 'flow', question: 'How would you describe your flow?', options: ['Light', 'Moderate', 'Heavy'], type: 'select' },
  { id: 'energy', question: 'How is your energy level?', options: ['Very low', 'Low', 'Normal', 'High'], type: 'select' },
  { id: 'cravings', question: 'What cravings are you experiencing?', options: ['Chocolate', 'Sweets', 'Salty foods', 'Carbs', 'None'], type: 'select' },
]
const PREGNANCY_QUESTIONS: Question[] = [
  { id: 'trimester', question: 'Which trimester are you in?', options: ['First (1-12 weeks)', 'Second (13-26 weeks)', 'Third (27-40 weeks)'], type: 'select' },
  { id: 'symptoms', question: 'Current symptoms?', options: ['Morning sickness', 'Fatigue', 'Heartburn', 'Constipation', 'Swelling', 'Back pain', 'Cravings', 'None'], type: 'multiselect' },
  { id: 'dietary_restrictions', question: 'Any dietary restrictions?', options: ['Vegetarian', 'Vegan', 'Gluten-free', 'Lactose intolerant', 'None'], type: 'select' },
  { id: 'activity_level', question: 'Daily activity level?', options: ['Sedentary', 'Lightly active', 'Moderately active', 'Very active'], type: 'select' },
]
const PCOS_QUESTIONS: Question[] = [
  { id: 'symptoms', question: 'Which PCOS symptoms do you experience?', options: ['Irregular periods', 'Weight gain', 'Acne', 'Hair thinning', 'Excess hair growth', 'Insulin resistance', 'Fatigue', 'Mood changes'], type: 'multiselect' },
  { id: 'weight_goal', question: 'What is your weight management goal?', options: ['Lose weight', 'Maintain weight', 'Gain muscle', 'Not focused on weight'], type: 'select' },
  { id: 'diet_type', question: 'Current dietary pattern?', options: ['Standard Indian diet', 'Low carb', 'High protein', 'Mediterranean style', 'No specific diet'], type: 'select' },
  { id: 'activity', question: 'Exercise frequency?', options: ['None', '1-2 times/week', '3-4 times/week', '5+ times/week'], type: 'select' },
]
const ANEMIA_QUESTIONS: Question[] = [
  { id: 'symptoms', question: 'Which symptoms do you experience?', options: ['Fatigue', 'Weakness', 'Pale skin', 'Shortness of breath', 'Dizziness', 'Cold hands/feet', 'Headaches', 'Brittle nails'], type: 'multiselect' },
  { id: 'diagnosed', question: 'Have you been diagnosed with anemia?', options: ['Yes, iron deficiency', 'Yes, other type', 'Suspected but not diagnosed', 'No'], type: 'select' },
  { id: 'hb_level', question: 'Last known hemoglobin level (g/dL)?', type: 'number' },
  { id: 'diet_type', question: 'Dietary preference?', options: ['Non-vegetarian', 'Vegetarian (includes dairy/eggs)', 'Vegan', 'Flexitarian'], type: 'select' },
]
const MENOPAUSE_QUESTIONS: Question[] = [
  { id: 'stage', question: 'Current stage?', options: ['Perimenopause', 'Menopause', 'Post-menopause', 'Not sure'], type: 'select' },
  { id: 'symptoms', question: 'Which symptoms affect you most?', options: ['Hot flashes', 'Night sweats', 'Mood changes', 'Sleep issues', 'Weight gain', 'Joint pain', 'Brain fog', 'Vaginal dryness'], type: 'multiselect' },
  { id: 'bone_health', question: 'Any bone health concerns?', options: ['Osteoporosis diagnosed', 'Osteopenia', 'Family history', 'No known issues', 'Not tested'], type: 'select' },
  { id: 'activity', question: 'Physical activity level?', options: ['None', 'Light (walking)', 'Moderate (yoga, swimming)', 'Active (gym, sports)'], type: 'select' },
]
const MUSCLE_QUESTIONS: Question[] = [
  { id: 'goal', question: 'What is your primary muscle goal?', options: ['Build mass (bulking)', 'Lean muscle tone', 'Athletic performance', 'Maintain current muscle'], type: 'select' },
  { id: 'training', question: 'Current training frequency?', options: ['Beginner (1-2x/week)', 'Intermediate (3-4x/week)', 'Advanced (5-6x/week)', 'Not training yet'], type: 'select' },
  { id: 'diet', question: 'Current diet style?', options: ['High protein', 'Standard balanced', 'Low carb / keto', 'Vegetarian/Vegan', 'No specific diet'], type: 'select' },
  { id: 'challenges', question: 'Biggest challenges?', options: ['Not eating enough protein', 'Hard gainer', 'Recovery issues', 'Lack of time', 'Budget constraints'], type: 'select' },
]
const WEIGHT_LOSS_QUESTIONS: Question[] = [
  { id: 'current_weight', question: 'How would you describe your current weight status?', options: ['Slightly overweight', 'Moderately overweight', 'Significantly overweight', 'Obese'], type: 'select' },
  { id: 'past_attempts', question: 'Have you tried weight loss before?', options: ['Yes, successfully', 'Yes, but regained', 'Multiple times', 'First time'], type: 'select' },
  { id: 'activity', question: 'Current physical activity?', options: ['None', 'Light (walking)', 'Moderate (gym 2-3x)', 'Active (gym 4-5x)'], type: 'select' },
  { id: 'diet_pref', question: 'Dietary preference?', options: ['Any food', 'Vegetarian', 'Vegan', 'Low carb', 'Intermittent fasting'], type: 'select' },
]
const TESTOSTERONE_QUESTIONS: Question[] = [
  { id: 'symptoms', question: 'Do you experience any of these?', options: ['Low energy / fatigue', 'Decreased libido', 'Mood changes / irritability', 'Difficulty gaining muscle', 'Increased body fat', 'Poor sleep', 'Brain fog', 'None'], type: 'multiselect' },
  { id: 'age_group', question: 'What is your age group?', options: ['18-25', '26-35', '36-45', '46-55', '55+'], type: 'select' },
  { id: 'lifestyle', question: 'Current lifestyle?', options: ['Sedentary', 'Lightly active', 'Moderately active', 'Very active'], type: 'select' },
  { id: 'sleep', question: 'Average sleep quality?', options: ['Poor', 'Fair', 'Good', 'Excellent'], type: 'select' },
]
const HEART_QUESTIONS: Question[] = [
  { id: 'risk_factors', question: 'Any of these apply to you?', options: ['High blood pressure', 'High cholesterol', 'Diabetes', 'Family history of heart disease', 'Smoking', 'Obesity', 'Sedentary job', 'None'], type: 'multiselect' },
  { id: 'diet', question: 'Current dietary habits?', options: ['Mostly home-cooked', 'Frequent outside food', 'Mixed', 'Healthy/balanced', 'High in processed food'], type: 'select' },
  { id: 'activity', question: 'Exercise frequency?', options: ['None', '1-2x/week', '3-4x/week', '5+x/week'], type: 'select' },
  { id: 'stress', question: 'Stress level?', options: ['High', 'Moderate', 'Low', 'Well managed'], type: 'select' },
]
const WELLNESS_QUESTIONS: Question[] = [
  { id: 'concerns', question: 'What are your primary wellness concerns?', options: ['Weight management', 'Mental wellness', 'Fitness & energy', 'Nutrition balance', 'Sleep quality', 'Stress management', 'General health', 'Self-care'], type: 'multiselect' },
  { id: 'diet_pref', question: 'Dietary preference?', options: ['Any food', 'Vegetarian', 'Vegan', 'Gluten-free', 'No specific preference'], type: 'select' },
  { id: 'activity', question: 'Current activity level?', options: ['Sedentary', 'Lightly active', 'Moderately active', 'Very active'], type: 'select' },
  { id: 'mental_health', question: 'Mental wellness priority?', options: ['Low', 'Moderate', 'High', 'Top priority'], type: 'select' },
]

// ─── analyzers ────────────────────────────────────────────────────────────────
function analyzePeriod(a: Record<string, any>): AnalysisResult {
  const cycleDay = a.cycle_day || 1
  const phase = cycleDay <= 5 ? 'Menstrual' : cycleDay <= 14 ? 'Follicular' : cycleDay <= 17 ? 'Ovulatory' : 'Luteal'
  return {
    summary: `${phase} Phase (Day ${cycleDay}) — ${a.flow || 'Moderate'} flow. Focusing on iron replenishment and comfort.`,
    foodsToEat: ['Iron-rich: Palak, methi, beetroot', 'Protein: Eggs, lentils, rajma', 'Magnesium: Bananas, dark chocolate, pumpkin seeds', 'Vitamin C: Amla, oranges (enhances iron absorption)', 'Ginger tea — reduces cramps', 'Warm soups and broths for comfort'],
    foodsToAvoid: ['Excessive caffeine — worsens cramps', 'Salty foods — causes bloating', 'Refined sugars — energy crashes', 'Processed/fried foods — increases inflammation'],
    hydrationTips: ['8-10 glasses warm water daily', 'Herbal teas: chamomile, peppermint, ginger', 'Coconut water for electrolytes', 'Avoid cold drinks during heavy flow days'],
    mealPlan: [
      { meal: 'Early Morning', items: ['Warm water with lemon', '5-6 soaked almonds'] },
      { meal: 'Breakfast', items: ['Ragi dosa or moong dal cheela', 'Fresh papaya', 'Glass of milk'] },
      { meal: 'Lunch', items: ['Rice or roti', 'Palak paneer or methi dal', 'Beetroot salad'] },
      { meal: 'Dinner', items: ['Light khichdi with vegetables', 'Warm turmeric milk'] },
    ],
    additionalTips: ['Apply heat to relieve cramps', 'Light yoga or walking helps', 'Prioritise 8-9 hours of sleep', 'Track your cycle monthly'],
  }
}

function analyzePregnancy(a: Record<string, any>): AnalysisResult {
  const trimNum = a.trimester?.includes('First') ? 1 : a.trimester?.includes('Second') ? 2 : 3
  return {
    summary: `${a.trimester || 'Pregnancy'} — balanced nutrition for healthy baby development.`,
    foodsToEat: [trimNum === 1 ? 'Folic acid: Spinach, lentils, fortified cereals' : 'Iron-rich: Lean meats, beans, leafy greens', 'Calcium: Milk, curd, paneer, sesame seeds', 'Protein: Eggs, dal, chicken (low-mercury fish)', 'DHA: Walnuts, flaxseeds', 'Vitamin C: Amla, oranges', 'Fiber: Whole grains, vegetables (prevents constipation)'],
    foodsToAvoid: ['High-mercury fish', 'Raw/undercooked meat or eggs', 'Excessive caffeine (limit 200 mg/day)', 'Alcohol — strictly avoid', 'Unripe papaya in first trimester'],
    hydrationTips: ['10-12 glasses of water daily', 'Coconut water for electrolytes', 'Warm milk with saffron', 'Avoid excessive tea/coffee'],
    mealPlan: [
      { meal: 'Early Morning', items: ['2-3 soaked almonds', '1 date', 'Glass of water'] },
      { meal: 'Breakfast', items: ['Ragi porridge or oats', 'Hard-boiled egg or paneer', 'Seasonal fruit'] },
      { meal: 'Lunch', items: ['Rice or 2 rotis', 'Dal or lean meat curry', 'Green vegetables', 'Curd'] },
      { meal: 'Dinner', items: ['Light khichdi or soup', 'Sauteed vegetables', 'Warm turmeric milk'] },
    ],
    additionalTips: [`Target ${trimNum === 1 ? '1800-2000' : trimNum === 2 ? '2200-2400' : '2400-2800'} calories/day`, 'Take prenatal vitamins', 'Attend regular prenatal check-ups', 'Stay active: walking, prenatal yoga'],
  }
}

function analyzePCOS(a: Record<string, any>): AnalysisResult {
  return {
    summary: `PCOS management — ${(a.symptoms || []).length} symptoms noted. Focus: insulin sensitivity & hormonal balance.`,
    foodsToEat: ['Low GI: Whole grains, oats, millets', 'Lean protein: Chicken, fish, eggs, tofu', 'Fiber: Green vegetables, beans, berries', 'Anti-inflammatory: Turmeric, ginger', 'Cinnamon — helps insulin sensitivity', 'Spearmint tea — may reduce androgens'],
    foodsToAvoid: ['Refined carbs: White rice, maida', 'Sugary foods and soft drinks', 'Processed and fried foods', 'Trans fats', 'Alcohol'],
    hydrationTips: ['8-10 glasses water daily', 'Green tea for insulin resistance', 'Warm lemon water for metabolism', 'Avoid sugary drinks'],
    mealPlan: [
      { meal: 'Early Morning', items: ['Warm water with lemon', 'Soaked almonds'] },
      { meal: 'Breakfast', items: ['Oats or millet upma', 'Egg bhurji or paneer', 'Green tea'] },
      { meal: 'Lunch', items: ['1-2 millet rotis', 'Grilled fish or dal', 'Large salad with olive oil'] },
      { meal: 'Dinner', items: ['Grilled chicken/paneer', 'Sautéed vegetables', 'Light soup'] },
    ],
    additionalTips: ['150+ min moderate exercise/week', 'Strength training 2-3x/week', 'Sleep 7-8 hours — crucial for hormones', 'Manage stress: yoga, meditation'],
  }
}

function analyzeAnemia(a: Record<string, any>): AnalysisResult {
  const hb = parseFloat(a.hb_level) || 0
  const severity = hb >= 12 ? 'Normal' : hb >= 10 ? 'Mild' : hb >= 8 ? 'Moderate' : 'Severe'
  const isVeg = (a.diet_type || '').includes('Vegetarian') || a.diet_type === 'Vegan'
  return {
    summary: `Anemia support${hb > 0 ? ` — ${severity} (${hb} g/dL)` : ''}. Diet: ${a.diet_type || 'Not specified'}. Focus: iron-rich foods.`,
    foodsToEat: [isVeg ? 'Plant iron: Spinach, lentils, tofu, sesame seeds' : 'Red meat — richest heme iron source', 'Leafy greens: Palak, methi, bathua', 'Legumes: Rajma, chana, moong dal', 'Dates and jaggery — traditional iron sources', 'Pomegranate and beetroot', 'Vitamin C with every iron-rich meal'],
    foodsToAvoid: ['Tea/coffee with meals — blocks iron absorption', 'Calcium supplements within 2 hrs of iron meals', 'Excessive processed foods', 'Unsoaked legumes (phytates)'],
    hydrationTips: ['8-10 glasses water daily', 'Fresh amla or orange juice with meals', 'Beetroot-carrot-spinach juice', 'Avoid tea 1 hour before and after meals'],
    mealPlan: [
      { meal: 'Early Morning', items: ['Warm water with lemon', 'Pumpkin seeds or almonds'] },
      { meal: 'Breakfast', items: [isVeg ? 'Ragi dosa or poha with peanuts' : 'Eggs bhurji', 'Orange or amla juice', 'Pomegranate seeds'] },
      { meal: 'Lunch', items: ['Rice or roti', 'Palak dal or methi sabzi', 'Beetroot-carrot salad with lemon'] },
      { meal: 'Dinner', items: ['Dal khichdi', 'Sautéed leafy greens', 'Jaggery (gur) for dessert'] },
    ],
    additionalTips: [a.diagnosed?.includes('Yes') ? "Follow doctor's treatment plan" : 'Get a blood test to confirm', 'Cook in cast iron pans for extra iron', 'Take iron supplements with Vitamin C', 'Blood tests every 3 months'],
  }
}

function analyzeMenopause(a: Record<string, any>): AnalysisResult {
  return {
    summary: `${a.stage || 'Menopause'} management — focus on bone and heart health.`,
    foodsToEat: ['Calcium: Milk, curd, paneer, ragi, sesame', 'Vitamin D: Fatty fish, egg yolks, fortified foods', 'Phytoestrogens: Soybeans, flaxseeds, tofu', 'Heart-healthy: Omega-3 from fish, walnuts, olive oil', 'Protein: Eggs, legumes (preserve muscle mass)', 'Magnesium: Dark chocolate, bananas, nuts (sleep)'],
    foodsToAvoid: ['Excessive caffeine — triggers hot flashes', 'Spicy foods — worsens hot flashes', 'Alcohol — increases bone loss', 'High-sodium processed foods', 'Refined sugars and trans fats'],
    hydrationTips: ['8-10 glasses water daily', 'Herbal teas: chamomile, peppermint', 'Coconut water for electrolytes', 'Limit caffeinated beverages'],
    mealPlan: [
      { meal: 'Early Morning', items: ['Warm water with lemon', 'Almonds and 1 fig'] },
      { meal: 'Breakfast', items: ['Oats with flaxseed', 'Greek yogurt with berries'] },
      { meal: 'Lunch', items: ['Ragi roti or brown rice', 'Fish curry or dal', 'Sautéed leafy greens'] },
      { meal: 'Dinner', items: ['Soup or salad', 'Grilled fish or paneer', 'Steamed vegetables'] },
    ],
    additionalTips: ['Weight-bearing exercises 3-4x/week', 'Get Vitamin D levels checked', 'Manage stress: yoga, meditation', 'Regular bone density screening'],
  }
}

function analyzeMuscleGain(a: Record<string, any>): AnalysisResult {
  return {
    summary: `Muscle gain plan — goal: ${a.goal || 'Build mass'}. Training: ${a.training || 'Intermediate'}.`,
    foodsToEat: ['High-quality protein: Chicken breast, eggs, paneer, fish', 'Complex carbs: Brown rice, oats, sweet potato, quinoa', 'Healthy fats: Almonds, walnuts, avocado, olive oil', 'Leucine-rich: Whey protein, lentils, soybeans', 'Pre-workout: Banana, oats 45 min before training', 'Post-workout: Protein + fast carbs within 30 min', 'Creatine-rich foods: Red meat, fish'],
    foodsToAvoid: ['Excessive sugar and alcohol', 'Fried and processed foods', 'Skipping meals — breaks muscle synthesis', 'Trans fats in packaged snacks'],
    hydrationTips: ['3-4 litres water on training days', 'Electrolyte drinks after intense sessions', 'Avoid sugary sports drinks', 'Protein shakes count toward fluid intake'],
    mealPlan: [
      { meal: 'Pre-Workout', items: ['Banana', 'Oats or toast with peanut butter', 'Black coffee (optional)'] },
      { meal: 'Post-Workout', items: ['Whey protein shake or eggs', 'White rice or banana for fast carbs'] },
      { meal: 'Breakfast', items: ['4-6 eggs or paneer bhurji', 'Oats or multigrain bread', 'Fresh fruit'] },
      { meal: 'Lunch', items: ['200-250 g chicken/fish or tofu', 'Brown rice or 2-3 rotis', 'Mixed vegetables', 'Dal or lentils'] },
      { meal: 'Dinner', items: ['Protein-rich meal: Eggs, cottage cheese, or lean meat', 'Steamed or stir-fried vegetables', 'Light carb source'] },
    ],
    additionalTips: ['Aim for 1.6-2.2 g protein per kg body weight', 'Progressive overload — increase weights weekly', 'Sleep 8 hours — muscle repair happens at rest', 'Track calories with a slight surplus for bulking'],
  }
}

function analyzeWeightLoss(a: Record<string, any>): AnalysisResult {
  return {
    summary: `Weight loss plan — ${a.current_weight || 'Moderate overweight'}. Focus: sustainable calorie deficit.`,
    foodsToEat: ['High-volume low-calorie: Leafy greens, cucumber, tomato', 'Lean protein: Chicken breast, eggs, fish, dal, tofu', 'Fiber-rich: Oats, rajma, chickpeas, whole grains', 'Healthy fats (moderate): Avocado, nuts, olive oil', 'Fruits: Berries, apple, guava — low sugar, high fiber', 'Green tea — boosts metabolism'],
    foodsToAvoid: ['Refined carbs: Maida, white rice, bread', 'Sugary drinks and fruit juices', 'Fried and fast foods', 'Alcohol — empty calories', 'High-fat dairy in excess'],
    hydrationTips: ['3-4 litres water daily', 'Drink 2 glasses water before each meal', 'Green tea or black coffee (no sugar)', 'Avoid sugary packaged drinks'],
    mealPlan: [
      { meal: 'Early Morning', items: ['Warm water with lemon and honey', 'Green tea after 30 min'] },
      { meal: 'Breakfast', items: ['Egg white omelette with vegetables', 'Oats or multigrain toast', 'Fresh fruit'] },
      { meal: 'Lunch', items: ['1 millet roti or small brown rice', 'Grilled chicken / paneer / fish', 'Large salad', 'Dal or lentil soup'] },
      { meal: 'Dinner', items: ['Clear vegetable or chicken soup', 'Grilled protein', 'Sautéed greens'] },
    ],
    additionalTips: ['500-700 calorie deficit for safe weight loss', 'Cardio 4-5x/week: walking, cycling, swimming', 'Strength training preserves muscle during loss', 'Do not skip meals — causes overeating later'],
  }
}

function analyzeTestosterone(a: Record<string, any>): AnalysisResult {
  return {
    summary: `Testosterone support — ${(a.symptoms || []).length} symptoms noted. Focus: hormone-boosting nutrition.`,
    foodsToEat: ['Zinc-rich: Pumpkin seeds, oysters, beef, chickpeas', 'Vitamin D: Fatty fish, egg yolks, mushrooms', 'Magnesium: Dark chocolate, spinach, almonds', 'Healthy fats: Avocado, olive oil, walnuts — cholesterol for T', 'Cruciferous vegetables: Broccoli, cauliflower (reduce estrogen)', 'Pomegranate — antioxidants linked to T levels', 'Ashwagandha — adaptogen supporting testosterone'],
    foodsToAvoid: ['Excessive alcohol — lowers testosterone', 'Processed and fast foods', 'High-sugar foods — spike insulin, lower T', 'Soy in excess (phytoestrogens)', 'Mint in large quantities'],
    hydrationTips: ['3+ litres water daily', 'Avoid sugary energy drinks', 'Green tea in moderation', 'Pomegranate juice — antioxidant-rich'],
    mealPlan: [
      { meal: 'Breakfast', items: ['3-4 whole eggs', 'Avocado on multigrain toast', 'Handful of pumpkin seeds'] },
      { meal: 'Lunch', items: ['Grilled beef, chicken or fatty fish', 'Brown rice or sweet potato', 'Broccoli or spinach sauté'] },
      { meal: 'Post-Workout', items: ['Protein shake or eggs', 'Banana for glycogen replenishment'] },
      { meal: 'Dinner', items: ['Salmon / tuna / lean meat', 'Steamed cruciferous vegetables', 'Olive oil drizzle'] },
    ],
    additionalTips: ['Strength training 4-5x/week raises T naturally', 'Sleep 7-9 hours — T peaks during deep sleep', 'Manage stress — cortisol suppresses testosterone', 'Consider Vitamin D3 + Zinc supplementation (doctor advice)'],
  }
}

function analyzeHeartHealth(a: Record<string, any>): AnalysisResult {
  return {
    summary: `Heart health plan — ${(a.risk_factors || []).filter((r: string) => r !== 'None').length} risk factors noted. Focus: cardiovascular nutrition.`,
    foodsToEat: ['Omega-3: Fatty fish (salmon, mackerel), walnuts, flaxseeds', 'Soluble fiber: Oats, barley, apples, beans', 'Potassium: Bananas, sweet potato, spinach, avocado', 'Antioxidants: Berries, dark chocolate (70%+), green tea', 'Garlic and onions — reduce cholesterol', 'Olive oil — heart-healthy monounsaturated fats', 'Leafy greens: Spinach, kale — reduce arterial stiffness'],
    foodsToAvoid: ['Trans fats in fried / packaged foods', 'Excess sodium — raises blood pressure', 'Refined carbs and sugars', 'Red processed meats: Sausages, hot dogs', 'Alcohol in excess', 'Full-fat dairy (limit, not eliminate)'],
    hydrationTips: ['8-10 glasses water daily', 'Green tea — antioxidant-rich', 'Hibiscus tea — natural blood pressure support', 'Avoid sugary beverages and excess coffee'],
    mealPlan: [
      { meal: 'Breakfast', items: ['Oats with walnuts and berries', 'Low-fat curd or glass of low-fat milk'] },
      { meal: 'Lunch', items: ['Grilled fish or chicken or lentils', 'Brown rice or multigrain roti', 'Large salad with olive oil', 'Steamed vegetables'] },
      { meal: 'Snack', items: ['Handful of mixed nuts (unsalted)', 'Fresh fruit'] },
      { meal: 'Dinner', items: ['Light dal or soup', 'Steamed/grilled vegetables', 'Small portion whole grain'] },
    ],
    additionalTips: ['150 min moderate aerobic exercise/week', 'Monitor blood pressure regularly', 'Quit smoking if applicable', 'Annual lipid panel and ECG recommended'],
  }
}

function analyzeStressMental(a: Record<string, any>): AnalysisResult {
  return {
    summary: 'Stress & mental wellness plan — focus: mood-supporting nutrition and lifestyle.',
    foodsToEat: ['Tryptophan (serotonin precursor): Turkey, eggs, bananas, cheese', 'Omega-3: Fatty fish, walnuts, flaxseeds — reduce cortisol', 'Magnesium: Dark chocolate, spinach, almonds — calming', 'Probiotic foods: Curd, kefir, idli — gut-brain axis', 'Complex carbs: Oats, whole grains — steady energy', 'Ashwagandha, brahmi — adaptogenic herbs', 'Green tea — L-theanine for calm focus'],
    foodsToAvoid: ['Excess caffeine — worsens anxiety', 'Alcohol — depressant despite short relief', 'Sugar spikes — crashes cause mood swings', 'Skipping meals — drops blood sugar', 'Ultra-processed comfort foods'],
    hydrationTips: ['8-10 glasses water daily', 'Chamomile tea — natural anxiolytic', 'Ashwagandha latte or golden milk', 'Avoid energy drinks (high caffeine)'],
    mealPlan: [
      { meal: 'Morning', items: ['Overnight oats with banana', 'Green tea or warm lemon water'] },
      { meal: 'Lunch', items: ['Salmon or eggs or dal', 'Brown rice or quinoa', 'Salad with fermented dressing'] },
      { meal: 'Evening Snack', items: ['Dark chocolate (1-2 squares)', 'Walnuts or almonds', 'Chamomile tea'] },
      { meal: 'Dinner', items: ['Warm soup or khichdi', 'Warm turmeric milk before bed'] },
    ],
    additionalTips: ['30 min outdoor walk daily — reduces cortisol', 'Meditation 10-15 min/day', 'Prioritise 7-9 hours quality sleep', 'Limit news/screen time in evenings'],
  }
}

function analyzeHairBeard(a: Record<string, any>): AnalysisResult {
  return {
    summary: 'Hair & beard nutrition plan — focus: essential nutrients for growth and strength.',
    foodsToEat: ['Biotin: Eggs, almonds, sweet potato, avocado', 'Zinc: Pumpkin seeds, beef, chickpeas, lentils', 'Iron: Spinach, rajma, meat, dates (prevents hair loss)', 'Protein: Keratin base — eggs, fish, chicken, paneer', 'Vitamin C: Amla, citrus (iron absorption + collagen)', 'Omega-3: Walnuts, salmon, flaxseeds — scalp health', 'Vitamin D: Fatty fish, egg yolks, sunlight exposure'],
    foodsToAvoid: ['Excess sugar — causes inflammation', 'High-glycemic carbs — triggers androgens', 'Alcohol — disrupts nutrient absorption', 'Excessive vitamin A supplements (can cause hair loss)', 'Junk food and trans fats'],
    hydrationTips: ['8-10 glasses water daily — hydrates scalp', 'Amla juice — Vitamin C for hair growth', 'Avoid dehydration — causes brittle hair'],
    mealPlan: [
      { meal: 'Breakfast', items: ['3-4 eggs (biotin)', 'Avocado toast', 'Fresh amla or orange juice'] },
      { meal: 'Lunch', items: ['Chicken/fish/paneer', 'Palak sabzi (iron)', 'Mixed vegetables', 'Dal'] },
      { meal: 'Snacks', items: ['Pumpkin seeds', 'Walnuts', 'Sweet potato'] },
      { meal: 'Dinner', items: ['Salmon or lean meat', 'Colourful vegetables', 'Small whole grain portion'] },
    ],
    additionalTips: ['Biotin 30-100 mcg/day (consult doctor)', 'Scalp massage with coconut oil weekly', 'Manage stress — key cause of hair loss', 'Check ferritin and Vitamin D levels'],
  }
}

function analyzeWellness(a: Record<string, any>): AnalysisResult {
  const concerns = (a.concerns || []).join(', ')
  return {
    summary: `Wellness plan — concerns: ${concerns || 'General wellbeing'}. Personalised guidance.`,
    foodsToEat: ['Whole foods: Vegetables, legumes, whole grains as foundation', 'Lean protein: Eggs, fish, chicken, tofu, paneer, dal', 'Healthy fats: Nuts, seeds, olive oil, avocado', 'Probiotic: Curd, kefir, idli — gut health', 'Antioxidants: Berries, amla, dark greens', 'Hydrating foods: Cucumber, watermelon, oranges'],
    foodsToAvoid: ['Ultra-processed and packaged foods', 'Excess sugar and refined carbs', 'Fried foods and trans fats', 'Alcohol and sugary drinks'],
    hydrationTips: ['8-10 glasses water daily', 'Herbal teas for relaxation', 'Coconut water for electrolytes', 'Infused water: Lemon, cucumber, mint'],
    mealPlan: [
      { meal: 'Morning', items: ['Warm water with lemon', 'Balanced breakfast: Oats, eggs, or idli with sambar'] },
      { meal: 'Lunch', items: ['Balanced plate: Protein + complex carb + vegetables', 'Curd or buttermilk'] },
      { meal: 'Evening', items: ['Nuts and seeds', 'Herbal tea or fresh fruit'] },
      { meal: 'Dinner', items: ['Light but nourishing: Soup or dal khichdi', 'Steamed vegetables'] },
    ],
    additionalTips: ['Aim for 7-8 hours quality sleep', '30 min movement daily', 'Mindful eating — no screens at meals', 'Connect with a nutritionist for deeper guidance'],
  }
}

// ─── Module configs per gender ────────────────────────────────────────────────
type ModuleKey = string

interface ModuleConfig {
  title: string
  icon: React.ReactNode
  description: string
  questions: Question[]
  analyzer: (a: Record<string, any>) => AnalysisResult
  color: string
  activeColor: string
}

function getModules(gender: Gender | undefined | null): Record<ModuleKey, ModuleConfig> {
  switch (gender) {
    case 'male':
      return {
        muscle_gain: { title: 'Muscle Gain Nutrition', icon: <Dumbbell className="w-6 h-6" />, description: 'Optimise protein intake and training nutrition for muscle building', questions: MUSCLE_QUESTIONS, analyzer: analyzeMuscleGain, color: 'bg-blue-50 border-blue-200 text-blue-600', activeColor: 'bg-blue-600 border-blue-600 text-white' },
        weight_loss: { title: 'Weight Loss Nutrition', icon: <Scale className="w-6 h-6" />, description: 'Sustainable calorie deficit with optimal nutrients for fat loss', questions: WEIGHT_LOSS_QUESTIONS, analyzer: analyzeWeightLoss, color: 'bg-cyan-50 border-cyan-200 text-cyan-600', activeColor: 'bg-cyan-600 border-cyan-600 text-white' },
        testosterone: { title: 'Testosterone Support', icon: <Zap className="w-6 h-6" />, description: 'Boost natural testosterone through evidence-based nutrition', questions: TESTOSTERONE_QUESTIONS, analyzer: analyzeTestosterone, color: 'bg-orange-50 border-orange-200 text-orange-600', activeColor: 'bg-orange-600 border-orange-600 text-white' },
        fitness: { title: "Men's Fitness & Gym", icon: <Activity className="w-6 h-6" />, description: 'Pre/post workout nutrition and gym meal planning strategies', questions: MUSCLE_QUESTIONS, analyzer: analyzeMuscleGain, color: 'bg-green-50 border-green-200 text-green-600', activeColor: 'bg-green-600 border-green-600 text-white' },
        heart_health: { title: 'Heart Health Guide', icon: <HeartPulse className="w-6 h-6" />, description: 'Cardiovascular nutrition to protect and strengthen heart health', questions: HEART_QUESTIONS, analyzer: analyzeHeartHealth, color: 'bg-red-50 border-red-200 text-red-600', activeColor: 'bg-red-600 border-red-600 text-white' },
        stress: { title: 'Stress & Mental Wellness', icon: <Brain className="w-6 h-6" />, description: 'Nutrition and habits to combat stress and support mental health', questions: WELLNESS_QUESTIONS, analyzer: analyzeStressMental, color: 'bg-teal-50 border-teal-200 text-teal-600', activeColor: 'bg-teal-600 border-teal-600 text-white' },
        hair_beard: { title: 'Hair & Beard Health', icon: <Sparkles className="w-6 h-6" />, description: 'Essential nutrients for strong hair growth and beard thickness', questions: MUSCLE_QUESTIONS, analyzer: analyzeHairBeard, color: 'bg-amber-50 border-amber-200 text-amber-600', activeColor: 'bg-amber-600 border-amber-600 text-white' },
      }
    case 'transgender':
      return {
        personalized: { title: 'Personalized Nutrition', icon: <Leaf className="w-6 h-6" />, description: 'Tailored nutritional guidance aligned with your personal health needs', questions: WELLNESS_QUESTIONS, analyzer: analyzeWellness, color: 'bg-teal-50 border-teal-200 text-teal-600', activeColor: 'bg-teal-600 border-teal-600 text-white' },
        weight_mgmt: { title: 'Healthy Weight Management', icon: <Scale className="w-6 h-6" />, description: 'Balanced approach to achieving and maintaining a healthy weight', questions: WEIGHT_LOSS_QUESTIONS, analyzer: analyzeWeightLoss, color: 'bg-green-50 border-green-200 text-green-600', activeColor: 'bg-green-600 border-green-600 text-white' },
        fitness: { title: 'Fitness & Exercise Plans', icon: <Activity className="w-6 h-6" />, description: 'Inclusive exercise and nutrition plans for your fitness goals', questions: MUSCLE_QUESTIONS, analyzer: analyzeMuscleGain, color: 'bg-blue-50 border-blue-200 text-blue-600', activeColor: 'bg-blue-600 border-blue-600 text-white' },
        mental: { title: 'Mental Wellness Support', icon: <Brain className="w-6 h-6" />, description: 'Nutrition strategies to support emotional and mental wellbeing', questions: WELLNESS_QUESTIONS, analyzer: analyzeStressMental, color: 'bg-purple-50 border-purple-200 text-purple-600', activeColor: 'bg-purple-600 border-purple-600 text-white' },
        self_care: { title: 'Self-Care Guidance', icon: <Heart className="w-6 h-6" />, description: 'Holistic self-care practices to nurture body and mind', questions: WELLNESS_QUESTIONS, analyzer: analyzeWellness, color: 'bg-pink-50 border-pink-200 text-pink-600', activeColor: 'bg-pink-600 border-pink-600 text-white' },
        general: { title: 'General Health Resources', icon: <Shield className="w-6 h-6" />, description: 'Foundational health, immunity, and preventive nutrition', questions: WELLNESS_QUESTIONS, analyzer: analyzeWellness, color: 'bg-amber-50 border-amber-200 text-amber-600', activeColor: 'bg-amber-600 border-amber-600 text-white' },
        ai_assistant: { title: 'Wellness AI Assistant', icon: <Sparkles className="w-6 h-6" />, description: 'Personalised AI-driven wellness recommendations for you', questions: WELLNESS_QUESTIONS, analyzer: analyzeWellness, color: 'bg-cyan-50 border-cyan-200 text-cyan-600', activeColor: 'bg-cyan-600 border-cyan-600 text-white' },
      }
    default:
      return {
        period: { title: 'Period Nutrition', icon: <Moon className="w-6 h-6" />, description: 'Personalised nutrition guidance for your menstrual cycle', questions: PERIOD_QUESTIONS, analyzer: analyzePeriod, color: 'bg-pink-50 border-pink-200 text-pink-600', activeColor: 'bg-pink-600 border-pink-600 text-white' },
        pregnancy: { title: 'Pregnancy Diet', icon: <Baby className="w-6 h-6" />, description: 'Essential nutrition guidance for each trimester', questions: PREGNANCY_QUESTIONS, analyzer: analyzePregnancy, color: 'bg-purple-50 border-purple-200 text-purple-600', activeColor: 'bg-purple-600 border-purple-600 text-white' },
        pcos: { title: 'PCOS Diet', icon: <Activity className="w-6 h-6" />, description: 'Manage PCOS through balanced nutrition and lifestyle', questions: PCOS_QUESTIONS, analyzer: analyzePCOS, color: 'bg-orange-50 border-orange-200 text-orange-600', activeColor: 'bg-orange-600 border-orange-600 text-white' },
        pcod: { title: 'PCOD Support', icon: <Heart className="w-6 h-6" />, description: 'Nutrition and lifestyle guidance for PCOD symptoms', questions: PCOS_QUESTIONS, analyzer: analyzePCOS, color: 'bg-teal-50 border-teal-200 text-teal-600', activeColor: 'bg-teal-600 border-teal-600 text-white' },
        anemia: { title: 'Anemia Support', icon: <Droplets className="w-6 h-6" />, description: 'Boost iron levels with targeted dietary recommendations', questions: ANEMIA_QUESTIONS, analyzer: analyzeAnemia, color: 'bg-red-50 border-red-200 text-red-600', activeColor: 'bg-red-600 border-red-600 text-white' },
        menopause: { title: 'Menopause Guide', icon: <TrendingUp className="w-6 h-6" />, description: 'Navigate menopause with nutrition for bone and heart health', questions: MENOPAUSE_QUESTIONS, analyzer: analyzeMenopause, color: 'bg-indigo-50 border-indigo-200 text-indigo-600', activeColor: 'bg-indigo-600 border-indigo-600 text-white' },
      }
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ModuleCard({ id, config, isActive, onSelect }: { id: string; config: ModuleConfig; isActive: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${isActive ? config.activeColor : config.color}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-white'}`}>
          {config.icon}
        </div>
        <span className="font-semibold">{config.title}</span>
      </div>
      <p className={`text-sm ${isActive ? 'text-white/90' : 'text-gray-600'}`}>{config.description}</p>
    </button>
  )
}

function QuestionForm({ questions, onComplete }: { questions: Question[]; onComplete: (a: Record<string, any>) => void }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const q = questions[current]
  const isLast = current === questions.length - 1

  function handleAnswer(value: any) {
    const next = { ...answers, [q.id]: value }
    setAnswers(next)
    if (isLast) setTimeout(() => onComplete(next), 300)
    else setTimeout(() => setCurrent(c => c + 1), 200)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Question {current + 1} of {questions.length}</span>
          <span>{Math.round(((current + 1) / questions.length) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{q.question}</h3>

      {q.type === 'select' && q.options && (
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${answers[q.id] === opt ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-green-300'}`}>
              <span className="text-gray-900 dark:text-white">{opt}</span>
            </button>
          ))}
        </div>
      )}

      {q.type === 'multiselect' && q.options && (
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const selected = (answers[q.id] || []).includes(opt)
            return (
              <button key={i}
                onClick={() => {
                  const cur = answers[q.id] || []
                  setAnswers({ ...answers, [q.id]: selected ? cur.filter((s: string) => s !== opt) : [...cur, opt] })
                }}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${selected ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-green-300'}`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selected ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                  {selected && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <span className="text-gray-900 dark:text-white">{opt}</span>
              </button>
            )
          })}
          <button onClick={() => handleAnswer(answers[q.id] || [])} disabled={!answers[q.id] || answers[q.id].length === 0}
            className="w-full mt-4 p-4 rounded-lg bg-green-600 text-white font-semibold disabled:opacity-50 hover:bg-green-700 transition">
            {isLast ? 'Get My Analysis' : 'Continue'}
          </button>
        </div>
      )}

      {q.type === 'number' && (
        <div className="space-y-4">
          <input type="number" value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
            className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 focus:outline-none text-lg dark:bg-gray-700 dark:text-white" placeholder="Enter value..." />
          <button onClick={() => handleAnswer(answers[q.id])} disabled={!answers[q.id]}
            className="w-full p-4 rounded-lg bg-green-600 text-white font-semibold disabled:opacity-50 hover:bg-green-700 transition">
            {isLast ? 'Get My Analysis' : 'Continue'}
          </button>
        </div>
      )}

      {current > 0 && (
        <button onClick={() => setCurrent(c => c - 1)} className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          Previous question
        </button>
      )}
    </div>
  )
}

function AnalysisDisplay({ result, onReset, moduleName }: { result: AnalysisResult; onReset: () => void; moduleName: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-8 h-8" />
          <h2 className="text-xl font-bold">Your Personalized {moduleName} Plan</h2>
        </div>
        <p className="text-green-100">{result.summary}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Foods to Eat</h3>
          </div>
          <ul className="space-y-2">
            {result.foodsToEat.map((food, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <Apple className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-sm">{food}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"><XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Foods to Avoid</h3>
          </div>
          <ul className="space-y-2">
            {result.foodsToAvoid.map((food, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                <span className="text-sm">{food}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg"><Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Hydration Recommendations</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {result.hydrationTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
              <Droplets className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />
              <span className="text-sm">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Utensils className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Sample Meal Plan</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {result.mealPlan.map((meal, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {meal.meal.toLowerCase().includes('morning') || meal.meal === 'Breakfast' ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : meal.meal.toLowerCase().includes('dinner') || meal.meal.toLowerCase().includes('bed') ? (
                  <Moon className="w-4 h-4 text-indigo-500" />
                ) : (
                  <Coffee className="w-4 h-4 text-orange-500" />
                )}
                <span className="font-medium text-gray-900 dark:text-white text-sm">{meal.meal}</span>
              </div>
              <ul className="space-y-1">
                {meal.items.map((item, j) => (
                  <li key={j} className="text-sm text-gray-600 dark:text-gray-400">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg"><Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Additional Tips</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {result.additionalTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
              <Target className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" />
              <span className="text-sm">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onReset}
        className="w-full py-3 px-6 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">
        Start New Assessment
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function HealthHub() {
  const { profile } = useAuth()
  const gender = (profile?.gender || 'female') as Gender
  const modules = getModules(gender)
  const hubConfig = getHubConfig(gender)

  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  function handleComplete(answers: Record<string, any>) {
    if (activeModule && modules[activeModule]) {
      setAnalysisResult(modules[activeModule].analyzer(answers))
    }
  }

  function reset() {
    setActiveModule(null)
    setAnalysisResult(null)
  }

  const genderLabel =
    gender === 'male' ? 'Men\'s'
    : gender === 'transgender' ? 'Transgender'
    : 'Women\'s'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to your {hubConfig.hubName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{hubConfig.tagline}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${hubConfig.accentBg} ${hubConfig.accentBorder} border`}>
          <User className={`w-4 h-4 ${hubConfig.accentText}`} />
          <span className={`text-sm font-medium ${hubConfig.accentText}`}>{genderLabel} Health</span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">Medical Disclaimer</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              This information is for educational purposes only and does not replace professional medical advice. Always consult your healthcare provider before making significant dietary or lifestyle changes.
            </p>
          </div>
        </div>
      </div>

      {!activeModule ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 ${hubConfig.iconBg} rounded-lg`}>
              <Heart className={`w-6 h-6 ${hubConfig.iconColor}`} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Choose Your Health Focus</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select a module to get started with your personalised assessment</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(modules).map(([key, config]) => (
              <ModuleCard key={key} id={key} config={config} isActive={activeModule === key} onSelect={setActiveModule} />
            ))}
          </div>
        </div>
      ) : analysisResult ? (
        <AnalysisDisplay result={analysisResult} onReset={reset} moduleName={activeModule && modules[activeModule] ? modules[activeModule].title : ''} />
      ) : (
        <div className="space-y-4">
          <button onClick={reset} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            ← Back to modules
          </button>
          {activeModule && modules[activeModule] && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${modules[activeModule].color}`}>
                  {modules[activeModule].icon}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{modules[activeModule].title} Assessment</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Answer a few questions for personalised recommendations</p>
                </div>
              </div>
              <QuestionForm questions={modules[activeModule].questions} onComplete={handleComplete} />
            </>
          )}
        </div>
      )}

      {/* Quick Guidelines */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Quick Guidelines</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">General Tips</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {['Maintain consistent meal timing for better metabolism', 'Prioritise whole, unprocessed foods', 'Stay hydrated throughout the day', 'Listen to your body and adjust portions based on hunger'].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">When to See a Doctor</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {['Severe or persistent symptoms despite dietary changes', 'Unexplained weight changes or fatigue', 'Dizziness, fainting, or severe weakness', 'Any health concern that worries you'].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
