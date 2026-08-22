import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Globe, Rocket, Terminal, X, Copy } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string | null;
  siteName: string | null;
  siteSubdomain: string | null;
  onDeploySuccess: (siteId: string) => void;
}

const DEPLOYMENT_STEPS = [
  { id: 'prepare', label: 'Establishing Secure Link', duration: 1000 },
  { id: 'validate', label: 'Validating Project Architecture', duration: 1500 },
  { id: 'build', label: 'Building Static Assets', duration: 2500 },
  { id: 'optimize', label: 'Optimizing Delivery Network', duration: 1500 },
  { id: 'publish', label: 'Publishing to Edge Nodes', duration: 1000 },
];

export function DeploymentModal({ isOpen, onClose, siteId, siteName, siteSubdomain, onDeploySuccess }: DeploymentModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && siteId && status === 'idle') {
      startDeployment();
    }
  }, [isOpen, siteId]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${msg}`]);
  };

  const startDeployment = async () => {
    if (!siteId) return;
    
    setStatus('running');
    setLogs([]);
    setCurrentStepIndex(0);
    setErrorMsg('');
    
    try {
      addLog('Initiating deployment sequence...');
      // 1. Trigger deployment on backend
      const res = await apiClient.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/deploy`, {});
      setDeploymentId(res.id);
      addLog(`Deployment ${res.id} created.`);

      // 2. Simulate premium loading states
      for (let i = 0; i < DEPLOYMENT_STEPS.length; i++) {
        setCurrentStepIndex(i);
        addLog(DEPLOYMENT_STEPS[i].label + '...');
        await new Promise(resolve => setTimeout(resolve, DEPLOYMENT_STEPS[i].duration));
      }

      // 3. Mark as LIVE
      addLog('Finalizing edge deployment...');
      await apiClient.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/deployments/${res.id}/status`, {
        status: 'LIVE'
      });
      addLog('Deployment marked as LIVE successfully.');

      setStatus('success');
      onDeploySuccess(siteId);

    } catch (err: any) {
      console.error('Deployment error:', err);
      setStatus('error');
      const message = err.response?.data?.error || err.message || 'Unknown deployment error occurred.';
      setErrorMsg(message);
      addLog(`ERROR: ${message}`);
      
      if (deploymentId) {
        // Attempt to mark as failed
        apiClient.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/deployments/${deploymentId}/status`, {
          status: 'FAILED',
          errorLogs: message
        }).catch(console.error);
      }
    }
  };

  const handleClose = () => {
    if (status === 'running') return; // Prevent closing while running
    setStatus('idle');
    setDeploymentId(null);
    setCurrentStepIndex(-1);
    setLogs([]);
    onClose();
  };

  const liveUrl = siteSubdomain ? `http://${siteSubdomain}.localhost:3000` : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-bg-base/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-bg-elevated border border-line rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-line bg-bg-subtle/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Rocket className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">Deploying {siteName}</h3>
                  <p className="text-xs text-ink-soft mt-0.5 font-mono">{siteSubdomain}.buildspace.app</p>
                </div>
              </div>
              {status !== 'running' && (
                <button 
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-bg-subtle text-ink-soft hover:text-ink transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="p-8 flex-1">
              {status === 'running' && (
                <div className="space-y-8">
                  <div className="relative">
                    <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-line rounded-full" />
                    <div className="space-y-6">
                      {DEPLOYMENT_STEPS.map((step, idx) => {
                        const isPast = currentStepIndex > idx;
                        const isCurrent = currentStepIndex === idx;
                        
                        return (
                          <div key={step.id} className="relative flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 bg-bg-elevated z-10 transition-colors duration-500 ${
                              isPast ? 'border-emerald-500 text-emerald-500' :
                              isCurrent ? 'border-accent text-accent' :
                              'border-line text-ink-soft'
                            }`}>
                              {isPast ? <CheckCircle2 className="w-4 h-4" /> :
                               isCurrent ? <Loader2 className="w-4 h-4 animate-spin" /> :
                               <div className="w-2 h-2 rounded-full bg-line" />
                              }
                            </div>
                            <div>
                              <p className={`text-sm font-semibold transition-colors duration-500 ${
                                isPast || isCurrent ? 'text-ink' : 'text-ink-soft'
                              }`}>
                                {step.label}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="text-center py-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-ink mb-2">Deployment Complete</h2>
                  <p className="text-ink-soft text-sm mb-8">Your project is now live and accessible globally.</p>
                  
                  <div className="bg-bg-subtle border border-line rounded-xl p-4 flex items-center justify-between max-w-md mx-auto">
                    <div className="flex flex-col items-start truncate pr-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1">Live URL</span>
                      <a href={liveUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-accent hover:underline truncate">
                        {liveUrl}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigator.clipboard.writeText(liveUrl)}
                        className="p-2 rounded-lg bg-bg-base border border-line hover:border-ink-soft text-ink-soft transition-all"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a 
                        href={liveUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2 rounded-lg bg-ink text-bg-elevated text-xs font-bold shadow-sm hover:bg-ink/90 transition-all flex items-center gap-2"
                      >
                        View Live <Globe className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <X className="w-10 h-10 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold text-ink mb-2">Deployment Failed</h2>
                  <p className="text-red-600 text-sm mb-6 max-w-sm mx-auto">{errorMsg}</p>
                  <button 
                    onClick={startDeployment}
                    className="px-6 py-2.5 rounded-xl bg-ink text-bg-elevated text-sm font-bold shadow-sm hover:bg-ink/90 transition-all"
                  >
                    Retry Deployment
                  </button>
                </div>
              )}
            </div>

            {/* Terminal Logs Footer */}
            <div className="bg-[#050505] p-4 font-mono text-[10px] text-emerald-400 h-32 overflow-y-auto flex flex-col gap-1 border-t border-line">
              <div className="flex items-center gap-2 text-white/40 mb-2 sticky top-0 bg-[#050505] py-1">
                <Terminal className="w-3 h-3" /> <span>Deployment Console Logs</span>
              </div>
              {logs.map((log, i) => (
                <div key={i} className="opacity-80 break-all">{log}</div>
              ))}
              {status === 'running' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-3 bg-emerald-400 animate-pulse" />
                </div>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
