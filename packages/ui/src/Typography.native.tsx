import React from 'react';
import { Text, TextProps } from 'react-native';

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';

export interface TypographyProps extends TextProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  className?: string;
  testID?: string;
}

export function Typography({
  children,
  variant = 'body',
  className = '',
  testID,
  ...props
}: TypographyProps) {
  const baseClasses = 'text-text font-sans';
  
  const variantClasses = {
    h1: 'text-4xl font-bold tracking-tight',
    h2: 'text-2xl font-semibold',
    h3: 'text-xl font-medium',
    h4: 'text-lg font-medium',
    body: 'text-base',
    caption: 'text-sm text-muted',
  };

  return (
    <Text
      testID={testID}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
};

export default Typography;
