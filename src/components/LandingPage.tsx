import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import emailjs from '@emailjs/browser'
import {
  Apple, Brain, Target, Activity, Droplets, TrendingUp,
  ChevronRight, Mail, MapPin, Play, Star, Menu, X,
  Moon, Sun, CheckCircle, Zap, Shield, BarChart3, Utensils,
  Calculator, Dumbbell, Heart, Send, Loader2, AlertCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'

// EmailJS config
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '' // Admin notification
const EMAILJS_REPLY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_REPLY_TEMPLATE_ID || '' // Auto-reply
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''

interface Review {
  id: string
  name: string
  message: string
  created_at: string
}

export default function LandingPage() {
  const { user } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([])
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetchApprovedReviews()
  }, [])

  async function fetchApprovedReviews() {
    try {
      const { data } = await supabase
        .from('contact_submissions')
        .select('id, name, message, created_at')
        .eq('is_approved', true)
        .eq('is_review', true)
        .order('created_at', { ascending: false })
        .limit(6)
      setApprovedReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {}

    if (!contactForm.name.trim()) {
      errors.name = 'Name is required'
    } else if (contactForm.name.length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!contactForm.email.trim()) {
      errors.email = 'Email is required'
    } else if (!emailRegex.test(contactForm.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!contactForm.subject.trim()) {
      errors.subject = 'Subject is required'
    }

    if (!contactForm.message.trim()) {
      errors.message = 'Message is required'
    } else if (contactForm.message.length < 10) {
      errors.message = 'Message must be at least 10 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const stats = [
    { label: 'Active Users', value: '50K+', suffix: '' },
    { label: 'Calories Tracked', value: '10M+', suffix: '' },
    { label: 'Success Rate', value: '94', suffix: '%' },
    { label: 'Expert Dietitians', value: '100+', suffix: '' },
  ]

  const features = [
    { icon: Calculator, title: 'Smart BMI Calculator', desc: 'Precise BMI analysis with personalized health insights and recommendations based on your body metrics.' },
    { icon: Utensils, title: 'Food Tracking', desc: 'Comprehensive nutrition logging with 5000+ Indian and international foods in our database.' },
    { icon: Brain, title: 'AI Diet Recommendations', desc: 'Machine learning powered meal suggestions tailored to your health goals and preferences.' },
    { icon: Activity, title: 'Exercise Tracking', desc: 'Log workouts and track calories burned with 50+ exercise types and intensity levels.' },
    { icon: Droplets, title: 'Hydration Monitor', desc: 'Stay hydrated with smart water intake reminders and daily goal tracking.' },
    { icon: BarChart3, title: 'Progress Analytics', desc: 'Beautiful charts showing weekly, monthly, and yearly nutrition trends.' },
  ]

  const howItWorks = [
    { step: 1, title: 'Create Your Profile', desc: 'Sign up and set your health goals - weight loss, maintenance, or muscle gain.' },
    { step: 2, title: 'Log Your Meals', desc: 'Quickly add foods from our extensive database or create custom entries.' },
    { step: 3, title: 'Get AI Insights', desc: 'Receive personalized recommendations based on your unique nutrition data.' },
    { step: 4, title: 'Track Progress', desc: 'Monitor your journey with detailed analytics and export reports.' },
  ]

  const testimonials = [
    { name: 'Priya Sharma', role: 'Fitness Enthusiast', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', text: 'Lost 15 kg in 4 months! The AI recommendations helped me understand what to eat and when.' },
    { name: 'Rahul Kumar', role: 'Software Developer', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', text: 'Finally a nutrition app that understands Indian food. My meal planning is so much easier now.' },
    { name: 'Anita Patel', role: 'Working Mom', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', text: 'The water tracker and exercise features keep me accountable. Love the weekly reports!' },
  ]

  const faqs = [
    { q: 'Is NutriAI free to use?', a: 'Yes! NutriAI offers a free tier with core features including food tracking, BMI calculator, and basic AI recommendations. Premium features like advanced analytics and personalized diet plans are available in our Pro plan.' },
    { q: 'Does it support Indian foods?', a: 'Absolutely! We have an extensive database of Indian foods including regional dishes from all states. From Idli-Dosa to Dal-Chawal, we have you covered.' },
    { q: 'How accurate are the AI recommendations?', a: 'Our AI model is trained on nutritional science data and validated by certified dietitians. It achieves 94% accuracy in meal recommendations based on user feedback.' },
    { q: 'Can I export my data?', a: 'Yes, you can export your complete nutrition history as PDF reports. Weekly and monthly summaries are available for download anytime.' },
    { q: 'Is my health data secure?', a: 'We use enterprise-grade encryption and follow HIPAA guidelines. Your data is stored securely in Supabase with row-level security policies.' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setFormSubmitting(true)
    setFormErrors({})

    try {
      // Save to Supabase
      const { error: dbError } = await supabase
        .from('contact_submissions')
        .insert({
          name: contactForm.name,
          email: contactForm.email,
          subject: contactForm.subject,
          message: contactForm.message,
          is_review: false,
          is_approved: false,
          reply_sent: false,
        })

      if (dbError) throw dbError

      // ─── 1. Send admin notification via EmailJS ───
      let adminNotificationSuccess = false
      if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
        try {
          console.log('[Contact] Sending admin notification via EmailJS to supportnutricians1@gmail.com...')
          console.log('[Contact] EmailJS config:', { service: EMAILJS_SERVICE_ID, template: EMAILJS_TEMPLATE_ID })
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
              user_name: contactForm.name,
              user_email: contactForm.email,
              title: contactForm.subject,
              message: contactForm.message,
              reply_to: contactForm.email,
            },
            EMAILJS_PUBLIC_KEY
          )
          console.log('[Contact] SUCCESS: Admin notification sent to supportnutricians1@gmail.com')
          adminNotificationSuccess = true
        } catch (adminErr: any) {
          console.error('[Contact] FAILED: Admin notification:', adminErr?.text || adminErr?.message || adminErr)
        }
      } else {
        console.warn('[Contact] EmailJS not configured — admin notification skipped.')
      }

      // ─── 2. Send auto-reply email to user via EmailJS ───
      let autoReplySuccess = false
      if (EMAILJS_SERVICE_ID && EMAILJS_REPLY_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
        try {
          console.log('[Contact] Sending auto-reply via EmailJS to:', contactForm.email)
          console.log('[Contact] Auto-reply template:', EMAILJS_REPLY_TEMPLATE_ID)
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_REPLY_TEMPLATE_ID,
            {
              user_name: contactForm.name,
              user_email: contactForm.email,
              message: contactForm.message,
              to_email: contactForm.email,
            },
            EMAILJS_PUBLIC_KEY
          )
          console.log('[Contact] SUCCESS: Auto-reply sent to', contactForm.email)
          autoReplySuccess = true
          // Mark reply_sent in Supabase
          await supabase
            .from('contact_submissions')
            .update({ reply_sent: true })
            .eq('email', contactForm.email)
            .eq('reply_sent', false)
            .order('created_at', { ascending: false })
            .limit(1)
        } catch (replyErr: any) {
          console.error('[Contact] FAILED: Auto-reply:', replyErr?.text || replyErr?.message || replyErr)
        }
      } else {
        console.warn('[Contact] EmailJS auto-reply template not configured — auto-reply skipped.')
      }

      console.log('[Contact] Email summary:', { adminNotificationSuccess, autoReplySuccess })

      setFormSuccess(true)
      setContactForm({ name: '', email: '', subject: '', message: '' })

      setTimeout(() => setFormSuccess(false), 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setFormErrors({ submit: 'Failed to send message. Please try again.' })
    } finally {
      setFormSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? `${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} shadow-lg backdrop-blur-md` : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2">
              <Apple className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>NutriAI</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Features</a>
              <a href="#how-it-works" className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>How It Works</a>
              <a href="#testimonials" className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Testimonials</a>
              <a href="#faq" className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>FAQ</a>
              <a href="#contact" className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Contact</a>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <Link to={user ? '/dashboard' : '/login'} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                {user ? 'Dashboard' : 'Get Started'} <ChevronRight className="w-4 h-4" />
              </Link>

              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2">
                <Menu className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className={`absolute right-0 top-0 bottom-0 w-72 ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl p-6 animate-fadeIn`}>
            <div className="flex justify-end mb-8">
              <button onClick={() => setMobileMenuOpen(false)} className={darkMode ? 'text-white' : 'text-gray-900'}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className={`block py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className={`block py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>How It Works</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className={`block py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Testimonials</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className={`block py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>FAQ</a>
              <Link to="/login" className={`block py-2 px-4 bg-green-600 text-white rounded-lg text-center font-medium`}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className={`relative min-h-screen flex items-center pt-20 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 via-white to-emerald-50'}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl ${darkMode ? 'bg-green-900/20' : 'bg-green-200/50'}`} />
          <div className={`absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl ${darkMode ? 'bg-emerald-900/20' : 'bg-emerald-100/50'}`} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6 animate-fadeIn">
                <Zap className="w-4 h-4" />
                AI-Powered Nutrition Platform
              </div>

              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Transform Your Health with <span className="text-green-600">Intelligent Nutrition</span>
              </h1>

              <p className={`text-lg sm:text-xl mb-8 max-w-xl mx-auto lg:mx-0 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Track meals, analyze BMI, and get personalized AI-powered diet recommendations.
                Your journey to a healthier lifestyle starts here.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to={user ? '/dashboard' : '/register'} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg shadow-green-200">
                  {user ? 'Go to Dashboard' : 'Start Free Today'} <ChevronRight className="w-5 h-5" />
                </Link>
                <a href="#how-it-works" className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all hover:scale-105 ${
                  darkMode ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}>
                  <Play className="w-5 h-5" /> Watch Demo
                </a>
              </div>
            </div>

            <div className="relative">
              {/* AI Nutrition Illustration */}
              <div className="relative">
                <div className={`relative bg-gradient-to-br ${darkMode ? 'from-green-600 to-emerald-700' : 'from-green-500 to-emerald-600'} rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500`}>
                  <div className="flex items-center gap-4 mb-6">
                    <Brain className="w-12 h-12 text-white" />
                    <div>
                      <div className="text-white font-semibold text-lg">AI Analysis</div>
                      <div className="text-green-100 text-sm">Personalized for you</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">Daily Goal</span>
                        <span className="text-white font-bold">78%</span>
                      </div>
                      <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full w-[78%] bg-white rounded-full" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'BMI', value: '22.5', status: 'Normal' },
                        { label: 'Calories', value: '1,840', status: 'Remaining: 160' },
                        { label: 'Water', value: '6/8', status: 'Glasses' },
                      ].map((item) => (
                        <div key={item.label} className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
                          <div className="text-white font-bold">{item.value}</div>
                          <div className="text-green-100 text-xs">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className={`absolute -top-4 -right-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg animate-bounce`}>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Apple className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Breakfast Added</div>
                      <div className="text-xs text-gray-500">Oatmeal + Fruits</div>
                    </div>
                  </div>
                </div>

                <div className={`absolute -bottom-4 -left-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Goal Achieved!</div>
                      <div className="text-xs text-gray-500">Protein target met</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className={`text-center p-6 rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transform hover:scale-105 transition-all duration-300 animate-fadeIn`} style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`text-4xl lg:text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {stat.value}{stat.suffix}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Everything You Need for Better Health
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Powerful features designed to help you achieve your nutrition goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className={`group p-6 lg:p-8 rounded-2xl transition-all duration-300 hover:scale-105 ${
                darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-white'
              } shadow-sm hover:shadow-xl`} style={{ animationDelay: `${index * 50}ms` }}>
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              How It Works
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Start your transformative journey in just 4 easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative">
                <div className={`h-full p-6 rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 font-bold text-xl ${
                    darkMode ? 'bg-green-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {item.step}
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.desc}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className={`w-6 h-6 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Demo Preview */}
      <section className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                AI-Powered Recommendations
              </h2>
              <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Our intelligent system analyzes your nutrition data, BMI, and health goals to provide
                personalized meal suggestions, portion recommendations, and lifestyle tips.
              </p>

              <div className="space-y-4">
                {[
                  'Real-time nutrition analysis',
                  'Personalized meal suggestions',
                  'Indian & international food database',
                  'Smart goal adjustments',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Recommendation</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Based on your profile</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-green-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Suggested Lunch
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">AI Choice</span>
                  </div>
                  <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Dal Tadka + Brown Rice + Salad
                  </div>
                  <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    450 cal • 18g protein • High fiber
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Health Tip
                  </div>
                  <div className={darkMode ? 'text-white' : 'text-gray-900'}>
                    Add a glass of buttermilk to your lunch for improved digestion and probiotics.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Loved by Thousands
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Real stories from real users who transformed their health
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Default testimonials */}
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{testimonial.name}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Approved reviews from database */}
            {approvedReviews.map((review) => (
              <div key={review.id} className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  "{review.message}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">{review.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{review.name}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Verified User</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Frequently Asked Questions
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Everything you need to know about NutriAI
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{faq.q}</span>
                  <ChevronRight className={`w-5 h-5 transition-transform ${activeFaq === index ? 'rotate-90' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
                {activeFaq === index && (
                  <div className={`px-6 pb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Get in Touch
              </h2>
              <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Email</div>
                    <a href="mailto:supportnutricians1@gmail.com" className={`${darkMode ? 'text-green-400' : 'text-green-600'} hover:underline`}>supportnutricians1@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Location</div>
                    <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Tamil Nadu, India</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 lg:p-8 rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {formSuccess ? (
                <div className="text-center py-8 animate-fadeIn">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Message Sent!</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your message has been received. A confirmation email has been sent to your inbox.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {formErrors.submit && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg">
                      <AlertCircle className="w-5 h-5" />
                      {formErrors.submit}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name *</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg border ${formErrors.name ? 'border-red-500' : darkMode ? 'border-gray-700' : 'border-gray-200'} ${darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'} focus:ring-2 focus:ring-green-500 outline-none transition`}
                      />
                      {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg border ${formErrors.email ? 'border-red-500' : darkMode ? 'border-gray-700' : 'border-gray-200'} ${darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'} focus:ring-2 focus:ring-green-500 outline-none transition`}
                      />
                      {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Subject *</label>
                    <input
                      type="text"
                      placeholder="How can we help?"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${formErrors.subject ? 'border-red-500' : darkMode ? 'border-gray-700' : 'border-gray-200'} ${darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'} focus:ring-2 focus:ring-green-500 outline-none transition`}
                    />
                    {formErrors.subject && <p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Message *</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us more..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border resize-none ${formErrors.message ? 'border-red-500' : darkMode ? 'border-gray-700' : 'border-gray-200'} ${darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'} focus:ring-2 focus:ring-green-500 outline-none transition`}
                    />
                    {formErrors.message && <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Apple className="w-8 h-8 text-green-400" />
                <span className="text-xl font-bold text-white">NutriAI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your AI-powered nutrition partner for a healthier lifestyle.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              © 2026 NutriAI. All rights reserved. Made with ❤️ in Tamil Nadu, India.
            </div>
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <a href="mailto:supportnutricians1@gmail.com" className="hover:text-white transition">supportnutricians1@gmail.com</a>
              <span>|</span>
              <a href="tel:+919944781247" className="hover:text-white transition">+91 9944781247</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
