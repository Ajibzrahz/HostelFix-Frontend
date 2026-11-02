'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'
import { categories, priorities, TicketCard, useRoomLookups } from '@/components/ticket-ui'
import type { Paginated, Ticket, TicketStatus } from '@/lib/tickets'

const statuses: TicketStatus[] = ['open', 'assigned', 'in_progress', 'resolved', 'closed']

export default function TicketsPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [category, setCategory] = useState('all')
  const [room, setRoom] = useState('all')
  const [sort, setSort] = useState('-createdAt')
  const { hostels, rooms, isLoading: lookupsLoading } = useRoomLookups()
  const query = useQuery({
    queryKey: ['tickets', page, status, priority, category, room, sort],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '10', sort })
      if (status !== 'all') params.set('status', status)
      if (priority !== 'all') params.set('priority', priority)
      if (category !== 'all') params.set('category', category)
      if (room !== 'all') params.set('room', room)
      return api<Paginated<Ticket>>(`/api/v1/tickets?${params}`)
    },
  })
  const tickets = query.data?.data ?? []
  const title = user?.role === 'student' ? 'My tickets' : 'All tickets'
  const resetPage = (setter: (value: string) => void) => (event: React.ChangeEvent<HTMLSelectElement>) => { setter(event.target.value); setPage(1) }
  const filteredTickets = useMemo(() => tickets, [tickets])

  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-blue-700">Maintenance desk</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{title}</h1><p className="mt-2 text-slate-500">Track reported faults from first report to confirmed fix.</p></div><Link href="/tickets/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"><Plus className="h-4 w-4" /> New ticket</Link></div>
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800"><SlidersHorizontal className="h-4 w-4 text-blue-700" /> Filters</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-sm text-slate-600">Status<select value={status} onChange={resetPage(setStatus)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"><option value="all">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}</select></label><label className="text-sm text-slate-600">Priority<select value={priority} onChange={resetPage(setPriority)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"><option value="all">All priorities</option>{priorities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="text-sm text-slate-600">Category<select value={category} onChange={resetPage(setCategory)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="text-sm text-slate-600">Room<select value={room} onChange={resetPage(setRoom)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"><option value="all">All rooms</option>{rooms.map((item) => <option key={item.id} value={item.id}>{item.roomNumber ?? item.room_number ?? item.id.slice(0, 8)}</option>)}</select></label><label className="text-sm text-slate-600">Sort<select value={sort} onChange={resetPage(setSort)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"><option value="-createdAt">Newest first</option><option value="createdAt">Oldest first</option></select></label></div></section>
    {query.isLoading || lookupsLoading ? <div className="mt-6 grid gap-4"><div className="h-28 animate-pulse rounded-2xl bg-slate-200" /><div className="h-28 animate-pulse rounded-2xl bg-slate-200" /></div> : query.isError ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">We could not load tickets. Please try again.</div> : filteredTickets.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="font-semibold text-slate-900">No tickets yet</h2><p className="mt-2 text-sm text-slate-500">Report your first problem and we&apos;ll help track it.</p></div> : <div className="mt-6 grid gap-4">{filteredTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} hostels={hostels} rooms={rooms} />)}</div>}
    {query.data && query.data.totalPages > 1 && <div className="mt-6 flex items-center justify-between text-sm"><span className="text-slate-500">Page {query.data.page} of {query.data.totalPages}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button disabled={page === query.data.totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div>}
  </main>
}
