export default function TemplatesLoading() {
  return (
    <div className="min-h-screen w-full bg-bg-base animate-pulse">
      {/* Hero */}
      <div className="pt-32 pb-12 px-6 md:px-12 max-w-[1400px] mx-auto text-center stagger-children">
        <div className="h-4 w-28 bg-line/20 rounded-full mx-auto mb-4" />
        <div className="h-12 w-96 bg-line/25 rounded-xl mx-auto mb-4" />
        <div className="h-4 w-72 bg-line/15 rounded-lg mx-auto" />
      </div>

      {/* Filter Pills */}
      <div className="flex justify-center gap-3 mb-12 px-6 flex-wrap">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-9 w-24 bg-line/15 rounded-full" />
        ))}
      </div>

      {/* Templates Grid */}
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-line/20 overflow-hidden bg-bg-elevated">
            <div className="w-full aspect-[16/10] bg-line/10" />
            <div className="p-6 space-y-3">
              <div className="h-5 w-2/5 bg-line/20 rounded" />
              <div className="h-3 w-4/5 bg-line/10 rounded" />
              <div className="h-3 w-3/5 bg-line/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
