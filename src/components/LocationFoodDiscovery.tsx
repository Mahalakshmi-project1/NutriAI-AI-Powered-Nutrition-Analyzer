import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../lib/supabase'
import NearbyHealthyFoods from './NearbyHealthyFoods'
import {
  MapPin, Navigation, Loader2, X, AlertCircle, Utensils,
  Flame, Target, Droplets, Info, Search, ChevronDown,
} from 'lucide-react'

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

type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied' | 'error'

// Maps normalised district/city key → array of exact food names from the DB.
const DISTRICT_FOODS: Record<string, string[]> = {
  coimbatore: ['Kambu Koozh', 'Kambu Roti', 'Ragi Kali', 'Ragi Dosa', 'Idli', 'Pongal', 'Ven Pongal', 'Avial', 'Kootu', 'Buttermilk'],
  tiruppur:   ['Kambu Koozh', 'Kambu Roti', 'Ragi Kali', 'Idli', 'Dosa', 'Pongal', 'Poriyal', 'Avial', 'Sambar', 'Buttermilk'],
  erode:      ['Kambu Koozh', 'Ragi Kali', 'Idli', 'Dosa', 'Ven Pongal', 'Sambar', 'Avial', 'Kootu', 'Poriyal', 'Filter Coffee'],
  salem:      ['Kambu Roti', 'Ragi Kali', 'Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Avial', 'Poriyal', 'Murukku'],
  namakkal:   ['Idli', 'Dosa', 'Pongal', 'Ven Pongal', 'Sambar', 'Rasam', 'Kootu', 'Poriyal', 'Avial', 'Buttermilk'],
  karur:      ['Kambu Koozh', 'Ragi Kali', 'Idli', 'Pongal', 'Sambar', 'Rasam', 'Mor Kuzhambu', 'Puli Kuzhambu', 'Kootu', 'Buttermilk'],
  madurai:    ['Idli', 'Dosa', 'Masala Dosa', 'Parotta', 'Vadai', 'Sambar', 'Puli Kuzhambu', 'Mor Kuzhambu', 'Mutton Curry', 'Filter Coffee'],
  dindigul:   ['Idli', 'Dosa', 'Parotta', 'Vadai', 'Sambar', 'Biryani', 'Mutton Curry', 'Rasam', 'Poriyal', 'Buttermilk'],
  theni:      ['Idli', 'Dosa', 'Ragi Kali', 'Kambu Koozh', 'Avial', 'Poriyal', 'Sambar', 'Rasam', 'Kootu', 'Buttermilk'],
  virudhunagar: ['Idli', 'Dosa', 'Vadai', 'Parotta', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Murukku', 'Sundal'],
  tirunelveli: ['Idli', 'Halwa', 'Dosa', 'Rasam', 'Pepper Rasam', 'Sambar', 'Poriyal', 'Kootu', 'Murukku', 'Jangiri'],
  thoothukudi: ['Idli', 'Halwa', 'Dosa', 'Rasam', 'Sambar', 'Fish Curry', 'Prawn Masala', 'Poriyal', 'Kootu', 'Sundal'],
  tuticorin:   ['Idli', 'Halwa', 'Dosa', 'Rasam', 'Sambar', 'Fish Curry', 'Prawn Masala', 'Poriyal', 'Kootu', 'Sundal'],
  kanyakumari: ['Idli', 'Dosa', 'Puttu', 'Appam', 'Fish Curry', 'Avial', 'Sambar', 'Rasam', 'Kootu', 'Tender Coconut'],
  sivaganga:   ['Idli', 'Dosa', 'Vadai', 'Parotta', 'Sambar', 'Puli Kuzhambu', 'Mor Kuzhambu', 'Rasam', 'Kootu', 'Buttermilk'],
  sivagangai:  ['Idli', 'Dosa', 'Vadai', 'Parotta', 'Sambar', 'Puli Kuzhambu', 'Mor Kuzhambu', 'Rasam', 'Kootu', 'Buttermilk'],
  ramanathapuram: ['Idli', 'Dosa', 'Appam', 'Puttu', 'Fish Curry', 'Prawn Masala', 'Rasam', 'Sambar', 'Poriyal', 'Tender Coconut'],
  tiruchirappalli: ['Idli', 'Dosa', 'Ven Pongal', 'Sambar', 'Rasam', 'Pepper Rasam', 'Poriyal', 'Kootu', 'Sambar Rice', 'Curd Rice'],
  trichy:          ['Idli', 'Dosa', 'Ven Pongal', 'Sambar', 'Rasam', 'Pepper Rasam', 'Poriyal', 'Kootu', 'Sambar Rice', 'Curd Rice'],
  perambalur:  ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Avial', 'Sambar Rice', 'Buttermilk'],
  ariyalur:    ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Avial', 'Rasam Rice', 'Buttermilk'],
  thanjavur:   ['Idli', 'Dosa', 'Ven Pongal', 'Sambar Rice', 'Rasam Rice', 'Curd Rice', 'Kootu', 'Poriyal', 'Avial', 'Pongal'],
  tiruvarur:   ['Idli', 'Dosa', 'Ven Pongal', 'Sambar Rice', 'Rasam', 'Curd Rice', 'Kootu', 'Poriyal', 'Sambar', 'Buttermilk'],
  nagapattinam: ['Idli', 'Dosa', 'Fish Curry', 'Prawn Masala', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Curd Rice', 'Tender Coconut'],
  chennai:     ['Idli', 'Dosa', 'Masala Dosa', 'Vadai', 'Sambar', 'Rasam', 'Filter Coffee', 'Pongal', 'Curd Rice', 'Bajji'],
  kancheepuram:['Idli', 'Dosa', 'Ven Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Avial', 'Curd Rice', 'Filter Coffee'],
  kanchipuram: ['Idli', 'Dosa', 'Ven Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Avial', 'Curd Rice', 'Filter Coffee'],
  thiruvallur: ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Curd Rice', 'Avial', 'Filter Coffee'],
  chengalpattu:['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Curd Rice', 'Kootu', 'Avial', 'Filter Coffee'],
  vellore:     ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Kambu Roti', 'Curd Rice', 'Filter Coffee'],
  tiruvannamalai: ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Avial', 'Kambu Koozh', 'Buttermilk'],
  villupuram:  ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Avial', 'Lemon Rice', 'Buttermilk'],
  viluppuram:  ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Avial', 'Lemon Rice', 'Buttermilk'],
  cuddalore:   ['Idli', 'Dosa', 'Pongal', 'Sambar', 'Rasam', 'Fish Curry', 'Poriyal', 'Kootu', 'Curd Rice', 'Buttermilk'],
  krishnagiri: ['Idli', 'Dosa', 'Ragi Kali', 'Ragi Dosa', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Buttermilk'],
  dharmapuri:  ['Idli', 'Dosa', 'Ragi Kali', 'Kambu Koozh', 'Pongal', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Buttermilk'],
  nilgiris:    ['Idli', 'Dosa', 'Oats Idli', 'Avial', 'Poriyal', 'Kootu', 'Sambar', 'Rasam', 'Vegetable Soup', 'Buttermilk'],
  ooty:        ['Idli', 'Dosa', 'Oats Idli', 'Avial', 'Poriyal', 'Kootu', 'Sambar', 'Rasam', 'Vegetable Soup', 'Buttermilk'],
  udhagamandalam: ['Idli', 'Dosa', 'Oats Idli', 'Avial', 'Poriyal', 'Kootu', 'Sambar', 'Rasam', 'Vegetable Soup', 'Buttermilk'],
}

// All distinct district names for the manual selector.
const ALL_DISTRICTS = Object.keys(DISTRICT_FOODS)
  .map(d => d.charAt(0).toUpperCase() + d.slice(1))
  .filter((v, i, arr) => arr.findIndex(x => x.toLowerCase() === v.toLowerCase()) === i)
  .sort()

// Case-insensitive lookup: try the full string, then partial matches.
function foodNamesForLocation(loc: DetectedLocation | string | null): string[] {
  if (!loc) return []
  const candidates = typeof loc === 'string'
    ? [loc.trim().toLowerCase()]
    : [loc.district, loc.city]
        .filter((v): v is string => Boolean(v))
        .map(v => v.trim().toLowerCase())

  for (const c of candidates) {
    if (DISTRICT_FOODS[c]) return DISTRICT_FOODS[c]
    const hit = Object.keys(DISTRICT_FOODS).find(k => c.includes(k) || k.includes(c))
    if (hit) return DISTRICT_FOODS[hit]
  }
  return []
}

export default function LocationFoodDiscovery() {
  const { darkMode } = useTheme()

  // ── DB state ────────────────────────────────────────────────────────────────
  const [allFoods, setAllFoods] = useState<TamilFood[]>([])
  const [dbLoading, setDbLoading] = useState(true)

  // ── Location state ───────────────────────────────────────────────────────────
  const [permission, setPermission] = useState<PermissionState>('idle')
  const [detected, setDetected] = useState<DetectedLocation | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [manualDistrict, setManualDistrict] = useState('')

  // ── Detail panel ─────────────────────────────────────────────────────────────
  const [selectedFood, setSelectedFood] = useState<TamilFood | null>(null)

  // ── Load all foods once ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    supabase
      .from('tamil_nadu_foods')
      .select('id,name,name_ta,category,calories,protein,carbs,fats,fiber,serving_size,description')
      .order('name')
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error) setAllFoods((data || []) as TamilFood[])
        setDbLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // ── Geolocation detection ───────────────────────────────────────────────────
  const detectLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setPermission('error')
      setLocationError('Geolocation is not supported by your browser.')
      return
    }
    setPermission('requesting')
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=en`,
            { headers: { Accept: 'application/json' } }
          )
          const json = await res.json()
          const a = json.address || {}
          setDetected({
            city: a.city || a.town || a.village || a.municipality || null,
            district: a.state_district || a.county || null,
            state: a.state || null,
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          })
          setPermission('granted')
        } catch {
          // Coords obtained but reverse-geocode failed — still mark granted.
          setDetected({ city: null, district: null, state: null, lat: pos.coords.latitude, lon: pos.coords.longitude })
          setPermission('granted')
          setLocationError('Location found, but could not resolve your district name.')
        }
      },
      (err) => {
        setPermission(err.code === err.PERMISSION_DENIED ? 'denied' : 'error')
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Select your district below to continue.'
            : 'Could not detect your location. Select your district below.'
        )
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 }
    )
  }, [])

  // ── Derived data ─────────────────────────────────────────────────────────────
  const activeSource: DetectedLocation | string | null =
    detected ?? (manualDistrict || null)

  const targetFoodNames = foodNamesForLocation(activeSource)

  const foodsNearYou: TamilFood[] = targetFoodNames
    .map(name => allFoods.find(f => f.name === name))
    .filter((f): f is TamilFood => f !== undefined)

  const locationLabel = detected
    ? [detected.city, detected.district, detected.state].filter(Boolean).join(', ') ||
      `${detected.lat.toFixed(3)}, ${detected.lon.toFixed(3)}`
    : manualDistrict
      ? manualDistrict.charAt(0).toUpperCase() + manualDistrict.slice(1)
      : null

  const hasActiveLocation = permission === 'granted' || Boolean(manualDistrict)

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Local Food Discovery
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Detect your location to see traditional foods popular near you.
        </p>
      </div>

      {/* ── Location card ── */}
      <div className={`rounded-xl border p-5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Icon + status text */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`shrink-0 p-3 rounded-xl ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
              {permission === 'requesting'
                ? <Loader2 className="w-5 h-5 text-green-600 dark:text-green-400 animate-spin" />
                : <Navigation className="w-5 h-5 text-green-600 dark:text-green-400" />}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 dark:text-white">
                {permission === 'granted' && locationLabel
                  ? 'Location detected'
                  : permission === 'requesting'
                    ? 'Detecting your location…'
                    : 'Detect your location'}
              </p>
              {permission === 'granted' && locationLabel && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{locationLabel}</span>
                </p>
              )}
              {permission === 'idle' && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  We'll show traditional foods popular near your district.
                </p>
              )}
            </div>
          </div>

          {/* Action button */}
          <div className="shrink-0">
            {permission !== 'granted' ? (
              <button
                onClick={detectLocation}
                disabled={permission === 'requesting' || dbLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {permission === 'requesting'
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Navigation className="w-4 h-4" />}
                {permission === 'requesting' ? 'Detecting…' : 'Allow location'}
              </button>
            ) : (
              <button
                onClick={() => { setDetected(null); setPermission('idle'); setLocationError(null); setManualDistrict('') }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error / denied banner */}
        {locationError && (
          <div className={`mt-4 flex items-start gap-2.5 p-3 rounded-lg text-sm ${
            darkMode ? 'bg-amber-900/25 text-amber-300' : 'bg-amber-50 text-amber-700'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Manual district selector — shown when location not granted */}
        {permission !== 'granted' && (
          <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Or choose your district manually
            </p>
            <div className="relative max-w-xs">
              <select
                value={manualDistrict}
                onChange={e => { setManualDistrict(e.target.value); setSelectedFood(null) }}
                className={`w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg border text-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              >
                <option value="">— Select district —</option>
                {ALL_DISTRICTS.map(d => (
                  <option key={d} value={d.toLowerCase()}>{d}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* ── Foods Near You ── */}
      {hasActiveLocation && (
        <section>
          <div className="flex items-center gap-2 mb-1">
            <Utensils className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Foods Near You
            </h2>
            {foodsNearYou.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {foodsNearYou.length}
              </span>
            )}
          </div>
          {locationLabel && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Traditional foods popular in <span className="font-medium text-green-600 dark:text-green-400">{locationLabel}</span>
            </p>
          )}

          {dbLoading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
              <span className="text-gray-500 dark:text-gray-400 text-sm">Loading foods…</span>
            </div>
          ) : foodsNearYou.length === 0 ? (
            <div className={`rounded-xl border p-8 text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <MapPin className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No foods mapped for this area yet. Try a different district.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {foodsNearYou.map(food => (
                <button
                  key={food.id}
                  onClick={() => setSelectedFood(prev => prev?.id === food.id ? null : food)}
                  className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-100 ${
                    selectedFood?.id === food.id
                      ? darkMode
                        ? 'border-green-500 bg-green-900/20'
                        : 'border-green-500 bg-green-50'
                      : darkMode
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-500'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {/* Name + category */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{food.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                        darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>{food.category}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400 leading-none">{food.calories}</div>
                      <div className="text-xs text-gray-400 mt-0.5">kcal</div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{food.serving_size}</p>

                  {/* Macro pills */}
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <div className={`py-1.5 rounded-lg text-center ${darkMode ? 'bg-rose-900/20' : 'bg-rose-50'}`}>
                      <div className="font-semibold text-rose-600 dark:text-rose-400">{food.protein}g</div>
                      <div className="text-gray-500 dark:text-gray-400">Protein</div>
                    </div>
                    <div className={`py-1.5 rounded-lg text-center ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                      <div className="font-semibold text-blue-600 dark:text-blue-400">{food.carbs}g</div>
                      <div className="text-gray-500 dark:text-gray-400">Carbs</div>
                    </div>
                    <div className={`py-1.5 rounded-lg text-center ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
                      <div className="font-semibold text-amber-600 dark:text-amber-400">{food.fats}g</div>
                      <div className="text-gray-500 dark:text-gray-400">Fats</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Detail panel ── */}
      {selectedFood && (
        <div className={`rounded-xl border p-5 ${
          darkMode ? 'bg-gray-800 border-green-700' : 'bg-white border-green-200'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedFood.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {selectedFood.category} · {selectedFood.serving_size}
              </p>
            </div>
            <button
              onClick={() => setSelectedFood(null)}
              className={`p-2 rounded-lg shrink-0 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition`}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {selectedFood.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {selectedFood.description}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Flame,   label: 'Calories', value: `${selectedFood.calories}`,    unit: 'kcal', cls: 'text-orange-600 dark:text-orange-400', bg: darkMode ? 'bg-orange-900/20' : 'bg-orange-50' },
              { icon: Target,  label: 'Protein',  value: `${selectedFood.protein}g`,   unit: '',     cls: 'text-rose-600 dark:text-rose-400',    bg: darkMode ? 'bg-rose-900/20'   : 'bg-rose-50'   },
              { icon: Droplets,label: 'Carbs',    value: `${selectedFood.carbs}g`,     unit: '',     cls: 'text-blue-600 dark:text-blue-400',    bg: darkMode ? 'bg-blue-900/20'   : 'bg-blue-50'   },
              { icon: Info,    label: 'Fats',     value: `${selectedFood.fats}g`,      unit: '',     cls: 'text-amber-600 dark:text-amber-400',  bg: darkMode ? 'bg-amber-900/20'  : 'bg-amber-50'  },
            ].map(({ icon: Icon, label, value, cls, bg }) => (
              <div key={label} className={`p-3 rounded-xl ${bg}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-4 h-4 ${cls}`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                </div>
                <div className={`text-xl font-bold ${cls}`}>{value}</div>
              </div>
            ))}
          </div>

          {selectedFood.fiber > 0 && (
            <div className={`mt-3 flex items-center justify-between px-4 py-2.5 rounded-lg text-sm ${
              darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <span className="text-gray-500 dark:text-gray-400">Fiber</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedFood.fiber}g</span>
            </div>
          )}
        </div>
      )}

      {/* ── Nearby Healthy Foods ── */}
      {hasActiveLocation && (
        <NearbyHealthyFoods
          allFoods={allFoods}
          activeSource={activeSource}
          locationLabel={locationLabel}
        />
      )}

      {/* ── Empty state when location not yet used ── */}
      {!hasActiveLocation && permission === 'idle' && (
        <div className={`rounded-xl border p-10 text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Allow location access or select a district above to see foods near you.
          </p>
        </div>
      )}

    </div>
  )
}
