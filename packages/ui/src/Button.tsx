"use client";

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'glass' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  type = 'button',
  className = '',
  testID,
}) => {
  const baseClasses = 'flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100';
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const variantClasses = {
    primary: 'bg-primary text-background hover:brightness-110 shadow-lg hover:shadow-primary/20',
    secondary: 'bg-card text-text border border-border hover:border-muted',
    ghost: 'bg-transparent text-text hover:bg-card',
    glass: 'bg-background/40 backdrop-blur-md text-text border border-text/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-text/5',
    outline: 'bg-transparent border',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onPress}
      data-testid={testID}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      aria-busy={loading}
    >
      {loading ? (
        <span className="animate-spin mr-2 border-2 border-background/20 border-t-background rounded-full w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
