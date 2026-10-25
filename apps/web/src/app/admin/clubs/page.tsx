'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Typography, Button } from '@readixon/ui';
import { getAllClubs, useAuthStore, type Club } from '@readixon/core';
import {
  Users,
  Search,
  ExternalLink,
  ShieldAlert,
  Feather,
  Sparkles,
  Lock,
  Globe,
  Loader2,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { AdminDeleteClubModal } from '@/components/clubs/AdminDeleteClubModal';

export default function AdminClubsPage() {
  const { firebaseUser, userProfile } = useAuthStore();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClubForDelete, setSelectedClubForDelete] = useState<Club | null>(null);

  const loadClubs = async () => {
    setLoading(true);
    try {
      const data = await getAllClubs();
      setClubs(data);
    } catch (err) {
      console.error('Kulüpler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const filteredClubs = clubs.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.creatorName.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="font-bold flex items-center gap-2.5">
            <Users className="text-primary" size={26} />
            Kitap Kulüpleri Yönetimi
          </Typography>
          <Typography variant="body" className="text-muted mt-1">
            Platformdaki tüm okur ve yazar kitap kulüplerini denetleyin, detaylarını inceleyin veya gerekçeli kapatma uygulayın.
          </Typography>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/clubs" target="_blank">
            <Button variant="outline" className="text-xs font-semibold flex items-center gap-1.5 border-border/60">
              <ExternalLink size={14} /> Kulüpler Vitrinine Git
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/50">
          <span className="text-xs text-muted font-medium">Toplam Kulüp Sayısı</span>
          <p className="text-2xl font-black text-foreground mt-1">{clubs.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/50">
          <span className="text-xs text-muted font-medium">Resmi Yazar Kulüpleri</span>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {clubs.filter((c) => c.isAuthorOfficial).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/50">
          <span className="text-xs text-muted font-medium">Açık / Topluluk Kulüpleri</span>
          <p className="text-2xl font-black text-primary mt-1">
            {clubs.filter((c) => !c.isPrivate).length}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Kulüp adı, kurucu veya slug ile ara..."
          className="w-full bg-card border border-border/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground outline-hidden focus:border-primary transition-all placeholder:text-muted/60"
        />
      </div>

      {/* Clubs Table */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="text-xs text-muted">Kulüpler yükleniyor...</span>
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-muted/40 mb-3" size={40} />
            <Typography variant="body" className="text-muted font-medium">
              {searchQuery ? 'Aramanıza uygun kulüp bulunamadı.' : 'Henüz kurulmuş bir kulüp yok.'}
            </Typography>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background/50 border-b border-border/40 text-[11px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-3.5 px-4">Kulüp</th>
                  <th className="py-3.5 px-4">Tür & Görünürlük</th>
                  <th className="py-3.5 px-4">Kurucu</th>
                  <th className="py-3.5 px-4 text-center">Üye</th>
                  <th className="py-3.5 px-4 text-center">Bitirilen</th>
                  <th className="py-3.5 px-4 text-right">Yönetici İşlemleri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredClubs.map((club) => (
                  <tr key={club.id} className="hover:bg-muted/5 transition-colors">
                    {/* Club Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted/20 border border-border/40 overflow-hidden flex items-center justify-center shrink-0">
                          {club.avatarUrl ? (
                            <img src={club.avatarUrl} alt={club.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-primary">{club.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/clubs/${club.slug}`}
                            target="_blank"
                            className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                          >
                            <span>{club.name}</span>
                            <ExternalLink size={12} className="opacity-60" />
                          </Link>
                          <span className="text-[11px] text-muted block mt-0.5 max-w-xs truncate">
                            /{club.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type & Visibility */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        {club.isAuthorOfficial ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            <Feather size={10} /> Yazar Kulübü
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/15 text-primary border border-primary/20">
                            <Sparkles size={10} /> Okur Kulübü
                          </span>
                        )}
                        {club.isPrivate ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted">
                            <Lock size={10} /> Özel
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted">
                            <Globe size={10} /> Açık
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Creator */}
                    <td className="py-4 px-4">
                      <span className="font-medium text-foreground text-xs block">{club.creatorName}</span>
                      <span className="text-[11px] text-muted">@{club.creatorUsername || 'okur'}</span>
                    </td>

                    {/* Members Count */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-semibold text-xs text-foreground">
                        {club.stats?.membersCount || 1}
                      </span>
                    </td>

                    {/* Completed Books */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-semibold text-xs text-foreground">
                        {club.stats?.completedBooksCount || 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/clubs/${club.slug}`} target="_blank">
                          <Button
                            variant="ghost"
                            className="text-xs font-semibold px-2.5 py-1.5 h-auto text-muted hover:text-foreground"
                          >
                            İncele
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          onPress={() => setSelectedClubForDelete(club)}
                          className="text-xs font-bold px-3 py-1.5 h-auto text-rose-500 border-rose-500/30 hover:bg-rose-500/10 flex items-center gap-1"
                        >
                          <ShieldAlert size={13} />
                          <span>Kulübü Kapat</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Delete Club Modal */}
      {selectedClubForDelete && (
        <AdminDeleteClubModal
          isOpen={true}
          onClose={() => setSelectedClubForDelete(null)}
          clubId={selectedClubForDelete.id}
          clubName={selectedClubForDelete.name}
          creatorName={selectedClubForDelete.creatorName}
          membersCount={selectedClubForDelete.stats?.membersCount || 1}
          adminId={firebaseUser?.uid || ''}
          adminName={userProfile?.displayName || userProfile?.username || 'Admin'}
          onSuccess={() => {
            setSelectedClubForDelete(null);
            loadClubs();
          }}
        />
      )}
    </div>
  );
}
