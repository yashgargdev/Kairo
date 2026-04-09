export default function ChatLoading() {
  return (
    <div className="flex h-screen bg-[#080808] overflow-hidden">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r border-white/[0.05] flex flex-col p-3 gap-2 shrink-0">
        <div className="h-9 rounded-lg bg-white/[0.05] animate-pulse mb-1" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-lg bg-white/[0.04] animate-pulse"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 overflow-hidden px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* User message */}
            <div className="flex justify-end">
              <div className="w-64 h-12 rounded-2xl bg-white/[0.06] animate-pulse" />
            </div>

            {/* Assistant message */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/30 animate-pulse shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2 pt-0.5">
                <div className="w-full h-4 rounded bg-white/[0.05] animate-pulse" style={{ animationDelay: '80ms' }} />
                <div className="w-5/6 h-4 rounded bg-white/[0.05] animate-pulse" style={{ animationDelay: '120ms' }} />
                <div className="w-4/6 h-4 rounded bg-white/[0.05] animate-pulse" style={{ animationDelay: '160ms' }} />
              </div>
            </div>

            {/* User message */}
            <div className="flex justify-end">
              <div className="w-48 h-10 rounded-2xl bg-white/[0.06] animate-pulse" />
            </div>

            {/* Assistant message */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/30 animate-pulse shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2 pt-0.5">
                <div className="w-full h-4 rounded bg-white/[0.05] animate-pulse" style={{ animationDelay: '80ms' }} />
                <div className="w-3/4 h-4 rounded bg-white/[0.05] animate-pulse" style={{ animationDelay: '120ms' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Input skeleton */}
        <div className="px-4 pb-4 pt-2 border-t border-white/[0.04]">
          <div className="max-w-2xl mx-auto">
            <div className="h-14 rounded-2xl bg-white/[0.05] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
