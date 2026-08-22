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
      const res = await fetch(`/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({ 
          query: userMessage, 
          siteId: siteId || 'global',
          contextData: { pathname: window.location.pathname },
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
        // Request was aborted, no action needed
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong while connecting to the assistant. Please try again.' }]);
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
            initial={{ opacity: 0, y: 30, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom,2rem)+5rem)] right-4 sm:right-8 z-50 w-[calc(100vw-2rem)] sm:w-[380px] bg-[#FDFCF8] border border-[#111111]/10 rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
            style={{ height: '580px', maxHeight: 'calc(100dvh - 140px)' }}
          >
            {/* Header */}
            <div className="bg-[#111111] text-[#FDFCF8] px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-8 h-8 bg-white/10 rounded-full">
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#E55225] border-2 border-[#111111] rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm tracking-tight text-white">Concierge</h3>
                  <p className="text-[9px] text-white/50 font-bold tracking-[0.1em] uppercase mt-0.5">Powered by AI</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors group"
              >
                <X className="w-4 h-4 text-white/70 group-hover:text-white" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FDFCF8] scrollbar-thin scrollbar-thumb-[#111111]/10">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-[#111111] text-[#FDFCF8] rounded-br-sm' 
                          : 'bg-white text-[#111111] border border-[#111111]/5 rounded-bl-sm'
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
                    <div className="bg-white text-[#111111] border border-[#111111]/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center shadow-sm h-10">
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="w-1.5 h-1.5 bg-[#111111]/40 rounded-full"></motion.span>
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#111111]/40 rounded-full"></motion.span>
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#111111]/40 rounded-full"></motion.span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={endOfMessagesRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#111111]/10 bg-white shrink-0">
              <div className="flex items-center gap-2 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none rounded-none pl-3 pr-10 py-2.5 text-[13px] text-[#111111] placeholder:text-[#111111]/40 focus:outline-none focus:ring-0 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-1 p-1.5 bg-[#111111] text-[#FDFCF8] rounded-md hover:bg-[#E55225] disabled:opacity-30 disabled:hover:bg-[#111111] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
