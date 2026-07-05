"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Typography, ChatListItem } from '@readixon/ui';
import { useAuthStore, subscribeToChats, Chat } from '@readixon/core';
import { Loader2, MessageSquare, UserPlus } from 'lucide-react';

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'accepted' | 'pending'>('accepted');
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  // Is a specific chat open?
  const isChatOpen = pathname !== '/messages';

  useEffect(() => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }

    const unsubscribe = subscribeToChats(firebaseUser.uid, (data) => {
      setChats(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser, router]);

  const acceptedChats = chats.filter(c => c.status === 'accepted' || (c.status === 'pending' && c.requestedBy === firebaseUser?.uid));
  const pendingRequests = chats.filter(c => c.status === 'pending' && c.requestedBy !== firebaseUser?.uid);

  const displayChats = activeTab === 'accepted' ? acceptedChats : pendingRequests;

  return (
    <div className="flex flex-1 h-[calc(100vh-80px)] md:h-screen overflow-hidden bg-background">
      {/* Inbox Sidebar */}
      <div 
        className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-border/50 bg-card/20 ${
          isChatOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-border/50">
          <Typography variant="h2" className="font-bold text-xl mb-4">Mesajlar</Typography>
          
          {/* Tabs */}
          <div className="flex bg-muted/10 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('accepted')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'accepted' ? 'bg-card text-text shadow-sm' : 'text-muted hover:text-text'
              }`}
            >
              Mesajlar
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pending' ? 'bg-card text-text shadow-sm' : 'text-muted hover:text-text'
              }`}
            >
              İstekler
              {pendingRequests.length > 0 && (
                <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : displayChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center opacity-60">
              {activeTab === 'accepted' ? (
                <>
                  <MessageSquare size={40} className="mb-4 text-muted" />
                  <Typography variant="body" className="text-sm">Henüz mesajınız yok.</Typography>
                </>
              ) : (
                <>
                  <UserPlus size={40} className="mb-4 text-muted" />
                  <Typography variant="body" className="text-sm">Mesaj isteği bulunmuyor.</Typography>
                </>
              )}
            </div>
          ) : (
            displayChats.map(chat => {
              const otherUserId = chat.participants.find(id => id !== firebaseUser?.uid) || '';
              const otherUser = chat.participantDetails[otherUserId];
              const unreadCount = chat.unreadCounts[firebaseUser?.uid || ''] || 0;
              
              let timeText = '';
              if (chat.lastMessageAt) {
                const date = chat.lastMessageAt.toDate();
                const now = new Date();
                if (date.toDateString() === now.toDateString()) {
                  timeText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else {
                  timeText = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
                }
              }

              let lastMsg = chat.lastMessage;
              if (chat.status === 'pending' && chat.requestedBy !== firebaseUser?.uid) {
                lastMsg = 'Sana bir mesaj göndermek istiyor.';
              } else if (chat.status === 'pending' && chat.requestedBy === firebaseUser?.uid) {
                lastMsg = 'İstek gönderildi.';
              }

              return (
                <ChatListItem
                  key={chat.id}
                  id={chat.id}
                  displayName={otherUser?.displayName || 'Kullanıcı'}
                  username={otherUser?.username || ''}
                  avatarUrl={otherUser?.avatarUrl}
                  lastMessage={lastMsg}
                  timeText={timeText}
                  unreadCount={unreadCount}
                  isActive={pathname === `/messages/${chat.id}`}
                  onPress={() => router.push(`/messages/${chat.id}`)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Active Chat Area */}
      <div 
        className={`flex-1 flex flex-col bg-background ${
          !isChatOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
