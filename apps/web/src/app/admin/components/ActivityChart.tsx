"use client";

import React, { useEffect, useState } from 'react';
import { listenToRecentActivity, ActivityDataPoint } from '@readixon/core';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Typography } from '@readixon/ui';
import { Activity } from 'lucide-react';

export function ActivityChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Component yüklendiğinde dinleyiciyi başlat
    // 100 belge sınırı ile performansı optimize ediyoruz
    const unsubscribe = listenToRecentActivity(100, (newData) => {
      // Gelen veriyi (YYYY-MM-DD) daha okunabilir formata çevirebiliriz,
      // ancak X ekseninde rahat okunsun diye günü alıyoruz
      const formattedData = newData.map(item => {
        const d = new Date(item.date);
        return {
          ...item,
          displayDate: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
        };
      });
      setData(formattedData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (data.length === 0) {
    return (
      <div className="w-full h-[350px] flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <Typography variant="body" className="text-muted">Aktivite verisi yükleniyor...</Typography>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Activity size={24} className="text-primary" />
        <Typography variant="h3" className="font-bold">14 Günlük Büyüme (Canlı)</Typography>
      </div>
      
      <div className="flex-1 w-full" style={{ minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorStories" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'currentColor' }} 
              className="opacity-50 text-xs"
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'currentColor' }} 
              className="opacity-50 text-xs"
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                color: 'hsl(var(--text))'
              }}
              itemStyle={{ color: 'hsl(var(--text))' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted))' }} />
            <Area 
              type="monotone" 
              name="Yeni Kullanıcılar"
              dataKey="newUsers" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorUsers)" 
            />
            <Area 
              type="monotone" 
              name="Yeni Hikayeler"
              dataKey="newStories" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorStories)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
