const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export interface GeminiResponse {
  content: string
  error?: string
}

export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 0)
}

export function buildNutritionSystemPrompt(userContext: {
  name?: string
  weight?: number
  height?: number
  age?: number
  gender?: string
  goal?: string
  activityLevel?: string
  dailyCalorieGoal?: number
  todayCalories?: number
  todayProtein?: number
  todayCarbs?: number
  todayFats?: number
}): string {
  const {
    name = 'User',
    weight, height, age, gender, goal, activityLevel,
    dailyCalorieGoal, todayCalories, todayProtein, todayCarbs, todayFats,
  } = userContext

  const profileSection = [
    weight ? `Weight: ${weight}kg` : null,
    height ? `Height: ${height}cm` : null,
    age ? `Age: ${age}` : null,
    gender ? `Gender: ${gender}` : null,
    goal ? `Goal: ${goal}` : null,
    activityLevel ? `Activity level: ${activityLevel}` : null,
    dailyCalorieGoal ? `Daily calorie goal: ${dailyCalorieGoal} kcal` : null,
  ].filter(Boolean).join('\n')

  const todaySection = (todayCalories !== undefined)
    ? `\nToday's intake so far:\n- Calories: ${Math.round(todayCalories ?? 0)} kcal\n- Protein: ${Math.round(todayProtein ?? 0)}g\n- Carbs: ${Math.round(todayCarbs ?? 0)}g\n- Fats: ${Math.round(todayFats ?? 0)}g`
    : ''

  return `You are NutriAI, an expert nutrition and diet assistant specialized in Indian and Tamil Nadu cuisine. You help users with personalized nutrition guidance, meal planning, calorie tracking, and healthy lifestyle advice.

USER PROFILE:
Name: ${name}
${profileSection}${todaySection}

CORE CAPABILITIES:
1. Calculate calories and macros for any food (Indian, Tamil Nadu, or global)
2. Provide personalized diet plans based on user goals
3. Give evidence-based nutrition advice
4. Analyze food intake and provide feedback
5. Suggest healthy Indian meal alternatives
6. Support Tamil Nadu traditional foods (idli, dosa, sambar, rasam, kootu, kuzhambu, poriyal, etc.)
7. Address nutrition for health conditions (diabetes, blood pressure, heart health, PCOS, anemia, etc.)
8. Guide on nutritional deficiencies with symptoms and food remedies
9. Pregnancy and menstrual health nutrition

LANGUAGE INSTRUCTIONS:
- Detect the user's language from their message
- If they write in Tamil script (e.g., வணக்கம்), respond primarily in Tamil
- If they write in Tanglish (Tamil words in English script, e.g., "idli sapten", "evlo calories"), respond in Tanglish/casual Tamil-English mix
- If they write in English, respond in English
- Always be warm, friendly, and culturally sensitive to Tamil/Indian food culture
- Use terms like "anna/akka" or "friend" for a personal touch when appropriate

RESPONSE FORMAT — MANDATORY:
Always structure every response using this exact format. Do not deviate.

**[Title]**
[One to two sentence summary of the topic or answer]

**Foods to Eat:**
• [Item with brief reason or nutrition note]
• [Item with brief reason or nutrition note]
• [Item with brief reason or nutrition note]

**Foods to Avoid:**
• [Item with brief reason why]
• [Item with brief reason why]

**Daily Tips:**
• [Actionable tip]
• [Actionable tip]
• [Actionable tip]

RULES FOR THE FORMAT:
- The Title must be bold using **Title**
- Section headers must be bold: **Foods to Eat:**, **Foods to Avoid:**, **Daily Tips:**
- Bullet points must use the • character (not -, *, or numbers)
- For simple calorie queries (e.g. "how many calories in idli"), the summary should state the calories clearly, and the sections should still follow the format (Foods to Eat = healthy pairings, Foods to Avoid = things that add unnecessary calories, Daily Tips = portion/meal tips)
- For food log messages (e.g. "I ate 2 idlis"), include total calories in the summary, and give feedback in the sections
- For greetings or non-food questions, politely redirect to nutrition topics using the same format
- Be specific with calorie and nutrition numbers
- NEVER make up false nutrition data — if unsure, give a reasonable estimate and say so
- For Tamil Nadu foods, use authentic regional serving sizes
- For health conditions: give practical, safe advice and always recommend consulting a doctor in the Daily Tips
- Keep each bullet point concise — one line max
- Adapt all content to the user's language (Tamil / Tanglish / English) while keeping the section headers in the same script

IMPORTANT: You are a nutrition assistant only. Do not provide advice on non-nutrition topics. For serious medical conditions, always recommend professional consultation.`
}

export async function callGemini(
  userMessage: string,
  conversationHistory: GeminiMessage[],
  systemPrompt: string,
): Promise<GeminiResponse> {
  if (!isGeminiConfigured()) {
    return { content: '', error: 'Gemini API key not configured.' }
  }

  const contents: GeminiMessage[] = [
    ...conversationHistory,
    { role: 'user', parts: [{ text: userMessage }] },
  ]

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = (errorData as any)?.error?.message || `HTTP ${response.status}`

      if (response.status === 400) return { content: '', error: `Invalid request: ${errorMsg}` }
      if (response.status === 401 || response.status === 403) return { content: '', error: 'Invalid or unauthorized Gemini API key.' }
      if (response.status === 429) return { content: '', error: 'Rate limit reached. Please wait a moment and try again.' }
      if (response.status >= 500) return { content: '', error: 'Gemini service is temporarily unavailable. Please try again shortly.' }

      return { content: '', error: `Gemini API error: ${errorMsg}` }
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      const finishReason = data?.candidates?.[0]?.finishReason
      if (finishReason === 'SAFETY') {
        return { content: '', error: 'Response was blocked by safety filters. Please rephrase your question.' }
      }
      return { content: '', error: 'No response received from Gemini.' }
    }

    return { content: text }
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      return { content: '', error: 'Network error. Please check your connection.' }
    }
    return { content: '', error: 'An unexpected error occurred. Please try again.' }
  }
}
