import React from 'react';
import { View, Image } from 'react-native';
import type { ContentBlock } from '@readixon/core/src/types';
import { Typography } from './Typography';

export interface ContentRendererProps {
  blocks: ContentBlock[];
  fontSize?: number;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ blocks, fontSize = 16 }) => {
  return (
    <View className="flex-col gap-6 w-full">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <Typography 
                key={index} 
                variant="body" 
                style={{ fontSize, lineHeight: fontSize * 1.6 }}
              >
                {block.text}
              </Typography>
            );
          case 'quote':
            return (
              <View 
                key={index} 
                className="pl-4 border-l-4 border-primary"
              >
                <Typography 
                  variant="body" 
                  className="italic text-muted"
                  style={{ fontSize: fontSize * 1.1, lineHeight: fontSize * 1.7 }}
                >
                  "{block.text}"
                </Typography>
              </View>
            );
          case 'image':
            return (
              <View key={index} className="w-full rounded-xl overflow-hidden my-4">
                <Image 
                  source={{ uri: block.url }} 
                  className="w-full aspect-video" 
                  resizeMode="cover"
                />
              </View>
            );
          case 'divider':
            return (
              <View key={index} className="items-center my-6">
                <View className="w-16 h-1 rounded-full bg-border/50" />
              </View>
            );
          default:
            return null;
        }
      })}
    </View>
  );
};
