"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  DoorOpen,
  Building2,
  MapPin,
  Layers3,
  RefreshCw,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { api, ApiError } from "@/lib/api";
import type { Hostel, Paginated, Room } from "@/lib/tickets";
import { useAuth } from "@/components/auth-provider";

function errorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "Something went wrong. Please try again.";
  }

  if (error.code === "HOSTEL_HAS_ROOMS") {
    return "This hostel cannot be deleted while it still has rooms.";
  }

  if (error.code === "ROOM_HAS_TICKETS") {
    return "This room cannot be deleted while it still has tickets.";
  }

  return error.message;
}

function listItems<T>(value: Paginated<T> | T[] | undefined): T[] {
  return Array.isArray(value) ? value : (value?.data ?? []);
}

function AccessDenied() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertCircle className="size-8" />
      </div>

      <h1 className="mt-5 text-2xl font-bold text-slate-950">
        You don't have access
      </h1>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        This area is restricted to the appropriate facilities team.
      </p>

      <button
        onClick={() => router.push("/tickets")}
        className="mt-6 rounded-xl bg-[#087f8c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#066b76]"
      >
        Back to tickets
      </button>
    </main>
  );
}

function Message({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  if (!message) return null;

  const isError =
    message.toLowerCase().includes("cannot") ||
    message.toLowerCase().includes("wrong") ||
    message.toLowerCase().includes("failed") ||
    message.toLowerCase().includes("error") ||
    message.toLowerCase().includes("not found");

  return (
    <div
      role="status"
      className={`mt-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-teal-200 bg-teal-50 text-teal-800"
      }`}
    >
      <div className="flex items-start gap-2">
        {isError ? (
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
        ) : (
          <span className="mt-0.5 size-2 shrink-0 rounded-full bg-teal-600" />
        )}
        <span>{message}</span>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="shrink-0 opacity-70 transition hover:opacity-100"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function LoadingRows({ count = 3 }: { count?: number }) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-5">
          <div className="size-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HostelsPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [editing, setEditing] = useState<Hostel | null>(null);
  const [message, setMessage] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["hostels"],
    queryFn: () =>
      api<Paginated<Hostel> | Hostel[]>("/api/v1/hostels?page=1&limit=50"),
  });

  const save = useMutation({
    mutationFn: () =>
      editing
        ? api(`/api/v1/hostels/${editing.id}`, {
            method: "PATCH",
            body: { name, ...(location ? { location } : {}) },
          })
        : api("/api/v1/hostels", {
            method: "POST",
            body: { name, ...(location ? { location } : {}) },
          }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
      setName("");
      setLocation("");
      setEditing(null);
      setMessage("Hostel saved successfully.");
    },

    onError: (error) => setMessage(errorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/api/v1/hostels/${id}`, { method: "DELETE" }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
      setMessage("Hostel deleted successfully.");
    },

    onError: (error) => setMessage(errorMessage(error)),
  });

  if (user?.role !== "staff" && user?.role !== "admin") {
    return <AccessDenied />;
  }

  const isAdmin = user.role === "admin";
  const hostels = listItems(data);

  function cancelEditing() {
    setEditing(null);
    setName("");
    setLocation("");
    setMessage("");
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      {/* Page heading */}
      <div className="mb-8">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-[#087f8c]">
          <Building2 className="size-6" />
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#087f8c]">
          Facilities management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Hostels
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Manage hostel facilities and access the rooms registered under each
          hostel.
        </p>
      </div>

      {/* Admin hostel form */}
      {isAdmin && (
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-[#087f8c]">
                {editing ? (
                  <Pencil className="size-5" />
                ) : (
                  <Plus className="size-5" />
                )}
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">
                  {editing ? "Edit hostel" : "Add a hostel"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {editing
                    ? "Update the hostel information."
                    : "Register a new hostel facility."}
                </p>
              </div>
            </div>
          </div>

          <form
            className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("");
              save.mutate();
            }}
          >
            <label className="block text-sm font-medium text-slate-700">
              Hostel name
              <input
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#087f8c] focus:bg-white focus:ring-4 focus:ring-teal-50"
                placeholder="e.g. Unity Hall"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Location
              <input
                maxLength={200}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#087f8c] focus:bg-white focus:ring-4 focus:ring-teal-50"
                placeholder="e.g. North campus"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={save.isPending || !name.trim()}
                className="inline-flex items-center justify-center rounded-xl bg-[#087f8c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#066b76] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {save.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 size-4" />
                )}
                {save.isPending
                  ? "Saving..."
                  : editing
                    ? "Update hostel"
                    : "Add hostel"}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="inline-flex items-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <X className="mr-2 size-4" />
                  Cancel
                </button>
              )}
            </div>

            <div className="sm:col-span-2">
              <Message message={message} onDismiss={() => setMessage("")} />
            </div>
          </form>
        </section>
      )}

      {/* Hostel list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-950">All hostels</h2>
            <p className="mt-1 text-xs text-slate-500">
              {isLoading
                ? "Loading facilities..."
                : `${hostels.length} hostel${hostels.length === 1 ? "" : "s"} listed`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <LoadingRows />
        ) : isError ? (
          <div className="px-5 py-12 text-center">
            <AlertCircle className="mx-auto size-8 text-red-500" />
            <p className="mt-3 font-semibold text-slate-900">
              Unable to load hostels
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Something went wrong while retrieving the hostel list.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-xl bg-[#087f8c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#066b76]"
            >
              Try again
            </button>
          </div>
        ) : hostels.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Building2 className="size-7" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No hostels registered
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {isAdmin
                ? "Get started by adding the first hostel facility."
                : "There are currently no hostel facilities to display."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {hostels.map((hostel) => (
              <div
                key={hostel.id}
                className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#087f8c]">
                    <Building2 className="size-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900">
                      {hostel.name}
                    </h3>

                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin className="size-3.5 shrink-0" />
                      {hostel.location || "Location not set"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Link
                    href={`/hostels/${hostel.id}/rooms`}
                    className="inline-flex items-center justify-center rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-[#087f8c] transition hover:border-teal-300 hover:bg-teal-100"
                  >
                    <DoorOpen className="mr-2 size-4" />
                    Manage rooms
                  </Link>

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(hostel);
                          setName(hostel.name);
                          setLocation(hostel.location || "");
                          setMessage("");
                        }}
                        aria-label={`Edit ${hostel.name}`}
                        className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-[#087f8c]"
                      >
                        <Pencil className="size-4" />
                      </button>

                      <button
                        type="button"
                        disabled={remove.isPending}
                        onClick={() => {
                          if (window.confirm(`Delete ${hostel.name}?`)) {
                            setMessage("");
                            remove.mutate(hostel.id);
                          }
                        }}
                        aria-label={`Delete ${hostel.name}`}
                        className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export function RoomsPanel({ hostelId }: { hostelId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState("0");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Room | null>(null);

  const { data: hostel, isLoading: isHostelLoading } = useQuery({
    queryKey: ["hostel", hostelId],
    queryFn: () => api<Hostel>(`/api/v1/hostels/${hostelId}`),
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["rooms", hostelId],
    queryFn: () =>
      api<Paginated<Room> | Room[]>(
        `/api/v1/hostels/${encodeURIComponent(hostelId)}/rooms?page=1&limit=50`,
      ),
  });

  const save = useMutation({
    mutationFn: () =>
      editing
        ? api(`/api/v1/rooms/${editing.id}`, {
            method: "PATCH",
            body: { roomNumber, floor: Number(floor) },
          })
        : api(`/api/v1/hostels/${hostelId}/rooms`, {
            method: "POST",
            body: { roomNumber, floor: Number(floor) },
          }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", hostelId] });
      setRoomNumber("");
      setFloor("0");
      setEditing(null);
      setMessage("Room saved successfully.");
    },

    onError: (error) => setMessage(errorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/api/v1/rooms/${id}`, { method: "DELETE" }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", hostelId] });
      setMessage("Room deleted successfully.");
    },

    onError: (error) => setMessage(errorMessage(error)),
  });

  if (user?.role !== "staff" && user?.role !== "admin") {
    return <AccessDenied />;
  }

  // The endpoint is already scoped to this hostel. Do not filter out
  // valid rooms when the backend omits their hostel relationship.
  const rooms = listItems(data).filter((room) => {
    const rawRoom = room as Room & {
      hostel_id?: string;
      hostel?: { id?: string } | string;
    };

    const roomHostelId =
      rawRoom.hostel_id ??
      (typeof rawRoom.hostel === "string"
        ? rawRoom.hostel
        : rawRoom.hostel?.id);

    return !roomHostelId || String(roomHostelId) === String(hostelId);
  });

  function cancelEditing() {
    setEditing(null);
    setRoomNumber("");
    setFloor("0");
    setMessage("");
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      {/* Breadcrumb */}
      <Link
        href="/hostels"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#087f8c] transition hover:text-[#066b76]"
      >
        <span aria-hidden="true">←</span>
        Back to hostels
      </Link>

      {/* Page heading */}
      <div className="mb-8 mt-6">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-[#087f8c]">
          <DoorOpen className="size-6" />
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#087f8c]">
          Facilities management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {isHostelLoading
            ? "Loading hostel..."
            : hostel?.name || "Hostel rooms"}
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Manage the rooms in this hostel. Add new rooms, update existing
          details, or remove rooms that are no longer in use.
        </p>
      </div>

      {/* Room form */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-[#087f8c]">
              {editing ? (
                <Pencil className="size-5" />
              ) : (
                <Plus className="size-5" />
              )}
            </div>

            <div>
              <h2 className="font-semibold text-slate-950">
                {editing ? "Edit room" : "Add a room"}
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {editing
                  ? "Update the room number or floor."
                  : "Register a room under this hostel."}
              </p>
            </div>
          </div>
        </div>

        <form
          className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("");
            save.mutate();
          }}
        >
          <label className="block text-sm font-medium text-slate-700">
            Room number
            <input
              required
              maxLength={20}
              value={roomNumber}
              onChange={(event) => setRoomNumber(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#087f8c] focus:bg-white focus:ring-4 focus:ring-teal-50"
              placeholder="e.g. B12"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Floor
            <input
              required
              min={0}
              step={1}
              type="number"
              value={floor}
              onChange={(event) => setFloor(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#087f8c] focus:bg-white focus:ring-4 focus:ring-teal-50"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={
                save.isPending ||
                !roomNumber.trim() ||
                floor === "" ||
                !Number.isInteger(Number(floor)) ||
                Number(floor) < 0
              }
              className="inline-flex items-center justify-center rounded-xl bg-[#087f8c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#066b76] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {save.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Plus className="mr-2 size-4" />
              )}
              {save.isPending
                ? "Saving..."
                : editing
                  ? "Update room"
                  : "Add room"}
            </button>

            {editing && (
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X className="mr-2 size-4" />
                Cancel
              </button>
            )}
          </div>

          <div className="sm:col-span-2">
            <Message message={message} onDismiss={() => setMessage("")} />
          </div>
        </form>
      </section>

      {/* Room list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-950">Registered rooms</h2>

            <p className="mt-1 text-xs text-slate-500">
              {isLoading
                ? "Loading rooms..."
                : `${rooms.length} room${rooms.length === 1 ? "" : "s"} in this hostel`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <LoadingRows />
        ) : isError ? (
          <div className="px-5 py-12 text-center">
            <AlertCircle className="mx-auto size-8 text-red-500" />

            <p className="mt-3 font-semibold text-slate-900">
              Unable to load rooms
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Something went wrong while retrieving the rooms for this hostel.
            </p>

            <button
              onClick={() => refetch()}
              className="mt-4 rounded-xl bg-[#087f8c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#066b76]"
            >
              Try again
            </button>
          </div>
        ) : rooms.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <DoorOpen className="size-7" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No rooms registered
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              Add the first room to start managing this hostel's maintenance
              requests.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
            {rooms.map((room) => (
              <article
                key={room.id}
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-[#087f8c]">
                    <DoorOpen className="size-5" />
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Floor {room.floor}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Room number
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-950">
                    {room.roomNumber}
                  </h3>
                </div>

                <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(room);
                      setRoomNumber(room.roomNumber);
                      setFloor(String(room.floor ?? 0));
                      setMessage("");
                    }}
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-[#087f8c]"
                  >
                    <Pencil className="mr-2 size-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(`Delete room ${room.roomNumber}?`)) {
                        setMessage("");
                        remove.mutate(room.id);
                      }
                    }}
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="mr-2 size-3.5" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
