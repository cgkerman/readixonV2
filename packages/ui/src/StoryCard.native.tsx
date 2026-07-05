import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Eye, Heart } from 'lucide-react-native';
import { Typography } from './Typography';

export interface StoryCardProps {
  title: string;
  authorName: string;
  coverImage?: string;
  views: number;
  likes: number;
  tags: string[];
  onPress?: () => void;
  className?: string;
  testID?: string;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  title,
  authorName,
  coverImage,
  views,
  likes,
  tags,
  onPress,
  className = '',
  testID,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      testID={testID}
      className={`flex-1 rounded-2xl overflow-hidden bg-card/80 border border-border/40 ${className}`}
    >
      {/* Kapak Resmi Alanı */}
      <View className="w-full aspect-[4/5] bg-muted/20 relative">
        {coverImage ? (
          <Image 
            source={{ uri: coverImage }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-purple-900/40">
            <Typography variant="h2" className="text-white/30 font-bold uppercase">
              {title.substring(0, 2)}
            </Typography>
          </View>
        )}

        {/* İstatistikler Overlay */}
        <View className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 flex-row justify-between items-center">
          <View className="flex-row items-center gap-1">
            <Eye size={12} color="#ffffff90" />
            <Typography variant="caption" className="text-white/90">
              {(views / 1000).toFixed(1)}k
            </Typography>
          </View>
          <View className="flex-row items-center gap-1">
            <Heart size={12} color="#ffffff90" />
            <Typography variant="caption" className="text-white/90">
              {likes}
            </Typography>
          </View>
        </View>
      </View>

      {/* İçerik Alanı */}
      <View className="p-3 gap-1">
        <Typography variant="body" className="font-semibold text-text" numberOfLines={1}>
          {title}
        </Typography>
        <Typography variant="caption" className="text-muted" numberOfLines={1}>
          {authorName}
        </Typography>
        
        {/* Etiketler */}
        <View className="flex-row flex-wrap gap-1 mt-1">
          {tags.slice(0, 2).map((tag, i) => (
            <View key={i} className="px-1.5 py-0.5 rounded-full bg-primary/10">
              <Typography variant="caption" className="text-primary text-[9px] uppercase font-bold">
                {tag}
              </Typography>
            </View>
          ))}
          {tags.length > 2 && (
            <View className="px-1.5 py-0.5 rounded-full bg-muted/10">
              <Typography variant="caption" className="text-muted text-[9px] uppercase font-bold">
                +{tags.length - 2}
              </Typography>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StoryCard;
