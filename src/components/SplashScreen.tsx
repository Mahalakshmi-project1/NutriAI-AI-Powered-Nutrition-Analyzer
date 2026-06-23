import { useEffect, useState } from 'react'
import { Apple, Sparkles } from 'lucide-react'
import { isMobileApp, hideSplashScreen } from '../lib/mobile'

interface SplashScreenProps {
  onComplete: () => void
}

export default function AppSplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        hideSplashScreen()
        onComplete()
      }, 500)
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  // Only show custom splash on web, native uses Capacitor splash
  if (isMobileApp()) {
    return null
  }

  return (
    <div className={`fixed inset-0 z-[100] bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse delay-300" />
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-500" />
      </div>

      {/* Logo */}
      <div className="relative flex flex-col items-center">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-6 animate-bounce">
          <Apple className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          NutriAI
        </h1>

        <p className="text-white/80 text-lg flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Your Personal AI Nutrition Assistant
          <Sparkles className="w-4 h-4" />
        </p>
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-20 flex flex-col items-center">
        <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-loading-bar" />
        </div>
        <p className="text-white/60 text-sm mt-3">Loading your health journey...</p>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out forwards;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </div>
  )
}
