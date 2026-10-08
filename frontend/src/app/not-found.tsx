import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <FileQuestion size={40} className="mb-4 text-fg-subtle" />
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="mt-1 text-sm text-fg-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">
        Go home
      </Link>
    </div>
  );
}
