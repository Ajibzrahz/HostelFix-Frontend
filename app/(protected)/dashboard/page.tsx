'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ClipboardList, Clock3, Home, Plus, ShieldCheck, Wrench } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { api } from '@/lib/api'
import { roomLabel, type Paginated, type Ticket } from '@/lib/tickets'
import { useRoomLookups } from '@/components/ticket-ui'

const statusLabels: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { rooms, hostels } = useRoomLookups()
  const { data: ticketPage, isLoading } = useQuery({
    queryKey: ['tickets', 'dashboard'],
    queryFn: () => api<Paginated<Ticket>>('/api/v1/tickets?limit=5&sort=-createdAt'),
  })
  const tickets = ticketPage?.data ?? []

  const openCount = tickets.filter((ticket) => ticket.status === 'open').length
  const activeCount = tickets.filter((ticket) => ticket.status === 'in_progress').length
  const resolvedCount = tickets.filter((ticket) => ['resolved', 'closed'].includes(ticket.status)).length

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-[#087f8c]">Overview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Good to see you, {user?.name?.split(' ')[0] ?? 'there'}.</h1>
          <p className="mt-2 text-sm text-slate-500">Keep your hostel maintenance moving in the right direction.</p>
        </div>
        <Link href="/tickets/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#087f8c] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#066b76]">
          <Plus className="size-4" aria-hidden="true" /> New ticket
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Ticket summary">
        {[
          { label: 'Total tickets', value: tickets.length, icon: ClipboardList, tone: 'bg-[#ecfbf9] text-[#087f8c]' },
          { label: 'Open', value: openCount, icon: Clock3, tone: 'bg-amber-50 text-amber-700' },
          { label: 'In progress', value: activeCount, icon: Wrench, tone: 'bg-blue-50 text-blue-700' },
          { label: 'Resolved', value: resolvedCount, icon: ShieldCheck, tone: 'bg-emerald-50 text-emerald-700' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <div className={`rounded-xl p-2.5 ${tone}`}><Icon className="size-4" aria-hidden="true" /></div>
            </div>
            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">{isLoading ? '—' : value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-950">Recent tickets</h2>
            <p className="mt-1 text-sm text-slate-500">The latest maintenance activity in your view.</p>
          </div>
          <Link href="/tickets" className="inline-flex items-center gap-1 text-sm font-semibold text-[#087f8c] hover:underline">View all <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        <div className="divide-y divide-slate-100">
          {!isLoading && tickets.length === 0 ? <p className="px-6 py-12 text-center text-sm text-slate-500">No tickets yet. Create the first one when something needs attention.</p> : tickets.map((ticket) => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{ticket.title}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-slate-500"><Home className="size-3.5" aria-hidden="true" /> {roomLabel(ticket.room, rooms, hostels)} · {ticket.category}</p>
              </div>
              <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{statusLabels[ticket.status] ?? ticket.status}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
