import React from 'react';
import { View, Pressable } from 'react-native';
import type { CardProps } from './Card';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onPress,
  testID,
}) => {
  const baseClasses = 'rounded-3xl p-6';
  
  const variantClasses = {
    default: 'bg-card border border-border',
    glass: 'bg-[#18181B] opacity-90 border border-white/10', // Fallback for glass on native without heavy libraries
    interactive: 'bg-card border border-border',
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        testID={testID}
        className={`${baseClasses} ${variantClasses[variant]} active:scale-[0.98] active:opacity-80 ${className}`}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </View>
  );
};

export default Card;
