'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TicketForm } from '@/components/ticket-form'

export default function NewTicketPage() {
  return <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8"><Link href="/tickets" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to tickets</Link><div className="mb-6 mt-6"><p className="text-sm font-semibold text-blue-700">New report</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Report a problem</h1><p className="mt-2 text-slate-600">Give the maintenance team enough detail to find and fix it quickly.</p></div><TicketForm /></main>
}
