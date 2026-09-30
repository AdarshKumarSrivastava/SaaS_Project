export default function SiteLoading() {
  return (
    <div className="min-h-screen w-full bg-bg-base animate-pulse">
      {/* Top Bar */}
      <div className="h-14 border-b border-line/30 flex items-center px-6 gap-4">
        <div className="w-6 h-6 rounded bg-line/30" />
        <div className="h-3 w-32 bg-line/20 rounded" />
        <div className="flex-1" />
        <div className="h-8 w-24 bg-line/15 rounded-lg" />
      </div>

      {/* Content Area */}
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:flex flex-col w-56 border-r border-line/20 p-4 gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-full bg-line/10 rounded-lg" />
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 p-8 space-y-6">
          <div className="h-8 w-48 bg-line/20 rounded-lg" />
          <div className="h-4 w-80 bg-line/10 rounded" />
          <div className="h-[60vh] bg-bg-elevated border border-line/20 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
