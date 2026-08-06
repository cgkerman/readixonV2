import React from 'react';
import { Typography } from './Typography';

export interface ChatBubbleProps {
  id: string;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  linkedStory?: {
    id: string;
    title: string;
    coverUrl?: string;
    authorName?: string;
  };
  isOwnMessage: boolean;
  timeText: string;
  status?: 'sent' | 'read';
  onStoryClick?: (storyId: string) => void;
}

import { Check, CheckCheck, BookOpen } from 'lucide-react';
import { CustomAudioPlayer } from './CustomAudioPlayer';

export function ChatBubble({ text, imageUrl, audioUrl, linkedStory, isOwnMessage, timeText, status, onStoryClick }: ChatBubbleProps) {
  return (
    <div className={`flex w-full mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl relative group ${
          isOwnMessage 
            ? 'bg-primary text-white rounded-tr-sm' 
            : 'bg-card border border-border text-text rounded-tl-sm'
        }`}
      >
        {imageUrl && (
          <div className="mb-2 -mx-2 -mt-1 overflow-hidden rounded-xl">
            <img src={imageUrl} alt="Message" className="w-full h-auto max-h-64 object-cover" />
          </div>
        )}
        
        {audioUrl && (
          <div className="mb-2 mt-1 -mx-2 bg-black/10 rounded-xl overflow-hidden p-0.5">
            <CustomAudioPlayer src={audioUrl} isOwnMessage={isOwnMessage} />
          </div>
        )}
        
        {linkedStory && (
          <a 
            href={`/story/${linkedStory.id}`} 
            onClick={(e) => {
              if (onStoryClick) {
                e.preventDefault();
                onStoryClick(linkedStory.id);
              }
            }}
            className={`block mb-2 -mx-1 mt-1 p-2 rounded-xl flex gap-3 transition-colors ${
              isOwnMessage ? 'bg-black/10 hover:bg-black/20' : 'bg-muted/10 hover:bg-muted/20 border border-border/50'
            }`}
          >
            {linkedStory.coverUrl ? (
              <img src={linkedStory.coverUrl} alt={linkedStory.title} className="w-12 h-16 object-cover rounded-md shadow-sm shrink-0" />
            ) : (
              <div className="w-12 h-16 bg-muted/20 rounded-md flex items-center justify-center shrink-0">
                <BookOpen size={16} className="opacity-50" />
              </div>
            )}
            <div className="flex flex-col justify-center min-w-0">
              <Typography variant="body" className={`font-semibold text-sm truncate ${isOwnMessage ? 'text-white' : 'text-text'}`}>
                {linkedStory.title}
              </Typography>
              <Typography variant="caption" className={`text-xs truncate ${isOwnMessage ? 'text-white/80' : 'text-muted'}`}>
                {linkedStory.authorName}
              </Typography>
            </div>
          </a>
        )}

        {text && (
          <Typography variant="body" className={`text-sm break-words whitespace-pre-wrap ${isOwnMessage ? 'text-white' : 'text-text'}`}>
            {text}
          </Typography>
        )}
        <div 
          className={`text-[10px] mt-1 flex items-center gap-1 ${
            isOwnMessage ? 'text-white/70 justify-end' : 'text-muted justify-start'
          }`}
        >
          {timeText}
          {isOwnMessage && status && (
            <span className="ml-0.5">
              {status === 'read' ? <CheckCheck size={14} className="text-white" /> : <Check size={14} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
