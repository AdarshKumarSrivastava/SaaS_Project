"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Shield, Key, Sparkles, Check, Copy, ExternalLink, 
  Camera, Lock, Eye, EyeOff, Globe, Mail, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useLenis } from '@studio-freight/react-lenis';

const LinkedInIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.22a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
  </svg>
);

const GitHubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

export function AccountSettingsModal({
  isOpen,
  onClose,
  user,
}: AccountSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'system'>('profile');
  const lenis = useLenis();

  // User Profile State
  const defaultEmail = 'Adarsh.25SCSE1280059@galgotiasuniversity.ac.in';
  const [name, setName] = useState('Adarsh Kumar Srivastava');
  const [role, setRole] = useState('Senior Developer');
  const [email, setEmail] = useState(defaultEmail);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  // Mount detection for React 19 Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize from user prop or localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAvatar = localStorage.getItem('buildspace_custom_avatar');
      if (savedAvatar) setAvatarUrl(savedAvatar);
      const savedName = localStorage.getItem('buildspace_user_name');
      if (savedName) setName(savedName);
    }
  }, []);

  // Sync with user prop if provided
  useEffect(() => {
    if (user?.name) setName(user.name);
    else if (user?.first_name) {
      setName(`${user.first_name} ${user.last_name && user.last_name !== '-' ? user.last_name : ''}`.trim());
    }
  }, [user]);

  // Robust Scroll Lock, Scroll-to-Top & Escape Key Handler
  useEffect(() => {
    if (!isOpen) return;

    // 1. Immediately reset background scroll position to top ("show page upside")
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      lenis.stop();
    } else {
      window.scrollTo(0, 0);
    }

    // 2. Prevent native body scroll & layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
      if (lenis) {
        lenis.start();
      }
    };
  }, [isOpen, lenis, onClose]);

  // Handle Avatar Image Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatarUrl(result);
        if (typeof window !== 'undefined') {
          localStorage.setItem('buildspace_custom_avatar', result);
        }
        toast.success('Profile picture updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully! Security credentials refreshed.');
    }, 600);
  };

  // Copy API Key
  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('bs_live_94829ad8291048291');
    toast.success('API Key copied to clipboard');
  };

  // Save Profile Changes
  const handleSaveProfile = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('buildspace_user_name', name);
    }
    toast.success('Account profile updated');
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-settings-title"
        >
          {/* Glassmorphic Backdrop */}
          <motion.div
            key="account-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 bg-ink/50 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Centered Modal Window */}
          <motion.div
            key="account-modal-window"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl max-h-[85vh] bg-bg-elevated border border-line rounded-[2rem] shadow-[0_25px_80px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col focus:outline-none"
            data-lenis-prevent="true"
          >
            {/* Pinned Modal Header */}
              <div className="px-6 py-5 sm:px-8 border-b border-line/60 flex items-center justify-between shrink-0 bg-bg-elevated/95 backdrop-blur-md">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-ink text-bg-elevated flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 id="account-settings-title" className="text-lg font-bold tracking-tight text-ink">
                      Account & Settings
                    </h2>
                    <p className="text-xs text-ink-soft">
                      Manage personal details, security credentials & preferences
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-bg-subtle transition-colors"
                  aria-label="Close settings"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="px-6 sm:px-8 pt-3 pb-1 border-b border-line/50 bg-bg-subtle/30 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'profile'
                      ? 'bg-bg-elevated text-ink shadow-sm border border-line/80'
                      : 'text-ink-soft hover:text-ink hover:bg-bg-subtle/60'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile & About</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'security'
                      ? 'bg-bg-elevated text-ink shadow-sm border border-line/80'
                      : 'text-ink-soft hover:text-ink hover:bg-bg-subtle/60'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Security & Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('system')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'system'
                      ? 'bg-bg-elevated text-ink shadow-sm border border-line/80'
                      : 'text-ink-soft hover:text-ink hover:bg-bg-subtle/60'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>System & API</span>
                </button>
              </div>

              {/* Scrollable Body Content */}
              <div 
                className="px-6 py-6 sm:px-8 overflow-y-auto flex-1 sleek-scrollbar space-y-6"
                data-lenis-prevent="true"
              >
                {/* TAB 1: PROFILE & ABOUT */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* User Identity Card */}
                    <div className="p-4 rounded-2xl bg-bg-subtle/70 border border-line/70 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative group">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent via-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-2xl shadow-md overflow-hidden ring-2 ring-line">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-ink/60 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-inner"
                            title="Change Profile Picture"
                          >
                            <Camera className="w-5 h-5" />
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-ink">{name}</h3>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Verified
                            </span>
                          </div>
                          <p className="text-xs text-ink-soft font-mono mt-0.5">{email}</p>
                          <p className="text-xs font-semibold text-accent mt-1">{role}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-accent hover:underline flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Change Photo</span>
                      </button>
                    </div>

                    {/* Personal Details Form */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Personal Information</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-ink-soft mb-1.5">Full Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-bg-base border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink font-medium focus:outline-none focus:border-ink transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-ink-soft mb-1.5">Role / Position</label>
                          <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-bg-base border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink font-medium focus:outline-none focus:border-ink transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink-soft mb-1.5">Official University Email</label>
                        <input
                          type="email"
                          value={email}
                          readOnly
                          className="w-full bg-bg-subtle/50 border border-line/60 rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink-soft cursor-not-allowed"
                        />
                        <p className="text-[11px] text-ink-soft/70 mt-1">Managed via Galgotias University single sign-on federation.</p>
                      </div>
                    </div>

                    {/* Social & Contact Links */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Connected Links & Profiles</h4>
                      
                      <div className="grid grid-cols-1 gap-2.5 text-xs">
                        <a 
                          href="https://www.linkedin.com/in/adarsh-kumar-srivastava-8198b3387/" 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-3 rounded-xl border border-line/70 bg-bg-elevated hover:bg-bg-subtle/50 flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <LinkedInIcon className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-medium text-ink">LinkedIn Profile</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-ink-soft group-hover:text-ink transition-colors" />
                        </a>

                        <a 
                          href="https://github.com/AdarshKumarSrivastava" 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-3 rounded-xl border border-line/70 bg-bg-elevated hover:bg-bg-subtle/50 flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <GitHubIcon className="w-4 h-4 text-ink shrink-0" />
                            <span className="font-medium text-ink">GitHub Repository</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-ink-soft group-hover:text-ink transition-colors" />
                        </a>

                        <a 
                          href="https://adarsh-portfilio.vercel.app/" 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-3 rounded-xl border border-line/70 bg-bg-elevated hover:bg-bg-subtle/50 flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-accent shrink-0" />
                            <span className="font-medium text-ink">Personal Portfolio</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-ink-soft group-hover:text-ink transition-colors" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SECURITY & PASSWORD */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    {/* Password Update Form */}
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Change Password</h4>

                      <div>
                        <label className="block text-xs font-medium text-ink-soft mb-1.5">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full bg-bg-base border border-line rounded-xl px-3.5 py-2.5 pr-10 text-xs text-ink focus:outline-none focus:border-ink transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-ink-soft mb-1.5">New Password</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Minimum 8 characters"
                              className="w-full bg-bg-base border border-line rounded-xl px-3.5 py-2.5 pr-10 text-xs text-ink focus:outline-none focus:border-ink transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-ink-soft mb-1.5">Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                            className="w-full bg-bg-base border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-ink transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isUpdatingPassword}
                          className="bg-accent text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-accent/90 transition-all shadow-sm disabled:opacity-50"
                        >
                          {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                        </button>
                      </div>
                    </form>

                    {/* 2FA Section */}
                    <div className="pt-4 border-t border-line/60">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-bg-subtle/50 border border-line/60">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-ink">Two-Factor Authentication (2FA)</h5>
                            <p className="text-[11px] text-ink-soft">Secure biometric & hardware token confirmation enabled</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIs2FAEnabled(!is2FAEnabled);
                            toast.success(`2FA has been ${!is2FAEnabled ? 'enabled' : 'disabled'}`);
                          }}
                          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                            is2FAEnabled ? 'bg-emerald-500' : 'bg-line'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                            is2FAEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: SYSTEM & API */}
                {activeTab === 'system' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink">System Environment</h4>

                    <div className="p-4 rounded-2xl border border-line/60 bg-bg-elevated flex items-center justify-between">
                      <div>
                        <span className="text-xs text-ink-soft">Current Membership Tier</span>
                        <p className="text-sm font-bold text-ink mt-0.5">Empire Pro Subscription</p>
                      </div>
                      <span className="inline-flex items-center gap-1 font-bold text-xs text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-line/60 bg-bg-elevated flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-ink-soft">Production API Key</span>
                        <p className="text-xs font-mono font-semibold text-ink mt-0.5">bs_live_94829*****7291</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyApiKey}
                        className="px-3 py-1.5 rounded-lg border border-line hover:bg-bg-subtle text-xs font-medium text-ink flex items-center gap-1.5 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl border border-line/60 bg-bg-elevated">
                        <span className="text-ink-soft block mb-1">Global Edge Region</span>
                        <span className="font-semibold text-ink">us-east-1 (Anycast)</span>
                      </div>
                      <div className="p-3.5 rounded-2xl border border-line/60 bg-bg-elevated">
                        <span className="text-ink-soft block mb-1">Edge Latency</span>
                        <span className="font-semibold text-emerald-600">14ms Average</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pinned Modal Action Footer */}
              <div className="px-6 py-4 sm:px-8 border-t border-line/60 bg-bg-subtle/50 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-soft hover:text-ink hover:bg-bg-subtle transition-colors"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="bg-ink text-bg-elevated px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-ink/90 transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              </div>
            </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
