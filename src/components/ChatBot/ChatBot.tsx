"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useChatBot } from './ChatBotProvider';
import { useTranslation } from '@/lib/i18n/context';
import { MessageCircle, X, Send, Sparkles, Trash2 } from 'lucide-react';

export type ChatMessage = {
  role: 'user' | 'bot';
  content: string;
};

export function ChatBot({ context: propContext }: { context?: 'visitor' | 'teacher' }) {
  const { isOpen, closeChat, toggleChat, defaultContext } = useChatBot();
  const { t, lang } = useTranslation();
  const isRtl = lang === 'ar';
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeContext = propContext || defaultContext;

  useEffect(() => {
    // Load from sessionStorage
    const saved = sessionStorage.getItem(`fitna_chat_${activeContext}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages([]);
      }
    } else {
      // Set welcome message
      setMessages([{ role: 'bot', content: t.chatbot?.chatbot_welcome || (isRtl ? "أهلاً بك! أنا مساعد فِطنة الذكي. إزاي أقدر أساعدك النهاردة؟" : "Hi there! I'm your Fitna AI Assistant. How can I help you today?") }]);
    }
  }, [activeContext, t.chatbot, isRtl]);

  useEffect(() => {
    // Save to sessionStorage
    if (messages.length > 0) {
      sessionStorage.setItem(`fitna_chat_${activeContext}`, JSON.stringify(messages));
    }
  }, [messages, activeContext]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleClear = () => {
    sessionStorage.removeItem(`fitna_chat_${activeContext}`);
    setMessages([{ role: 'bot', content: t.chatbot?.chatbot_welcome || (isRtl ? "أهلاً بك! أنا مساعد فِطنة الذكي. إزاي أقدر أساعدك النهاردة؟" : "Hi there! I'm your Fitna AI Assistant. How can I help you today?") }]);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    // Add empty bot message for streaming
    setMessages((prev) => [...prev, { role: 'bot', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages,
          context: activeContext
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      if (!response.body) throw new Error('No readable stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let done = false;
      let text = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        text += chunkValue;
        
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = text;
          return updated;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = isRtl ? "عذراً، حدث خطأ. حاول مرة أخرى." : "Sorry, an error occurred. Please try again.";
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed z-50 transition-all duration-300 ${isRtl ? 'left-4' : 'right-4'} bottom-4 sm:bottom-6 flex flex-col items-end`}>
      {/* Chat Window */}
      <div 
        className={`
          mb-4 bg-[#071B3A] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
          w-[calc(100vw-2rem)] sm:w-[400px] h-[500px] max-h-[calc(100vh-6rem)]
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#071B3A]/95 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#12B8C4]/20 flex items-center justify-center text-[#12B8C4]">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-white">
              {t.chatbot?.chatbot_title || (isRtl ? "مساعد فِطنة" : "Fitna Assistant")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleClear}
              className="p-2 text-white/50 hover:text-white/90 hover:bg-white/10 rounded-lg transition"
              title={t.chatbot?.chatbot_clear || (isRtl ? "مسح المحادثة" : "Clear chat")}
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={closeChat}
              className="p-2 text-white/50 hover:text-white/90 hover:bg-white/10 rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`
                  max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'user' 
                    ? 'bg-[#12B8C4] text-white rounded-br-sm rtl:rounded-bl-sm rtl:rounded-br-2xl' 
                    : 'bg-slate-800 text-slate-100 border border-white/5 rounded-bl-sm rtl:rounded-br-sm rtl:rounded-bl-2xl'}
                `}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-white/5 rounded-2xl rounded-bl-sm rtl:rounded-br-sm rtl:rounded-bl-2xl px-4 py-3 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-[#071B3A]/95">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chatbot?.chatbot_placeholder || (isRtl ? "اكتب سؤالك..." : "Ask me anything...")}
              className={`
                w-full bg-black/20 text-white border border-white/10 rounded-xl py-3
                ${isRtl ? 'pr-4 pl-12' : 'pl-4 pr-12'}
                focus:outline-none focus:border-[#12B8C4]/50 focus:ring-1 focus:ring-[#12B8C4]/50
                placeholder-white/30 text-sm
              `}
              dir={isRtl ? "rtl" : "ltr"}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`
                absolute ${isRtl ? 'left-2' : 'right-2'}
                p-2 rounded-lg text-[#12B8C4] hover:bg-[#12B8C4]/10 disabled:opacity-50 disabled:hover:bg-transparent
                transition-colors
              `}
            >
              <Send size={18} className={isRtl ? 'rotate-180' : ''} />
            </button>
          </div>
        </form>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleChat}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center shadow-lg
          transition-transform hover:scale-105 active:scale-95
          ${isOpen ? 'bg-slate-700 text-white' : 'bg-[#FFB52E] text-[#071B3A] hover:bg-[#E5A93C]'}
        `}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
