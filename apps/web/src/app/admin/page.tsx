"use client";

import React, { useEffect, useState } from 'react';
import { Typography } from '@readixon/ui';
import { Users, BookOpen, Feather, Hash, Activity } from 'lucide-react';
import { getPlatformStats, PlatformStats } from '@readixon/core';
import Link from 'next/link';
import { ActivityChart } from './components/ActivityChart';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getPlatformStats();
        setStats(data);
      } catch (error) {
        console.error('Stats fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Kullanıcılar', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/admin/users' },
    { title: 'Hikayeler', value: stats?.totalStories ?? 0, icon: BookOpen, color: 'text-green-500', bg: 'bg-green-500/10', href: '/admin/stories' },
    { title: 'Düellolar', value: stats?.totalDuels ?? 0, icon: Feather, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: "Readix'ler", value: stats?.totalReadixes ?? 0, icon: Hash, color: 'text-purple-500', bg: 'bg-purple-500/10', href: '/admin/readixes' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Typography variant="h2" className="font-bold">Dashboard</Typography>
        <Typography variant="body" className="text-muted mt-1">Platformun genel durumu ve özet istatistikleri.</Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const CardContent = (
            <div className={`bg-card/40 border border-border/50 rounded-2xl p-6 flex items-center gap-4 transition-all ${card.href ? 'hover:border-primary/50 hover:bg-card/60 cursor-pointer hover:-translate-y-1 shadow-sm hover:shadow-md' : 'hover:border-primary/30'}`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${card.bg} ${card.color}`}>
                <card.icon size={28} />
              </div>
              <div>
                <Typography variant="caption" className="text-muted font-medium uppercase tracking-wider">{card.title}</Typography>
                {loading ? (
                  <div className="h-8 w-16 bg-muted/20 animate-pulse rounded mt-1"></div>
                ) : (
                  <Typography variant="h2" className="font-bold leading-none mt-1">{card.value}</Typography>
                )}
              </div>
            </div>
          );

          return card.href ? (
            <Link href={card.href} key={idx} className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
              {CardContent}
            </Link>
          ) : (
            <div key={idx}>
              {CardContent}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card/40 border border-border/50 rounded-2xl p-6 min-h-[350px]">
          <ActivityChart />
        </div>

        <div className="bg-card/40 border border-border/50 rounded-2xl p-6">
          <Typography variant="h3" className="mb-4">Son İşlemler</Typography>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <Typography variant="body" className="text-sm">Aktivite Grafiği anlık senkronizasyona başladı</Typography>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <Typography variant="body" className="text-sm">Admin paneli tabloları güncellendi</Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
