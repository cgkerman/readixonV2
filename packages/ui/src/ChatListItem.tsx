import React from 'react';
import { Typography } from './Typography';

export interface ChatListItemProps {
  id: string;
  avatarUrl?: string;
  displayName: string;
  username: string;
  lastMessage: string;
  timeText: string;
  unreadCount?: number;
  isActive?: boolean;
  onPress: () => void;
}

export function ChatListItem({
  avatarUrl,
  displayName,
  username,
  lastMessage,
  timeText,
  unreadCount = 0,
  isActive = false,
  onPress
}: ChatListItemProps) {
  return (
    <div
      onClick={onPress}
      className={`flex items-center gap-4 p-4 cursor-pointer transition-all border-b border-border/30 last:border-0 hover:bg-card ${
        isActive ? 'bg-card border-l-2 border-l-primary' : ''
      }`}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-primary uppercase">{displayName.charAt(0)}</span>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <Typography variant="body" className="font-semibold text-text truncate pr-2">
            {displayName}
          </Typography>
          <span className="text-[10px] text-muted whitespace-nowrap">{timeText}</span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <Typography 
            variant="body" 
            className={`text-sm truncate ${unreadCount > 0 ? 'text-text font-medium' : 'text-muted'}`}
          >
            {lastMessage || 'Mesaj gönder'}
          </Typography>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
