import { useTheme } from '../hooks/useTheme'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Toast() {
  const { toastMessage } = useTheme()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (toastMessage) {
      setVisible(true)
    }
  }, [toastMessage])

  if (!toastMessage || !visible) return null

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  }

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
  }

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slideIn">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[toastMessage.type]}`}>
        {icons[toastMessage.type]}
        <span className="text-gray-800 dark:text-gray-100 font-medium">{toastMessage.message}</span>
        <button onClick={() => setVisible(false)} className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
