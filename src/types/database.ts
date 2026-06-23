export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  avatar_url?: string
  age?: number
  gender?: 'male' | 'female' | 'transgender' | 'other'
  height?: number
  weight?: number
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal?: 'lose' | 'maintain' | 'gain'
  daily_calorie_goal?: number
  created_at: string
  updated_at: string
}

export interface FoodRecord {
  id: string
  user_id: string
  food_name: string
  quantity: number
  serving_unit: string
  calories: number
  protein: number
  carbohydrates: number
  fats: number
  fiber?: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: string
  created_at: string
}

export interface BMIHistory {
  id: string
  user_id: string
  height: number
  weight: number
  bmi: number
  category: string
  created_at: string
}

export interface WaterIntake {
  id: string
  user_id: string
  glasses: number
  date: string
  created_at: string
}

export interface ExerciseRecord {
  id: string
  user_id: string
  exercise_type: string
  duration: number
  calories_burned: number
  date: string
  notes?: string
  created_at: string
}

export interface NutritionRecommendation {
  id: string
  user_id: string
  recommendation_type: 'diet' | 'exercise' | 'general'
  title: string
  description: string
  suggested_foods?: string[]
  created_at: string
}

export interface FoodDatabase {
  id: string
  name: string
  category: string
  calories_per_serving: number
  protein_per_serving: number
  carbs_per_serving: number
  fats_per_serving: number
  fiber_per_serving?: number
  serving_size: string
}
