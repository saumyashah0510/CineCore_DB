import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Database, Loader2, Bot, Code, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  sql?: string;
  columns?: string[];
  rows?: any[][];
  summary?: string;
  rowCount?: number;
  error?: boolean;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi! I am the CineCore AI Assistant. Ask me anything about your projects, budgets, contracts, or schedules.',
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter(msg => msg.id !== 'welcome') // ignore default greeting
        .map(msg => ({
          role: msg.role,
          content: msg.text || msg.summary || ''
        }))
        .filter(msg => msg.content);

      const { data } = await api.post('/ai/query', { 
        question: query,
        history: historyPayload
      });
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        summary: data.summary,
        sql: data.sql,
        columns: data.columns,
        rows: data.rows,
        rowCount: data.row_count
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      let errorMsg = error.response?.data?.detail || 'Something went wrong. Please try again later.';
      
      // Make rate limit (429) errors user-friendly
      if (typeof errorMsg === 'string' && (errorMsg.includes('429') || errorMsg.includes('Quota exceeded'))) {
        errorMsg = "Whoa, slow down! You've reached the free-tier API rate limit. Please wait about 30 seconds and try asking again.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
        error: true
      }]);
      toast.error('AI Query Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const SqlDetails = ({ sql }: { sql: string }) => {
    const [open, setOpen] = useState(false);
    
    return (
      <div className="mt-3 border border-cine-border/50 rounded bg-cine-void overflow-hidden">
        <button 
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-cine-dust hover:text-cine-cream hover:bg-cine-onyx transition-colors"
        >
          <span className="flex items-center gap-2 font-mono">
            <Code className="w-3.5 h-3.5 text-cine-gold" />
            Generated SQL
          </span>
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-3 py-2 border-t border-cine-border/50 bg-cine-void text-[10px] sm:text-xs font-mono text-cine-gold/80 overflow-x-auto whitespace-pre-wrap"
            >
              {sql}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const ResultsTable = ({ columns, rows }: { columns: string[], rows: any[][] }) => {
    if (!columns || columns.length === 0 || !rows || rows.length === 0) return null;
    
    return (
      <div className="mt-3 overflow-x-auto rounded border border-cine-border custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead className="bg-cine-onyx text-cine-gold uppercase font-caption tracking-wider border-b border-cine-border">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-3 py-2 whitespace-nowrap">{col.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cine-border/50 bg-cine-void/50">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-cine-onyx/50 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-2 whitespace-nowrap text-cine-ivory/90">
                    {cell === null ? <span className="text-cine-dust italic">null</span> : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-gradient-to-br from-cine-gold to-cine-gold-dim shadow-2xl flex items-center justify-center text-cine-void hover:shadow-[0_0_20px_rgba(184,150,46,0.4)] transition-all"
            title="Ask CineCore AI"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 z-[100] w-[calc(100vw-3rem)] sm:w-[450px] h-[600px] max-h-[calc(100vh-6rem)] bg-cine-onyx border border-cine-border/60 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cine-velvet to-cine-onyx border-b border-cine-border relative overflow-hidden">
              <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded border border-cine-gold/30 bg-cine-void flex items-center justify-center">
                  <Database className="w-4 h-4 text-cine-gold" />
                </div>
                <div>
                  <h3 className="font-caption tracking-cinema uppercase text-cine-ivory text-sm">CineCore AI</h3>
                  <p className="text-[10px] text-cine-dust font-mono uppercase">Text-to-SQL powered by Groq</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="relative z-10 p-1.5 text-cine-dust hover:text-cine-ivory hover:bg-cine-border rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-cine-void relative">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border ${
                    msg.role === 'user' 
                      ? 'bg-cine-border border-cine-dust/30 text-cine-cream' 
                      : 'bg-cine-onyx border-cine-gold/40 text-cine-gold'
                  }`}>
                    {msg.role === 'user' ? <span className="text-[10px] font-mono">You</span> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    {msg.text && (
                      <div className={`px-4 py-2 rounded-2xl text-sm ${
                        msg.role === 'user' 
                          ? 'bg-cine-border text-cine-ivory rounded-tr-sm' 
                          : msg.error 
                            ? 'bg-red-950/30 border border-red-900/50 text-red-200 rounded-tl-sm'
                            : 'bg-cine-onyx border border-cine-border text-cine-cream rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    )}
                    
                    {msg.summary && (
                      <div className="px-4 py-2 rounded-2xl rounded-tl-sm bg-cine-onyx border border-cine-border text-cine-cream text-sm">
                        <p className="text-cine-ivory">{msg.summary}</p>
                      </div>
                    )}

                    {msg.sql && <SqlDetails sql={msg.sql} />}
                    {msg.rows && msg.columns && <ResultsTable columns={msg.columns} rows={msg.rows} />}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-cine-onyx border border-cine-gold/40 text-cine-gold flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-cine-onyx border border-cine-border flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cine-gold" />
                    <span className="text-xs text-cine-dust animate-pulse">Running query on database...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-cine-onyx border-t border-cine-border">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about projects, budgets..."
                  className="w-full bg-cine-void border border-cine-border rounded-full pl-4 pr-12 py-3 text-sm text-cine-ivory placeholder:text-cine-dust focus:outline-none focus:border-cine-gold/50 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 rounded-full bg-cine-gold/10 text-cine-gold hover:bg-cine-gold hover:text-cine-void disabled:opacity-50 disabled:hover:bg-cine-gold/10 disabled:hover:text-cine-gold transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-center mt-2">
                <p className="text-[9px] text-cine-dust font-mono uppercase tracking-widest opacity-60">AI can make mistakes. Verify important data.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
