'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatDate, priorityLabels, roomLabel, statusLabels, type Hostel, type Paginated, type Room, type Ticket, type TicketCategory, type TicketPriority, type TicketStatus } from '@/lib/tickets'

const badgeStyles: Record<string, string> = {
  open: 'bg-slate-100 text-slate-700', assigned: 'bg-violet-100 text-violet-700', in_progress: 'bg-amber-100 text-amber-800', resolved: 'bg-teal-100 text-teal-800', closed: 'bg-emerald-100 text-emerald-800',
  low: 'bg-slate-100 text-slate-600', medium: 'bg-blue-100 text-blue-700', high: 'bg-orange-100 text-orange-800', urgent: 'bg-red-100 text-red-700',
}

function listItems<T>(value: Paginated<T> | T[] | undefined): T[] {
  return Array.isArray(value) ? value : value?.data ?? []
}

export function useRoomLookups() {
  const hostels = useQuery({ queryKey: ['hostels'], queryFn: () => api<Paginated<Hostel> | Hostel[]>('/api/v1/hostels?page=1&limit=50') })
  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => api<Paginated<Room> | Room[]>('/api/v1/rooms?page=1&limit=50') })
  return { hostels: listItems(hostels.data), rooms: listItems(rooms.data), isLoading: hostels.isLoading || rooms.isLoading }
}

export function TicketBadge({ value, kind }: { value: TicketStatus | TicketPriority; kind: 'status' | 'priority' }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyles[value]}`}>{kind === 'status' ? statusLabels[value as TicketStatus] : priorityLabels[value as TicketPriority]}</span>
}

export function TicketCard({ ticket, hostels, rooms }: { ticket: Ticket; hostels: Hostel[]; rooms: Room[] }) {
  return <Link href={`/tickets/${ticket.id}`} className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{ticket.title}</p><p className="mt-1 text-sm text-slate-500">{roomLabel(ticket.room, rooms, hostels)}</p></div>
      <div className="flex shrink-0 gap-2"><TicketBadge value={ticket.status} kind="status" /><TicketBadge value={ticket.priority} kind="priority" /></div>
    </div>
    <div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span className="capitalize">{ticket.category}</span><span>{ticket.isRecurring ? 'Recurring · ' : ''}{formatDate(ticket.createdAt)}</span></div>
  </Link>
}

export const filterOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
]
export const categories: TicketCategory[] = ['plumbing', 'electrical', 'furniture', 'other']
export const priorities: TicketPriority[] = ['low', 'medium', 'high', 'urgent']
