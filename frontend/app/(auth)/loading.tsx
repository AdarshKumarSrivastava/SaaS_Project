export default function AuthLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#030014]">
      {/* Background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/30 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-500/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Spinner */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-fuchsia-500 animate-spin" />
          {/* Inner spinning ring (reverse) */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-fuchsia-400 border-l-cyan-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          {/* Center glow dot */}
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.6)] animate-pulse" />
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-pulse">
            LOADING
          </h2>
          <p className="text-xs text-white/40 font-mono tracking-wider">Initializing secure module...</p>
        </div>
      </div>
    </div>
  );
}
