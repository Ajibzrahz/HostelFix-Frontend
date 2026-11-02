"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, DoorOpen } from "lucide-react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Hostel, Paginated, Room } from "@/lib/tickets";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

function errorMessage(error: unknown) {
  if (!(error instanceof ApiError))
    return "Something went wrong. Please try again.";
  if (error.code === "HOSTEL_HAS_ROOMS")
    return "This hostel cannot be deleted while it still has rooms.";
  if (error.code === "ROOM_HAS_TICKETS")
    return "This room cannot be deleted while it still has tickets.";
  return error.message;
}

function listItems<T>(value: Paginated<T> | T[] | undefined): T[] {
  return Array.isArray(value) ? value : (value?.data ?? []);
}

export function HostelsPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [editing, setEditing] = useState<Hostel | null>(null);
  const [message, setMessage] = useState("");
  const { data, isLoading } = useQuery({
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
      setMessage("Hostel saved.");
    },
    onError: (error) => setMessage(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/api/v1/hostels/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hostels"] }),
    onError: (error) => setMessage(errorMessage(error)),
  });
  if (user?.role !== "staff" && user?.role !== "admin") return <AccessDenied />;
  const hostels = listItems(data);
  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#087f8c]">
            Facilities
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Hostels</h1>
          <p className="mt-2 text-slate-600">
            Manage the places students live and report issues.
          </p>
        </div>
      </div>
      {user.role === "admin" && (
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            {editing ? "Edit hostel" : "Add a hostel"}
          </h2>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate();
            }}
          >
            <label className="text-sm font-medium text-slate-700">
              Name
              <input
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
                placeholder="Unity Hall"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Location
              <input
                maxLength={200}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
                placeholder="North campus"
              />
            </label>
            <button
              disabled={save.isPending}
              className="self-end rounded-lg bg-[#087f8c] px-4 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              <Plus className="mr-2 inline size-4" aria-hidden="true" />
              {save.isPending ? "Saving..." : editing ? "Update" : "Add hostel"}
            </button>
          </form>
          {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
        </section>
      )}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-950">All hostels</h2>
        </div>
        {isLoading ? (
          <p className="p-5 text-sm text-slate-500">Loading hostels...</p>
        ) : hostels.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">
            No hostels yet. Add the first one above.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {hostels.map((hostel) => (
              <div
                key={hostel.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{hostel.name}</p>
                  <p className="text-sm text-slate-500">
                    {hostel.location || "Location not set"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/hostels/${hostel.id}/rooms`}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    <DoorOpen
                      className="mr-1 inline size-4"
                      aria-hidden="true"
                    />
                    Rooms
                  </Link>
                  <button
                    onClick={() => {
                      setEditing(hostel);
                      setName(hostel.name);
                      setLocation(hostel.location || "");
                    }}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600"
                    aria-label={`Edit ${hostel.name}`}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${hostel.name}?`))
                        remove.mutate(hostel.id);
                    }}
                    className="rounded-lg border border-slate-200 p-2 text-red-600"
                    aria-label={`Delete ${hostel.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
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
  const { data: hostel } = useQuery({
    queryKey: ["hostel", hostelId],
    queryFn: () => api<Hostel>(`/api/v1/hostels/${hostelId}`),
  });
  const { data, isLoading } = useQuery({
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
      setMessage("Room saved.");
    },
    onError: (error) => setMessage(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/api/v1/rooms/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["rooms", hostelId] }),
    onError: (error) => setMessage(errorMessage(error)),
  });
  if (user?.role !== "staff" && user?.role !== "admin") return <AccessDenied />;
  // The endpoint is already scoped to this hostel. Some backend responses omit the hostel field, so do not filter those valid rows out client-side.
  const rooms = listItems(data).filter((room) => {
    const rawRoom = room as Room & {
      hostel_id?: string;
      hostel?: { id?: string } | string;
    };
    const roomHostelId =
      rawRoom.hostel_id ??
      rawRoom.hostel_id ??
      (typeof rawRoom.hostel === "string"
        ? rawRoom.hostel
        : rawRoom.hostel?.id);
    return !roomHostelId || String(roomHostelId) === String(hostelId);
  });
  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <Link href="/hostels" className="text-sm font-semibold text-[#087f8c]">
        ← Back to hostels
      </Link>
      <div className="mb-8 mt-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#087f8c]">
          Rooms
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          {hostel?.name || "Hostel rooms"}
        </h1>
        <p className="mt-2 text-slate-600">
          Add and maintain rooms for this hostel.
        </p>
      </div>
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-950">
          {editing ? "Edit room" : "Add a room"}
        </h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <label className="text-sm font-medium text-slate-700">
            Room number
            <input
              required
              maxLength={20}
              value={roomNumber}
              onChange={(event) => setRoomNumber(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
              placeholder="B12"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Floor
            <input
              required
              min={0}
              step={1}
              type="number"
              value={floor}
              onChange={(event) => setFloor(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
            />
          </label>
          <button
            disabled={save.isPending}
            className="self-end rounded-lg bg-[#087f8c] px-4 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            <Plus className="mr-2 inline size-4" aria-hidden="true" />
            {save.isPending ? "Saving..." : editing ? "Update" : "Add room"}
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 font-semibold text-slate-950">
          Rooms
        </div>
        {isLoading ? (
          <p className="p-5 text-sm text-slate-500">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">
            No rooms yet. Add the first room above.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    Room {room.roomNumber }
                  </p>
                  <p className="text-sm text-slate-500">Floor {room.floor}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(room);
                      setRoomNumber(room.roomNumber);
                      setFloor(String(room.floor ?? 0));
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                  >
                    <Pencil className="mr-1 inline size-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete room ${room.roomNumber}?`))
                        remove.mutate(room.id);
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-red-600"
                  >
                    <Trash2 className="mr-1 inline size-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function AccessDenied() {
  const router = useRouter();
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-2xl font-bold text-slate-950">
        You don&apos;t have access
      </h1>
      <p className="mt-2 text-slate-600">
        This area is restricted to the appropriate facilities team.
      </p>
      <button
        onClick={() => router.push("/tickets")}
        className="mt-6 rounded-lg bg-[#087f8c] px-4 py-2.5 font-semibold text-white"
      >
        Back to tickets
      </button>
    </main>
  );
}
