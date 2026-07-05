import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import type { ButtonProps } from './Button';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  className = '',
  testID,
}) => {
  const baseClasses = 'flex-row items-center justify-center rounded-2xl';
  
  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };
  
  const variantContainerClasses = {
    primary: 'bg-primary shadow-lg',
    secondary: 'bg-card border border-border',
    ghost: 'bg-transparent',
    glass: 'bg-[#18181B] opacity-90 border border-white/10', // Simplified glass for native
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const variantTextClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-text font-semibold',
    ghost: 'text-text font-semibold',
    glass: 'text-text font-semibold',
  };

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      testID={testID}
      className={`${baseClasses} ${sizeClasses[size]} ${variantContainerClasses[variant]} ${disabled ? 'opacity-50' : 'active:opacity-70 active:scale-95'} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#FF9900'} className="mr-2" />
      ) : null}
      {typeof children === 'string' ? (
        <Text className={`${textSizeClasses[size]} ${variantTextClasses[variant]}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

export default Button;
