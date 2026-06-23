import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ThemeProvider, useTheme } from './hooks/useTheme'
import { NotificationProvider } from './hooks/useNotifications'
import LandingPage from './components/LandingPage'
import { Login, Register, Onboarding } from './components/Auth'
import DashboardLayout from './components/Layout'
import Dashboard from './components/Dashboard'
import FoodTracking from './components/FoodTracking'
import BMICalculator from './components/BMI'
import WaterIntake from './components/Water'
import ExerciseTracker from './components/Exercise'
import AIRecommendations from './components/Recommendations'
import AdminPanel from './components/AdminPanel'
import Toast from './components/Toast'
import NutriAIChatbot from './components/NutriAIChatbot'
import BudgetDietPlanner from './components/BudgetDietPlanner'
import DeficiencyDetector from './components/DeficiencyDetector'
import HealthHub from './components/HealthHub'
import LocationFoodDiscovery from './components/LocationFoodDiscovery'
import MobileNav from './components/MobileNav'
import AppSplashScreen from './components/SplashScreen'
import AITools from './components/AITools'
import MobileProfile from './components/MobileProfile'
import { isMobileApp } from './lib/mobile'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children, authOnly = false }: { children: React.ReactNode; authOnly?: boolean }) {
  const { user, loading, profile } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (user && authOnly) {
    if (!profile?.height || !profile?.weight) {
      return <Navigate to="/onboarding" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute authOnly><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute authOnly><Register /></PublicRoute>} />
      <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

      {/* Mobile App Routes (with bottom nav) */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <MobileLayout>
            <Dashboard />
          </MobileLayout>
        </PrivateRoute>
      } />
      <Route path="/ai-tools" element={
        <PrivateRoute>
          <MobileLayout>
            <AITools />
          </MobileLayout>
        </PrivateRoute>
      } />
      <Route path="/health-hub" element={
        <PrivateRoute>
          <MobileLayout>
            <HealthHub />
          </MobileLayout>
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <MobileLayout>
            <MobileProfile />
          </MobileLayout>
        </PrivateRoute>
      } />

      {/* Feature Routes */}
      <Route path="/bmi" element={
        <PrivateRoute>
          <MobileLayout>
            <BMICalculator />
          </MobileLayout>
        </PrivateRoute>
      } />
      <Route path="/chatbot" element={
        <PrivateRoute>
          <MobileLayout>
            <NutriAIChatbot />
          </MobileLayout>
        </PrivateRoute>
      } />
      <Route path="/exercise" element={
        <PrivateRoute>
          <MobileLayout>
            <ExerciseTracker />
          </MobileLayout>
        </PrivateRoute>
      } />
      <Route path="/deficiency" element={
        <PrivateRoute>
          <MobileLayout>
            <DeficiencyDetector />
          </MobileLayout>
        </PrivateRoute>
      } />
      <Route path="/budget-planner" element={
        <PrivateRoute>
          <MobileLayout>
            <BudgetDietPlanner />
          </MobileLayout>
        </PrivateRoute>
      } />
      <Route path="/womens-health" element={
        <PrivateRoute>
          <MobileLayout>
            <HealthHub />
          </MobileLayout>
        </PrivateRoute>
      } />
      <Route path="/local-foods" element={
        <PrivateRoute>
          <MobileLayout>
            <LocationFoodDiscovery />
          </MobileLayout>
        </PrivateRoute>
      } />

      {/* Legacy App Routes (dashboard layout) */}
      <Route path="/app" element={<PrivateRoute><NotificationProvider><DashboardLayout /></NotificationProvider></PrivateRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="food" element={<FoodTracking />} />
        <Route path="bmi" element={<BMICalculator />} />
        <Route path="water" element={<WaterIntake />} />
        <Route path="exercise" element={<ExerciseTracker />} />
        <Route path="recommendations" element={<AIRecommendations />} />
        <Route path="chatbot" element={<NutriAIChatbot />} />
        <Route path="budget-planner" element={<BudgetDietPlanner />} />
        <Route path="deficiency" element={<DeficiencyDetector />} />
        <Route path="womens-health" element={<HealthHub />} />
        <Route path="health-hub" element={<HealthHub />} />
        <Route path="local-foods" element={<LocationFoodDiscovery />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Mobile Layout wrapper with bottom navigation
function MobileLayout({ children }: { children: React.ReactNode }) {
  const showMobileNav = isMobileApp()

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${showMobileNav ? 'pb-16' : ''}`}>
      {children}
      <MobileNav />
    </div>
  )
}

// Main App with Splash Screen
function AppContent() {
  const [showSplash, setShowSplash] = useState(isMobileApp())

  if (showSplash) {
    return <AppSplashScreen onComplete={() => setShowSplash(false)} />
  }

  return <AppRoutes />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Toast />
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
