export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Top bar skeleton */}
      <div className="h-14 border-b border-white/[0.05] px-6 flex items-center gap-4">
        <div className="w-24 h-4 rounded bg-white/[0.06] animate-pulse" />
        <div className="w-px h-4 bg-white/[0.06]" />
        <div className="w-16 h-4 rounded bg-white/[0.06] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-8 flex gap-10 h-[calc(100vh-3.5rem)]">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex flex-col w-56 shrink-0 pt-10 gap-4">
          <div className="space-y-2">
            <div className="w-24 h-7 rounded-lg bg-white/[0.06] animate-pulse" />
            <div className="w-48 h-3 rounded bg-white/[0.04] animate-pulse" />
            <div className="w-40 h-3 rounded bg-white/[0.04] animate-pulse" />
          </div>
          <div className="flex flex-col gap-1 mt-4">
            {['API Keys', 'General', 'Privacy'].map((_, i) => (
              <div
                key={i}
                className="h-9 rounded-lg bg-white/[0.04] animate-pulse"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 py-10 space-y-4">
          {/* Security notice */}
          <div className="h-16 rounded-xl bg-blue-500/5 border border-blue-500/10 animate-pulse" />

          {/* Provider cards grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
