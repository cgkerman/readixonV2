"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { getAdminUsers, User } from '@readixon/core';
import type { DocumentSnapshot } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  useEffect(() => {
    loadInitialUsers();
  }, []);

  const loadInitialUsers = async () => {
    setLoading(true);
    const result = await getAdminUsers(20);
    setUsers(result.data);
    setLastDoc(result.lastDoc);
    setLoading(false);
  };

  const loadMore = async () => {
    if (!lastDoc) return;
    setLoadingMore(true);
    const result = await getAdminUsers(20, lastDoc);
    setUsers((prev) => [...prev, ...result.data]);
    setLastDoc(result.lastDoc);
    setLoadingMore(false);
  };

  const getRoleBadge = (user: User) => {
    if (user.isAdmin) {
      return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Admin</span>;
    }
    if (user.isAuthor) {
      return <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Yazar</span>;
    }
    return <span className="bg-muted/10 text-muted border border-border/50 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Okur</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="font-bold">Kullanıcılar</Typography>
          <Typography variant="body" className="text-muted mt-1">Platforma kayıtlı tüm kullanıcıların listesi ve detayları.</Typography>
        </div>
      </div>

      <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border/50 bg-card/60 backdrop-blur-sm">
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[35%]">Kullanıcı</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[15%]">Rol</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[20%]">Katılım Tarihi</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[15%]">Okuma</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider w-[15%]">Takipçi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                      <Typography variant="body" className="text-muted">Yükleniyor...</Typography>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted">Kayıtlı kullanıcı bulunamadı.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.uid} className="hover:bg-card/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Link href={`/admin/users/${user.uid}`} className="shrink-0 block">
                          <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden border border-primary/20 group-hover:border-primary/50 transition-colors">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                                {user.displayName?.charAt(0) || 'U'}
                              </div>
                            )}
                          </div>
                        </Link>
                        <div>
                          <Link href={`/admin/users/${user.uid}`}>
                            <Typography variant="body" className="font-semibold text-text group-hover:text-primary transition-colors">{user.displayName}</Typography>
                          </Link>
                          <Typography variant="caption" className="text-muted">@{user.username || user.uid.substring(0, 8)}</Typography>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted font-medium">
                      {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {user.stats?.totalReads?.toLocaleString('tr-TR') || 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {user.stats?.followers?.toLocaleString('tr-TR') || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {lastDoc && (
          <div className="p-4 border-t border-border/50 flex justify-center bg-card/20">
            <Button variant="outline" onPress={loadMore} className="min-w-[200px] border-primary/20 text-primary hover:bg-primary/10">
              {loadingMore ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
