export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* Navbar skeleton */}
      <div className="h-16 border-b border-white/[0.05] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-white/[0.06] animate-pulse" />
          <div className="w-16 h-4 rounded bg-white/[0.06] animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-8 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="w-24 h-8 rounded-lg bg-white/[0.06] animate-pulse" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.06] animate-pulse" />
        <div className="space-y-3 flex flex-col items-center">
          <div className="w-80 h-8 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="w-64 h-8 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="w-96 h-4 rounded bg-white/[0.04] animate-pulse mt-2" />
          <div className="w-72 h-4 rounded bg-white/[0.04] animate-pulse" />
        </div>
        <div className="flex gap-3 mt-4">
          <div className="w-36 h-11 rounded-xl bg-amber-500/20 animate-pulse" />
          <div className="w-36 h-11 rounded-xl bg-white/[0.06] animate-pulse" />
        </div>
      </div>
    </div>
  )
}
