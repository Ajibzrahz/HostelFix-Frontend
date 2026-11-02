'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { TicketForm } from '@/components/ticket-form'
import type { Ticket } from '@/lib/tickets'

export default function EditTicketPage() {
  const params = useParams<{ id: string }>()
  const query = useQuery({ queryKey: ['ticket', params.id], queryFn: () => api<Ticket>(`/api/v1/tickets/${params.id}`) })
  if (query.isLoading) return <main className="mx-auto max-w-3xl px-4 py-10"><div className="h-96 animate-pulse rounded-2xl bg-slate-200" /></main>
  if (!query.data) return <main className="mx-auto max-w-3xl px-4 py-10"><p className="rounded-xl bg-red-50 p-5 text-red-700">This ticket could not be loaded.</p></main>
  return <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8"><Link href={`/tickets/${params.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to ticket</Link><div className="mb-6 mt-6"><p className="text-sm font-semibold text-blue-700">Edit report</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Update ticket details</h1></div><TicketForm ticket={query.data} /></main>
}
