"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Globe, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const data = await apiClient.get(`http://localhost:3001/api/sites/${siteId}`);
        setSite(data);
        setCustomDomain(data.customDomain || '');
      } catch (err) {
        console.error(err);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [siteId, router]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await apiClient.patch(`http://localhost:3001/api/sites/${siteId}/domain`, {
        customDomain
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (err as { message?: string })?.message || 'Failed to update domain');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !site) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold mb-2">Site Settings</h1>
        <p className="text-zinc-400 mb-12">Manage your domains and site configuration.</p>

        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-medium">Custom Domain</h2>
              <p className="text-sm text-zinc-400">Map your own domain to this BuildSpace site.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Subdomain</label>
              <div className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed">
                {site.subdomain}.localhost:3000
              </div>
              <p className="text-xs text-zinc-500 mt-2">This is your permanent BuildSpace assigned URL.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Custom Domain</label>
              <input 
                type="text" 
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                placeholder="e.g. www.myawesomebrand.com"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30"
              />
              <p className="text-xs text-zinc-500 mt-2">Set up a CNAME record pointing to our servers before saving.</p>
            </div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">{error}</div>}
            
            <div className="pt-4 border-t border-white/10 flex items-center justify-end">
              <button 
                onClick={handleSave}
                disabled={saving || !customDomain}
                className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : success ? 'Saved!' : 'Save Domain'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
