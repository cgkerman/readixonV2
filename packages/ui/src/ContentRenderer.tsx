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
            const htmlContent = (block.text || '\u00A0')
              .replace(/\n/g, '<br/>')
              .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
              .replace(/\*(.*?)\*/g, '<i>$1</i>');

            return (
              <div key={index} className="flex flex-col gap-2">
                <Typography 
                  variant="body" 
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    lineHeight: 1.6, 
                    color: textColor
                  }}
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
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
              <div key={index} className="flex justify-center my-6 w-full">
                <div className="w-full h-[1px]" style={{ backgroundColor: textColor || 'currentColor', opacity: 0.2 }} />
              </div>
            );
          case 'end_of_chapter':
            return (
              <div key={index} className="flex justify-center my-12 w-full">
                <Typography 
                  variant="body" 
                  style={{ fontSize: `${fontSize}px`, color: textColor, fontWeight: 'bold' }}
                  className="text-center tracking-widest uppercase opacity-80"
                >
                  • • • Bölüm Sonu • • •
                </Typography>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};
