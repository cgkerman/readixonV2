import React from 'react';
import Login11AuthCard from '@/components/auth/Login11AuthCard';

export const metadata = {
  title: 'Giriş Yap | Readixon',
  description: 'Readixon hesabınıza giriş yapın, hikayelerinizi ve kütüphanenizi keşfetmeye devam edin.',
};

export default function LoginPage() {
  return <Login11AuthCard initialView="signin" />;
}
