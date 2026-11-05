"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Home,
  Plus,
  ShieldCheck,
  Ticket as TicketIcon,
  Wrench,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { roomLabel, type Paginated, type Ticket } from "@/lib/tickets";
import { useRoomLookups } from "@/components/ticket-ui";

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

const statusStyles: Record<string, string> = {
  open: "bg-amber-50 text-amber-700 ring-amber-600/20",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-600/20",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  closed: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { rooms, hostels } = useRoomLookups();

  const {
    data: ticketPage,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tickets", "dashboard"],
    queryFn: () =>
      api<Paginated<Ticket>>("/api/v1/tickets?limit=5&sort=-createdAt"),
  });

  const tickets = ticketPage?.data ?? [];

  const openCount = tickets.filter((ticket) => ticket.status === "open").length;

  const activeCount = tickets.filter(
    (ticket) => ticket.status === "in_progress",
  ).length;

  const resolvedCount = tickets.filter((ticket) =>
    ["resolved", "closed"].includes(ticket.status),
  ).length;

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const summaryCards = [
    {
      label: "Tickets shown",
      value: tickets.length,
      description: "Latest five tickets",
      icon: ClipboardList,
      iconStyle: "bg-teal-50 text-teal-700",
    },
    {
      label: "Open",
      value: openCount,
      description: "Awaiting attention",
      icon: Clock3,
      iconStyle: "bg-amber-50 text-amber-700",
    },
    {
      label: "In progress",
      value: activeCount,
      description: "Currently being handled",
      icon: Wrench,
      iconStyle: "bg-blue-50 text-blue-700",
    },
    {
      label: "Completed",
      value: resolvedCount,
      description: "Resolved or closed",
      icon: ShieldCheck,
      iconStyle: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
      {/* Welcome section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#075e68] via-[#087f8c] to-[#0d9b9b] px-6 py-8 text-white shadow-lg sm:px-9 sm:py-10">
        <div className="relative z-10 flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-teal-50">
              <span className="size-2 rounded-full bg-emerald-300" />
              HostelFix Dashboard
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {firstName}.
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-teal-50/90 sm:text-base">
              Stay on top of your hostel maintenance requests. Report a problem
              and follow its progress right here.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/tickets/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#087f8c] shadow-sm transition hover:bg-teal-50"
              >
                <Plus className="size-4" aria-hidden="true" />
                Report an issue
              </Link>

              <Link
                href="/tickets"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                My tickets
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="hidden shrink-0 items-center justify-center sm:flex">
            <div className="flex size-36 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <div className="flex size-24 items-center justify-center rounded-full bg-white/15">
                <Wrench className="size-12 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-40 right-32 size-80 rounded-full border border-white/10" />
      </section>

      {/* Ticket summary */}
      <section className="mt-9" aria-label="Ticket summary">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Ticket overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A snapshot of your latest maintenance requests.
            </p>
          </div>

          <span className="text-xs text-slate-400">
            Counts are based on the latest 5 tickets.
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>

                  <div className={`rounded-xl p-2.5 ${card.iconStyle}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                </div>

                <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                  {isLoading ? "—" : card.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent tickets */}
      <section className="mt-9 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Recent tickets</h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep track of your latest maintenance requests.
            </p>
          </div>

          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#087f8c] transition hover:text-[#066b76]"
          >
            View all tickets
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Loading state */}
          {isLoading && (
            <div className="space-y-4 px-6 py-7">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/5 rounded bg-slate-100" />
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                  </div>
                  <div className="h-6 w-20 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <TicketIcon className="size-5" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Couldn't load your tickets
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Something went wrong while retrieving your maintenance requests.
              </p>

              <button
                onClick={() => refetch()}
                className="mt-4 rounded-lg bg-[#087f8c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#066b76]"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && tickets.length === 0 && (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-[#087f8c]">
                <ClipboardList className="size-7" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No tickets yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Everything starts with reporting an issue. Create your first
                maintenance ticket when something needs attention.
              </p>

              <Link
                href="/tickets/new"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#087f8c] px-4 text-sm font-semibold text-white transition hover:bg-[#066b76]"
              >
                <Plus className="size-4" />
                Create a ticket
              </Link>
            </div>
          )}

          {/* Ticket list */}
          {!isLoading &&
            !isError &&
            tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="group flex flex-col gap-3 px-5 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#087f8c]">
                    <Wrench className="size-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 transition group-hover:text-[#087f8c]">
                      {ticket.title}
                    </p>

                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Home className="size-3.5" aria-hidden="true" />
                        {roomLabel(ticket.room, rooms, hostels)}
                      </span>

                      <span className="text-slate-300">•</span>

                      <span className="capitalize">{ticket.category}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                      statusStyles[ticket.status] ??
                      "bg-slate-100 text-slate-600 ring-slate-500/20"
                    }`}
                  >
                    {statusLabels[ticket.status] ?? ticket.status}
                  </span>

                  <ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#087f8c]" />
                </div>
              </Link>
            ))}
        </div>

        {!isLoading && !isError && tickets.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-center sm:px-6">
            <Link
              href="/tickets"
              className="text-sm font-semibold text-[#087f8c] hover:underline"
            >
              See all your maintenance requests
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
