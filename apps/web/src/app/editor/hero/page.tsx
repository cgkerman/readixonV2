"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@readixon/ui';
import { getAllHeroBannersAdmin, deleteHeroBanner, updateHeroBanner, type HeroBanner } from '@readixon/core';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditorHeroBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await getAllHeroBannersAdmin();
      setBanners(data);
    } catch (error) {
      toast.error('Manşetler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu manşeti silmek istediğinize emin misiniz?')) return;
    
    try {
      await deleteHeroBanner(id);
      toast.success('Manşet silindi!');
      fetchBanners();
    } catch (error) {
      toast.error('Silinirken hata oluştu.');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateHeroBanner(id, { isActive: !currentStatus });
      toast.success(currentStatus ? 'Manşet yayından kaldırıldı.' : 'Manşet yayına alındı.');
      fetchBanners();
    } catch (error) {
      toast.error('Durum güncellenirken hata oluştu.');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Typography variant="h2" className="font-bold text-text mb-1">Manşet Yönetimi</Typography>
          <Typography variant="body" className="text-muted">Ana sayfadaki (feed) kahraman (hero) alanında çıkacak dinamik duyuruları yönetin.</Typography>
        </div>
        <Link href="/editor/hero/create">
          <Button variant="primary" className="px-6 rounded-full">
            <Plus size={18} className="mr-2" /> Yeni Manşet Ekle
          </Button>
        </Link>
      </div>

      <div className="bg-card w-full rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <p>Henüz hiç manşet eklenmemiş.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/50 text-muted text-sm bg-muted/5">
                  <th className="py-4 px-6 font-medium">Sıra</th>
                  <th className="py-4 px-6 font-medium">Görsel</th>
                  <th className="py-4 px-6 font-medium">Başlık / Badge</th>
                  <th className="py-4 px-6 font-medium">Durum</th>
                  <th className="py-4 px-6 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {banners.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/5 transition-colors">
                    <td className="py-4 px-6 font-semibold">{item.order}</td>
                    <td className="py-4 px-6">
                      <div className="w-24 aspect-square rounded bg-muted/20 border border-border/50 overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted">Yok</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">
                        {item.badge}
                      </span>
                      <Typography variant="body" className="font-semibold line-clamp-1">{item.title}</Typography>
                      {item.primaryLink && (
                        <a href={item.primaryLink} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block truncate max-w-[200px]">
                          {item.primaryLink}
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => toggleStatus(item.id, item.isActive)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          item.isActive 
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                            : 'bg-muted/10 text-muted hover:bg-muted/20'
                        }`}
                      >
                        {item.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {item.isActive ? 'Yayında' : 'Pasif'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/editor/hero/${item.id}/edit`}>
                          <button className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                            <Pencil size={18} />
                          </button>
                        </Link>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
