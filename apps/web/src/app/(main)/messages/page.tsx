"use client";

import React from 'react';
import { Typography } from '@readixon/ui';
import { MessageCircle } from 'lucide-react';

export default function MessagesEmptyPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-70">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <MessageCircle size={48} className="text-primary/70" />
      </div>
      <Typography variant="h2" className="mb-2">Mesajlarınız</Typography>
      <Typography variant="body" className="text-muted max-w-md">
        Sohbet başlatmak veya mesaj okumak için yandaki listeden bir konuşma seçin. Yalnızca karşılıklı takipleştiğiniz kişilerle veya istekleri kabul ettiğiniz kişilerle mesajlaşabilirsiniz.
      </Typography>
    </div>
  );
}
