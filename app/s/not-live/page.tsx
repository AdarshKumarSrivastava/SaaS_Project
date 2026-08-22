import Link from 'next/link';
import { Globe, Rocket } from 'lucide-react';

export default function NotLivePage() {
  return (
    <div className="min-h-screen bg-bg-base text-ink flex items-center justify-center p-6 selection:bg-accent/20">
      <div className="max-w-md w-full bg-bg-elevated border border-line rounded-3xl p-10 text-center shadow-xl">
        <div className="w-16 h-16 bg-bg-subtle rounded-2xl flex items-center justify-center mx-auto mb-6 border border-line">
          <Globe className="w-8 h-8 text-ink-soft" />
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-4 uppercase">THIS PROJECT HAS NOT BEEN DEPLOYED YET.</h1>
        <Link 
          href="/dashboard"
          className="w-full bg-ink text-bg-elevated font-semibold py-3 rounded-xl hover:bg-ink/90 transition-colors flex items-center justify-center gap-2"
        >
          <Rocket className="w-4 h-4" /> DEPLOY LIVE
        </Link>
      </div>
    </div>
  );
}
