"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Globe, Loader2, Save, CheckCircle2, Shield } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { TransitionLink } from '@/components/TransitionLink';

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

   
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState(false);

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

  const handleSaveAdminPassword = async () => {
    if (!adminPassword || adminPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    setSavingAdmin(true);
    setAdminSuccess(false);

    try {
      await apiClient.post(`/sites/${siteId}/credentials`, {
        keys: [{ keyName: 'admin_password', keyValue: adminPassword }]
      });
      setAdminSuccess(true);
      setAdminPassword('');
      setTimeout(() => setAdminSuccess(false), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update admin password');
    } finally {
      setSavingAdmin(false);
    }
  };

  if (loading || !site) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin" />
          <span className="text-sm text-ink-soft">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-ink p-8">
      <div className="max-w-3xl mx-auto">
        <TransitionLink href="/dashboard" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors mb-10">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </TransitionLink>

        <h1 className="text-3xl font-semibold tracking-tight mb-1.5">Site Settings</h1>
        <p className="text-ink-soft mb-10">Manage your domains and site configuration.</p>

        <div className="bg-bg-elevated border border-line rounded-2xl p-10 shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Custom Domain</h2>
              <p className="text-sm text-ink-soft">Map your own domain to this BuildSpace site.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Primary Subdomain</label>
              <div className="w-full bg-bg-subtle border border-line rounded-xl px-4 py-3 text-ink-soft text-sm cursor-not-allowed">
                {site.subdomain}.localhost:3000
              </div>
              <p className="text-xs text-ink-soft mt-1.5">This is your permanent BuildSpace assigned URL.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Custom Domain</label>
              <input 
                type="text" 
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                placeholder="e.g. www.myawesomebrand.com"
                className="w-full bg-bg-base border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/50"
              />
              <p className="text-xs text-ink-soft mt-1.5">Set up a CNAME record pointing to our servers before saving.</p>
            </div>

            {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}
            
            <div className="pt-4 border-t border-line flex items-center justify-end">
              <button 
                onClick={handleSave}
                disabled={saving || !customDomain}
                className="bg-ink text-bg-elevated px-6 py-3 rounded-xl font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : success ? 'Saved!' : 'Save Domain'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-bg-elevated border border-line rounded-2xl p-10 shadow-[0_4px_24px_rgb(0,0,0,0.06)] mt-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-11 h-11 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Admin Panel Access</h2>
              <p className="text-sm text-ink-soft">Secure your generated dashboard with an admin password.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Admin Password</label>
              <input 
                type="password" 
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Enter a new secure password"
                className="w-full bg-bg-base border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/50"
              />
              <p className="text-xs text-ink-soft mt-1.5">This password will be used to access the /admin dashboard of your site.</p>
            </div>
            
            <div className="pt-4 border-t border-line flex items-center justify-end">
              <button 
                onClick={handleSaveAdminPassword}
                disabled={savingAdmin || !adminPassword}
                className="bg-ink text-bg-elevated px-6 py-3 rounded-xl font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {savingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : adminSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                {savingAdmin ? 'Saving...' : adminSuccess ? 'Saved!' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
