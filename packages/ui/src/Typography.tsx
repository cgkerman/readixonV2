import React from 'react';

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  variant?: TypographyVariant;
  className?: string;
  testID?: string;
  numberOfLines?: number;
}

export function Typography({
  children,
  variant = 'body',
  className = '',
  testID,
  numberOfLines,
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

  const Component = (variant.startsWith('h') ? variant : 'p') as 'h1' | 'h2' | 'h3' | 'h4' | 'p';

  if (props.dangerouslySetInnerHTML) {
    return (
      <Component
        data-testid={testID}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }

  return (
    <Component
      data-testid={testID}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Typography;
