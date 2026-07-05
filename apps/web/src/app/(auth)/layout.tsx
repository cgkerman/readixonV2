import React from 'react';
import { Typography } from '@readixon/ui';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient light effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mb-8 text-center animate-fade-in z-10">
        <Typography variant="h1" className="text-4xl font-extrabold tracking-tighter">
          readixon
        </Typography>
        <Typography variant="body" className="text-muted mt-2">
          Hikayeler seni bekliyor.
        </Typography>
      </div>

      <div className="w-full max-w-md z-10 animate-slide-up">
        {children}
      </div>
    </div>
  );
}
