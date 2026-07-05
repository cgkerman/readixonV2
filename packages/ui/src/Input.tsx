"use client";

import React from 'react';

export type InputType = 'text' | 'email' | 'password' | 'search' | 'number' | 'tel';

export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: InputType;
  value?: string;
  onChangeText?: (value: string) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  accessibilityLabel?: string;
  testID?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChangeText,
  error,
  hint,
  disabled = false,
  required = false,
  className = '',
  accessibilityLabel,
  testID,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeText?.(e.target.value);
  };

  const baseInputClasses = 'w-full px-4 py-3 rounded-2xl bg-card border text-text transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/50';
  const stateClasses = error 
    ? 'border-red-500 focus:border-red-500' 
    : 'border-border focus:border-primary';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text ml-1">
          {label}
          {required && <span className="text-primary ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${baseInputClasses} ${stateClasses} ${disabledClasses}`}
        aria-label={accessibilityLabel ?? label}
        aria-describedby={error ? `${testID}-error` : hint ? `${testID}-hint` : undefined}
        aria-invalid={!!error}
        data-testid={testID}
      />
      {hint && !error && <p id={`${testID}-hint`} className="text-xs text-muted ml-1">{hint}</p>}
      {error && (
        <p id={`${testID}-error`} className="text-xs text-red-500 ml-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
