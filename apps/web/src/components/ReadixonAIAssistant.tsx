'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Typography, Button, Input } from '@readixon/ui';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { auth } from '@readixon/core/src/firebase';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface ReadixonAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string; // Editor's current content for context
}

export function ReadixonAIAssistant({ isOpen, onClose, currentContent }: ReadixonAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Merhaba! Ben Readixon Yaratıcı Asistanınızım. Tıkandığınız yerlerde bana danışabilir, karakter gelişimi veya kurgu hakkında fikir alabilirsiniz. Nasıl yardımcı olabilirim?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // Check auth token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Lütfen yapay zeka asistanını kullanmak için giriş yapın.");
      }
      
      const token = await currentUser.getIdToken();

      // Send to API
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: userMessage,
          // Extract the last 1500 chars from currentContent to save tokens while keeping context
          context: currentContent ? currentContent.substring(Math.max(0, currentContent.length - 1500)) : ''
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Bilinmeyen bir hata oluştu.');
      }

      const aiMsg: Message = { 
        id: Date.now().toString(), 
        role: 'ai', 
        content: data.response 
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
    } catch (error: any) {
      console.error(error);
      const errorMsg: Message = { 
        id: Date.now().toString(), 
        role: 'ai', 
        content: error.message || 'Üzgünüm, şu an bağlantı kuramıyorum.' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-screen w-[400px] bg-card border-l border-border shadow-2xl flex flex-col z-[100] animate-slide-in-right">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={18} />
          </div>
          <div>
            <Typography variant="body" className="font-bold text-text">Readixon AI</Typography>
            <Typography variant="caption" className="text-muted text-[11px]">Kurgu Asistanı</Typography>
          </div>
        </div>
        <button onClick={onClose} className="text-muted hover:text-text transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-orange-500/10 text-orange-500'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                : 'bg-muted/30 text-text border border-border/50 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 shrink-0 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-muted/30 border border-border/50 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-muted" />
              <Typography variant="caption" className="text-muted">Düşünüyor...</Typography>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="relative flex items-center">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hikayeniz için neye ihtiyacınız var?"
            className="w-full bg-background border border-border rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-primary resize-none min-h-[50px] max-h-[120px]"
            rows={2}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 w-8 h-8 flex items-center justify-center bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <Typography variant="caption" className="text-center block mt-3 text-muted text-[10px]">
          Readixon AI bölüm içeriğinizi bağlam olarak okur. Günlük limitli kullanımdır.
        </Typography>
      </div>
    </div>
  );
}
