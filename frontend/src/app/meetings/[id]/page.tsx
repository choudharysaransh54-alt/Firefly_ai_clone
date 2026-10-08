import { MeetingDetailView } from "@/components/meeting/MeetingDetailView";

// /meetings/12?t=95 opens meeting 12 with the player at 1:35 (used by search results).
export default async function MeetingPage({ params, searchParams }: PageProps<"/meetings/[id]">) {
  const { id } = await params;
  const { t } = await searchParams;
  const initialTime = Number(t) || 0;
  // The key remounts the view when ?t= changes, so the player starts at the new time.
  return <MeetingDetailView key={`${id}-${initialTime}`} meetingId={Number(id)} initialTime={initialTime} />;
}
