'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Server } from 'lucide-react'
import { api } from '@/lib/api'

export function ServerHealth() {
  const [state, setState] = useState<'waking' | 'ready' | 'error'>('waking')

  useEffect(() => {
    let active = true

    api<{ status?: string }>('/backend-health')
      .then(() => active && setState('ready'))
      .catch(() => active && setState('error'))

    return () => {
      active = false
    }
  }, [])

  if (state === 'ready') {
    return (
      <div className="flex items-center gap-2 text-sm text-teal-700" role="status">
        <CheckCircle2 className="size-4" aria-hidden="true" />
        Server is awake and ready
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-700" role="status">
        <Server className="size-4" aria-hidden="true" />
        The server is taking a moment to respond. Refresh to try again.
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-sky-800" role="status" aria-live="polite">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      Waking up the server. This can take up to a minute.
    </div>
  )
}
