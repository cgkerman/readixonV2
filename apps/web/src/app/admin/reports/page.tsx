'use client';

import React, { useEffect, useState } from 'react';
import { getAdminReports, resolveReport, deleteReportTarget, Report, ReportStatus, ReportTargetType } from '@readixon/core';
import { Typography, Button, ConfirmationDialog } from '@readixon/ui';
import { Loader2, Flag, CheckCircle, Trash2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";
import { DocumentSnapshot } from 'firebase/firestore';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const res = await getAdminReports(20, null);
      setReports(res.data);
      setLastDoc(res.lastDoc);
    } catch (error) {
      toast.error('Şikayetler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!lastDoc) return;
    setLoadingMore(true);
    try {
      const res = await getAdminReports(20, lastDoc);
      setReports(prev => [...prev, ...res.data]);
      setLastDoc(res.lastDoc);
    } catch (error) {
      toast.error('Daha fazla yüklenemedi.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleResolve = async (reportId: string, status: ReportStatus) => {
    try {
      await resolveReport(reportId, status);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      toast.success(status === 'resolved' ? 'Şikayet çözüldü olarak işaretlendi.' : 'Şikayet reddedildi.');
    } catch (e) {
      toast.error('İşlem başarısız.');
    }
  };

  const handleDeleteTarget = async () => {
    if (!activeReport) return;
    setIsProcessing(true);
    try {
      await deleteReportTarget(activeReport.targetId, activeReport.targetType);
      await resolveReport(activeReport.id!, 'resolved');
      
      setReports(prev => prev.map(r => r.id === activeReport.id ? { ...r, status: 'resolved' } : r));
      setDeleteConfirmOpen(false);
      toast.success('İçerik silindi ve şikayet çözüldü.');
    } catch (e) {
      toast.error('Silme başarısız.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeLabel = (type: ReportTargetType) => {
    switch (type) {
      case 'readix': return 'Readix Gönderisi';
      case 'story': return 'Hikaye';
      case 'user': return 'Kullanıcı';
      case 'comment': return 'Yorum';
      default: return type;
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-semibold flex items-center gap-1"><AlertTriangle size={12} /> Bekliyor</span>;
      case 'resolved':
        return <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle size={12} /> Çözüldü</span>;
      case 'dismissed':
        return <span className="px-3 py-1 bg-muted/20 text-muted border border-border rounded-full text-xs font-semibold flex items-center gap-1"><XCircle size={12} /> Reddedildi</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20">
          <Flag size={28} />
        </div>
        <div>
          <Typography variant="h2" className="text-2xl font-bold">Şikayet Yönetimi</Typography>
          <Typography variant="body" className="text-muted">Kullanıcı bildirimlerini inceleyin ve aksiyon alın.</Typography>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/10 text-muted border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Tür</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Detay</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Durum</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Tarih</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted">
                    Hiç şikayet bulunmuyor. Her şey yolunda!
                  </td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {getTypeLabel(report.targetType)}
                      <br/>
                      <span className="text-xs text-muted">ID: {report.targetId.substring(0,8)}...</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="truncate text-text font-medium">{report.reason}</p>
                      <p className="text-xs text-muted">Şikayet eden: {report.reporterId.substring(0,8)}...</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {report.createdAt ? new Date((report.createdAt as any).seconds ? (report.createdAt as any).seconds * 1000 : (report.createdAt as unknown as number)).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {report.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => { setActiveReport(report); setDeleteConfirmOpen(true); }}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                              title="İçeriği Sil"
                            >
                              <Trash2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleResolve(report.id!, 'dismissed')}
                              className="p-2 text-muted hover:bg-muted/20 rounded-xl transition-colors"
                              title="Asılsız / Reddet"
                            >
                              <XCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleResolve(report.id!, 'resolved')}
                              className="p-2 text-green-500 hover:bg-green-500/10 rounded-xl transition-colors"
                              title="Çözüldü İşaretle (İşlem Yapmadan)"
                            >
                              <CheckCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {lastDoc && (
          <div className="p-4 border-t border-border/50 flex justify-center bg-muted/5">
            <Button variant="secondary" onPress={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
            </Button>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setActiveReport(null); }}
        onConfirm={handleDeleteTarget}
        title="İçeriği Sil ve Şikayeti Çöz"
        message="Bu şikayet edilen içeriği tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil ve Çöz"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
