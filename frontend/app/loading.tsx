export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030014] text-white">
      {/* Background glow */}
      <div className="absolute w-[30%] h-[30%] bg-fuchsia-500/20 rounded-full blur-[100px] animate-pulse" />
      
      <div className="relative flex flex-col items-center gap-6 z-10">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shadow-[0_0_40px_rgba(217,70,239,0.5)]">
          <div className="absolute inset-1 bg-[#030014] rounded-full flex items-center justify-center">
            {/* Spinning inner border */}
            <div className="w-10 h-10 border-t-2 border-r-2 border-cyan-400 rounded-full animate-spin" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-pulse">
            LOADING ENGINE
          </h2>
          <p className="text-xs text-white/40 font-mono">Compiling resources...</p>
        </div>
      </div>
    </div>
  );
}
