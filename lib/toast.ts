export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastPayload {
  id?: string
  type?: ToastType
  title?: string
  message: string
  durationMs?: number
}

export function showToast(message: string, type: ToastType = 'info', options?: Partial<Omit<ToastPayload, 'message' | 'type'>>) {
  if (typeof window === 'undefined') return
  const payload: ToastPayload = {
    id: Math.random().toString(36).slice(2),
    message,
    type,
    durationMs: 3500,
    ...options,
  }
  window.dispatchEvent(new CustomEvent('app:toast', { detail: payload }))
}
