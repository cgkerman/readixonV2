import React from 'react';
import type { ContentBlock } from '@readixon/core/src/types';
import { Typography } from './Typography';

export interface ContentRendererProps {
  blocks: ContentBlock[];
  fontSize?: number;
  textColor?: string;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ blocks, fontSize = 16, textColor }) => {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <div key={index} className="flex flex-col gap-2">
                {block.text?.split('\n').map((line, i) => (
                  <Typography 
                    key={i} 
                    variant="body" 
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.6, color: textColor }}
                  >
                    {line || '\u00A0'}
                  </Typography>
                ))}
              </div>
            );
          case 'quote':
            return (
              <blockquote 
                key={index} 
                className="pl-4 border-l-4 italic"
                style={{ borderColor: textColor, opacity: 0.8 }}
              >
                <Typography 
                  variant="body" 
                  style={{ fontSize: `${fontSize * 1.1}px`, lineHeight: 1.6, color: textColor }}
                >
                  "{block.text}"
                </Typography>
              </blockquote>
            );
          case 'image':
            return (
              <div key={index} className="w-full rounded-xl overflow-hidden my-4">
                <img 
                  src={block.url} 
                  alt="Story Image" 
                  className="w-full h-auto object-cover" 
                />
              </div>
            );
          case 'divider':
            return (
              <div key={index} className="flex justify-center my-6">
                <div className="w-16 h-1 rounded-full bg-border/50" />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};
