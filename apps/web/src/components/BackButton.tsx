"use client";

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Geri Dön
    </button>
  );
}
