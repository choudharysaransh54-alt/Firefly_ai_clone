// A tiny typed client for the FastAPI backend. Every network call in the app goes through here.
import type {
  ActionItem,
  ActionItemInput,
  ActionItemWithMeeting,
  AskResponse,
  Comment,
  MeetingCreate,
  MeetingDetail,
  MeetingFilters,
  MeetingListItem,
  MeetingUpdate,
  Participant,
  SearchResponse,
  Tag,
  User,
} from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("fireflies_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem("fireflies_token");
      window.location.href = "/login";
    }
    const body = await response.json().catch(() => null);
    throw new Error(readErrorMessage(body) ?? `Request failed (${response.status})`);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}

/** FastAPI errors look like {detail: "..."} or {detail: [{msg: "..."}]} for validation errors. */
function readErrorMessage(body: unknown): string | null {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  return null;
}

function toQueryString(params: object): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const api = {
  login: async (credentials?: { email?: string; password?: string }) => {
    const res = await request<{ token: string; user: User; status: string }>("/auth/login", json("POST", credentials ?? {}));
    if (typeof window !== "undefined" && res?.token) {
      localStorage.setItem("fireflies_token", res.token);
    }
    return res;
  },

  logout: async () => {
    try {
      await request("/auth/logout", json("POST", {}));
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("fireflies_token");
      }
    }
  },

  getMe: () => request<User>("/me"),
  updateMe: (data: Partial<Pick<User, "name" | "email" | "avatar_url">>) =>
    request<User>("/me", json("PATCH", data)),

  listMeetings: (filters: MeetingFilters = {}) =>
    request<MeetingListItem[]>(`/meetings${toQueryString(filters)}`),
  getMeeting: (id: number) => request<MeetingDetail>(`/meetings/${id}`),
  createMeeting: (data: MeetingCreate) => request<MeetingDetail>("/meetings", json("POST", data)),
  updateMeeting: (id: number, data: MeetingUpdate) =>
    request<MeetingDetail>(`/meetings/${id}`, json("PATCH", data)),
  deleteMeeting: (id: number) => request<void>(`/meetings/${id}`, json("DELETE")),
  regenerateSummary: (id: number) => request<MeetingDetail>(`/meetings/${id}/summary`, json("POST")),
  askQuestion: (id: number, question: string) =>
    request<AskResponse>(`/meetings/${id}/ask`, json("POST", { question })),
  exportUrl: (id: number, format: "md" | "txt") => `${API_URL}/api/meetings/${id}/export?format=${format}`,

  listActionItems: (status: "open" | "completed" | "all" = "open") =>
    request<ActionItemWithMeeting[]>(`/action-items?status=${status}`),
  createActionItem: (meetingId: number, data: ActionItemInput) =>
    request<ActionItem>(`/meetings/${meetingId}/action-items`, json("POST", data)),
  updateActionItem: (id: number, data: ActionItemInput) =>
    request<ActionItem>(`/action-items/${id}`, json("PATCH", data)),
  deleteActionItem: (id: number) => request<void>(`/action-items/${id}`, json("DELETE")),

  addComment: (segmentId: number, body: string) =>
    request<Comment>(`/segments/${segmentId}/comments`, json("POST", { body })),
  deleteComment: (id: number) => request<void>(`/comments/${id}`, json("DELETE")),

  search: (q: string) => request<SearchResponse>(`/search${toQueryString({ q })}`),
  listParticipants: () => request<Participant[]>("/participants"),
  listTags: () => request<Tag[]>("/tags"),
};

/** Downloads the exported notes. The backend sends Content-Disposition: attachment, so the page stays put. */
export function downloadMeetingExport(id: number, format: "md" | "txt") {
  const link = document.createElement("a");
  link.href = api.exportUrl(id, format);
  link.click();
}
