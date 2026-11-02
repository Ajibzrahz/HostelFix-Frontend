'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import { useRoomLookups } from '@/components/ticket-ui'
import type { Ticket, TicketCategory, TicketPriority, Paginated, Room, Hostel } from '@/lib/tickets'

const schema = z.object({ title: z.string().min(3).max(100), description: z.string().min(10).max(1000), category: z.enum(['plumbing', 'electrical', 'furniture', 'other']), priority: z.enum(['low', 'medium', 'high', 'urgent']), hostel: z.string().min(1, 'Choose a hostel'), room: z.string().min(1, 'Choose a room') })
type Values = z.infer<typeof schema>

export function TicketForm({ ticket }: { ticket?: Ticket }) {
  const router = useRouter(); const queryClient = useQueryClient(); const { hostels, rooms } = useRoomLookups(); const [selectedHostel, setSelectedHostel] = useState(ticket ? rooms.find((room) => room.id === ticket.room)?.hostel ?? '' : '')
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: ticket?.title ?? '', description: ticket?.description ?? '', category: ticket?.category ?? 'other', priority: ticket?.priority ?? 'medium', hostel: selectedHostel, room: ticket?.room ?? '' } })
  const availableRooms = rooms.filter((room) => room.hostel === selectedHostel)
  const mutation = useMutation({ mutationFn: (values: Values) => ticket ? api<Ticket>(`/api/v1/tickets/${ticket.id}`, { method: 'PATCH', body: JSON.stringify({ title: values.title, description: values.description, category: values.category, priority: values.priority }) }) : api<Ticket>('/api/v1/tickets', { method: 'POST', body: JSON.stringify({ title: values.title, description: values.description, category: values.category, priority: values.priority, room: values.room }) }), onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ['tickets'] }); toast.success(ticket ? 'Ticket updated' : 'Ticket reported'); router.push(`/tickets/${data?.id ?? ticket?.id}`) }, onError: (error) => toast.error(error instanceof ApiError && error.code === 'DUPLICATE_TICKET' ? 'Someone has already reported this problem in this room. It is already being handled.' : error instanceof ApiError ? error.message : 'Could not save this ticket') })
  return <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <div><label className="text-sm font-semibold text-slate-800">Hostel</label><select {...form.register('hostel')} disabled={Boolean(ticket)} onChange={(event) => { setSelectedHostel(event.target.value); form.setValue('hostel', event.target.value); form.setValue('room', '') }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Choose a hostel</option>{hostels.map((hostel) => <option key={hostel.id} value={hostel.id}>{hostel.name}</option>)}</select><p className="mt-1 text-xs text-red-600">{form.formState.errors.hostel?.message}</p></div>
    <div><label className="text-sm font-semibold text-slate-800">Room</label><select {...form.register('room')} disabled={!selectedHostel || Boolean(ticket)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Choose a room</option>{availableRooms.map((room) => <option key={room.id} value={room.id}>{room.roomNumber}</option>)}</select><p className="mt-1 text-xs text-red-600">{form.formState.errors.room?.message}</p></div>
    <div><label className="text-sm font-semibold text-slate-800">Title</label><input {...form.register('title')} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Leaking tap in room B12" /><p className="mt-1 text-xs text-red-600">{form.formState.errors.title?.message}</p></div>
    <div><div className="flex justify-between"><label className="text-sm font-semibold text-slate-800">Description</label><span className="text-xs text-slate-500">{form.watch('description').length}/1000</span></div><textarea {...form.register('description')} className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Tell us what is broken and where." /><p className="mt-1 text-xs text-red-600">{form.formState.errors.description?.message}</p></div>
    <div className="grid gap-5 sm:grid-cols-2"><div><label className="text-sm font-semibold text-slate-800">Category</label><select {...form.register('category')} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">{(['plumbing', 'electrical', 'furniture', 'other'] as TicketCategory[]).map((value) => <option key={value}>{value}</option>)}</select></div><div><label className="text-sm font-semibold text-slate-800">Priority</label><select {...form.register('priority')} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">{(['low', 'medium', 'high', 'urgent'] as TicketPriority[]).map((value) => <option key={value}>{value}</option>)}</select></div></div>
    <button disabled={mutation.isPending} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{mutation.isPending ? 'Saving…' : ticket ? 'Save changes' : 'Report problem'}</button>
  </form>
}
