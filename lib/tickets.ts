export type TicketStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "plumbing" | "electrical" | "furniture" | "other";

export type Paginated<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Hostel = {
  id: string;
  name: string;
  location?: string;
  hostelName?: string;
};

export type Room = {
  id: string;
  hostel: {
    id: string;
    name: string;
  };
  roomNumber: string;
  floor?: number;
  createdAt: string;
  updatedAt: string;
};

export type TicketComment = {
  author: string;
  body: string;
  createdAt: string;
};

export type StatusHistoryItem = {
  from: TicketStatus | null;
  to: TicketStatus;
  changedBy: string;
  changedAt: string;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  room: string;
  reportedBy: string;
  assignedTo: string | null;
  isRecurring: boolean;
  comments: TicketComment[];
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  confirmedAt: string | null;
};

export const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const priorityLabels: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function roomLabel(roomId: string, rooms: Room[], hostels: Hostel[]) {
  const room = rooms.find((item) => item.id === roomId);

  if (!room) return "Room unavailable";

  const hostel = hostels.find((item) => item.id === room.hostel.id);

  const hostelName = room.hostel.name || hostel?.name || "Hostel";

  return `${hostelName} · Room ${room.roomNumber}`;
}
