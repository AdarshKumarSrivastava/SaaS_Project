export default function AuthLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-base">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin" />
        <p className="text-sm text-ink-soft">Loading...</p>
      </div>
    </div>
  );
}
