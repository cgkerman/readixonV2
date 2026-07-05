"use client";

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'interactive';
  className?: string;
  onPress?: () => void;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onPress,
  testID,
}) => {
  const baseClasses = 'rounded-3xl p-6 transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-card border border-border shadow-sm',
    glass: 'bg-glass backdrop-blur-lg border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
    interactive: 'bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer active:scale-[0.98]',
  };

  const Component = onPress ? 'div' : 'div'; // Use div for both, handle click

  return (
    <Component
      onClick={onPress}
      data-testid={testID}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role={onPress ? 'button' : 'article'}
    >
      {children}
    </Component>
  );
};

export default Card;
