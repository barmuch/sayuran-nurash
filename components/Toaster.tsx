'use client'
import { useEffect, useState } from 'react'
import type { ToastPayload } from '@/lib/toast'

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastPayload[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<ToastPayload>
      const toast = ce.detail
      setToasts(prev => [...prev, toast])
      const timeout = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, toast.durationMs ?? 3500)
      return () => clearTimeout(timeout)
    }
    window.addEventListener('app:toast', handler as EventListener)
    return () => window.removeEventListener('app:toast', handler as EventListener)
  }, [])

  const color = (type?: string) => {
    switch (type) {
      case 'success': return 'bg-green-600'
      case 'error': return 'bg-red-600'
      case 'warning': return 'bg-yellow-600'
      default: return 'bg-gray-800'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`${color(t.type)} text-white shadow-lg rounded-md px-4 py-3 max-w-xs w-80 transition-all`}> 
          {t.title && <div className="font-semibold text-sm mb-0.5">{t.title}</div>}
          <div className="text-sm leading-snug">{t.message}</div>
        </div>
      ))}
    </div>
  )
}
