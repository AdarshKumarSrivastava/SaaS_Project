export default function DashboardLoading() {
  return (
    <div className="min-h-screen w-full bg-bg-base">
      {/* Top Nav Skeleton */}
      <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-pulse">
        <div className="bg-bg-elevated/60 backdrop-blur-2xl border border-line/50 rounded-[1.25rem] px-4 py-2 flex items-center gap-5 h-12 w-[420px]">
          <div className="w-6 h-6 rounded-full bg-line/40" />
          <div className="h-3 w-20 rounded bg-line/30" />
          <div className="flex-1" />
          <div className="h-3 w-16 rounded bg-line/30" />
          <div className="w-8 h-8 rounded-full bg-line/20" />
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-[1600px] mx-auto animate-pulse stagger-children">
        <div className="flex flex-col items-start gap-4 mb-12">
          <div className="h-10 w-64 bg-line/20 rounded-xl" />
          <div className="h-4 w-96 bg-line/15 rounded-lg" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-bg-elevated border border-line/30 rounded-2xl" />
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col rounded-2xl border border-line/30 overflow-hidden bg-bg-elevated">
              <div className="w-full aspect-[16/10] bg-line/10" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-3/5 bg-line/20 rounded" />
                <div className="h-3 w-2/5 bg-line/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
