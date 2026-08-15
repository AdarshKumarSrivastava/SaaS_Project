"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export function Chatbot({ siteId }: { siteId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hi there! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const conversationIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({ 
          query: userMessage, 
          siteId: siteId || 'global',
          conversationId: conversationIdRef.current,
          sessionId: 'client-' + Math.random().toString(36).substring(7)
        })
      });

      if (!res.ok) throw new Error('Failed to fetch');
      if (!res.body) throw new Error('No readable stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setLoading(false);

      let isDone = false;
      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) {
          isDone = true;
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (dataStr.trim() === '') continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'init') {
                conversationIdRef.current = data.conversationId;
              } else if (data.type === 'chunk') {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content += data.content;
                  return newMsgs;
                });
              } else if (data.type === 'error') {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content += '\n[Error: ' + data.message + ']';
                  return newMsgs;
                });
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, dataStr);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am currently offline or encountered an error.' }]);
      }
      setLoading(false);
    } finally {
      abortControllerRef.current = null;
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95, rotate: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-full flex items-center justify-center shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_32px_-12px_rgba(0,0,0,0.4)] transition-shadow group"
      >
        <MessageSquare className="w-7 h-7 transform group-hover:scale-110 transition-transform duration-300" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-8 right-8 z-50 w-[90vw] sm:w-[400px] bg-white/70 backdrop-blur-3xl border border-white/60 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
            style={{ height: '550px', maxHeight: 'calc(100vh - 64px)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]">
                    <MessageSquare className="w-5 h-5 text-indigo-200" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-semibold text-base tracking-tight text-white/95">Concierge</h3>
                  <p className="text-[11px] text-white/60 font-medium tracking-wider uppercase mt-0.5">Powered by AI</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:rotate-90 group"
              >
                <X className="w-5 h-5 text-white/80 group-hover:text-white" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-[20px] px-5 py-3 text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-br-[4px]' 
                          : 'bg-white text-slate-800 border border-slate-100 rounded-bl-[4px] shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white text-slate-800 border border-slate-100 rounded-[20px] rounded-bl-[4px] px-5 py-4 flex gap-1.5 items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-slate-300 rounded-full"></motion.span>
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-2 h-2 bg-slate-400 rounded-full"></motion.span>
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-2 h-2 bg-slate-500 rounded-full"></motion.span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={endOfMessagesRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/60 bg-white/70 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/80 border border-slate-200 rounded-2xl pl-5 pr-12 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-[inset_0_2px_5px_rgba(0,0,0,0.01)]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all shadow-md group"
                >
                  <Send className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
