"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Send,
  Wrench,
} from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { useRoomLookups } from "@/components/ticket-ui";
import type { Ticket, TicketCategory, TicketPriority } from "@/lib/tickets";

const schema = z.object({
  title: z.string().min(3, "Title must contain at least 3 characters").max(100),
  description: z
    .string()
    .min(10, "Please provide at least 10 characters")
    .max(1000),
  category: z.enum(["plumbing", "electrical", "furniture", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  hostel: z.string().min(1, "Choose a hostel"),
  room: z.string().min(1, "Choose a room"),
});

type Values = z.infer<typeof schema>;

type Relation = string | { id?: string; name?: string } | null | undefined;

function getRelationId(value: Relation): string {
  if (typeof value === "string") {
    return value;
  }

  return value?.id ?? "";
}

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#087f8c] focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const labelClass = "text-sm font-semibold text-slate-800";

const errorClass = "mt-1.5 flex items-center gap-1.5 text-xs text-rose-600";

const priorities: {
  value: TicketPriority;
  description: string;
}[] = [
  { value: "low", description: "Minor issue with little impact." },
  { value: "medium", description: "Needs attention but is not urgent." },
  { value: "high", description: "Significantly affects your room." },
  { value: "urgent", description: "Requires immediate attention." },
];

export function TicketForm({ ticket }: { ticket?: Ticket }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { hostels, rooms } = useRoomLookups();

  const ticketRoomId = getRelationId(ticket?.room);

  const [selectedHostel, setSelectedHostel] = useState("");

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: ticket?.title ?? "",
      description: ticket?.description ?? "",
      category: ticket?.category ?? "other",
      priority: ticket?.priority ?? "medium",
      hostel: "",
      room: ticketRoomId,
    },
  });

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = form;

  const description = watch("description") ?? "";
  const selectedPriority = watch("priority");

  // Resolve the hostel after room lookups have loaded.
  useEffect(() => {
    if (!ticket || !ticketRoomId) return;

    const ticketRoom = rooms.find((room) => room.id === ticketRoomId);

    if (!ticketRoom) return;

    const hostelId = getRelationId(ticketRoom.hostel);

    setSelectedHostel(hostelId);

    setValue("hostel", hostelId, {
      shouldValidate: true,
    });
  }, [ticket, ticketRoomId, rooms, setValue]);

  const availableRooms = rooms.filter(
    (room) => getRelationId(room.hostel) === selectedHostel,
  );

  const mutation = useMutation<Ticket, Error, Values>({
    mutationFn: async (values) => {
      const result = ticket
        ? await api<Ticket>(`/api/v1/tickets/${ticket.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              title: values.title,
              description: values.description,
              category: values.category,
              priority: values.priority,
            }),
          })
        : await api<Ticket>("/api/v1/tickets", {
            method: "POST",
            body: JSON.stringify({
              title: values.title,
              description: values.description,
              category: values.category,
              priority: values.priority,
              room: values.room,
            }),
          });

      if (!result) {
        throw new Error("The server returned no ticket data");
      }

      return result;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });

      toast.success(ticket ? "Ticket updated" : "Ticket reported");

      router.push(`/tickets/${data.id}`);
    },

    onError: (error) => {
      toast.error(
        error instanceof ApiError && error.code === "DUPLICATE_TICKET"
          ? "Someone has already reported this problem in this room. It is already being handled."
          : error instanceof ApiError
            ? error.message
            : error.message || "Could not save this ticket",
      );
    },
  });

  const handleHostelChange = (hostelId: string) => {
    setSelectedHostel(hostelId);

    setValue("hostel", hostelId, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("room", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleFormSubmit = (values: Values) => {
    mutation.mutate(values);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Form introduction */}
      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-8">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#087f8c]">
            <Wrench className="size-5" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              {ticket ? "Update maintenance request" : "Ticket information"}
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              {ticket
                ? "Update the details of your maintenance request."
                : "Provide accurate details so the maintenance team can address the problem."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-5 sm:p-8">
        {/* Location section */}
        <section>
          <div className="mb-5 flex items-center gap-2">
            <MapPin className="size-4 text-[#087f8c]" />
            <h3 className="text-sm font-bold text-slate-900">
              Location details
            </h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Hostel */}
            <div>
              <label htmlFor="hostel" className={labelClass}>
                Hostel <span className="text-rose-500">*</span>
              </label>

              <select
                id="hostel"
                {...register("hostel")}
                disabled={Boolean(ticket)}
                onChange={(event) => handleHostelChange(event.target.value)}
                className={inputClass}
              >
                <option value="">Choose a hostel</option>

                {hostels.map((hostel) => (
                  <option key={hostel.id} value={hostel.id}>
                    {hostel.name}
                  </option>
                ))}
              </select>

              {errors.hostel && (
                <p className={errorClass} role="alert">
                  <AlertCircle className="size-3.5" />
                  {errors.hostel.message}
                </p>
              )}

              {!errors.hostel && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Select the hostel where the issue occurred.
                </p>
              )}
            </div>

            {/* Room */}
            <div>
              <label htmlFor="room" className={labelClass}>
                Room <span className="text-rose-500">*</span>
              </label>

              <select
                id="room"
                {...register("room")}
                disabled={!selectedHostel || Boolean(ticket)}
                className={inputClass}
              >
                <option value="">
                  {!selectedHostel ? "Select a hostel first" : "Choose a room"}
                </option>

                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber}
                  </option>
                ))}
              </select>

              {errors.room && (
                <p className={errorClass} role="alert">
                  <AlertCircle className="size-3.5" />
                  {errors.room.message}
                </p>
              )}

              {!errors.room && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Choose the room affected by the problem.
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="border-t border-slate-100" />

        {/* Problem details */}
        <section>
          <div className="mb-5 flex items-center gap-2">
            <FileText className="size-4 text-[#087f8c]" />
            <h3 className="text-sm font-bold text-slate-900">
              Problem details
            </h3>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className={labelClass}>
                Issue title <span className="text-rose-500">*</span>
              </label>

              <input
                id="title"
                {...register("title")}
                maxLength={100}
                className={inputClass}
                placeholder="e.g. Leaking tap in room B12"
              />

              {errors.title && (
                <p className={errorClass} role="alert">
                  <AlertCircle className="size-3.5" />
                  {errors.title.message}
                </p>
              )}

              {!errors.title && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Keep it short and specific.
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="description" className={labelClass}>
                  Description <span className="text-rose-500">*</span>
                </label>

                <span
                  className={`text-xs ${
                    description.length > 1000
                      ? "text-rose-600"
                      : "text-slate-400"
                  }`}
                >
                  {description.length}/1000
                </span>
              </div>

              <textarea
                id="description"
                {...register("description")}
                maxLength={1000}
                rows={5}
                className={`${inputClass} min-h-32 resize-y leading-6`}
                placeholder="Describe what happened, when you noticed it, and any other useful details..."
              />

              {errors.description && (
                <p className={errorClass} role="alert">
                  <AlertCircle className="size-3.5" />
                  {errors.description.message}
                </p>
              )}

              {!errors.description && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Include enough detail to help the maintenance team understand
                  the issue.
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="border-t border-slate-100" />

        {/* Classification */}
        <section>
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="size-4 text-[#087f8c]" />
            <h3 className="text-sm font-bold text-slate-900">Classification</h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Category */}
            <div>
              <label htmlFor="category" className={labelClass}>
                Issue category <span className="text-rose-500">*</span>
              </label>

              <select
                id="category"
                {...register("category")}
                className={inputClass}
              >
                {(
                  [
                    "plumbing",
                    "electrical",
                    "furniture",
                    "other",
                  ] as TicketCategory[]
                ).map((value) => (
                  <option key={value} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-xs text-slate-400">
                Select the type of maintenance problem.
              </p>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className={labelClass}>
                Priority <span className="text-rose-500">*</span>
              </label>

              <select
                id="priority"
                {...register("priority")}
                className={inputClass}
              >
                {priorities.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.value.charAt(0).toUpperCase() + item.value.slice(1)}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-xs text-slate-400">
                {
                  priorities.find((item) => item.value === selectedPriority)
                    ?.description
                }
              </p>
            </div>
          </div>
        </section>

        {/* Submission note */}
        <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#087f8c]" />

          <p className="text-xs leading-5 text-teal-900">
            Please review your details before submitting. Your maintenance
            request will be sent to the team for review and follow-up.
          </p>
        </div>

        {/* Submit */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              router.push(ticket ? `/tickets/${ticket.id}` : "/tickets")
            }
            disabled={mutation.isPending}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087f8c] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#066b76] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {ticket ? "Saving changes..." : "Submitting..."}
              </>
            ) : (
              <>
                <Send className="size-4" />
                {ticket ? "Save changes" : "Submit ticket"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
