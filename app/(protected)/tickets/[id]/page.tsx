'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, MessageSquare, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'
import { TicketBadge, useRoomLookups } from '@/components/ticket-ui'
import { formatDate, roomLabel, statusLabels, type Ticket, type TicketStatus } from '@/lib/tickets'

const nextStatuses: Partial<Record<TicketStatus, TicketStatus>> = { assigned: 'in_progress', in_progress: 'resolved' }

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { hostels, rooms } = useRoomLookups()
  const [comment, setComment] = useState('')
  const ticketQuery = useQuery({ queryKey: ['ticket', params.id], queryFn: () => api<Ticket>(`/api/v1/tickets/${params.id}`) })
  const ticket = ticketQuery.data
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['ticket', params.id] })
  const action = useMutation({ mutationFn: ({ path, method = 'PATCH', body }: { path: string; method?: 'PATCH' | 'POST' | 'DELETE'; body?: unknown }) => api<Ticket | undefined>(path, { method, body }), onSuccess: (_, variables) => { refresh(); queryClient.invalidateQueries({ queryKey: ['tickets'] }); toast.success(variables.method === 'DELETE' ? 'Ticket deleted' : 'Ticket updated') }, onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Could not update this ticket') })

  if (ticketQuery.isLoading) return <main className="mx-auto max-w-4xl px-4 py-10"><div className="h-72 animate-pulse rounded-2xl bg-slate-200" /></main>
  if (ticketQuery.isError || !ticket) return <main className="mx-auto max-w-4xl px-4 py-10"><div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">We could not load this ticket. It may no longer be available.</div></main>

  const canAssign = user?.role === 'staff' || user?.role === 'admin'
  const canManage = canAssign
  const canConfirm = user?.role === 'admin' || ticket.reportedBy === user?.id
  const submitComment = () => { const body = comment.trim(); if (!body) return; action.mutate({ path: `/api/v1/tickets/${ticket.id}/comments`, method: 'POST', body: { body } }); setComment('') }

  return <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <Link href="/tickets" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to tickets</Link>
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap gap-2"><TicketBadge value={ticket.status} kind="status" /><TicketBadge value={ticket.priority} kind="priority" /></div><h1 className="mt-3 text-2xl font-bold text-slate-950">{ticket.title}</h1><p className="mt-2 text-sm text-slate-500">{roomLabel(ticket.room, rooms, hostels)} · Reported {formatDate(ticket.createdAt)}</p></div><span className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">{ticket.category}</span></div>
      <p className="whitespace-pre-wrap py-6 text-sm leading-7 text-slate-700">{ticket.description}</p>
      <div className="grid gap-4 border-y border-slate-100 py-5 text-sm sm:grid-cols-3"><div><p className="text-slate-500">Reported by</p><p className="mt-1 font-medium text-slate-900">{ticket.reportedBy === user?.id ? 'You' : 'A student'}</p></div><div><p className="text-slate-500">Assigned to</p><p className="mt-1 font-medium text-slate-900">{ticket.assignedTo ? (ticket.assignedTo === user?.id ? 'You' : 'Staff member') : 'Unassigned'}</p></div><div><p className="text-slate-500">Last updated</p><p className="mt-1 font-medium text-slate-900">{formatDate(ticket.updatedAt)}</p></div></div>
      <div className="flex flex-wrap gap-2 border-b border-slate-100 py-5">{ticket.status === 'open' && canAssign && <button disabled={action.isPending} onClick={() => action.mutate({ path: `/api/v1/tickets/${ticket.id}/assign`, body: { assignedTo: user?.id } })} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">Assign to me</button>}{nextStatuses[ticket.status] && canManage && <button disabled={action.isPending} onClick={() => action.mutate({ path: `/api/v1/tickets/${ticket.id}/status`, body: { status: nextStatuses[ticket.status] } })} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">{ticket.status === 'assigned' ? 'Start work' : 'Mark resolved'}</button>}{ticket.status === 'resolved' && canConfirm && <><button disabled={action.isPending} onClick={() => action.mutate({ path: `/api/v1/tickets/${ticket.id}/status`, body: { status: 'closed' } })} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">Confirm the fix</button><button disabled={action.isPending} onClick={() => action.mutate({ path: `/api/v1/tickets/${ticket.id}/status`, body: { status: 'in_progress' } })} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60">Not fixed, reopen</button></>}{user?.role === 'admin' && <button disabled={action.isPending} onClick={() => { if (window.confirm('Delete this ticket?')) action.mutate({ path: `/api/v1/tickets/${ticket.id}`, method: 'DELETE' }) }} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"><Trash2 className="mr-2 inline h-4 w-4" />Delete</button>}{(ticket.status === 'open' && (ticket.reportedBy === user?.id || canManage)) && <Link href={`/tickets/${ticket.id}/edit`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Edit details</Link>}</div>
      <section className="py-6"><h2 className="font-semibold text-slate-900">Status timeline</h2><div className="mt-5 space-y-5">{ticket.statusHistory.map((item, index) => <div key={`${item.changedAt}-${index}`} className="relative flex gap-3"><div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-600 ring-4 ring-blue-50" /><div><p className="text-sm font-medium text-slate-900">{item.from ? `${statusLabels[item.from]} → ` : ''}{statusLabels[item.to]}</p><p className="text-xs text-slate-500">{formatDate(item.changedAt)} · {item.changedBy === user?.id ? 'You' : 'Staff member'}</p></div></div>)}</div></section>
      <section className="border-t border-slate-100 pt-6"><h2 className="flex items-center gap-2 font-semibold text-slate-900"><MessageSquare className="h-4 w-4" /> Comments</h2><div className="mt-4 space-y-3">{ticket.comments.length ? ticket.comments.map((item, index) => <div key={`${item.createdAt}-${index}`} className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-700">{item.body}</p><p className="mt-2 text-xs text-slate-500">{item.author === user?.id ? 'You' : 'Staff member'} · {formatDate(item.createdAt)}</p></div>) : <p className="text-sm text-slate-500">No comments yet.</p>}</div><div className="mt-4 flex gap-2"><textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={500} placeholder="Add a comment" className="min-h-20 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" /><button disabled={!comment.trim() || action.isPending} onClick={submitComment} className="self-end rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{action.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Comment'}</button></div></section>
    </div>
  </main>
}
