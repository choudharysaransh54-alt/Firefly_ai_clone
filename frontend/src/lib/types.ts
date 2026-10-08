// TypeScript mirrors of the backend's Pydantic schemas (backend/app/schemas.py).

export type MeetingSource = "google_meet" | "zoom" | "teams" | "upload" | "paste";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
}

export interface Participant {
  id: number;
  name: string;
  email: string | null;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Comment {
  id: number;
  segment_id: number;
  body: string;
  author_name: string;
  created_at: string;
}

export interface Segment {
  id: number;
  position: number;
  speaker: string;
  start_time: number;
  end_time: number;
  text: string;
  comments: Comment[];
}

export interface Summary {
  overview: string;
  keywords: string[];
  generated_by: "seed" | "heuristic" | "llm";
}

export interface Chapter {
  id: number;
  title: string;
  start_time: number;
  summary: string;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  text: string;
  assignee: string | null;
  timestamp: number | null;
  is_completed: boolean;
  created_at: string;
}

export interface ActionItemWithMeeting extends ActionItem {
  meeting_title: string;
}

export interface MeetingListItem {
  id: number;
  title: string;
  started_at: string;
  duration_seconds: number;
  source: MeetingSource;
  participants: Participant[];
  tags: Tag[];
  open_action_items: number;
  overview_snippet: string | null;
}

export interface MeetingDetail extends MeetingListItem {
  summary: Summary | null;
  chapters: Chapter[];
  action_items: ActionItem[];
  segments: Segment[];
}

export interface MeetingFilters {
  q?: string;
  participant?: string;
  tag?: string;
  date_from?: string;
  date_to?: string;
  sort?: "newest" | "oldest";
  limit?: number;
}

export interface MeetingCreate {
  title: string;
  started_at?: string;
  participants: string[];
  tags: string[];
  transcript: string;
  filename?: string;
  source: "upload" | "paste";
}

export interface MeetingUpdate {
  title?: string;
  started_at?: string;
  participants?: string[];
  tags?: string[];
}

export interface ActionItemInput {
  text?: string;
  assignee?: string | null;
  timestamp?: number | null;
  is_completed?: boolean;
}

export interface TranscriptQuote {
  id: number;
  speaker: string;
  start_time: number;
  text: string;
}

export interface AskResponse {
  answer: string;
  sources: TranscriptQuote[];
  generated_by: "heuristic" | "llm";
}

export interface SearchResult {
  meeting_id: number;
  meeting_title: string;
  started_at: string;
  title_match: boolean;
  matches: TranscriptQuote[];
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}
