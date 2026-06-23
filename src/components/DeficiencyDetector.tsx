import { useState } from 'react'
import { AlertTriangle, Search, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Leaf, XCircle } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

interface DeficiencyResult {
  nutrient: string
  confidence: number
  matchedSymptoms: string[]
  reasons: string[]
  foods: string[]
  severity: 'high' | 'medium' | 'low'
}

interface SymptomEntry {
  label: string
  keywords: string[]
}

interface NutrientDef {
  color: string
  bgLight: string
  bgDark: string
  borderLight: string
  borderDark: string
  emoji: string
  allSymptoms: SymptomEntry[]
  reasons: string[]
  foods: string[]
}

const NUTRIENTS: Record<string, NutrientDef> = {
  Iron: {
    color: 'text-red-600 dark:text-red-400',
    bgLight: 'bg-red-50',
    bgDark: 'dark:bg-red-900/20',
    borderLight: 'border-red-200',
    borderDark: 'dark:border-red-800',
    emoji: '🩸',
    allSymptoms: [
      { label: 'Fatigue / Tiredness', keywords: ['fatigue', 'tired', 'tiredness', 'exhausted', 'weak', 'weakness', 'no energy', 'low energy', 'always tired', 'very tired'] },
      { label: 'Pale skin', keywords: ['pale', 'pale skin', 'pallor', 'yellowish', 'white skin', 'light skin color'] },
      { label: 'Shortness of breath', keywords: ['shortness of breath', 'breathless', 'difficulty breathing', 'out of breath', 'breathing problem'] },
      { label: 'Dizziness / Lightheadedness', keywords: ['dizzy', 'dizziness', 'lightheaded', 'lightheadedness', 'spinning', 'vertigo'] },
      { label: 'Cold hands and feet', keywords: ['cold hands', 'cold feet', 'cold extremities', 'hands cold', 'feet cold', 'cold fingers', 'cold toes'] },
      { label: 'Brittle / Spoon-shaped nails', keywords: ['brittle nails', 'spoon nails', 'nails break', 'weak nails', 'nail problems', 'nails', 'breaking nails'] },
      { label: 'Hair loss', keywords: ['hair loss', 'hair fall', 'hairfall', 'losing hair', 'hair thinning', 'bald', 'hair breaking'] },
      { label: 'Headache', keywords: ['headache', 'head pain', 'head ache', 'migraine', 'head hurts'] },
      { label: 'Chest pain / palpitations', keywords: ['chest pain', 'palpitations', 'heart racing', 'heart beating fast', 'irregular heartbeat'] },
    ],
    reasons: [
      'Iron is essential for producing hemoglobin, the protein in red blood cells that carries oxygen.',
      'Low iron means less oxygen is transported to your muscles and organs, causing fatigue and weakness.',
      'Pale skin and dizziness occur because fewer red blood cells are produced (anemia).',
      'Cold extremities result from reduced circulation due to low red blood cell count.',
    ],
    foods: [
      'Spinach (keerai)', 'Beetroot', 'Dates (pericham pazham)', 'Jaggery (vellam)',
      'Lentils (paruppu)', 'Rajma (kidney beans)', 'Ragi (finger millet)',
      'Chicken liver', 'Red meat', 'Fish', 'Sesame seeds (black)',
      'Pomegranate', 'Dried figs', 'Pumpkin seeds',
    ],
  },
  'Vitamin D': {
    color: 'text-yellow-600 dark:text-yellow-400',
    bgLight: 'bg-yellow-50',
    bgDark: 'dark:bg-yellow-900/20',
    borderLight: 'border-yellow-200',
    borderDark: 'dark:border-yellow-800',
    emoji: '☀️',
    allSymptoms: [
      { label: 'Fatigue / Tiredness', keywords: ['fatigue', 'tired', 'exhausted', 'weak', 'no energy', 'low energy', 'always tired'] },
      { label: 'Bone pain / Aching bones', keywords: ['bone pain', 'aching bones', 'bones hurt', 'bone ache', 'back pain', 'joint pain', 'joint ache', 'achy joints'] },
      { label: 'Muscle weakness', keywords: ['muscle weakness', 'muscle weak', 'weak muscles', 'muscle pain', 'muscle ache', 'sore muscles', 'body pain', 'body ache'] },
      { label: 'Depression / Low mood', keywords: ['depression', 'depressed', 'low mood', 'sad', 'anxiety', 'mood swings', 'feeling low', 'unhappy', 'hopeless'] },
      { label: 'Frequent illness / infections', keywords: ['frequent illness', 'getting sick', 'infections', 'low immunity', 'weak immune', 'cold frequently', 'fever frequently'] },
      { label: 'Hair loss', keywords: ['hair loss', 'hair fall', 'hairfall', 'losing hair', 'hair thinning'] },
      { label: 'Slow wound healing', keywords: ['slow healing', 'wounds not healing', 'cuts healing slow', 'wound healing'] },
      { label: 'Sweating (head/neck)', keywords: ['excessive sweating', 'sweating head', 'night sweats', 'sweating neck', 'sweating a lot'] },
    ],
    reasons: [
      'Vitamin D regulates calcium absorption, keeping bones and teeth strong.',
      'It plays a crucial role in immune function — deficiency raises infection risk.',
      'Vitamin D receptors exist in brain tissue; low levels are linked to mood disorders.',
      'Most people in India get insufficient sun exposure due to darker skin pigmentation, indoor lifestyles, and pollution.',
    ],
    foods: [
      'Egg yolk', 'Fatty fish (salmon, sardines, mackerel)',
      'Fortified milk', 'Fortified cereals', 'Mushrooms (sun-exposed)',
      'Cod liver oil', 'Cheese',
      '⭐ 15–20 mins of morning sunlight daily is the best natural source',
    ],
  },
  'Vitamin B12': {
    color: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-900/20',
    borderLight: 'border-blue-200',
    borderDark: 'dark:border-blue-800',
    emoji: '🧠',
    allSymptoms: [
      { label: 'Extreme fatigue', keywords: ['fatigue', 'tired', 'exhausted', 'weak', 'no energy', 'low energy', 'very tired', 'always tired'] },
      { label: 'Tingling / Numbness', keywords: ['tingling', 'numbness', 'numb', 'pins and needles', 'tingling hands', 'tingling feet', 'numb hands', 'numb feet', 'burning sensation'] },
      { label: 'Memory problems / Brain fog', keywords: ['memory', 'forgetful', 'brain fog', 'concentration', 'confusion', 'can\'t focus', 'difficulty focusing', 'memory loss', 'forget things'] },
      { label: 'Mouth ulcers / Sore tongue', keywords: ['mouth ulcers', 'sore tongue', 'tongue sore', 'tongue pain', 'ulcers in mouth', 'glossitis', 'swollen tongue'] },
      { label: 'Pale / Yellowish skin', keywords: ['pale', 'pale skin', 'yellowish', 'yellow skin', 'jaundice', 'pallor'] },
      { label: 'Dizziness / Balance problems', keywords: ['dizzy', 'dizziness', 'balance problems', 'unsteady', 'falling', 'coordination problems'] },
      { label: 'Shortness of breath', keywords: ['shortness of breath', 'breathless', 'out of breath'] },
      { label: 'Mood changes / Irritability', keywords: ['mood', 'irritable', 'irritability', 'mood changes', 'depression', 'anxiety', 'mood swings'] },
    ],
    reasons: [
      'B12 is critical for nerve function; deficiency causes the characteristic tingling and numbness.',
      'It is required for DNA synthesis and red blood cell formation — low B12 leads to megaloblastic anemia.',
      'B12 is found almost exclusively in animal products; vegetarians and vegans are at high risk.',
      'Elderly individuals and those with digestive issues (IBS, Crohn\'s) often can\'t absorb B12 effectively.',
    ],
    foods: [
      'Eggs', 'Fish (salmon, tuna, sardines)', 'Chicken', 'Meat',
      'Milk', 'Curd / Yogurt', 'Paneer', 'Cheese',
      'Fortified plant-based milk', 'Nutritional yeast',
      '⚠️ Vegetarians / vegans should consider B12 supplements after consulting a doctor',
    ],
  },
  Calcium: {
    color: 'text-teal-600 dark:text-teal-400',
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-900/20',
    borderLight: 'border-teal-200',
    borderDark: 'dark:border-teal-800',
    emoji: '🦴',
    allSymptoms: [
      { label: 'Muscle cramps / Spasms', keywords: ['muscle cramps', 'cramps', 'spasms', 'muscle spasm', 'leg cramps', 'calf cramps', 'night cramps', 'muscle twitch'] },
      { label: 'Weak / Brittle nails', keywords: ['weak nails', 'brittle nails', 'nails break', 'nail problems', 'breaking nails'] },
      { label: 'Tooth problems / Decay', keywords: ['tooth problems', 'tooth decay', 'dental problems', 'weak teeth', 'teeth', 'toothache'] },
      { label: 'Numbness / Tingling', keywords: ['numbness', 'tingling', 'numb', 'pins and needles'] },
      { label: 'Bone fractures / Weakness', keywords: ['bone fracture', 'fracture', 'bones break', 'weak bones', 'osteoporosis', 'bone weakness'] },
      { label: 'Difficulty swallowing', keywords: ['difficulty swallowing', 'swallowing problem', 'throat spasm', 'laryngospasm'] },
      { label: 'Poor memory / Confusion', keywords: ['memory', 'confusion', 'forgetful', 'brain fog', 'concentration'] },
    ],
    reasons: [
      'Calcium is the most abundant mineral in the body; 99% is stored in bones and teeth.',
      'Deficiency causes bones to become weak and brittle (osteoporosis/osteopenia).',
      'Calcium is essential for muscle contraction — low levels cause cramps and spasms.',
      'Nerve signal transmission also depends on calcium, leading to tingling and numbness when deficient.',
    ],
    foods: [
      'Milk', 'Curd / Yogurt', 'Paneer', 'Cheese',
      'Ragi (finger millet) — one of the richest plant sources',
      'Sesame seeds (til/nalla ennai)', 'Almonds', 'Broccoli',
      'Tofu', 'Soy milk', 'Dried figs', 'Amaranth (thandukeerai)',
      'Small dried fish (nethili)', 'Sardines with bones',
    ],
  },
  Protein: {
    color: 'text-orange-600 dark:text-orange-400',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-900/20',
    borderLight: 'border-orange-200',
    borderDark: 'dark:border-orange-800',
    emoji: '💪',
    allSymptoms: [
      { label: 'Muscle weakness / Wasting', keywords: ['muscle weakness', 'muscle wasting', 'muscle loss', 'losing muscle', 'weak muscles', 'sarcopenia'] },
      { label: 'Fatigue / Low energy', keywords: ['fatigue', 'tired', 'weak', 'no energy', 'low energy', 'exhausted'] },
      { label: 'Hair thinning / Brittle hair', keywords: ['hair thinning', 'hair loss', 'hair fall', 'hairfall', 'brittle hair', 'hair breaking', 'hair damage'] },
      { label: 'Slow wound healing', keywords: ['slow healing', 'wounds not healing', 'cuts healing slow', 'wound'] },
      { label: 'Edema / Swelling (feet, ankles)', keywords: ['swelling', 'edema', 'swollen feet', 'swollen ankles', 'puffiness', 'puffy feet', 'bloating'] },
      { label: 'Frequent infections', keywords: ['frequent illness', 'infections', 'low immunity', 'sick often', 'getting sick', 'weak immune'] },
      { label: 'Brittle nails', keywords: ['brittle nails', 'weak nails', 'nails break', 'nail problems'] },
      { label: 'Poor growth (children)', keywords: ['poor growth', 'growth problem', 'stunted', 'not growing', 'underweight'] },
    ],
    reasons: [
      'Proteins are the building blocks of muscles, skin, hair, and all tissues in the body.',
      'They are required for hormone production, immune function, and enzyme activity.',
      'Low protein intake leads to muscle breakdown as the body uses muscle protein for energy.',
      'Wound healing slows down dramatically as collagen (a protein) cannot be synthesized.',
    ],
    foods: [
      'Eggs (6g protein each)', 'Chicken breast (31g per 100g)', 'Fish (20–25g per 100g)',
      'Lentils / Dal (9g per 100g cooked)', 'Chickpeas / Chana (15g per 100g)',
      'Rajma / Kidney beans (9g per 100g)', 'Paneer (18g per 100g)',
      'Milk (3g per 100ml)', 'Curd / Greek yogurt (10g per 100g)',
      'Soybean / Tofu (8–17g per 100g)', 'Peanuts (26g per 100g)',
      'Almonds (21g per 100g)', 'Moong dal sprouts',
    ],
  },
  Zinc: {
    color: 'text-violet-600 dark:text-violet-400',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-900/20',
    borderLight: 'border-violet-200',
    borderDark: 'dark:border-violet-800',
    emoji: '🔬',
    allSymptoms: [
      { label: 'Hair loss', keywords: ['hair loss', 'hair fall', 'hairfall', 'losing hair', 'hair thinning', 'bald'] },
      { label: 'Poor wound healing', keywords: ['slow healing', 'wounds not healing', 'cuts healing slow', 'wound', 'poor healing'] },
      { label: 'Loss of taste / smell', keywords: ['loss of taste', 'no taste', 'loss of smell', 'no smell', 'can\'t taste', 'can\'t smell', 'taste problem', 'smell problem', 'ageusia', 'anosmia'] },
      { label: 'Frequent colds / Low immunity', keywords: ['frequent cold', 'cold often', 'sick often', 'low immunity', 'weak immune', 'infections', 'frequent illness'] },
      { label: 'Diarrhea', keywords: ['diarrhea', 'loose stools', 'frequent stools', 'stomach problem'] },
      { label: 'Loss of appetite', keywords: ['loss of appetite', 'no appetite', 'not hungry', 'poor appetite', 'not eating'] },
      { label: 'Eye / vision problems', keywords: ['vision problems', 'eye problems', 'poor vision', 'night blindness'] },
      { label: 'Skin issues / Acne', keywords: ['skin problems', 'acne', 'pimples', 'rash', 'eczema', 'dry skin', 'skin rash'] },
    ],
    reasons: [
      'Zinc is involved in over 300 enzymatic reactions in the body.',
      'It is essential for immune cell production — deficiency severely weakens immunity.',
      'Zinc is required for taste and smell receptor function.',
      'It plays a key role in skin health, protein synthesis, and wound healing.',
    ],
    foods: [
      'Pumpkin seeds (pepita) — richest plant source',
      'Chickpeas / Chana', 'Lentils / Dal', 'Cashews', 'Hemp seeds',
      'Oats', 'Quinoa', 'Eggs', 'Chicken', 'Red meat', 'Crab / Shellfish',
      'Dairy (milk, cheese, curd)', 'Dark chocolate',
    ],
  },
  Magnesium: {
    color: 'text-green-600 dark:text-green-400',
    bgLight: 'bg-green-50',
    bgDark: 'dark:bg-green-900/20',
    borderLight: 'border-green-200',
    borderDark: 'dark:border-green-800',
    emoji: '⚡',
    allSymptoms: [
      { label: 'Muscle cramps / Spasms', keywords: ['muscle cramps', 'cramps', 'spasms', 'leg cramps', 'calf cramps', 'night cramps', 'muscle twitch', 'twitching'] },
      { label: 'Headaches / Migraines', keywords: ['headache', 'migraine', 'head pain', 'head ache', 'head hurts', 'frequent headache'] },
      { label: 'Fatigue / Low energy', keywords: ['fatigue', 'tired', 'weak', 'no energy', 'low energy', 'exhausted', 'always tired'] },
      { label: 'Anxiety / Irritability', keywords: ['anxiety', 'anxious', 'irritable', 'irritability', 'stress', 'nervous', 'restless', 'mood swings'] },
      { label: 'Poor sleep / Insomnia', keywords: ['poor sleep', 'insomnia', 'can\'t sleep', 'difficulty sleeping', 'sleep problems', 'waking up at night', 'sleeplessness'] },
      { label: 'Numbness / Tingling', keywords: ['numbness', 'tingling', 'numb', 'pins and needles'] },
      { label: 'Irregular heartbeat', keywords: ['irregular heartbeat', 'palpitations', 'heart fluttering', 'arrhythmia', 'heart racing'] },
      { label: 'Constipation', keywords: ['constipation', 'hard stools', 'not passing stools', 'bowel problems'] },
    ],
    reasons: [
      'Magnesium is involved in over 600 biochemical reactions, including energy production and protein synthesis.',
      'It regulates muscle and nerve function — deficiency directly causes cramps and spasms.',
      'Magnesium helps regulate sleep by activating the GABA receptors that calm the nervous system.',
      'It is required for maintaining stable heart rhythm and blood pressure.',
    ],
    foods: [
      'Almonds (one of the best sources)', 'Pumpkin seeds', 'Dark chocolate (70%+)',
      'Spinach / Leafy greens (keerai)', 'Banana', 'Avocado',
      'Black beans', 'Chickpeas', 'Lentils',
      'Brown rice', 'Whole wheat', 'Oats',
      'Cashews', 'Peanuts', 'Tofu',
    ],
  },
}

const SYMPTOM_SUGGESTIONS = [
  'Fatigue, pale skin, cold hands and feet',
  'Muscle cramps, poor sleep, headaches',
  'Hair loss, loss of taste, slow wound healing',
  'Tingling in hands, memory problems, mouth ulcers',
  'Bone pain, depression, frequent illness',
  'Muscle weakness, swelling, brittle nails',
]

function analyzeDeficiencies(input: string): DeficiencyResult[] {
  const lower = input.toLowerCase()
  const results: DeficiencyResult[] = []

  for (const [nutrient, def] of Object.entries(NUTRIENTS)) {
    let matchCount = 0
    const matchedSymptoms: string[] = []

    for (const symptom of def.allSymptoms) {
      const matched = symptom.keywords.some(kw => lower.includes(kw))
      if (matched) {
        matchCount++
        matchedSymptoms.push(symptom.label)
      }
    }

    if (matchCount === 0) continue

    const total = def.allSymptoms.length
    const rawConfidence = Math.round((matchCount / total) * 100)
    // Scale: 1 symptom = min 25%, full match = 95%
    const confidence = Math.min(95, Math.max(25, Math.round(25 + (rawConfidence * 0.7))))

    const severity: DeficiencyResult['severity'] =
      confidence >= 65 ? 'high' : confidence >= 40 ? 'medium' : 'low'

    results.push({
      nutrient,
      confidence,
      matchedSymptoms,
      reasons: def.reasons,
      foods: def.foods,
      severity,
    })
  }

  return results.sort((a, b) => b.confidence - a.confidence)
}

function ConfidenceBar({ value, severity }: { value: number; severity: DeficiencyResult['severity'] }) {
  const color =
    severity === 'high' ? 'bg-red-500' :
    severity === 'medium' ? 'bg-yellow-500' :
    'bg-green-500'

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`text-sm font-bold min-w-[42px] text-right ${
        severity === 'high' ? 'text-red-600 dark:text-red-400' :
        severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
        'text-green-600 dark:text-green-400'
      }`}>
        {value}%
      </span>
    </div>
  )
}

export default function DeficiencyDetector() {
  const { darkMode } = useTheme()
  const [symptoms, setSymptoms] = useState('')
  const [results, setResults] = useState<DeficiencyResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  function analyze() {
    if (!symptoms.trim()) return
    setLoading(true)
    setTimeout(() => {
      const found = analyzeDeficiencies(symptoms)
      setResults(found)
      if (found.length > 0) {
        setExpanded({ [found[0].nutrient]: true })
      }
      setLoading(false)
    }, 600)
  }

  function toggleExpand(nutrient: string) {
    setExpanded(prev => ({ ...prev, [nutrient]: !prev[nutrient] }))
  }

  function useSuggestion(s: string) {
    setSymptoms(s)
    setResults(null)
  }

  const severityLabel = {
    high: 'High Likelihood',
    medium: 'Moderate Likelihood',
    low: 'Low Likelihood',
  }

  const severityBadge = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deficiency Detector</h1>
        <p className="text-gray-600 dark:text-gray-400">Describe your symptoms to identify possible nutritional deficiencies</p>
      </div>

      {/* Medical Disclaimer */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${
        darkMode
          ? 'bg-amber-900/20 border-amber-700/50 text-amber-300'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="font-semibold">Medical Disclaimer: </span>
          This tool provides general educational information only and is NOT a substitute for professional medical advice,
          diagnosis, or treatment. Confidence scores are symptom-based estimates — not clinical diagnoses.
          Always consult a qualified doctor or registered dietitian for blood tests and personalized guidance.
        </div>
      </div>

      {/* Input */}
      <div className={`rounded-xl border p-6 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Describe your symptoms
        </label>
        <textarea
          value={symptoms}
          onChange={e => setSymptoms(e.target.value)}
          placeholder="e.g., fatigue, hair loss, muscle cramps, tingling in hands, poor sleep..."
          rows={4}
          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
          }`}
        />

        <div className="mt-3 mb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Try an example:</div>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => useSuggestion(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={analyze}
          disabled={loading || !symptoms.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
        >
          <Search className="w-5 h-5" />
          {loading ? 'Analyzing symptoms...' : 'Analyze Symptoms'}
        </button>
      </div>

      {/* Results */}
      {results !== null && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className={`flex items-center gap-3 p-5 rounded-xl border ${
              darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
            }`}>
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">No deficiencies flagged</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Your symptoms don't strongly suggest common nutritional deficiencies. If concerns persist, consult a doctor for blood tests.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Found <span className="font-semibold text-gray-900 dark:text-white">{results.length}</span> possible {results.length === 1 ? 'deficiency' : 'deficiencies'} based on your symptoms, ranked by likelihood:
              </div>

              {results.map(result => {
                const def = NUTRIENTS[result.nutrient]
                const isOpen = expanded[result.nutrient] ?? false

                return (
                  <div
                    key={result.nutrient}
                    className={`rounded-xl border overflow-hidden ${def.bgLight} ${def.bgDark} ${def.borderLight} ${def.borderDark}`}
                  >
                    {/* Header row */}
                    <button
                      className="w-full text-left p-4 flex items-center gap-3"
                      onClick={() => toggleExpand(result.nutrient)}
                    >
                      <span className="text-2xl">{def.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-base font-bold ${def.color}`}>{result.nutrient} Deficiency</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityBadge[result.severity]}`}>
                            {severityLabel[result.severity]}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <ConfidenceBar value={result.confidence} severity={result.severity} />
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Matched: {result.matchedSymptoms.join(', ')}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2 text-gray-400">
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className={`px-4 pb-4 space-y-4 border-t ${def.borderLight} ${def.borderDark}`}>
                        {/* Reasons */}
                        <div className="pt-4">
                          <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            Why these symptoms suggest {result.nutrient} deficiency
                          </div>
                          <ul className="space-y-1.5">
                            {result.reasons.map((r, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Matched symptoms */}
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            Your matching symptoms ({result.matchedSymptoms.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {result.matchedSymptoms.map(s => (
                              <span
                                key={s}
                                className={`text-xs px-2.5 py-1 rounded-full border ${def.borderLight} ${def.borderDark} ${def.color} font-medium`}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Recommended foods */}
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-green-600" />
                            Recommended foods to increase {result.nutrient}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {result.foods.map(food => (
                              <div
                                key={food}
                                className={`text-sm px-3 py-1.5 rounded-lg ${
                                  darkMode ? 'bg-gray-800/60' : 'bg-white/70'
                                } ${food.startsWith('⭐') || food.startsWith('⚠️') ? 'col-span-full font-medium' : ''}`}
                              >
                                {food}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Bottom disclaimer */}
              <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${
                darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}>
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                Confidence percentages indicate how closely your symptoms match known deficiency patterns — they are not clinical test results. A blood test is the only accurate way to confirm a nutritional deficiency.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
