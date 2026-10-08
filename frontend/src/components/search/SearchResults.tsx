"use client";

import { Search, SearchX } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { formatDate, formatTimestamp, pluralize } from "@/lib/format";
import { Avatar } from "../ui/Avatar";
import { Highlight } from "../ui/Highlight";
import { EmptyState, ErrorState, Spinner } from "../ui/States";

/** Global search across every meeting's title and transcript. The query lives in the URL (?q=). */
export function SearchResults() {
  const query = useSearchParams().get("q")?.trim() ?? "";
  // key={query} resets the input when the URL changes (e.g. a new search from the top bar).
  return <SearchPageContent key={query} query={query} />;
}

function SearchPageContent({ query }: { query: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState(query);
  const { data, error, isLoading } = useSWR(query.length >= 2 ? ["search", query] : null, () => api.search(query));

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (draft.trim().length >= 2) router.push(`/search?q=${encodeURIComponent(draft.trim())}`);
  }

  const totalMatches = data?.results.reduce((sum, r) => sum + r.matches.length, 0) ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
      <h1 className="text-2xl font-semibold">Search</h1>
      <p className="mt-1 text-sm text-fg-muted">Find any moment in any meeting — searches titles and every transcript.</p>

      <form onSubmit={onSubmit} className="relative mt-5">
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="e.g. pricing, SSO, Okta, launch date…"
          aria-label="Search query"
          className="h-12 w-full rounded-xl border border-line bg-surface pl-11 pr-4 text-base outline-none placeholder:text-fg-subtle focus:border-brand"
        />
      </form>

      <div className="mt-6">
        {query.length < 2 ? (
          <EmptyState icon={Search} title="Search your meetings" description="Type at least 2 characters and press Enter." />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : isLoading || !data ? (
          <Spinner label="Searching…" />
        ) : data.results.length === 0 ? (
          <EmptyState icon={SearchX} title={`No results for “${query}”`} description="Try another keyword." />
        ) : (
          <>
            <p className="mb-3 text-sm text-fg-muted">
              {pluralize(totalMatches, "transcript match", "transcript matches")} in {pluralize(data.results.length, "meeting")}
            </p>
            <div className="space-y-4">
              {data.results.map((result) => (
                <section key={result.meeting_id} className="overflow-hidden rounded-2xl border border-line bg-surface">
                  <Link href={`/meetings/${result.meeting_id}`} className="flex items-center justify-between gap-3 border-b border-line px-5 py-3 hover:bg-surface-hover">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        <Highlight text={result.meeting_title} query={query} />
                      </p>
                      <p className="text-xs text-fg-muted">{formatDate(result.started_at)}</p>
                    </div>
                    {result.title_match && <span className="shrink-0 rounded-md bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-text">Title match</span>}
                  </Link>
                  <ul className="divide-y divide-line">
                    {result.matches.map((match) => (
                      <li key={match.id}>
                        <Link
                          href={`/meetings/${result.meeting_id}?t=${match.start_time}`}
                          className="flex gap-3 px-5 py-3 hover:bg-surface-hover"
                        >
                          <Avatar name={match.speaker} size="sm" />
                          <div className="min-w-0 text-sm">
                            <p className="text-xs">
                              <span className="font-semibold">{match.speaker}</span>{" "}
                              <span className="tabular-nums text-brand">{formatTimestamp(match.start_time)}</span>
                            </p>
                            <p className="mt-0.5 leading-relaxed text-fg-muted">
                              <Highlight text={match.text} query={query} />
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
