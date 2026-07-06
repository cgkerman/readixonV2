"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useAuthStore, 
  subscribeToMessages, 
  sendMessage, 
  markChatAsRead, 
  acceptChatRequest, 
  declineChatRequest,
  Chat,
  Message,
  db
} from '@readixon/core';
import { Typography, ChatBubble, Button } from '@readixon/ui';
import { ArrowLeft, Send, CheckCircle, XCircle, MoreVertical, Loader2 } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';

import { toast } from 'sonner';

export default function ActiveChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;
  
  const { firebaseUser } = useAuthStore();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat details
  useEffect(() => {
    if (!firebaseUser || !chatId) return;

    const chatRef = doc(db, 'chats', chatId);
    const unsubChat = onSnapshot(chatRef, (snap) => {
      if (snap.exists()) {
        const chatData = { id: snap.id, ...snap.data() } as Chat;
        setChat(chatData);
        
        // Mark as read if unread count is > 0
        if (chatData.unreadCounts[firebaseUser.uid] > 0) {
          markChatAsRead(chatId, firebaseUser.uid);
        }
      } else {
        router.push('/messages'); // Chat deleted or not found
      }
      setLoading(false);
    });

    const unsubMessages = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => scrollToBottom(), 100);
    });

    return () => {
      unsubChat();
      unsubMessages();
    };
  }, [chatId, firebaseUser, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !firebaseUser || !chat) return;

    setSending(true);
    try {
      await sendMessage(chatId, firebaseUser.uid, inputText.trim());
      setInputText('');
    } catch (error) {
      toast.error('Mesaj gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptChatRequest(chatId);
      toast.success('Mesaj isteği kabul edildi.');
    } catch (error) {
      toast.error('Hata oluştu.');
    }
  };

  const handleDecline = async () => {
    try {
      await declineChatRequest(chatId);
      toast('Mesaj isteği reddedildi.');
    } catch (error) {
      toast.error('Hata oluştu.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!chat || !firebaseUser) return null;

  const otherUserId = chat.participants.find(id => id !== firebaseUser.uid) || '';
  const otherUser = chat.participantDetails[otherUserId];
  const isPendingReceiver = chat.status === 'pending' && chat.requestedBy !== firebaseUser.uid;
  const isPendingSender = chat.status === 'pending' && chat.requestedBy === firebaseUser.uid;

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/messages')}
            className="md:hidden p-2 rounded-full hover:bg-muted/10 -ml-2"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div 
            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={() => router.push(`/profile/@${otherUser?.username}`)}
          >
            {otherUser?.avatarUrl ? (
              <img src={otherUser.avatarUrl} alt={otherUser.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold">{otherUser?.displayName?.charAt(0)}</span>
            )}
          </div>
          
          <div>
            <Typography 
              variant="body" 
              className="font-bold text-text cursor-pointer hover:underline"
              onClick={() => router.push(`/profile/@${otherUser?.username}`)}
            >
              {otherUser?.displayName}
            </Typography>
            <Typography variant="body" className="text-xs text-muted">
              @{otherUser?.username}
            </Typography>
          </div>
        </div>
        <button className="p-2 text-muted hover:text-text rounded-full hover:bg-muted/10 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
        {messages.map((msg, index) => {
          let timeText = '';
          if (msg.createdAt) {
            timeText = msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          return (
            <ChatBubble
              key={msg.id}
              id={msg.id}
              text={msg.text}
              isOwnMessage={msg.senderId === firebaseUser.uid}
              timeText={timeText}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Request Actions Overlay */}
      {isPendingReceiver && (
        <div className="p-4 bg-card border-t border-border/50 flex flex-col gap-3 items-center shrink-0">
          <Typography variant="body" className="text-sm text-center text-muted">
            <strong className="text-text">{otherUser?.displayName}</strong> size mesaj göndermek istiyor. Mesaj gönderebilmek için isteği kabul etmelisiniz.
          </Typography>
          <div className="flex gap-3 w-full max-w-sm">
            <Button variant="secondary" className="flex-1 rounded-full text-red-500 hover:bg-red-500/10 border-red-500/20" onPress={handleDecline}>
              <XCircle size={18} className="mr-2" /> Reddet
            </Button>
            <Button variant="primary" className="flex-1 rounded-full" onPress={handleAccept}>
              <CheckCircle size={18} className="mr-2" /> Kabul Et
            </Button>
          </div>
        </div>
      )}

      {isPendingSender && (
        <div className="p-4 bg-card border-t border-border/50 flex flex-col items-center shrink-0">
          <Typography variant="body" className="text-sm text-center text-muted">
            Mesaj isteği gönderildi. <strong className="text-text">{otherUser?.displayName}</strong> isteği kabul edene kadar yeni mesaj gönderemezsiniz.
          </Typography>
        </div>
      )}

      {/* Message Input */}
      {chat.status === 'accepted' && (
        <div className="p-4 bg-background border-t border-border/50 shrink-0 pb-6 md:pb-4">
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Bir mesaj yazın..."
              className="flex-1 bg-card border border-border/50 rounded-full px-6 py-3.5 text-sm text-text focus:outline-none focus:border-primary/50 transition-colors"
            />
            <Button 
              type="submit" 
              variant="primary" 
              className="w-12 h-12 rounded-full flex items-center justify-center p-0 flex-shrink-0"
              disabled={!inputText.trim() || sending}
            >
              {sending ? <Loader2 size={24} className="animate-spin text-white shrink-0" /> : <Send size={24} className="text-white shrink-0" />}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
