import { Suspense } from "react";
import { SearchResults } from "@/components/search/SearchResults";
import { Spinner } from "@/components/ui/States";

// useSearchParams() needs a Suspense boundary so the rest of the page can still be prerendered.
export default function SearchPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <SearchResults />
    </Suspense>
  );
}
