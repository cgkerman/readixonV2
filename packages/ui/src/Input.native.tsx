import React from 'react';
import { View, Text, TextInput } from 'react-native';
import type { InputProps } from './Input';

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
  testID,
}) => {
  const baseInputClasses = 'w-full px-4 py-3 rounded-2xl bg-card border text-text';
  const stateClasses = error ? 'border-red-500' : 'border-border';
  const disabledClasses = disabled ? 'opacity-50' : '';

  const keyboardType = type === 'email' ? 'email-address' : type === 'number' ? 'numeric' : type === 'tel' ? 'phone-pad' : 'default';
  const secureTextEntry = type === 'password';

  return (
    <View className={`flex-col gap-1.5 ${className}`}>
      {label && (
        <Text className="text-sm font-medium text-text ml-1">
          {label}
          {required && <Text className="text-primary ml-1">*</Text>}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A1A1AA"
        editable={!disabled}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        testID={testID}
        className={`${baseInputClasses} ${stateClasses} ${disabledClasses}`}
      />
      {hint && !error && <Text className="text-xs text-muted ml-1">{hint}</Text>}
      {error && <Text className="text-xs text-red-500 ml-1">{error}</Text>}
    </View>
  );
};

export default Input;
