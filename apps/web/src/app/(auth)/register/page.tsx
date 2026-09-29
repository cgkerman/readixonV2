import React from 'react';
import Login11AuthCard from '@/components/auth/Login11AuthCard';

export const metadata = {
  title: 'Kayıt Ol | Readixon',
  description: 'Readixon topluluğuna katılın, kendi hikayenizi yazın veya binlerce eseri keşfedin.',
};

export default function RegisterPage() {
  return <Login11AuthCard initialView="signup" />;
}
