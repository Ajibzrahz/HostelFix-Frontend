"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownUp,
  ArrowRight,
  ClipboardList,
  Filter,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Ticket as TicketIcon,
} from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import {
  categories,
  priorities,
  TicketCard,
  useRoomLookups,
} from "@/components/ticket-ui";
import type { Paginated, Ticket, TicketStatus } from "@/lib/tickets";

const statuses: TicketStatus[] = [
  "open",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
];

const statusLabels: Record<string, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

export default function TicketsPage() {
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [room, setRoom] = useState("all");
  const [sort, setSort] = useState("-createdAt");

  const { hostels, rooms, isLoading: lookupsLoading } = useRoomLookups();

  const query = useQuery({
    queryKey: ["tickets", page, status, priority, category, room, sort],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        sort,
      });

      if (status !== "all") params.set("status", status);
      if (priority !== "all") params.set("priority", priority);
      if (category !== "all") params.set("category", category);
      if (room !== "all") params.set("room", room);

      return api<Paginated<Ticket>>(`/api/v1/tickets?${params}`);
    },
  });

  const tickets = query.data?.data ?? [];

  const title = user?.role === "student" ? "My tickets" : "All tickets";

  const hasFilters =
    status !== "all" ||
    priority !== "all" ||
    category !== "all" ||
    room !== "all";

  const resetFilters = () => {
    setStatus("all");
    setPriority("all");
    setCategory("all");
    setRoom("all");
    setSort("-createdAt");
    setPage(1);
  };

  const handleFilterChange = (
    setter: (value: string) => void,
    value: string,
  ) => {
    setter(value);
    setPage(1);
  };

  const isLoading = query.isLoading || lookupsLoading;

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-[#087f8c]">
            <ClipboardList className="size-3.5" />
            Maintenance desk
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {title}
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Track maintenance requests, monitor their progress, and stay updated
            from the first report to the final fix.
          </p>
        </div>

        <Link
          href="/tickets/new"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#087f8c] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#066b76]"
        >
          <Plus className="size-4" />
          New ticket
        </Link>
      </section>

      {/* Filter section */}
      <section className="mt-9 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-[#087f8c]">
              <SlidersHorizontal className="size-4" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Filter tickets
              </h2>
              <p className="text-xs text-slate-500">
                Narrow down your maintenance requests.
              </p>
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#087f8c] hover:text-[#066b76]"
            >
              <RotateCcw className="size-3.5" />
              Clear filters
            </button>
          )}
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:p-6">
          {/* Status */}
          <label className="block text-sm font-medium text-slate-700">
            Status
            <select
              value={status}
              onChange={(event) =>
                handleFilterChange(setStatus, event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#087f8c] focus:ring-2 focus:ring-teal-100"
            >
              <option value="all">All statuses</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {statusLabels[item]}
                </option>
              ))}
            </select>
          </label>

          {/* Priority */}
          <label className="block text-sm font-medium text-slate-700">
            Priority
            <select
              value={priority}
              onChange={(event) =>
                handleFilterChange(setPriority, event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#087f8c] focus:ring-2 focus:ring-teal-100"
            >
              <option value="all">All priorities</option>
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>
          </label>

          {/* Category */}
          <label className="block text-sm font-medium text-slate-700">
            Category
            <select
              value={category}
              onChange={(event) =>
                handleFilterChange(setCategory, event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#087f8c] focus:ring-2 focus:ring-teal-100"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>
          </label>

          {/* Room */}
          <label className="block text-sm font-medium text-slate-700">
            Room
            <select
              value={room}
              onChange={(event) =>
                handleFilterChange(setRoom, event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#087f8c] focus:ring-2 focus:ring-teal-100"
            >
              <option value="all">All rooms</option>
              {rooms.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.roomNumber || item.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>

          {/* Sort */}
          <label className="block text-sm font-medium text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <ArrowDownUp className="size-3.5" />
              Sort by
            </span>
            <select
              value={sort}
              onChange={(event) =>
                handleFilterChange(setSort, event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#087f8c] focus:ring-2 focus:ring-teal-100"
            >
              <option value="-createdAt">Newest first</option>
              <option value="createdAt">Oldest first</option>
            </select>
          </label>
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
            <Filter className="size-3.5 text-slate-400" />

            <span className="text-xs font-medium text-slate-500">
              Active filters:
            </span>

            {status !== "all" && (
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
                {statusLabels[status]}
              </span>
            )}

            {priority !== "all" && (
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
                {priority}
              </span>
            )}

            {category !== "all" && (
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
                {category}
              </span>
            )}

            {room !== "all" && (
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
                Room selected
              </span>
            )}
          </div>
        )}
      </section>

      {/* Ticket list heading */}
      <section className="mt-9">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Maintenance requests
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {query.data
                ? `${tickets.length} tickets on this page`
                : "Your reported maintenance requests."}
            </p>
          </div>

          {query.data && (
            <span className="text-xs font-medium text-slate-400">
              Showing page {query.data.page} of {query.data.totalPages}
            </span>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && query.isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-white text-rose-600">
              <TicketIcon className="size-5" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              Couldn't load tickets
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Something went wrong while retrieving your maintenance requests.
            </p>

            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-5 rounded-xl bg-[#087f8c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#066b76]"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !query.isError && tickets.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-[#087f8c]">
              <ClipboardList className="size-7" />
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              {hasFilters ? "No matching tickets" : "No tickets yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {hasFilters
                ? "We couldn't find tickets matching your selected filters. Try changing or clearing them."
                : "When you report a maintenance problem, your tickets will appear here."}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw className="size-4" />
                Clear filters
              </button>
            ) : (
              <Link
                href="/tickets/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#087f8c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#066b76]"
              >
                <Plus className="size-4" />
                Create your first ticket
              </Link>
            )}
          </div>
        )}

        {/* Tickets */}
        {!isLoading && !query.isError && tickets.length > 0 && (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                hostels={hostels}
                rooms={rooms}
              />
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {!isLoading &&
        !query.isError &&
        query.data &&
        query.data.totalPages > 1 && (
          <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-900">
                {query.data.page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {query.data.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={page >= query.data.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#087f8c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#066b76] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}
    </main>
  );
}
