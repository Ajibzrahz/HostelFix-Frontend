
'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldCheck,
  Trash2,
  UserRound,
  Wrench,
} from 'lucide-react'
import { toast } from 'sonner'

import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'
import { TicketBadge, useRoomLookups } from '@/components/ticket-ui'
import {
  formatDate,
  roomLabel,
  statusLabels,
  type Ticket,
  type TicketStatus,
} from '@/lib/tickets'

const nextStatuses: Partial<Record<TicketStatus, TicketStatus>> = {
  assigned: 'in_progress',
  in_progress: 'resolved',
}

const statusDescriptions: Record<TicketStatus, string> = {
  open: 'Your request has been submitted and is waiting for attention.',
  assigned: 'A maintenance staff member has taken responsibility for this request.',
  in_progress: 'The maintenance team is currently working on this issue.',
  resolved: 'The issue has been marked as resolved. Please confirm the fix.',
  closed: 'This maintenance request has been completed and closed.',
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { hostels, rooms } = useRoomLookups()

  const [comment, setComment] = useState('')

  const ticketQuery = useQuery({
    queryKey: ['ticket', params.id],
    queryFn: () => api<Ticket>(`/api/v1/tickets/${params.id}`),
  })

  const ticket = ticketQuery.data

  const action = useMutation<
    Ticket | undefined,
    Error,
    {
      path: string
      method?: 'PATCH' | 'POST' | 'DELETE'
      body?: unknown
    }
  >({
    mutationFn: ({ path, method = 'PATCH', body }) =>
      api<Ticket | undefined>(path, { method, body }),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['tickets'],
      })

      if (variables.method === 'DELETE') {
        toast.success('Ticket deleted')
        router.push('/tickets')
        return
      }

      await queryClient.invalidateQueries({
        queryKey: ['ticket', params.id],
      })

      if (variables.path.endsWith('/comments')) {
        setComment('')
        toast.success('Comment added')
      } else {
        toast.success('Ticket updated')
      }
    },

    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : error.message || 'Could not complete this action',
      )
    },
  })

  if (ticketQuery.isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

        <div className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-24 animate-pulse rounded bg-slate-100" />
          <div className="h-32 animate-pulse rounded bg-slate-100" />
        </div>
      </main>
    )
  }

  if (ticketQuery.isError || !ticket) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#087f8c]"
        >
          <ArrowLeft className="size-4" />
          Back to tickets
        </Link>

        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 text-rose-600" />

            <div>
              <h2 className="font-semibold text-rose-900">
                Unable to load ticket
              </h2>

              <p className="mt-1 text-sm text-rose-700">
                This ticket may no longer be available, or something went wrong.
              </p>

              <button
                onClick={() => ticketQuery.refetch()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              >
                <RotateCcw className="size-4" />
                Try again
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const canAssign = user?.role === 'staff' || user?.role === 'admin'
  const canManage = canAssign

  const canConfirm =
    user?.role === 'admin' || ticket.reportedBy === user?.id

  const submitComment = () => {
    const body = comment.trim()

    if (!body || action.isPending) return

    action.mutate({
      path: `/api/v1/tickets/${ticket.id}/comments`,
      method: 'POST',
      body: { body },
    })
  }

  const updateStatus = (status: TicketStatus) => {
    action.mutate({
      path: `/api/v1/tickets/${ticket.id}/status`,
      body: { status },
    })
  }

  const deleteTicket = () => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      action.mutate({
        path: `/api/v1/tickets/${ticket.id}`,
        method: 'DELETE',
      })
    }
  }

  const history = ticket.statusHistory ?? []
  const comments = ticket.comments ?? []

  const categoryLabel =
    ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Back navigation */}
      <Link
        href="/tickets"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#087f8c]"
      >
        <ArrowLeft className="size-4" />
        Back to tickets
      </Link>

      {/* Ticket header */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 bg-slate-50/70 p-5 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <TicketBadge value={ticket.status} kind="status" />
                <TicketBadge value={ticket.priority} kind="priority" />

                {ticket.isRecurring && (
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                    Recurring issue
                  </span>
                )}
              </div>

              <h1 className="mt-4 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {ticket.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {roomLabel(ticket.room, rooms, hostels)}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4" />
                  Reported {formatDate(ticket.createdAt)}
                </span>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              <Wrench className="size-3.5 text-[#087f8c]" />
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Status overview */}
        <div className="border-b border-slate-100 p-5 sm:p-8">
          <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#087f8c]" />

            <div>
              <p className="text-sm font-semibold text-teal-950">
                {statusLabels[ticket.status]}
              </p>

              <p className="mt-1 text-sm leading-6 text-teal-800">
                {statusDescriptions[ticket.status]}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="border-b border-slate-100 p-5 sm:p-8">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-[#087f8c]" />
            <h2 className="font-semibold text-slate-900">
              Problem description
            </h2>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {ticket.description}
          </p>
        </div>

        {/* Ticket information */}
        <div className="grid gap-5 border-b border-slate-100 p-5 sm:grid-cols-3 sm:p-8">
          <div>
            <div className="flex items-center gap-2 text-slate-400">
              <UserRound className="size-4" />
              <p className="text-xs font-medium uppercase tracking-wide">
                Reported by
              </p>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              {ticket.reportedBy === user?.id ? 'You' : 'A student'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-400">
              <Wrench className="size-4" />
              <p className="text-xs font-medium uppercase tracking-wide">
                Assigned to
              </p>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              {ticket.assignedTo
                ? ticket.assignedTo === user?.id
                  ? 'You'
                  : 'Staff member'
                : 'Unassigned'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock3 className="size-4" />
              <p className="text-xs font-medium uppercase tracking-wide">
                Last updated
              </p>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatDate(ticket.updatedAt)}
            </p>
          </div>
        </div>

        {/* Available actions */}
        <div className="border-b border-slate-100 p-5 sm:p-8">
          <div className="mb-4">
            <h2 className="font-semibold text-slate-900">
              Available actions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Actions available depend on your role and the ticket status.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            {ticket.status === 'open' && canAssign && (
              <button
                disabled={action.isPending}
                onClick={() =>
                  action.mutate({
                    path: `/api/v1/tickets/${ticket.id}/assign`,
                    body: { assignedTo: user?.id },
                  })
                }
                className="rounded-xl bg-[#087f8c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#066b76] disabled:opacity-50"
              >
                Assign to me
              </button>
            )}

            {nextStatuses[ticket.status] && canManage && (
              <button
                disabled={action.isPending}
                onClick={() => updateStatus(nextStatuses[ticket.status]!)}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {ticket.status === 'assigned' ? 'Start work' : 'Mark as resolved'}
              </button>
            )}

            {ticket.status === 'resolved' && canConfirm && (
              <>
                <button
                  disabled={action.isPending}
                  onClick={() => updateStatus('closed')}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="size-4" />
                  Confirm the fix
                </button>

                <button
                  disabled={action.isPending}
                  onClick={() => updateStatus('in_progress')}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <RotateCcw className="size-4" />
                  Not fixed, reopen
                </button>
              </>
            )}

            {(ticket.status === 'open' &&
              (ticket.reportedBy === user?.id || canManage)) && (
              <Link
                href={`/tickets/${ticket.id}/edit`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Edit details
              </Link>
            )}

            {user?.role === 'admin' && (
              <button
                disabled={action.isPending}
                onClick={deleteTicket}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
              >
                <Trash2 className="size-4" />
                Delete ticket
              </button>
            )}
          </div>
        </div>

        {/* Status timeline */}
        <section className="border-b border-slate-100 p-5 sm:p-8">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-[#087f8c]" />
            <h2 className="font-semibold text-slate-900">
              Status timeline
            </h2>
          </div>

          {history.length > 0 ? (
            <div className="mt-6 space-y-6">
              {history.map((item, index) => (
                <div
                  key={`${item.changedAt}-${index}`}
                  className="relative flex gap-4"
                >
                  {index !== history.length - 1 && (
                    <div className="absolute left-[7px] top-4 h-full w-px bg-slate-200" />
                  )}

                  <div className="relative mt-1 size-4 shrink-0 rounded-full border-[3px] border-teal-100 bg-[#087f8c]" />

                  <div className="min-w-0 pb-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.from
                        ? `${statusLabels[item.from]} → `
                        : ''}
                      {statusLabels[item.to]}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(item.changedAt)}
                      {' · '}
                      {item.changedBy === user?.id ? 'You' : 'Staff member'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No status updates have been recorded yet.
            </p>
          )}
        </section>

        {/* Comments */}
        <section className="p-5 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-[#087f8c]" />
              <h2 className="font-semibold text-slate-900">
                Comments
              </h2>
            </div>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {comments.length}
            </span>
          </div>

          {/* Existing comments */}
          <div className="mt-5 space-y-3">
            {comments.length > 0 ? (
              comments.map((item, index) => (
                <div
                  key={`${item.createdAt}-${index}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {item.body}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <UserRound className="size-3.5" />
                    <span>
                      {item.author === user?.id ? 'You' : 'Staff member'}
                    </span>
                    <span>·</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                <MessageSquare className="mx-auto size-6 text-slate-300" />

                <p className="mt-2 text-sm font-medium text-slate-600">
                  No comments yet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Start a conversation about this maintenance request.
                </p>
              </div>
            )}
          </div>

          {/* Add comment */}
          <div className="mt-5">
            <label
              htmlFor="ticket-comment"
              className="text-sm font-semibold text-slate-800"
            >
              Add a comment
            </label>

            <textarea
              id="ticket-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Write an update or ask a question..."
              className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#087f8c] focus:ring-2 focus:ring-teal-100"
            />

            <div className="mt-2 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-xs text-slate-400">
                {comment.length}/500 characters
              </p>

              <button
                type="button"
                disabled={!comment.trim() || action.isPending}
                onClick={submitComment}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087f8c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#066b76] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {action.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Post comment
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
