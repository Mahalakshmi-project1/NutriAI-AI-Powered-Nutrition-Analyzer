import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  Heart, Droplets, Baby, Activity, Sparkles, ChevronRight, AlertTriangle,
  CheckCircle, XCircle, Apple, Coffee, Utensils, Moon, Sun, Info,
  Calendar, TrendingUp, Target, BookOpen, Dumbbell, Timer, Flame,
  Wind, PersonStanding
} from 'lucide-react'

type Module = 'period' | 'pregnancy' | 'pcos' | 'pcod' | 'anemia' | 'menopause'

interface Question {
  id: string
  question: string
  options?: string[]
  type: 'select' | 'multiselect' | 'number' | 'text'
}

interface YogaPose {
  name: string
  sanskrit?: string
  image: string
  instructions: string[]
  duration: string
  benefits: string[]
  precautions: string[]
}

interface ExerciseGuide {
  recommendedExercises: string[]
  beginnerRoutine: { name: string; duration: string; description: string }[]
  dailyActivity: string[]
  lifestyleTips: string[]
  stressManagement: string[]
  yogaPoses: YogaPose[]
}

interface AnalysisResult {
  summary: string
  foodsToEat: string[]
  foodsToAvoid: string[]
  hydrationTips: string[]
  mealPlan: { meal: string; items: string[] }[]
  additionalTips: string[]
  exerciseGuide: ExerciseGuide
}

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
  { id: 'supplements', question: 'Are you taking prenatal supplements?', options: ['Yes, regularly', 'Yes, occasionally', 'No', 'Not sure'], type: 'select' },
]

const PCOS_QUESTIONS: Question[] = [
  { id: 'symptoms', question: 'Which PCOS symptoms do you experience?', options: ['Irregular periods', 'Weight gain', 'Acne', 'Hair thinning', 'Excess hair growth', 'Insulin resistance', 'Fatigue', 'Mood changes'], type: 'multiselect' },
  { id: 'weight_goal', question: 'What is your weight management goal?', options: ['Lose weight', 'Maintain weight', 'Gain muscle', 'Not focused on weight'], type: 'select' },
  { id: 'diet_type', question: 'Current dietary pattern?', options: ['Standard Indian diet', 'Low carb', 'High protein', 'Mediterranean style', 'No specific diet'], type: 'select' },
  { id: 'activity', question: 'Exercise frequency?', options: ['None', '1-2 times/week', '3-4 times/week', '5+ times/week'], type: 'select' },
  { id: 'sleep', question: 'Average sleep quality?', options: ['Poor', 'Fair', 'Good', 'Excellent'], type: 'select' },
]

const PCOD_QUESTIONS: Question[] = [
  { id: 'symptoms', question: 'Which PCOD symptoms do you experience?', options: ['Irregular periods', 'Ovarian cysts', 'Weight gain', 'Acne', 'Hair thinning', 'Excess facial hair', 'Pelvic pain', 'Mood swings'], type: 'multiselect' },
  { id: 'diagnosed', question: 'Have you been diagnosed with PCOD?', options: ['Yes, confirmed diagnosis', 'Suspected but not confirmed', 'No, checking for symptoms', 'Not sure'], type: 'select' },
  { id: 'cycle_regular', question: 'How regular are your periods?', options: ['Regular (every 28-30 days)', 'Slightly irregular', 'Very irregular', 'Often missed'], type: 'select' },
  { id: 'lifestyle', question: 'Current lifestyle pattern?', options: ['Sedentary work, minimal exercise', 'Active job, some exercise', 'Regular workout routine', 'Athletic lifestyle'], type: 'select' },
  { id: 'stress_level', question: 'Current stress level?', options: ['High', 'Moderate', 'Low', 'Well managed'], type: 'select' },
]

const ANEMIA_QUESTIONS: Question[] = [
  { id: 'symptoms', question: 'Which symptoms do you experience?', options: ['Fatigue', 'Weakness', 'Pale skin', 'Shortness of breath', 'Dizziness', 'Cold hands/feet', 'Headaches', 'Brittle nails'], type: 'multiselect' },
  { id: 'diagnosed', question: 'Have you been diagnosed with anemia?', options: ['Yes, iron deficiency', 'Yes, other type', 'Suspected but not diagnosed', 'No'], type: 'select' },
  { id: 'hb_level', question: 'Last known hemoglobin level (g/dL)?', type: 'number' },
  { id: 'diet_type', question: 'Dietary preference?', options: ['Non-vegetarian', 'Vegetarian (includes dairy/eggs)', 'Vegan', 'Flexitarian'], type: 'select' },
  { id: 'supplements', question: 'Taking iron supplements?', options: ['Yes, as prescribed', 'Yes, over-the-counter', 'No', 'Not sure'], type: 'select' },
]

const MENOPAUSE_QUESTIONS: Question[] = [
  { id: 'stage', question: 'Current stage?', options: ['Perimenopause', 'Menopause', 'Post-menopause', 'Not sure'], type: 'select' },
  { id: 'symptoms', question: 'Which symptoms affect you most?', options: ['Hot flashes', 'Night sweats', 'Mood changes', 'Sleep issues', 'Weight gain', 'Joint pain', 'Brain fog', 'Vaginal dryness'], type: 'multiselect' },
  { id: 'bone_health', question: 'Any bone health concerns?', options: ['Osteoporosis diagnosed', 'Osteopenia', 'Family history', 'No known issues', 'Not tested'], type: 'select' },
  { id: 'activity', question: 'Physical activity level?', options: ['None', 'Light (walking)', 'Moderate (yoga, swimming)', 'Active (gym, sports)'], type: 'select' },
  { id: 'stress', question: 'Current stress level?', options: ['High', 'Moderate', 'Low', 'Well managed'], type: 'select' },
]

// Yoga Pose SVG Illustrations
function YogaPoseSVG({ pose, className = '' }: { pose: string; className?: string }) {
  const poses: Record<string, React.ReactNode> = {
    'childs-pose': (
      <svg viewBox="0 0 200 150" className={className}>
        <ellipse cx="100" cy="130" rx="60" ry="12" fill="#e8f5e9"/>
        <path d="M50 100 Q50 75 60 60 L80 45 Q100 30 120 45 L140 60 Q150 75 150 100 L150 125 C150 130 50 130 50 125 Z" fill="#81c784" stroke="#4caf50" strokeWidth="2"/>
        <circle cx="130" cy="50" r="15" fill="#a5d6a7" stroke="#4caf50" strokeWidth="2"/>
        <path d="M100 90 L80 95 L60 100" stroke="#4caf50" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    'butterfly': (
      <svg viewBox="0 0 200 150" className={className}>
        <ellipse cx="100" cy="130" rx="50" ry="10" fill="#e8f5e9"/>
        <path d="M100 70 L100 115" stroke="#4caf50" strokeWidth="4"/>
        <circle cx="100" cy="55" r="14" fill="#a5d6a7" stroke="#4caf50" strokeWidth="2"/>
        <path d="M100 90 Q130 95 150 85 Q160 75 145 85 Q130 95 100 90" fill="#81c784" stroke="#4caf50" strokeWidth="2"/>
        <path d="M100 90 Q70 95 50 85 Q40 75 55 85 Q70 95 100 90" fill="#81c784" stroke="#4caf50" strokeWidth="2"/>
        <path d="M100 100 L130 100 L145 95" stroke="#4caf50" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M100 100 L70 100 L55 95" stroke="#4caf50" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <circle cx="145" cy="85" r="5" fill="#c8e6c9"/>
        <circle cx="55" cy="85" r="5" fill="#c8e6c9"/>
      </svg>
    ),
    'supine-twist': (
      <svg viewBox="0 0 200 150" className={className}>
        <ellipse cx="100" cy="130" rx="60" ry="8" fill="#e8f5e9"/>
        <path d="M40 80 Q70 75 100 80 L160 80" stroke="#4caf50" strokeWidth="8" strokeLinecap="round"/>
        <circle cx="170" cy="50" r="12" fill="#a5d6a7" stroke="#4caf50" strokeWidth="2"/>
        <path d="M160 80 L170 60" stroke="#4caf50" strokeWidth="4"/>
        <path d="M100 80 L100 125" stroke="#4caf50" strokeWidth="6"/>
        <path d="M40 80 L40 120" stroke="#4caf50" strokeWidth="6"/>
        <path d="M100 100 L130 80 L145 70" stroke="#4caf50" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    'cat-cow': (
      <svg viewBox="0 0 200 150" className={className}>
        <ellipse cx="100" cy="135" rx="40" ry="8" fill="#e8f5e9"/>
        <path d="M50 70 Q70 60 90 70 L110 70 Q130 60 150 70" stroke="#4caf50" strokeWidth="4" fill="none"/>
        <path d="M70 80 Q80 75 90 80 L110 80 Q120 75 130 80" stroke="#4caf50" strokeWidth="8" strokeLinecap="round"/>
        <circle cx="145" cy="65" r="12" fill="#a5d6a7" stroke="#4caf50" strokeWidth="2"/>
        <path d="M70 80 L60 105" stroke="#4caf50" strokeWidth="4"/>
        <path d="M90 80 L90 115" stroke="#4caf50" strokeWidth="4"/>
        <path d="M110 80 L110 115" stroke="#4caf50" strokeWidth="4"/>
        <path d="M130 80 L140 105" stroke="#4caf50" strokeWidth="4"/>
        <path d="M145 90 L165 85" stroke="#4caf50" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    'side-stretch': (
      <svg viewBox="0 0 200 150" className={className}>
        <ellipse cx="140" cy="125" rx="30" ry="6" fill="#e8f5e9"/>
        <circle cx="60" cy="50" r="14" fill="#a5d6a7" stroke="#4caf50" strokeWidth="2"/>
        <path d="M60 64 L60 115" stroke="#4caf50" strokeWidth="6"/>
        <path d="M60 115 Q100 125 130 115" stroke="#4caf50" strokeWidth="4" fill="none"/>
        <circle cx="140" cy="110" r="10" fill="#a5d6a7" stroke="#4caf50" strokeWidth="2"/>
        <path d="M60 90 Q70 60 50 40" stroke="#4caf50" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M60 80 L90 60" stroke="#4caf50" strokeWidth="3" strokeLinecap="round"/>
        <path d="M60 90 L40 70" stroke="#4caf50" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    'cobra': (
      <svg viewBox="0 0 200 150" className={className}>
        <ellipse cx="100" cy="135" rx="50" ry="8" fill="#e8f5e9"/>
        <path d="M50 120 Q70 100 90 70 Q100 50 120 40" stroke="#4caf50" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <circle cx="130" cy="35" r="14" fill="#a5d6a7" stroke="#4caf50" strokeWidth="2"/>
        <path d="M90 90 L75 120" stroke="#4caf50" strokeWidth="4"/>
        <path d="M110 70 L125 100" stroke="#4caf50" strokeWidth="4"/>
        <path d="M140 45 L155 55" stroke="#4caf50" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M140 50 L150 65" stroke="#4caf50" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    'bridge': (
      <svg viewBox="0 0 200 150" className={className}>
        <ellipse cx="100" cy="135" rx="60" ry="8" fill="#e8f5e9"/>
        <path d="M30 120 Q50 80 100 60 Q150 80 170 120" stroke="#4caf50" strokeWidth="6" fill="#81c784"/>
        <path d="M30 120 L30 125" stroke="#4caf50" strokeWidth="5" strokeLinecap="round"/>
        <path d="M170 120 L170 125" stroke="#4caf50" strokeWidth="5" strokeLinecap="round"/>
        <circle cx="100" cy="55" r="12" fill="#a5d6a7" stroke="#4caf50" strokeWidth="2"/>
        <path d="M30 100 L15 80" stroke="#4caf50" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M170 100 L185 80" stroke="#4caf50" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    'surya-namaskar': (
      <svg viewBox="0 0 200 150" className={className}>
        <circle cx="170" cy="20" r="15" fill="#ffeb3b" stroke="#f9a825" strokeWidth="2"/>
        <g transform="translate(40, 60)">
          <circle cx="80" cy="10" r="12" fill="#a5d6a7" stroke="#4caf50" strokeWidth="2"/>
          <path d="M80 22 L80 50" stroke="#4caf50" strokeWidth="4"/>
          <path d="M80 30 L50 40" stroke="#4caf50" strokeWidth="3"/>
          <path d="M80 30 L110 40" stroke="#4caf50" strokeWidth="3"/>
          <path d="M80 50 L60 80" stroke="#4caf50" strokeWidth="4"/>
          <path d="M80 50 L100 80" stroke="#4caf50" strokeWidth="4"/>
        </g>
        <ellipse cx="100" cy="145" rx="60" ry="5" fill="#e8f5e9"/>
      </svg>
    ),
    'legs-up-wall': (
      <svg viewBox="0 0 200 150" className={className}>
        <path d="M180 10 L180 140" stroke="#90a4ae" strokeWidth="4" strokeDasharray="5,5"/>
        <ellipse cx="100" cy="135" rx="50" ry="8" fill="#e8f5e9"/>
        <path d="M80 70 Q100 60 100 135" stroke="#4caf50" strokeWidth="6" fill="#81c784"/>
        <circle cx="95" cy="55" r="14" fill="#a5d6a7" stroke="#4caf50" strokeWidth="2"/>
        <path d="M100 70 L100 10 L180 10" stroke="#4caf50" strokeWidth="4" fill="none"/>
        <circle cx="180" cy="10" r="5" fill="#4caf50"/>
        <path d="M100 85 L180 85" stroke="#4caf50" strokeWidth="3" strokeDasharray="10,5"/>
      </svg>
    ),
    'deep-breathing': (
      <svg viewBox="0 0 200 150" className={className}>
        <ellipse cx="100" cy="135" rx="40" ry="8" fill="#e8f5e9"/>
        <circle cx="100" cy="60" r="14" fill="#a5d6a7" stroke="#4caf50" strokeWidth="2"/>
        <path d="M100 74 L100 130" stroke="#4caf50" strokeWidth="6"/>
        <path d="M100 90 L70 100" stroke="#4caf50" strokeWidth="4"/>
        <path d="M100 90 L130 100" stroke="#4caf50" strokeWidth="4"/>
        <path d="M100 130 L80 135" stroke="#4caf50" strokeWidth="4"/>
        <path d="M100 130 L120 135" stroke="#4caf50" strokeWidth="4"/>
        <ellipse cx="100" cy="95" rx="25" ry="15" fill="none" stroke="#4caf50" strokeWidth="2" strokeDasharray="3,3"/>
        <text x="100" y="155" textAnchor="middle" fontSize="10" fill="#4caf50">Deep Breath</text>
      </svg>
    ),
    'walking': (
      <svg viewBox="0 0 200 150" className={className}>
        <ellipse cx="100" cy="135" rx="60" ry="8" fill="#e8f5e9"/>
        <circle cx="100" cy="50" r="14" fill="#a5d6a7" stroke="#4caf50" strokeWidth="2"/>
        <path d="M100 64 L100 95" stroke="#4caf50" strokeWidth="6"/>
        <path d="M100 75 L75 85" stroke="#4caf50" strokeWidth="4"/>
        <path d="M100 75 L125 85" stroke="#4caf50" strokeWidth="4"/>
        <path d="M100 95 L70 130" stroke="#4caf50" strokeWidth="4"/>
        <path d="M100 95 L130 130" stroke="#4caf50" strokeWidth="4"/>
        <path d="M70 130 L60 125" stroke="#4caf50" strokeWidth="3" fill="none"/>
        <path d="M60 125 L40 130" stroke="#4caf50" strokeWidth="2" fill="none"/>
        <path d="M130 130 L145 128" stroke="#4caf50" strokeWidth="3" fill="none"/>
      </svg>
    ),
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-2">
      {poses[pose] || poses['childs-pose']}
    </div>
  )
}

// Exercise Guides for each module
function getExerciseGuide(module: Module, answers: Record<string, any>): ExerciseGuide {
  const guides: Record<Module, ExerciseGuide> = {
    period: {
      recommendedExercises: [
        'Gentle walking - 20-30 minutes at comfortable pace',
        'Light stretching and mobility work',
        'Restorative yoga and deep breathing',
        'Swimming in warm water',
        'Low-impact cycling on flat terrain',
      ],
      beginnerRoutine: [
        { name: 'Gentle Walk', duration: '15-20 min', description: 'Comfortable pace outdoors or on treadmill' },
        { name: 'Hip Circles', duration: '2 min', description: 'Slow circles to relieve lower back tension' },
        { name: 'Knee-to-Chest Stretch', duration: '1 min each', description: 'Lying down, pull one knee toward chest' },
        { name: 'Deep Breathing', duration: '5 min', description: 'Diaphragmatic breathing for relaxation' },
      ],
      dailyActivity: [
        'Aim for 5,000-7,000 steps during heavy flow days',
        'Take breaks every hour to stretch',
        'Listen to your body - rest when needed',
        'Light activity can actually reduce cramps',
        'Avoid high-intensity workouts during menstruation',
      ],
      lifestyleTips: [
        'Use a heating pad while resting',
        'Take warm baths with Epsom salts',
        'Wear comfortable, loose clothing',
        'Keep healthy snacks accessible',
        'Prioritize sleep - aim for 8-9 hours',
      ],
      stressManagement: [
        'Practice guided meditation for 10-15 minutes',
        'Journal your feelings and symptoms',
        'Connect with supportive friends or family',
        'Use essential oils like lavender for calm',
        'Limit exposure to stressful news or work',
      ],
      yogaPoses: [
        { name: "Child's Pose", sanskrit: 'Balasana', image: 'childs-pose', instructions: ['Kneel on the mat with big toes touching', 'Sit back on your heels', 'Fold forward, extending arms in front', 'Rest forehead on the mat', 'Breathe deeply into your back'], duration: '1-3 minutes', benefits: ['Relieves back pain', 'Calms the nervous system', 'Gently stretches hips'], precautions: ['Avoid with knee injuries', 'Modify if pregnant'] },
        { name: 'Butterfly Pose', sanskrit: 'Baddha Konasana', image: 'butterfly', instructions: ['Sit with spine straight, legs extended', 'Bend knees and bring feet together', 'Hold feet with both hands', 'Gently flap knees up and down', 'Keep spine tall throughout'], duration: '1-5 minutes', benefits: ['Stimulates ovaries and uterus', 'Stretches inner thighs', 'Relieves menstrual discomfort'], precautions: ['Avoid with knee injuries', 'Support knees with blocks if needed'] },
        { name: 'Supine Twist', sanskrit: 'Supta Matsyendrasana', image: 'supine-twist', instructions: ['Lie on back with arms extended', 'Draw knees toward chest', 'Lower knees to one side', 'Turn head to opposite direction', 'Hold, then switch sides'], duration: '1-3 min each side', benefits: ['Releases lower back tension', 'Detoxifies internal organs', 'Improves digestion'], precautions: ['Avoid with disc herniation', 'Keep both shoulders on the ground'] },
      ],
    },
    pregnancy: {
      recommendedExercises: [
        'Prenatal yoga (with instructor)',
        'Swimming and water aerobics',
        'Walking on flat surfaces',
        'Stationary cycling with back support',
        'Gentle stretching routines',
        'Pelvic floor exercises (Kegels)',
      ],
      beginnerRoutine: [
        { name: 'Warm-up Walk', duration: '10 min', description: 'Gentle pace to warm up muscles' },
        { name: 'Cat-Cow Stretches', duration: '3 min', description: 'On hands and knees, alternate arching and rounding spine' },
        { name: 'Hip Circles', duration: '2 min', description: 'Standing hip circles to relieve tension' },
        { name: 'Side-Lying Stretch', duration: '1 min each side', description: 'Gently stretch the side body' },
      ],
      dailyActivity: [
        'Aim for 150 minutes of moderate activity per week',
        'Listen to your body - stop if uncomfortable',
        'Avoid exercises lying flat on back after 1st trimester',
        'Stay hydrated during exercise',
        'Wear supportive, comfortable footwear',
      ],
      lifestyleTips: [
        'Sleep on your left side with pillow support',
        'Wear comfortable, non-restrictive clothing',
        'Elevate feet when resting to reduce swelling',
        'Take prenatal vitamins as prescribed',
        'Attend regular prenatal check-ups',
      ],
      stressManagement: [
        'Practice prenatal meditation or breathing',
        'Join pregnancy support groups',
        'Communicate openly with partner',
        'Limit exposure to stressful situations',
        'Practice positive affirmations',
      ],
      yogaPoses: [
        { name: 'Cat-Cow Pose', sanskrit: 'Marjaryasana-Bitilasana', image: 'cat-cow', instructions: ['Start on hands and knees', 'Inhale: drop belly, lift head (Cow)', 'Exhale: round spine, tuck chin (Cat)', 'Move with your breath', 'Repeat 10-15 times'], duration: '2-3 minutes', benefits: ['Relieves back pain', 'Improves posture', 'Massages baby'], precautions: ['Avoid deep backbends', 'Keep movements gentle'] },
        { name: 'Butterfly Pose', sanskrit: 'Baddha Konasana', image: 'butterfly', instructions: ['Sit comfortably', 'Bring soles of feet together', 'Sit on a cushion if needed', 'Gently bounce knees', 'Keep spine tall'], duration: '2-5 minutes', benefits: ['Opens hips for birth', 'Relieves sciatica', 'Stretches inner thighs'], precautions: ['Avoid if pubic symphysis pain', 'Use props for support'] },
        { name: 'Side Stretch', sanskrit: 'Parsva Sthiti', image: 'side-stretch', instructions: ['Sit cross-legged or on chair', 'Raise one arm overhead', 'Gently lean to opposite side', 'Keep both sit bones grounded', 'Hold, then switch sides'], duration: '1 min each side', benefits: ['Stretches side body', 'Creates space for baby', 'Relieves rib discomfort'], precautions: ['Avoid overstretching', 'Keep neck relaxed'] },
      ],
    },
    pcos: {
      recommendedExercises: [
        'Strength training 2-3 times per week',
        'High-intensity interval training (HIIT)',
        'Brisk walking or jogging',
        'Swimming and water aerobics',
        'Yoga for hormone balance',
        'Cycling or spinning classes',
      ],
      beginnerRoutine: [
        { name: 'Warm-up', duration: '5 min', description: 'Light cardio to raise heart rate' },
        { name: 'Bodyweight Squats', duration: '3 sets x 12', description: 'Strengthens lower body and core' },
        { name: 'Modified Push-ups', duration: '3 sets x 10', description: 'Builds upper body strength' },
        { name: 'Plank Hold', duration: '3 sets x 30 sec', description: 'Core strengthening' },
      ],
      dailyActivity: [
        'Aim for 10,000 steps daily',
        'Include resistance training 3x/week',
        'Mix cardio with strength for best results',
        'Exercise in morning for better insulin sensitivity',
        'Try to be active throughout the day',
      ],
      lifestyleTips: [
        'Prioritize 7-9 hours of quality sleep',
        'Manage stress through relaxation techniques',
        'Consider tracking your cycle patterns',
        'Limit processed foods and refined sugars',
        'Build a consistent exercise routine',
      ],
      stressManagement: [
        'Practice yoga or meditation daily',
        'Consider therapy or counseling',
        'Use stress-tracking apps',
        'Establish a calming bedtime routine',
        'Connect with PCOS support communities',
      ],
      yogaPoses: [
        { name: 'Cobra Pose', sanskrit: 'Bhujangasana', image: 'cobra', instructions: ['Lie face down, legs extended', 'Place hands under shoulders', 'Press into hands, lift chest', 'Keep elbows close to body', 'Hold and breathe deeply'], duration: '30-60 seconds', benefits: ['Stimulates adrenal glands', 'Strengthens spine', 'Opens chest'], precautions: ['Avoid with back injuries', 'Keep movement gentle'] },
        { name: 'Bridge Pose', sanskrit: 'Setu Bandhasana', image: 'bridge', instructions: ['Lie on back, knees bent', 'Feet flat, hip-width apart', 'Press into feet, lift hips', 'Interlace hands beneath you', 'Hold and breathe'], duration: '30-60 seconds', benefits: ['Stimulates thyroid', 'Strengthens back and legs', 'Opens chest and heart'], precautions: ['Avoid with neck injuries', 'Support with block if needed'] },
        { name: 'Butterfly Pose', sanskrit: 'Baddha Konasana', image: 'butterfly', instructions: ['Sit with spine straight', 'Bring soles of feet together', 'Hold feet with hands', 'Gently flap knees', 'Keep breathing steadily'], duration: '2-5 minutes', benefits: ['Stimulates reproductive organs', 'Stretches inner thighs', 'Opens hips'], precautions: ['Support knees if needed', 'Avoid overstretching'] },
        { name: 'Cat-Cow Pose', sanskrit: 'Marjaryasana-Bitilasana', image: 'cat-cow', instructions: ['Start on hands and knees', 'Inhale: drop belly, lift head', 'Exhale: round spine, tuck chin', 'Flow with breath', 'Repeat 10-15 cycles'], duration: '2-3 minutes', benefits: ['Improves spine flexibility', 'Massages internal organs', 'Reduces stress'], precautions: ['Wrist pads if needed', 'Keep movements controlled'] },
      ],
    },
    pcod: {
      recommendedExercises: [
        'Surya Namaskar (Sun Salutation) - excellent for PCOD',
        'Cardio exercises for hormonal balance',
        'Strength training to improve insulin sensitivity',
        'Yoga poses targeting reproductive health',
        'Swimming and cycling',
        'Dance aerobics for mood enhancement',
      ],
      beginnerRoutine: [
        { name: 'Gentle Warm-up', duration: '5 min', description: 'Arm circles, shoulder rolls, light stretches' },
        { name: 'Modified Sun Salutation', duration: '5 rounds', description: 'Gentle version, move with breath' },
        { name: 'Standing Poses', duration: '10 min', description: 'Warrior poses, tree pose for strength' },
        { name: 'Cool Down', duration: '5 min', description: 'Deep breathing and relaxation' },
      ],
      dailyActivity: [
        'Practice Surya Namaskar in the morning',
        'Aim for 30-45 minutes daily exercise',
        'Include both cardio and strength training',
        'Take walks after meals to aid digestion',
        'Stay consistent with routine for best results',
      ],
      lifestyleTips: [
        'Maintain a regular sleep schedule',
        'Follow a balanced, low-glycemic diet',
        'Stay hydrated throughout the day',
        'Track your symptoms and cycle',
        'Avoid smoking and limit alcohol',
      ],
      stressManagement: [
        'Practice daily meditation or pranayama',
        'Join yoga classes for routine and community',
        'Keep a gratitude journal',
        'Spend time in nature weekly',
        'Build a strong support system',
      ],
      yogaPoses: [
        { name: 'Surya Namaskar', sanskrit: 'Sun Salutation', image: 'surya-namaskar', instructions: ['Stand at front of mat, hands in prayer', 'Inhale: raise arms overhead', 'Exhale: fold forward to hands', 'Inhale: half lift, flat back', 'Step or jump back to plank', 'Lower through chaturanga', 'Inhale: upward facing dog', 'Exhale: downward facing dog', 'Step forward, rise up'], duration: '5-12 rounds', benefits: ['Balances hormones', 'Improves circulation', 'Stimulates reproductive system', 'Full body workout'], precautions: ['Modify during menstruation', 'Avoid with back or wrist injuries', 'Practice on empty stomach'] },
        { name: 'Butterfly Pose', sanskrit: 'Baddha Konasana', image: 'butterfly', instructions: ['Sit with spine erect', 'Bend knees, bring feet together', 'Hold feet with both hands', 'Gently bounce knees', 'Breathe deeply and steadily'], duration: '3-5 minutes', benefits: ['Stimulates ovaries', 'Opens hip and groin', 'Improves circulation to pelvic area'], precautions: ['Use cushion for support', 'Avoid if knee pain persists'] },
        { name: 'Cobra Pose', sanskrit: 'Bhujangasana', image: 'cobra', instructions: ['Lie face down on mat', 'Place palms beside chest', 'Inhale, lift chest off floor', 'Keep elbows slightly bent', 'Gaze forward, hold and breathe'], duration: '30-60 seconds', benefits: ['Strengthens spine', 'Stimulates abdominal organs', 'Opens chest and lungs'], precautions: ['Avoid with back injury', 'Keep neck neutral'] },
        { name: 'Bridge Pose', sanskrit: 'Setu Bandhasana', image: 'bridge', instructions: ['Lie on back, knees bent', 'Feet hip-width apart', 'Exhale, press feet down and lift hips', 'Roll shoulders under body', 'Hold, breathing steadily'], duration: '30-60 seconds', benefits: ['Stimulates thyroid gland', 'Stretches chest and spine', 'Strengthens legs and back'], precautions: ['Support with block if needed', 'Avoid with neck injury'] },
        { name: "Child's Pose", sanskrit: 'Balasana', image: 'childs-pose', instructions: ['Kneel on mat, big toes touching', 'Sit back on heels', 'Fold forward, arms extended', 'Rest forehead on mat', 'Relax completely and breathe'], duration: '1-3 minutes', benefits: ['Restores balance', 'Calms the mind', 'Gently stretches back'], precautions: ['Knee injuries - use props', 'Third trimester - modify'] },
      ],
    },
    anemia: {
      recommendedExercises: [
        'Gentle walking in fresh air',
        'Light stretching and mobility',
        'Restorative yoga and deep breathing',
        'Low-intensity cardiovascular exercise',
        'Swimming at comfortable pace',
      ],
      beginnerRoutine: [
        { name: 'Gentle Walk', duration: '15-20 min', description: 'Outdoors in fresh air, comfortable pace' },
        { name: 'Seated Stretches', duration: '5 min', description: 'Neck rolls, shoulder stretches, side stretches' },
        { name: 'Deep Breathing', duration: '5 min', description: 'Sit comfortably, breathe deeply into belly' },
        { name: 'Relaxation', duration: '5 min', description: 'Lie down, focus on releasing tension' },
      ],
      dailyActivity: [
        'Start slowly and build up gradually',
        'Exercise when energy is highest (often mornings)',
        'Take frequent breaks as needed',
        'Combine exercise with iron-rich meal timing',
        'Avoid strenuous exercise during anemia episodes',
      ],
      lifestyleTips: [
        'Eat iron-rich foods with Vitamin C',
        'Cook in cast iron pans',
        'Avoid tea and coffee with meals',
        'Get adequate rest and sleep',
        'Have regular blood tests to monitor levels',
      ],
      stressManagement: [
        'Practice deep breathing exercises',
        'Gentle yoga for energy restoration',
        'Meditation for fatigue management',
        'Connect with nature outdoors',
        'Pace activities throughout the day',
      ],
      yogaPoses: [
        { name: 'Deep Breathing', sanskrit: 'Pranayama', image: 'deep-breathing', instructions: ['Sit comfortably with spine tall', 'Place one hand on belly', 'Inhale deeply through nose', 'Fill belly, then chest', 'Exhale slowly and completely'], duration: '5-10 minutes', benefits: ['Increases oxygen in blood', 'Calms nervous system', 'Improves energy'], precautions: ['Practice in fresh air', 'Start slowly, build up'] },
        { name: 'Gentle Walking', sanskrit: 'Walking Meditation', image: 'walking', instructions: ['Walk at comfortable pace', 'Focus on each step', 'Breathe naturally', 'Stay present and aware', 'Walk outdoors when possible'], duration: '15-30 minutes', benefits: ['Improves circulation', 'Gentle cardiovascular benefit', 'Fresh air and vitamin D'], precautions: ['Walk during cooler hours', 'Stay hydrated', 'Rest when tired'] },
        { name: "Child's Pose", sanskrit: 'Balasana', image: 'childs-pose', instructions: ['Kneel and sit back on heels', 'Fold forward, arms extended', 'Rest forehead on mat', 'Breathe deeply', 'Stay as long as comfortable'], duration: '1-5 minutes', benefits: ['Restorative for fatigue', 'Gentle stretch', 'Calms the body'], precautions: ['Use props for comfort', 'Avoid with knee issues'] },
      ],
    },
    menopause: {
      recommendedExercises: [
        'Weight-bearing exercises for bone health',
        'Walking and light jogging',
        'Yoga for flexibility and balance',
        'Strength training with light weights',
        'Swimming and water exercises',
        'Tai Chi for balance and calm',
      ],
      beginnerRoutine: [
        { name: 'Warm-up Walk', duration: '5 min', description: 'Gentle pace to prepare body' },
        { name: 'Bodyweight Exercises', duration: '10 min', description: 'Squats against wall, modified push-ups' },
        { name: 'Balance Practice', duration: '5 min', description: 'Stand on one foot, use support if needed' },
        { name: 'Gentle Yoga Flow', duration: '10 min', description: 'Cat-cow, child pose, gentle twists' },
      ],
      dailyActivity: [
        'Aim for 30 minutes of activity most days',
        'Include weight-bearing exercises 3x/week',
        'Practice balance exercises daily',
        'Stay active throughout the day',
        'Listen to your body and adjust intensity',
      ],
      lifestyleTips: [
        'Wear layers to manage hot flashes',
        'Keep bedroom cool for better sleep',
        'Stay hydrated throughout the day',
        'Maintain a regular sleep schedule',
        'Consider calcium and vitamin D supplements',
      ],
      stressManagement: [
        'Practice mindfulness meditation',
        'Use cooling breathing techniques',
        'Join support groups for menopause',
        'Express feelings through journaling',
        'Prioritize self-care activities',
      ],
      yogaPoses: [
        { name: 'Legs Up The Wall', sanskrit: 'Viparita Karani', image: 'legs-up-wall', instructions: ['Sit sideways next to wall', 'Swing legs up the wall as you lie back', 'Rest arms at sides', 'Close eyes and breathe', 'Stay for 5-15 minutes'], duration: '5-15 minutes', benefits: ['Reduces hot flashes', 'Relieves fatigue', 'Calms nervous system'], precautions: ['Avoid with high blood pressure', 'Use support under hips if needed'] },
        { name: 'Bridge Pose', sanskrit: 'Setu Bandhasana', image: 'bridge', instructions: ['Lie on back, knees bent', 'Feet flat, hip-width apart', 'Press into feet, lift hips', 'Interlace hands beneath you', 'Hold and breathe deeply'], duration: '30-60 seconds', benefits: ['Strengthens bones', 'Stimulates thyroid', 'Opens chest'], precautions: ['Use support if needed', 'Avoid with neck injury'] },
        { name: "Child's Pose", sanskrit: 'Balasana', image: 'childs-pose', instructions: ['Kneel with big toes touching', 'Sit back on heels', 'Fold forward, extend arms', 'Rest forehead on mat', 'Breathe and relax'], duration: '1-5 minutes', benefits: ['Calms the mind', 'Stretches lower back', 'Promotes relaxation'], precautions: ['Use props for comfort', 'Modify with wide knees'] },
      ],
    },
  }

  return guides[module]
}

function analyzePeriod(answers: Record<string, any>): AnalysisResult {
  const symptoms = answers.symptoms || []
  const cycleDay = answers.cycle_day || 1
  const flow = answers.flow || 'Moderate'

  const isMenstrualPhase = cycleDay <= 5
  const isFollicularPhase = cycleDay > 5 && cycleDay <= 14
  const isOvulatoryPhase = cycleDay > 14 && cycleDay <= 17
  const isLutealPhase = cycleDay > 17

  let phase = 'Menstrual'
  let phaseAdvice = ''
  if (isFollicularPhase) { phase = 'Follicular'; phaseAdvice = 'Energy is returning. Focus on iron-rich foods.' }
  else if (isOvulatoryPhase) { phase = 'Ovulatory'; phaseAdvice = 'Peak energy time. Optimize nutrient intake.' }
  else if (isLutealPhase) { phase = 'Luteal'; phaseAdvice = 'PMS symptoms common. Increase magnesium and B vitamins.' }
  else { phaseAdvice = 'Rest and nourish. Prioritize iron and hydration.' }

  const foodsToEat = [
    'Iron-rich: Palak (spinach), methi (fenugreek), beetroot',
    'Protein: Eggs, lentils, rajma, chickpeas',
    'Omega-3: Walnuts, flaxseeds, fatty fish',
    'Magnesium: Bananas, dark chocolate, pumpkin seeds',
    'Vitamin C: Amla, oranges, tomatoes (enhances iron absorption)',
    'Ginger tea - reduces inflammation and cramps',
    'Warm soups and broths for comfort',
  ]

  if (symptoms.includes('Cramps')) {
    foodsToEat.push('Turmeric milk (haldi doodh) - natural anti-inflammatory')
  }
  if (symptoms.includes('Fatigue')) {
    foodsToEat.push('Dates and jaggery for natural energy')
  }

  const foodsToAvoid = [
    'Excessive caffeine - can worsen cramps and anxiety',
    'Salty foods - increases bloating and water retention',
    'Refined sugars - causes energy crashes and mood swings',
    'Processed foods - increases inflammation',
    'Alcohol - can worsen symptoms and dehydration',
    'Fatty/fried foods - can increase discomfort',
  ]

  const hydrationTips = [
    'Drink 8-10 glasses of warm water daily',
    'Herbal teas: chamomile, peppermint, ginger',
    'Coconut water for electrolytes',
    'Warm water with lemon - aids digestion and reduces bloating',
    'Avoid cold drinks during heavy flow days',
    'Buttermilk (chaas) with jeera - aids digestion',
  ]

  const mealPlan = [
    { meal: 'Early Morning', items: ['Warm water with lemon and honey', '5-6 soaked almonds'] },
    { meal: 'Breakfast', items: ['Ragi dosa or moong dal cheela', 'Fresh papaya or apple', 'Glass of milk'] },
    { meal: 'Mid-Morning', items: ['Handful of pumpkin seeds', 'Banana or dates'] },
    { meal: 'Lunch', items: ['Rice or roti', 'Palak paneer or methi dal', 'Beetroot salad', 'Curd rice'] },
    { meal: 'Evening', items: ['Herbal tea', 'Roasted makhana (fox nuts)'] },
    { meal: 'Dinner', items: ['Light khichdi with vegetables', 'Warm turmeric milk before bed'] },
  ]

  const additionalTips = [
    `Current Phase: ${phase}. ${phaseAdvice}`,
    'Light yoga or stretching can help with cramps',
    'Apply heat (hot water bottle) to relieve cramps',
    'Get 7-9 hours of quality sleep',
    'Track your cycle to anticipate needs',
    'Consider calcium supplements if needed',
  ]

  return {
    summary: `${phase} Phase (Day ${cycleDay}) - ${flow} flow. Focusing on iron replenishment and comfort.`,
    foodsToEat,
    foodsToAvoid,
    hydrationTips,
    mealPlan,
    additionalTips,
    exerciseGuide: getExerciseGuide('period', answers)
  }
}

function analyzePregnancy(answers: Record<string, any>): AnalysisResult {
  const trimester = answers.trimester || 'First (1-12 weeks)'
  const symptoms = answers.symptoms || []
  const activityLevel = answers.activity_level || 'Moderately active'

  const trimesterNum = trimester.includes('First') ? 1 : trimester.includes('Second') ? 2 : 3

  const foodsToEat = [
    trimesterNum === 1 ? 'Folic acid rich: Spinach, lentils, fortified cereals' : 'Iron-rich: Lean meats, beans, leafy greens',
    'Calcium: Milk, curd, paneer, sesame seeds',
    'Protein: Eggs, dal, chicken, fish (low mercury)',
    'DHA sources: Walnuts, flaxseeds, ghee in moderation',
    'Vitamin C: Amla, oranges, tomatoes',
    'Fiber: Whole grains, vegetables, fruits (prevents constipation)',
    'Healthy fats: Avocado, nuts, seeds',
  ]

  if (symptoms.includes('Morning sickness')) {
    foodsToEat.push('Ginger tea or candies - helps with nausea')
    foodsToEat.push('Small, frequent meals - crackers, toast')
  }
  if (symptoms.includes('Heartburn')) {
    foodsToEat.push('Alkaline foods: Bananas, melons, oatmeal')
  }

  const foodsToAvoid = [
    'High-mercury fish (shark, swordfish, king mackerel)',
    'Raw or undercooked meat and eggs',
    'Unpasteurized dairy products',
    'Excessive caffeine (limit to 200mg/day)',
    'Processed meats (raw salami, hot dogs)',
    'High-sugar foods and refined carbs',
    'Raw sprouts (bacterial risk)',
    'Alcohol and smoking - strictly avoid',
    'Papaya (unripe) and pineapple - avoid in first trimester',
  ]

  const hydrationTips = [
    'Drink 10-12 glasses of water daily',
    trimesterNum === 3 ? 'Increase to 12-14 glasses in third trimester' : '',
    'Coconut water for natural electrolytes',
    'Fresh fruit juices (diluted)',
    'Warm milk with saffron (especially in third trimester)',
    'Avoid excessive tea/coffee',
    'Buttermilk with mint and cumin - refreshing',
  ].filter(Boolean)

  const calorieTarget = trimesterNum === 1 ? '1800-2000' : trimesterNum === 2 ? '2200-2400' : '2400-2800'

  const mealPlan = [
    { meal: 'Early Morning', items: ['2-3 soaked almonds', '1 date', 'Glass of water'] },
    { meal: 'Breakfast', items: ['Ragi porridge or oats', 'Hard-boiled egg or paneer', 'Seasonal fruit'] },
    { meal: 'Mid-Morning', items: ['Greek yogurt or fruit smoothie', 'Handful of walnuts'] },
    { meal: 'Lunch', items: ['Rice or 2 rotis', 'Dal or lean meat curry', 'Green vegetables', 'Curd or buttermilk'] },
    { meal: 'Evening', items: ['Roasted chana or makhana', 'Herbal tea or fresh juice'] },
    { meal: 'Dinner', items: ['Light dinner: Khichdi or soup', 'Sauteed vegetables', 'Warm milk with turmeric'] },
    { meal: 'Bedtime', items: ['Warm milk with dates', 'Small handful of raisins'] },
  ]

  const additionalTips = [
    `Trimester ${trimesterNum}: Target ${calorieTarget} calories/day`,
    'Take prenatal vitamins as prescribed',
    symptoms.includes('Morning sickness') ? 'Eat small, frequent meals every 2-3 hours' : '',
    'Stay active with walking, pregnancy yoga, swimming',
    trimesterNum === 2 ? 'Sleep on your left side with pillow support' : '',
    'Regular prenatal check-ups are essential',
    'Monitor weight gain as per doctor recommendations',
  ].filter(Boolean)

  return {
    summary: `${trimester}. Activity: ${activityLevel}. Focus on balanced nutrition for healthy baby development.`,
    foodsToEat,
    foodsToAvoid,
    hydrationTips,
    mealPlan,
    additionalTips,
    exerciseGuide: getExerciseGuide('pregnancy', answers)
  }
}

function analyzePCOS(answers: Record<string, any>): AnalysisResult {
  const symptoms = answers.symptoms || []
  const weightGoal = answers.weight_goal || 'Maintain weight'
  const activity = answers.activity || '1-2 times/week'

  const foodsToEat = [
    'Low glycemic: Whole grains (quinoa, oats, millets)',
    'Lean protein: Chicken, fish, eggs, tofu, lentils',
    'Fiber-rich: Green vegetables, beans, berries',
    'Anti-inflammatory: Turmeric, ginger, fatty fish',
    'Healthy fats: Olive oil, avocados, nuts',
    'Leafy greens: Spinach, kale, methi (for iron)',
    'Cinnamon - helps with insulin sensitivity',
    'Berries - antioxidants without spiking blood sugar',
  ]

  if (weightGoal === 'Lose weight') {
    foodsToEat.push('Focus on protein at every meal')
  }

  const foodsToAvoid = [
    'Refined carbs: White rice, maida, white bread',
    'Sugary foods: Sweets, pastries, soft drinks',
    'Processed foods and fast food',
    'Excessive dairy (can increase androgens in some)',
    'Soy products - consume in moderation',
    'Trans fats: Fried foods, processed snacks',
    'High glycemic fruits on empty stomach',
    'Alcohol - affects hormone balance',
  ]

  const hydrationTips = [
    'Drink 8-10 glasses of water daily',
    'Green tea - may help with insulin resistance',
    'Spearmint tea - may reduce androgen levels',
    'Warm lemon water - metabolism booster',
    'Avoid sugary drinks and fruit juices',
    'Vegetable soups - hydrating and filling',
    'Detox water: cucumber, mint, lemon',
  ]

  const mealPlan = [
    { meal: 'Early Morning', items: ['Warm water with lemon', '5-6 soaked almonds'] },
    { meal: 'Breakfast', items: ['Oats or millet upma with vegetables', 'Egg bhurji or paneer', 'Green tea'] },
    { meal: 'Mid-Morning', items: ['Handful of pumpkin seeds', 'Apple or berries'] },
    { meal: 'Lunch', items: ['1-2 millet rotis or brown rice', 'Grilled fish or dal', 'Large salad with olive oil', 'Steamed vegetables'] },
    { meal: 'Evening', items: ['Roasted chana or makhana', 'Spearmint tea'] },
    { meal: 'Dinner', items: ['Grilled chicken/fish or paneer tikka', 'Sauteed vegetables', 'Light soup'] },
  ]

  const additionalTips = [
    `Weight Goal: ${weightGoal}. Aim for balanced blood sugar.`,
    'Exercise: 150+ minutes of moderate activity weekly',
    'Include strength training 2-3 times/week',
    'Sleep 7-8 hours - crucial for hormone balance',
    'Manage stress through yoga, meditation',
    'Regular meals - avoid long gaps between meals',
    'Consider inositol supplements (consult doctor)',
    'Track your cycle and symptoms',
  ]

  return {
    summary: `PCOS management plan. Symptoms: ${symptoms.length}. Focus: Insulin sensitivity and hormonal balance.`,
    foodsToEat,
    foodsToAvoid,
    hydrationTips,
    mealPlan,
    additionalTips,
    exerciseGuide: getExerciseGuide('pcos', answers)
  }
}

function analyzePCOD(answers: Record<string, any>): AnalysisResult {
  const symptoms = answers.symptoms || []
  const diagnosed = answers.diagnosed || 'Not sure'
  const cycleRegular = answers.cycle_regular || 'Slightly irregular'
  const lifestyle = answers.lifestyle || 'Sedentary work, minimal exercise'
  const stressLevel = answers.stress_level || 'Moderate'

  const foodsToEat = [
    'Low glycemic index foods: Millets, quinoa, brown rice',
    'Anti-inflammatory foods: Turmeric, ginger, berries',
    'High fiber vegetables: Broccoli, spinach, kale',
    'Lean proteins: Fish, eggs, legumes, paneer',
    'Healthy fats: Avocado, olive oil, nuts, seeds',
    'Foods rich in omega-3: Walnuts, flaxseeds, chia seeds',
    'Antioxidant-rich: Green tea, colorful vegetables',
    'Iron-rich foods: Leafy greens, lentils, tofu',
  ]

  if (symptoms.includes('Weight gain')) {
    foodsToEat.push('Protein-rich breakfast to jumpstart metabolism')
    foodsToEat.push('Smaller, more frequent meals throughout day')
  }

  if (symptoms.includes('Acne')) {
    foodsToEat.push('Zinc-rich: Pumpkin seeds, chickpeas')
    foodsToEat.push('Vitamin A: Carrots, sweet potatoes')
  }

  const foodsToAvoid = [
    'Refined carbohydrates: White bread, white rice, maida',
    'Sugary foods and beverages',
    'Fried and processed foods',
    'Excessive dairy (especially for acne)',
    'High sodium processed foods',
    'Alcohol and excessive caffeine',
    'Foods with artificial hormones or additives',
    'Trans fats and hydrogenated oils',
  ]

  const hydrationTips = [
    'Drink 8-10 glasses of water daily',
    'Start the day with warm lemon water',
    'Herbal teas: Spearmint, green tea, chamomile',
    'Fresh vegetable juices for nutrients',
    'Coconut water for natural electrolytes',
    'Avoid sugary drinks and packaged juices',
    'Warm water throughout the day aids digestion',
  ]

  const mealPlan = [
    { meal: 'Early Morning', items: ['Warm water with lemon and honey', '5 soaked almonds', '1 tablespoon flaxseeds'] },
    { meal: 'Breakfast', items: ['Vegetable daliya or oats', 'Egg white bhurji', 'Seasonal fruit (berries/apple)'] },
    { meal: 'Mid-Morning', items: ['Green tea', 'Handful of mixed nuts'] },
    { meal: 'Lunch', items: ['Multi-grain roti or brown rice', 'Grilled fish/paneer', 'Large salad', 'Steamed vegetables'] },
    { meal: 'Evening', items: ['Sprouts salad', 'Herbal tea'] },
    { meal: 'Dinner', items: ['Light meal: Vegetable soup', 'Grilled protein', 'Sautéed greens'] },
  ]

  const additionalTips = [
    `${diagnosed.includes('Yes') ? 'Following medical guidance is key' : 'Consider consulting a gynecologist'}`,
    'Focus on whole, unprocessed foods',
    `Cycle status: ${cycleRegular}. Regular exercise helps regulate cycles.`,
    'Morning sunlight exposure for vitamin D',
    'Quality sleep: 7-9 hours nightly',
    `Current stress: ${stressLevel}. Incorporate daily relaxation.`,
    'Consider seed cycling for hormone balance',
    'Regular health check-ups and ultrasounds as advised',
  ]

  return {
    summary: `PCOD support plan. ${symptoms.length} symptoms being managed. Focus on hormonal balance through lifestyle.`,
    foodsToEat,
    foodsToAvoid,
    hydrationTips,
    mealPlan,
    additionalTips,
    exerciseGuide: getExerciseGuide('pcod', answers)
  }
}

function analyzeAnemia(answers: Record<string, any>): AnalysisResult {
  const symptoms = answers.symptoms || []
  const diagnosed = answers.diagnosed || 'No'
  const hbLevel = parseFloat(answers.hb_level) || 0
  const dietType = answers.diet_type || 'Vegetarian (includes dairy/eggs)'
  const supplements = answers.supplements || 'No'

  const severity = hbLevel >= 12 ? 'Normal' : hbLevel >= 10 ? 'Mild' : hbLevel >= 8 ? 'Moderate' : 'Severe'

  const isVegetarian = dietType.includes('Vegetarian') || dietType === 'Vegan'
  const isVegan = dietType === 'Vegan'

  const foodsToEat = [
    isVegetarian ? 'Plant iron (non-heme): Spinach, lentils, tofu, sesame seeds' : 'Red meat (mutton, beef) - richest source of heme iron',
    'Liver (if non-vegetarian) - highest iron content',
    'Leafy greens: Palak, methi, bathua',
    'Legumes: Rajma, chana, moong dal',
    !isVegan ? 'Vitamin C pairings: Add lemon to dal, amla juice' : 'Vitamin C rich foods - essential for iron absorption',
    'Fortified cereals and grains',
    'Dates and jaggery (gur) - traditional iron sources',
    'Pomegranate and beetroot - increase hemoglobin',
    'Seeds: Pumpkin, sunflower, flax',
  ]

  if (isVegetarian) {
    foodsToEat.push('Include vitamin C with every iron-rich meal')
  }

  const foodsToAvoid = [
    'Tea/coffee with meals - tannins block iron absorption',
    'Calcium supplements within 2 hours of iron-rich meals',
    'Phytates: Unsoaked legumes, raw grains',
    'Excessive fiber with iron-rich meals',
    'Processed foods with low nutritional value',
    'Excessive dairy with iron-rich meals',
  ]

  const hydrationTips = [
    'Drink 8-10 glasses of water daily',
    'Fresh amla juice or orange juice with meals',
    'Avoid tea/coffee 1 hour before and after meals',
    'Fresh vegetable juices - beetroot, carrot, spinach',
    'Buttermilk - but not with iron-rich meals',
    'Warm water with lemon - enhances absorption',
  ]

  const mealPlan = [
    { meal: 'Early Morning', items: ['Warm water with honey and lemon', '5-6 soaked almonds or pumpkin seeds'] },
    { meal: 'Breakfast', items: [isVegetarian ? 'Ragi dosa or poha with peanuts' : 'Eggs bhurji or omelette', 'Glass of orange juice or amla juice', 'Pomegranate seeds'] },
    { meal: 'Mid-Morning', items: ['Handful of dates', 'Roasted chana'] },
    { meal: 'Lunch', items: ['Rice or roti', 'Palak dal or methi sabzi', isVegetarian ? 'Paneer or tofu curry' : 'Mutton or chicken curry', 'Beetroot and carrot salad with lemon'] },
    { meal: 'Evening', items: ['Sprouts salad with lemon', 'Herbal tea (avoid regular tea)'] },
    { meal: 'Dinner', items: ['Light dinner: Dal khichdi', 'Sauteed leafy greens', 'Jaggery (gur) for dessert'] },
  ]

  const additionalTips = [
    diagnosed.includes('Yes') ? "Follow doctor's treatment plan strictly" : 'Consider getting a blood test to confirm',
    hbLevel > 0 ? `Hemoglobin: ${hbLevel} g/dL (${severity} anemia)` : 'Get your hemoglobin level tested',
    supplements.includes('Yes') ? 'Take supplements with vitamin C for better absorption' : 'Ask your doctor about iron supplements',
    isVegetarian ? 'Vegetarian iron needs 1.8x more attention to absorption' : 'Include both heme and non-heme iron sources',
    'Avoid calcium-rich foods with iron meals',
    'Cook in cast iron pans for extra iron',
    'Regular blood tests every 3 months',
    'Report worsening symptoms to your doctor immediately',
  ]

  return {
    summary: `Anemia support: ${severity} level. Diet: ${dietType}. Focus on iron-rich foods with optimal absorption.`,
    foodsToEat,
    foodsToAvoid,
    hydrationTips,
    mealPlan,
    additionalTips,
    exerciseGuide: getExerciseGuide('anemia', answers)
  }
}

function analyzeMenopause(answers: Record<string, any>): AnalysisResult {
  const stage = answers.stage || 'Menopause'
  const symptoms = answers.symptoms || []
  const boneHealth = answers.bone_health || 'No known issues'
  const activity = answers.activity || 'Light (walking)'
  const stress = answers.stress || 'Moderate'

  const foodsToEat = [
    'Calcium-rich: Milk, curd, paneer, ragi, sesame seeds',
    'Vitamin D: Fatty fish, egg yolks, fortified foods',
    'Phytoestrogens: Soybeans, flaxseeds, tofu',
    'Bone support: Leafy greens, almonds, figs',
    'Heart-healthy: Omega-3 from fish, walnuts, olive oil',
    'Fiber: Whole grains, vegetables, fruits (manage weight)',
    'Protein: Eggs, lean meats, legumes (preserve muscle)',
    'Magnesium: Dark chocolate, bananas, nuts (for sleep)',
  ]

  if (symptoms.includes('Hot flashes')) {
    foodsToEat.push('Cooling foods: Cucumber, watermelon, mint')
    foodsToEat.push('Flaxseeds daily - may reduce hot flashes')
  }

  const foodsToAvoid = [
    'Excessive caffeine - triggers hot flashes',
    'Spicy foods - can worsen hot flashes',
    'Alcohol - increases hot flashes and bone loss',
    'High sodium foods - affects bone health',
    'Processed sugars - weight gain and inflammation',
    'Refined carbs - rapid blood sugar fluctuations',
    'Saturated and trans fats - heart health risk',
  ]

  const hydrationTips = [
    'Drink 8-10 glasses of water daily',
    'Herbal teas: Black cohosh, red clover (consult doctor)',
    'Coconut water for natural electrolytes',
    'Limit caffeinated beverages',
    'Buttermilk with mint - cooling',
    'Warm water with lemon - gentle on the system',
  ]

  const mealPlan = [
    { meal: 'Early Morning', items: ['Warm water with lemon', '5-6 soaked almonds', '1 date or fig'] },
    { meal: 'Breakfast', items: ['Oats with flaxseed powder', 'Greek yogurt with berries', 'Egg if desired'] },
    { meal: 'Mid-Morning', items: ['Fresh seasonal fruit', 'Handful of pumpkin seeds'] },
    { meal: 'Lunch', items: ['Ragi roti or brown rice', 'Fish curry or dal', 'Sauteed leafy greens', 'Curd or raita'] },
    { meal: 'Evening', items: ['Herbal tea', 'Roasted makhana or chana'] },
    { meal: 'Dinner', items: ['Light dinner: Soup or salad', 'Grilled fish or paneer', 'Steamed vegetables'] },
  ]

  const additionalTips = [
    `Stage: ${stage}. Focus on bone and heart health.`,
    boneHealth !== 'No known issues' ? 'Prioritize calcium and vitamin D intake' : 'Maintain bone health with weight-bearing exercise',
    'Weight-bearing exercises 3-4 times/week',
    'Strength training preserves muscle mass',
    'Get vitamin D levels checked regularly',
    'Manage stress: Yoga, meditation, deep breathing',
    symptoms.includes('Sleep issues') ? 'Avoid screens 1 hour before bed, try chamomile tea' : '',
    'Regular health screenings: bone density, heart health',
    'Quality sleep: 7-8 hours, consistent schedule',
  ].filter(Boolean)

  return {
    summary: `${stage} management. Key symptoms: ${symptoms.slice(0, 3).join(', ') || 'none reported'}. Focus on bone health and symptom management.`,
    foodsToEat,
    foodsToAvoid,
    hydrationTips,
    mealPlan,
    additionalTips,
    exerciseGuide: getExerciseGuide('menopause', answers)
  }
}

function ModuleCard({ id, title, icon, description, activeModule, setActiveModule }: {
  id: Module
  title: string
  icon: React.ReactNode
  description: string
  activeModule: Module | null
  setActiveModule: (m: Module) => void
}) {
  const isActive = activeModule === id
  const colors: Record<Module, string> = {
    period: 'bg-pink-50 border-pink-200 text-pink-600',
    pregnancy: 'bg-purple-50 border-purple-200 text-purple-600',
    pcos: 'bg-orange-50 border-orange-200 text-orange-600',
    pcod: 'bg-teal-50 border-teal-200 text-teal-600',
    anemia: 'bg-red-50 border-red-200 text-red-600',
    menopause: 'bg-indigo-50 border-indigo-200 text-indigo-600',
  }
  const activeColors: Record<Module, string> = {
    period: 'bg-pink-600 border-pink-600 text-white',
    pregnancy: 'bg-purple-600 border-purple-600 text-white',
    pcos: 'bg-orange-600 border-orange-600 text-white',
    pcod: 'bg-teal-600 border-teal-600 text-white',
    anemia: 'bg-red-600 border-red-600 text-white',
    menopause: 'bg-indigo-600 border-indigo-600 text-white',
  }

  return (
    <button
      onClick={() => setActiveModule(id)}
      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${isActive ? activeColors[id] : colors[id]}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-white'}`}>
          {icon}
        </div>
        <span className="font-semibold">{title}</span>
      </div>
      <p className={`text-sm ${isActive ? 'text-white/90' : 'text-gray-600'}`}>{description}</p>
    </button>
  )
}

function QuestionForm({ questions, onComplete }: { questions: Question[]; onComplete: (answers: Record<string, any>) => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const question = questions[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1

  function handleAnswer(value: any) {
    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)

    if (isLastQuestion) {
      setTimeout(() => onComplete(newAnswers), 300)
    } else {
      setTimeout(() => setCurrentQuestion(c => c + 1), 200)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{question.question}</h3>

      {question.type === 'select' && question.options && (
        <div className="space-y-2">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(option)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                answers[question.id] === option
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
              }`}
            >
              <span className="text-gray-900 dark:text-white">{option}</span>
            </button>
          ))}
        </div>
      )}

      {question.type === 'multiselect' && question.options && (
        <div className="space-y-2">
          {question.options.map((option, i) => {
            const selected = (answers[question.id] || []).includes(option)
            return (
              <button
                key={i}
                onClick={() => {
                  const current = answers[question.id] || []
                  const newSelection = selected
                    ? current.filter((s: string) => s !== option)
                    : [...current, option]
                  setAnswers({ ...answers, [question.id]: newSelection })
                }}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${
                  selected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selected ? 'bg-green-500 border-green-500' : 'border-gray-400'
                }`}>
                  {selected && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <span className="text-gray-900 dark:text-white">{option}</span>
              </button>
            )
          })}
          <button
            onClick={() => handleAnswer(answers[question.id] || [])}
            disabled={!answers[question.id] || answers[question.id].length === 0}
            className="w-full mt-4 p-4 rounded-lg bg-green-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
          >
            {isLastQuestion ? 'Get My Analysis' : 'Continue'}
          </button>
        </div>
      )}

      {question.type === 'number' && (
        <div className="space-y-4">
          <input
            type="number"
            value={answers[question.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 focus:outline-none text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance:none [&::-webkit-inner-spin-button]:appearance-none dark:bg-gray-700 dark:text-white"
            placeholder="Enter value..."
          />
          <button
            onClick={() => handleAnswer(answers[question.id])}
            disabled={!answers[question.id]}
            className="w-full p-4 rounded-lg bg-green-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
          >
            {isLastQuestion ? 'Get My Analysis' : 'Continue'}
          </button>
        </div>
      )}

      {currentQuestion > 0 && (
        <button
          onClick={() => setCurrentQuestion(c => c - 1)}
          className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Previous question
        </button>
      )}
    </div>
  )
}

function YogaPoseCard({ pose }: { pose: YogaPose }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="h-32 sm:h-40">
        <YogaPoseSVG pose={pose.image} className="w-full h-full" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{pose.name}</h4>
            {pose.sanskrit && <p className="text-xs text-gray-500 dark:text-gray-400 italic">{pose.sanskrit}</p>}
          </div>
          <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-1 rounded">
            {pose.duration}
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
        >
          {expanded ? 'Hide Details' : 'View Instructions'}
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Instructions</p>
              <ol className="space-y-1">
                {pose.instructions.map((step, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Benefits</p>
              <div className="flex flex-wrap gap-1">
                {pose.benefits.map((benefit, i) => (
                  <span key={i} className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
            {pose.precautions.length > 0 && (
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Precautions:</p>
                <ul className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {pose.precautions.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ExerciseSection({ guide }: { guide: ExerciseGuide }) {
  return (
    <div className="space-y-6">
      {/* Recommended Exercises */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-5">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-green-600 dark:text-green-400" />
          Recommended Exercises
        </h4>
        <div className="grid sm:grid-cols-2 gap-2">
          {guide.recommendedExercises.map((exercise, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{exercise}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Beginner Workout Routine */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Timer className="w-5 h-5 text-orange-500" />
          Beginner Workout Routine
        </h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {guide.beginnerRoutine.map((item, i) => (
            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs flex items-center justify-center font-semibold">{i + 1}</span>
                <span className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                <Flame className="w-3 h-3" />
                {item.duration}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Activity & Lifestyle */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Daily Activity
          </h4>
          <ul className="space-y-2">
            {guide.dailyActivity.map((tip, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <Target className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Lifestyle Tips
          </h4>
          <ul className="space-y-2">
            {guide.lifestyleTips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stress Management */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-teal-800 p-5">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Wind className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Stress Management
        </h4>
        <div className="grid sm:grid-cols-2 gap-2">
          {guide.stressManagement.map((tip, i) => (
            <div key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <Wind className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Yoga Poses Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <PersonStanding className="w-5 h-5 text-pink-500" />
          Yoga Poses
        </h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guide.yogaPoses.map((pose, i) => (
            <YogaPoseCard key={i} pose={pose} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AnalysisDisplay({ result, onReset, moduleName }: { result: AnalysisResult; onReset: () => void; moduleName: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-8 h-8" />
          <h2 className="text-xl font-bold">Your Personalized {moduleName}</h2>
        </div>
        <p className="text-green-100">{result.summary}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
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
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
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
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
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
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Utensils className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Sample Meal Plan</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.mealPlan.map((meal, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {meal.meal.includes('Morning') || meal.meal === 'Breakfast' ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : meal.meal.includes('Dinner') || meal.meal.includes('Bedtime') ? (
                  <Moon className="w-4 h-4 text-indigo-500" />
                ) : (
                  <Coffee className="w-4 h-4 text-orange-500" />
                )}
                <span className="font-medium text-gray-900 dark:text-white">{meal.meal}</span>
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
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
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

      {/* Exercise & Wellness Section */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
            <Dumbbell className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Exercise & Wellness Guide</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Personalized movement and lifestyle recommendations</p>
          </div>
        </div>
        <ExerciseSection guide={result.exerciseGuide} />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onReset}
          className="flex-1 py-3 px-6 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Start New Assessment
        </button>
      </div>
    </div>
  )
}

export default function WomenHealthHub() {
  const { profile } = useAuth()
  const [activeModule, setActiveModule] = useState<Module | null>(null)
  const [answers, setAnswers] = useState<Record<string, any> | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const moduleConfig: Record<Module, { title: string; icon: React.ReactNode; description: string; questions: Question[]; analyzer: (a: Record<string, any>) => AnalysisResult }> = {
    period: {
      title: 'Period Nutrition',
      icon: <Moon className="w-6 h-6" />,
      description: 'Get personalized nutrition guidance for your menstrual cycle',
      questions: PERIOD_QUESTIONS,
      analyzer: analyzePeriod,
    },
    pregnancy: {
      title: 'Pregnancy Diet',
      icon: <Baby className="w-6 h-6" />,
      description: 'Essential nutrition guidance for each trimester',
      questions: PREGNANCY_QUESTIONS,
      analyzer: analyzePregnancy,
    },
    pcos: {
      title: 'PCOS Diet',
      icon: <Activity className="w-6 h-6" />,
      description: 'Manage PCOS through balanced nutrition and lifestyle',
      questions: PCOS_QUESTIONS,
      analyzer: analyzePCOS,
    },
    pcod: {
      title: 'PCOD Support',
      icon: <Heart className="w-6 h-6" />,
      description: 'Nutrition, exercise, and lifestyle guidance for managing PCOD symptoms',
      questions: PCOD_QUESTIONS,
      analyzer: analyzePCOD,
    },
    anemia: {
      title: 'Anemia Support',
      icon: <Droplets className="w-6 h-6" />,
      description: 'Boost iron levels with targeted dietary recommendations',
      questions: ANEMIA_QUESTIONS,
      analyzer: analyzeAnemia,
    },
    menopause: {
      title: 'Menopause Guide',
      icon: <TrendingUp className="w-6 h-6" />,
      description: 'Navigate menopause with nutrition for bone and heart health',
      questions: MENOPAUSE_QUESTIONS,
      analyzer: analyzeMenopause,
    },
  }

  function handleComplete(moduleAnswers: Record<string, any>) {
    if (activeModule) {
      setAnswers(moduleAnswers)
      setAnalysisResult(moduleConfig[activeModule].analyzer(moduleAnswers))
    }
  }

  function resetModule() {
    setActiveModule(null)
    setAnswers(null)
    setAnalysisResult(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Women's Health Hub</h1>
          <p className="text-gray-600 dark:text-gray-400">Personalized nutrition guidance for every stage of life</p>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">Medical Disclaimer</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              This information is for educational purposes only and does not replace professional medical advice.
              Always consult with your healthcare provider before making significant changes to your diet,
              especially during pregnancy, if you have PCOS/PCOD, anemia, or are experiencing menopause symptoms.
            </p>
          </div>
        </div>
      </div>

      {!activeModule ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Choose Your Health Focus</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select a module to get started with your personalized assessment</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.entries(moduleConfig) as [Module, typeof moduleConfig.period][]).map(([key, config]) => (
              <ModuleCard
                key={key}
                id={key}
                title={config.title}
                icon={config.icon}
                description={config.description}
                activeModule={activeModule}
                setActiveModule={setActiveModule}
              />
            ))}
          </div>
        </div>
      ) : analysisResult ? (
        <AnalysisDisplay
          result={analysisResult}
          onReset={resetModule}
          moduleName={moduleConfig[activeModule].title}
        />
      ) : (
        <div className="space-y-4">
          <button
            onClick={resetModule}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Previous question
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${
              activeModule === 'period' ? 'bg-pink-100 text-pink-600' :
              activeModule === 'pregnancy' ? 'bg-purple-100 text-purple-600' :
              activeModule === 'pcos' ? 'bg-orange-100 text-orange-600' :
              activeModule === 'pcod' ? 'bg-teal-100 text-teal-600' :
              activeModule === 'anemia' ? 'bg-red-100 text-red-600' :
              'bg-indigo-100 text-indigo-600'
            }`}>
              {moduleConfig[activeModule].icon}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{moduleConfig[activeModule].title} Assessment</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Answer a few questions to get personalized recommendations</p>
            </div>
          </div>

          <QuestionForm
            questions={moduleConfig[activeModule].questions}
            onComplete={handleComplete}
          />
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Quick Guidelines</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">General Tips for All Modules</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>Maintain consistent meal timing for better metabolism</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>Prioritize whole, unprocessed foods whenever possible</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>Stay hydrated throughout the day, not just at meals</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>Listen to your body and adjust portions based on hunger</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">When to See a Doctor</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Severe or persistent symptoms despite dietary changes</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Unusual changes in menstrual cycle or bleeding</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Dizziness, fainting, or severe weakness</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Planning pregnancy or pregnancy complications</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
