export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7.5 w-7.5 items-center justify-center rounded-[9px] bg-linear-to-br from-violet-600 via-fuchsia-600 to-orange-500">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2c.9 4.6 2.9 6.6 7.5 7.5-4.6.9-6.6 2.9-7.5 7.5-.9-4.6-2.9-6.6-7.5-7.5C9.1 8.6 11.1 6.6 12 2Z" fill="white" />
          <circle cx="19" cy="19" r="2.2" fill="white" opacity="0.85" />
        </svg>
      </span>
      <span className="text-[17px] font-bold tracking-tight">fireflies</span>
    </div>
  );
}
