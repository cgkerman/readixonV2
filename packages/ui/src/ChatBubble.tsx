import React from 'react';
import { Typography } from './Typography';

export interface ChatBubbleProps {
  id: string;
  text: string;
  isOwnMessage: boolean;
  timeText: string;
}

export function ChatBubble({ text, isOwnMessage, timeText }: ChatBubbleProps) {
  return (
    <div className={`flex w-full mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl relative group ${
          isOwnMessage 
            ? 'bg-primary text-white rounded-tr-sm' 
            : 'bg-card border border-border text-text rounded-tl-sm'
        }`}
      >
        <Typography variant="body" className={`text-sm break-words whitespace-pre-wrap ${isOwnMessage ? 'text-white' : 'text-text'}`}>
          {text}
        </Typography>
        <div 
          className={`text-[10px] mt-1 flex items-center gap-1 ${
            isOwnMessage ? 'text-white/70 justify-end' : 'text-muted justify-start'
          }`}
        >
          {timeText}
        </div>
      </div>
    </div>
  );
}
