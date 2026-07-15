"use client";

import React from 'react';
import { Typography } from '@readixon/ui';

export default function AdminDuelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="font-bold text-primary">Düellolar</Typography>
        <Typography variant="body" className="text-muted">Platformdaki düelloların yönetimi (Çok Yakında)</Typography>
      </div>
      <div className="bg-card/50 border border-border/50 rounded-2xl p-12 text-center">
        <Typography variant="h3" className="text-muted">Bu modül yapım aşamasındadır.</Typography>
      </div>
    </div>
  );
}
