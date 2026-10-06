'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  Users,
  BookOpen,
  User as UserIcon,
  Edit2,
  Check,
  X,
  MessageCircle,
  Feather,
  Eye,
  Heart,
  MessageSquare,
  Award,
  Calendar,
  Globe,
  Star,
  Layers,
  MapPin,
  ListMusic,
  Plus,
  Share2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Flame,
  Info
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import {
  Typography,
  Button,
  Input,
  ReadixCard,
  ReadixCommentModal,
  ReadixShareModal,
  ShareReadixData,
  EditReadixModal,
  ReportModal,
  ConfirmationDialog,
  BadgeCard
} from '@readixon/ui';
import {
  useAuthStore,
  getUserByUsername,
  getUserProfile,
  subscribeToPublishedAuthorStories,
  getPublishedChapters,
  checkIsFollowing,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  updateUserProfile,
  uploadFile,
  compressImage,
  getCroppedImg,
  getUserReadixes,
  getMentionedReadixes,
  toggleReadixLike,
  createOrGetChat,
  createReadix,
  updateReadix,
  deleteReadix,
  reportContent,
  blockUser,
  toggleReadixPin,
  getUserReadingLists,
  getPublicUserReadingLists,
  getStoriesByIds,
  BADGES
} from '@readixon/core';
import type { User, Story, Readix, ReadingList } from '@readixon/core';
import { ReadingListCard } from '@/components/reading-list/ReadingListCard';
import { toast } from 'sonner';

type ProfileTab = 'stories' | 'readixes' | 'lists' | 'achievements' | 'about';

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();

  // URL'den kullanıcı adını ayrıştır (@kitapkurdu veya kitapkurdu)
  const rawUsernameParam = typeof params.username === 'string' ? params.username : '';
  const decodedParam = decodeURIComponent(rawUsernameParam);
  const targetUsername = decodedParam.startsWith('@') ? decodedParam.slice(1) : decodedParam;

  const { userProfile: currentUser, firebaseUser } = useAuthStore();

  // Temel Profil Durumları
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [readixes, setReadixes] = useState<Readix[]>([]);
  const [mentionedReadixes, setMentionedReadixes] = useState<Readix[]>([]);
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [listCovers, setListCovers] = useState<Record<string, string[]>>({});
  const [authors, setAuthors] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Sekme Durumları
  const [activeTab, setActiveTab] = useState<ProfileTab>('stories');
  const [activeStoryFormat, setActiveStoryFormat] = useState<'all' | 'novels' | 'webtoons'>('all');
  const [activeReadixTab, setActiveReadixTab] = useState<'shared' | 'mentions'>('shared');

  // Takip Durumları
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Takipçi / Takip Edilen Modalı
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);
  const [followModalUsers, setFollowModalUsers] = useState<User[]>([]);
  const [isFollowModalLoading, setIsFollowModalLoading] = useState(false);

  // Readix Etkileşim & Modal Durumları
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedReadix, setSelectedReadix] = useState<Readix | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedReadixForShare, setSelectedReadixForShare] = useState<ShareReadixData | null>(null);
  const [editReadixModalOpen, setEditReadixModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [activeReadix, setActiveReadix] = useState<Readix | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Profil Düzenleme Modalı (Kapak Görseli Tamamen Çıkarıldı)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    username: '',
    authorQuote: '',
    location: '',
    bio: '',
    avatarUrl: '',
    pinnedStoryId: '',
    preferredGenresText: '',
    socials: {
      twitter: '',
      instagram: '',
      tiktok: '',
      website: '',
      linkedin: '',
      youtube: ''
    }
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fotoğraf Kırpma (Yalnızca Avatar)
  const [isCropping, setIsCropping] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // İstatistikler (Toplam Yorum Sayısı)
  const [globalTotalComments, setGlobalTotalComments] = useState(0);

  const isOwnProfile = currentUser?.uid === profileUser?.uid;

  // Profil Verilerini Yükleme
  useEffect(() => {
    let unsubscribeStories: (() => void) | undefined;

    const fetchProfileData = async () => {
      if (!targetUsername) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const user = await getUserByUsername(targetUsername);
        if (!user) {
          setNotFound(true);
          return;
        }

        setProfileUser(user);

        // 1. Hikayeleri Getir (Eğer Yazarsa)
        let publishedStories: Story[] = [];
        if (user.isAuthor) {
          unsubscribeStories = subscribeToPublishedAuthorStories(user.uid, (loadedStories) => {
            setStories(loadedStories);
            publishedStories = loadedStories;
          });
        }

        // 2. Readixleri Getir
        const userReadixes = await getUserReadixes(user.uid, 30);
        const sortedReadixes = [...userReadixes.readixes].sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0;
        });
        setReadixes(sortedReadixes);

        // 3. Bahsedilen Readixleri Getir
        const mentions = await getMentionedReadixes(user.username || '', 20);
        setMentionedReadixes(mentions.readixes);

        // 4. Okuma Listelerini Getir
        const isSelf = firebaseUser?.uid === user.uid;
        const fetchedLists = isSelf 
          ? await getUserReadingLists(user.uid) 
          : await getPublicUserReadingLists(user.uid);
        setReadingLists(fetchedLists);

        // Okuma listesi kapak mozaiklerini arka planda çek
        const allStoryIds = Array.from(new Set(fetchedLists.flatMap(l => (l.storyIds || []).slice(0, 4))));
        if (allStoryIds.length > 0) {
          try {
            const listStories = await getStoriesByIds(allStoryIds);
            const coverMap: Record<string, string> = {};
            listStories.forEach(s => {
              const cover = s.coverImage || (s as any).coverUrl;
              if (cover) coverMap[s.storyId] = cover;
            });
            const coversRecord: Record<string, string[]> = {};
            fetchedLists.forEach(l => {
              coversRecord[l.id] = (l.storyIds || [])
                .slice(0, 4)
                .map(id => coverMap[id])
                .filter(Boolean);
            });
            setListCovers(coversRecord);
          } catch (listErr) {
            console.warn('Okuma listesi kapakları alınamadı:', listErr);
          }
        }

        // 5. Akıllı Sekme Seçimi (Yazar mı Okur mu?)
        if (user.isAuthor) {
          setActiveTab('stories');
        } else if (userReadixes.readixes.length > 0) {
          setActiveTab('readixes');
        } else if (fetchedLists.length > 0) {
          setActiveTab('lists');
        } else {
          setActiveTab('about');
        }

        // 6. Eksik Yazar Profillerini Getir (Readixler için)
        const missingAuthorIds = Array.from(new Set([
          ...mentions.readixes.map(r => r.authorId),
          ...mentions.readixes.map(r => r.originalReadix?.authorId),
          ...userReadixes.readixes.map(r => r.originalReadix?.authorId)
        ])).filter(id => id && id !== user.uid) as string[];

        if (missingAuthorIds.length > 0) {
          const newAuthors: Record<string, User> = {};
          await Promise.all(missingAuthorIds.map(async (id) => {
            const authorData = await getUserProfile(id);
            if (authorData) newAuthors[id] = authorData;
          }));
          setAuthors(newAuthors);
        }

        // 7. Takip Durumu Kontrolü
        if (firebaseUser && firebaseUser.uid !== user.uid) {
          const following = await checkIsFollowing(firebaseUser.uid, user.uid);
          setIsFollowing(following);
        }

      } catch (error) {
        console.error("Profil verisi yüklenirken hata:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();

    return () => {
      if (unsubscribeStories) unsubscribeStories();
    };
  }, [targetUsername, firebaseUser?.uid]);

  // Global Yorum Sayısı Hesaplaması
  useEffect(() => {
    const fetchGlobalComments = async () => {
      if (profileUser?.isAuthor && stories.length > 0) {
        let total = 0;
        await Promise.all(
          stories.map(async (story) => {
            try {
              const chapters = await getPublishedChapters(story.storyId);
              const chapTotal = chapters.reduce((sum, chap) => sum + (chap.stats?.commentCount || 0), 0);
              const storyTotal = Math.max(story.stats?.commentCount || 0, chapTotal);
              total += storyTotal + (story.stats?.reviewCount || 0);
            } catch (e) {
              total += (story.stats?.commentCount || 0) + (story.stats?.reviewCount || 0);
            }
          })
        );
        setGlobalTotalComments(total);
      }
    };
    fetchGlobalComments();
  }, [profileUser?.isAuthor, stories]);

  // Takip Açma / Kapatma
  const handleFollowToggle = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    if (isFollowLoading || !profileUser) return;

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(firebaseUser.uid, profileUser.uid);
        setIsFollowing(false);
        setProfileUser({
          ...profileUser,
          stats: { ...profileUser.stats, followers: Math.max(0, (profileUser.stats?.followers || 1) - 1) }
        });
        toast.info(`${profileUser.displayName} takipten çıkarıldı.`);
      } else {
        await followUser(firebaseUser.uid, profileUser.uid);
        setIsFollowing(true);
        setProfileUser({
          ...profileUser,
          stats: { ...profileUser.stats, followers: (profileUser.stats?.followers || 0) + 1 }
        });
        toast.success(`${profileUser.displayName} takip ediliyor!`);
      }
    } catch (err) {
      console.error("Takip işlemi başarısız:", err);
      toast.error('İşlem gerçekleştirilemedi.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Takipçi / Takip Edilen Listesi Modalı Açma
  const openFollowModal = async (type: 'followers' | 'following') => {
    if (!profileUser?.uid) return;
    setFollowModalType(type);
    setIsFollowModalLoading(true);
    setFollowModalUsers([]);
    try {
      if (type === 'followers') {
        const users = await getUserFollowers(profileUser.uid);
        setFollowModalUsers(users);
      } else {
        const users = await getUserFollowing(profileUser.uid);
        setFollowModalUsers(users);
      }
    } catch (e) {
      toast.error('Kullanıcı listesi alınamadı.');
    } finally {
      setIsFollowModalLoading(false);
    }
  };

  // Kırpma İşlemleri
  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (cropImageSrc && croppedAreaPixels) {
      try {
        const croppedFile = await getCroppedImg(cropImageSrc, croppedAreaPixels);
        if (croppedFile) {
          setAvatarFile(croppedFile);
          setAvatarPreview(URL.createObjectURL(croppedFile));
        }
      } catch (e) {
        console.error("Kırpma hatası", e);
        toast.error("Fotoğraf kırpılamadı.");
      }
    }
    setIsCropping(false);
  };

  // Profil Güncelleme Kaydetme
  const handleEditSave = async () => {
    if (!profileUser || !firebaseUser || !editForm.displayName || !editForm.username) return;
    setIsSaving(true);
    try {
      let finalAvatarUrl = editForm.avatarUrl;

      if (avatarFile) {
        const compressedFile = await compressImage(avatarFile, 400, 400, 0.85);
        const path = `users/${firebaseUser.uid}/avatar_${Date.now()}`;
        finalAvatarUrl = await uploadFile(compressedFile, path);
      }

      const genresList = editForm.preferredGenresText
        ? editForm.preferredGenresText.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)
        : [];

      const updateData = {
        displayName: editForm.displayName,
        username: editForm.username,
        authorQuote: editForm.authorQuote,
        location: editForm.location,
        bio: editForm.bio,
        avatarUrl: finalAvatarUrl,
        pinnedStoryId: editForm.pinnedStoryId,
        preferredGenres: genresList,
        socials: {
          twitter: editForm.socials?.twitter || '',
          instagram: editForm.socials?.instagram || '',
          tiktok: editForm.socials?.tiktok || '',
          website: editForm.socials?.website || '',
          linkedin: editForm.socials?.linkedin || '',
          youtube: editForm.socials?.youtube || ''
        }
      };

      await updateUserProfile(firebaseUser.uid, updateData);

      const updatedUser: User = {
        ...profileUser,
        ...updateData,
      };

      setProfileUser(updatedUser);
      useAuthStore.getState().setUserProfile(updatedUser);

      setIsEditModalOpen(false);
      toast.success('Profiliniz başarıyla güncellendi!');

      if (editForm.username !== profileUser.username) {
        router.replace(`/profile/@${editForm.username}`);
      }
    } catch (err: any) {
      console.error("Profil güncelleme hatası:", err);
      toast.error(err.message || 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  // Readix Etkileşim Fonksiyonları
  const handleReadixLike = async (readixId: string, currentLikes: number) => {
    if (!firebaseUser) return router.push('/login');
    setReadixes(prev => prev.map(r => r.id === readixId ? { ...r, stats: { ...r.stats, likes: currentLikes + 1 } } : r));
    try {
      const isLikedNow = await toggleReadixLike(firebaseUser.uid, readixId);
      if (!isLikedNow) {
        setReadixes(prev => prev.map(r => r.id === readixId ? { ...r, stats: { ...r.stats, likes: Math.max(0, currentLikes - 1) } } : r));
      }
    } catch (e) {
      setReadixes(prev => prev.map(r => r.id === readixId ? { ...r, stats: { ...r.stats, likes: currentLikes } } : r));
    }
  };

  const handleReadixPin = async (readixId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await toggleReadixPin(readixId, newStatus);
      setReadixes(prev => prev.map(r => r.id === readixId ? { ...r, isPinned: newStatus } : r));
      toast.success(newStatus ? 'Gönderi profile sabitlendi' : 'Sabitleme kaldırıldı');
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleRepost = async (readixId: string) => {
    if (!firebaseUser) return router.push('/login');
    try {
      const newReadix = await createReadix(firebaseUser.uid, '', [], undefined, null, readixId);
      toast.success("Gönderi alıntılandı!");
      const original = readixes.find(r => r.id === readixId) || mentionedReadixes.find(r => r.id === readixId);
      if (original) newReadix.originalReadix = original.originalReadix || original;
      if (isOwnProfile && activeReadixTab === 'shared') {
        setReadixes(prev => [newReadix, ...prev]);
      }
    } catch (error) {
      toast.error("Alıntılanamadı");
    }
  };

  const handleReadixEditSave = async (newContent: string) => {
    if (!activeReadix) return;
    try {
      await updateReadix(activeReadix.id, newContent);
      setReadixes(prev => prev.map(r => r.id === activeReadix.id ? { ...r, content: newContent } : r));
      toast.success('Gönderi güncellendi.');
    } catch (e) {
      toast.error('Güncelleme başarısız.');
    }
  };

  const handleReadixDeleteConfirm = async () => {
    if (!activeReadix) return;
    setIsProcessing(true);
    try {
      await deleteReadix(activeReadix.id);
      setReadixes(prev => prev.filter(r => r.id !== activeReadix.id));
      setDeleteConfirmOpen(false);
      toast.success('Gönderi silindi.');
    } catch (e) {
      toast.error('Silme başarısız.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReadixReportSubmit = async (reason: string, details: string) => {
    if (!activeReadix || !firebaseUser) return;
    try {
      await reportContent(activeReadix.id, 'readix', firebaseUser.uid, `${reason} ${details ? '- ' + details : ''}`);
      toast.success('Şikayetiniz alındı, incelenecek.');
    } catch (e) {
      toast.error('Şikayet gönderilemedi.');
    }
  };

  const handleBlockConfirm = async () => {
    if (!activeReadix || !firebaseUser || !currentUser) return;
    setIsProcessing(true);
    try {
      await blockUser(firebaseUser.uid, activeReadix.authorId);
      setReadixes(prev => prev.filter(r => r.authorId !== activeReadix.authorId));
      useAuthStore.getState().setUserProfile({
        ...currentUser,
        blockedUsers: [...(currentUser?.blockedUsers || []), activeReadix.authorId]
      });
      setBlockConfirmOpen(false);
      toast.success('Kullanıcı engellendi.');
    } catch (e) {
      toast.error('Engelleme başarısız.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openShare = (readix: Readix, author: User | null) => {
    setSelectedReadixForShare({
      id: readix.id,
      content: readix.content,
      authorName: author?.displayName || 'Bilinmeyen Kullanıcı',
      authorUsername: author?.username || 'user',
      authorAvatarUrl: author?.avatarUrl,
      mediaUrls: readix.mediaUrls,
      createdAtStr: readix.createdAt 
        ? new Date((readix.createdAt as any).seconds ? (readix.createdAt as any).seconds * 1000 : (readix.createdAt as unknown as number)).toLocaleDateString() 
        : 'Şimdi'
    });
    setShareModalOpen(true);
  };

  // Filtrelenmiş Eserler
  const filteredStories = useMemo(() => {
    if (activeStoryFormat === 'all') return stories;
    if (activeStoryFormat === 'novels') return stories.filter(s => s.format !== 'webtoon');
    return stories.filter(s => s.format === 'webtoon');
  }, [stories, activeStoryFormat]);

  // Vitrin Hikayesi (Gözde Eser)
  const pinnedStory = useMemo(() => {
    if (!profileUser?.pinnedStoryId) return null;
    return stories.find(s => s.storyId === profileUser.pinnedStoryId) || null;
  }, [profileUser?.pinnedStoryId, stories]);

  // Yükleniyor Ekranı
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={44} />
          <Typography variant="caption" className="text-muted text-xs tracking-wider uppercase">
            Profil Yükleniyor...
          </Typography>
        </div>
      </div>
    );
  }

  // Bulunamadı Ekranı
  if (notFound || !profileUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-muted/10 border border-border/40 flex items-center justify-center mb-6 shadow-inner">
          <UserIcon size={44} className="text-muted/40" />
        </div>
        <Typography variant="h2" className="mb-2 text-2xl font-bold">Kullanıcı Bulunamadı</Typography>
        <Typography variant="body" className="text-muted max-w-sm mx-auto mb-8 text-sm">
          Aradığınız profile ulaşılamıyor veya kullanıcı adı değiştirilmiş olabilir.
        </Typography>
        <Button variant="primary" onPress={() => router.push('/')} className="rounded-full px-8">
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-28 sm:pb-36">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER (Kapak Görseli Olmadan, Zarif & Prestijli Tasarım)
          ───────────────────────────────────────────────────────────── */}
      <div className="relative mb-8 sm:mb-12">
        {/* Yumuşak Arka Plan Ambient Işığı */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full max-w-3xl h-48 bg-gradient-to-b from-primary/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          
          {/* Avatar & Rozetler */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-card bg-card overflow-hidden shadow-2xl shadow-black/40 ring-2 ring-primary/20 flex items-center justify-center">
              {profileUser.avatarUrl ? (
                <img
                  src={profileUser.avatarUrl}
                  alt={profileUser.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl sm:text-5xl font-extrabold text-primary uppercase select-none">
                  {profileUser.displayName?.charAt(0) || profileUser.username?.charAt(0) || 'U'}
                </span>
              )}
            </div>

            {/* Premium Rozeti */}
            {profileUser.status === 'premium' && (
              <div 
                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 border-2 border-card flex items-center justify-center text-white shadow-lg"
                title="Readixon Premium Üye"
              >
                <Check size={16} strokeWidth={3.5} />
              </div>
            )}
          </div>

          {/* Profil Başlığı, İsim, Rozetler & Aksiyon Butonları */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left min-w-0">
            
            {/* Üst Satır: İsim, Etiketler ve Aksiyon Butonları */}
            <div className="w-full flex flex-col md:flex-row items-center md:items-center justify-between gap-4 mb-2">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 flex-wrap">
                <Typography variant="h1" className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {profileUser.displayName}
                </Typography>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {profileUser.isAdmin && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25">
                      Yönetici
                    </span>
                  )}
                  {profileUser.isAuthor && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                      Yazar
                    </span>
                  )}
                  {profileUser.status === 'premium' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/25">
                      Premium
                    </span>
                  )}
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex items-center gap-2.5 mt-2 md:mt-0 flex-shrink-0">
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    onPress={() => {
                      setEditForm({
                        displayName: profileUser.displayName || '',
                        username: profileUser.username || '',
                        authorQuote: profileUser.authorQuote || '',
                        location: profileUser.location || '',
                        bio: profileUser.bio || '',
                        avatarUrl: profileUser.avatarUrl || '',
                        pinnedStoryId: profileUser.pinnedStoryId || '',
                        preferredGenresText: profileUser.preferredGenres ? profileUser.preferredGenres.join(', ') : '',
                        socials: {
                          twitter: profileUser.socials?.twitter || '',
                          instagram: profileUser.socials?.instagram || '',
                          tiktok: profileUser.socials?.tiktok || '',
                          website: profileUser.socials?.website || '',
                          linkedin: profileUser.socials?.linkedin || '',
                          youtube: profileUser.socials?.youtube || ''
                        }
                      });
                      setAvatarFile(null);
                      setAvatarPreview(profileUser.avatarUrl || null);
                      setCropImageSrc(null);
                      setIsCropping(false);
                      setIsEditModalOpen(true);
                    }}
                    className="rounded-full px-5 py-2.5 flex items-center gap-2 text-xs sm:text-sm font-semibold border-border/80 hover:border-primary/50 shadow-sm"
                  >
                    <Edit2 size={15} />
                    <span>Profili Düzenle</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      onPress={async () => {
                        if (!firebaseUser || !profileUser) return router.push('/login');
                        try {
                          const chatId = await createOrGetChat(firebaseUser.uid, profileUser.uid);
                          router.push(`/messages/${chatId}`);
                        } catch (err) {
                          toast.error('Sohbet başlatılamadı.');
                        }
                      }}
                      className="rounded-full w-10 h-10 flex items-center justify-center p-0 bg-card hover:bg-card/80 border border-border/60 text-foreground"
                      aria-label="Mesaj Gönder"
                    >
                      <MessageCircle size={18} />
                    </Button>

                    <Button
                      variant={isFollowing ? "outline" : "primary"}
                      onPress={handleFollowToggle}
                      disabled={isFollowLoading}
                      className={`rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md transition-all ${
                        isFollowing ? 'border-primary/40 text-primary' : ''
                      }`}
                    >
                      {isFollowLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : isFollowing ? (
                        'Takip Ediliyor'
                      ) : (
                        'Takip Et'
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Kullanıcı Adı */}
            <p className="text-primary font-bold text-sm sm:text-base mb-3">
              @{profileUser.username}
            </p>

            {/* Yazar Sözü (Varsa Şık ve İtalik İmza Çubuğu) */}
            {profileUser.authorQuote && (
              <div className="relative my-2 py-1.5 px-4 rounded-xl bg-primary/5 border border-primary/15 max-w-xl text-xs sm:text-sm text-foreground/90 italic font-serif leading-relaxed">
                &ldquo;{profileUser.authorQuote}&rdquo;
              </div>
            )}

            {/* ── İstatistik Hapları (Metric Pills) ── */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5 mt-4 text-xs font-semibold">
              
              {/* Takipçi */}
              <button
                type="button"
                onClick={() => openFollowModal('followers')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/50 hover:border-primary/40 text-foreground transition-all cursor-pointer shadow-sm group"
              >
                <span className="font-extrabold text-foreground group-hover:text-primary transition-colors">
                  {profileUser.stats?.followers || 0}
                </span>
                <span className="text-muted-foreground text-[11px] font-normal">Takipçi</span>
              </button>

              {/* Takip Edilen */}
              <button
                type="button"
                onClick={() => openFollowModal('following')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/50 hover:border-primary/40 text-foreground transition-all cursor-pointer shadow-sm group"
              >
                <span className="font-extrabold text-foreground group-hover:text-primary transition-colors">
                  {profileUser.stats?.following || 0}
                </span>
                <span className="text-muted-foreground text-[11px] font-normal">Takip</span>
              </button>

              {/* Okunma Sayısı */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/50 text-foreground shadow-sm">
                <Eye size={13} className="text-primary" />
                <span className="font-extrabold">
                  {profileUser.isAuthor
                    ? (() => {
                        const total = stories.reduce((sum, s) => sum + (s.stats?.views || 0), 0);
                        return total >= 1000 ? (total / 1000).toFixed(1) + 'B' : total;
                      })()
                    : profileUser.stats?.totalReads || 0}
                </span>
                <span className="text-muted-foreground text-[11px] font-normal">Okunma</span>
              </div>

              {/* Yazar İstatistikleri: Beğeni & Yorum */}
              {profileUser.isAuthor && (
                <>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/50 text-foreground shadow-sm">
                    <Heart size={13} className="text-pink-500" />
                    <span className="font-extrabold">
                      {stories.reduce((sum, s) => sum + (s.stats?.likes || 0), 0)}
                    </span>
                    <span className="text-muted-foreground text-[11px] font-normal">Beğeni</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/50 text-foreground shadow-sm">
                    <MessageSquare size={13} className="text-indigo-400" />
                    <span className="font-extrabold">
                      {globalTotalComments >= 1000 ? (globalTotalComments / 1000).toFixed(1) + 'B' : globalTotalComments}
                    </span>
                    <span className="text-muted-foreground text-[11px] font-normal">Yorum</span>
                  </div>

                  {profileUser.stats?.arenaScore && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 shadow-sm">
                      <Feather size={13} />
                      <span className="font-extrabold">{Number(profileUser.stats.arenaScore).toFixed(1)}</span>
                      <span className="text-amber-500/80 text-[11px] font-normal">Arena</span>
                    </div>
                  )}
                </>
              )}

              {/* Katılım Tarihi */}
              {profileUser.createdAt && (() => {
                try {
                  const ca = profileUser.createdAt as any;
                  const d = ca.seconds ? new Date(ca.seconds * 1000) : new Date(ca);
                  if (isNaN(d.getTime())) return null;
                  const month = d.toLocaleString('tr-TR', { month: 'long' });
                  const year = d.getFullYear();
                  return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/20 border border-border/30 text-muted-foreground text-[11px]">
                      <Calendar size={12} className="opacity-70" />
                      <span>{month} {year}</span>
                    </div>
                  );
                } catch {
                  return null;
                }
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ANA SEKME BAR (Unified Modern Tab Bar)
          ───────────────────────────────────────────────────────────── */}
      <div className="border-b border-border/40 mb-8 sm:mb-10">
        <div className="flex items-center gap-2 sm:gap-8 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          
          {/* 1. Eserler (Sadece yazarlarda veya hikayesi olanlarda) */}
          {(profileUser.isAuthor || stories.length > 0) && (
            <button
              type="button"
              onClick={() => setActiveTab('stories')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-1 border-b-2 font-bold text-xs sm:text-sm shrink-0 transition-all cursor-pointer ${
                activeTab === 'stories'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen size={16} />
              <span>Eserler</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'stories' ? 'bg-primary/20 text-primary' : 'bg-muted/30 text-muted-foreground'
              }`}>
                {stories.length}
              </span>
            </button>
          )}

          {/* 2. Readixler */}
          <button
            type="button"
            onClick={() => setActiveTab('readixes')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-1 border-b-2 font-bold text-xs sm:text-sm shrink-0 transition-all cursor-pointer ${
              activeTab === 'readixes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageCircle size={16} />
            <span>Readixler</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'readixes' ? 'bg-primary/20 text-primary' : 'bg-muted/30 text-muted-foreground'
            }`}>
              {readixes.length}
            </span>
          </button>

          {/* 3. Okuma Listeleri */}
          <button
            type="button"
            onClick={() => setActiveTab('lists')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-1 border-b-2 font-bold text-xs sm:text-sm shrink-0 transition-all cursor-pointer ${
              activeTab === 'lists'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListMusic size={16} />
            <span>Okuma Listeleri</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'lists' ? 'bg-primary/20 text-primary' : 'bg-muted/30 text-muted-foreground'
            }`}>
              {readingLists.length}
            </span>
          </button>

          {/* 4. Başarımlar */}
          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-1 border-b-2 font-bold text-xs sm:text-sm shrink-0 transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Award size={16} />
            <span>Başarımlar</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'achievements' ? 'bg-primary/20 text-primary' : 'bg-muted/30 text-muted-foreground'
            }`}>
              {profileUser.achievements?.earnedBadges?.length || 0}
            </span>
          </button>

          {/* 5. Hakkında */}
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-1 border-b-2 font-bold text-xs sm:text-sm shrink-0 transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Info size={16} />
            <span>Hakkında</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SEKME İÇERİKLERİ
          ───────────────────────────────────────────────────────────── */}
      
      {/* ── SEKME 1: ESERLER ── */}
      {activeTab === 'stories' && (
        <div className="space-y-10 animate-fade-in">
          
          {/* Yazarın Gözdesi (Vitrin Kitabı - Varsa) */}
          {pinnedStory && (
            <div className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 p-5 sm:p-8 overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Award size={240} className="text-primary" />
              </div>

              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-5">
                <Sparkles size={16} />
                <span>Yazarın Gözdesi (Öne Çıkan Eser)</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                {/* 3D Kapak */}
                <div
                  className="relative w-36 sm:w-44 aspect-[2/3] rounded-r-xl rounded-l-sm overflow-hidden shadow-2xl transition-transform hover:-translate-y-1 cursor-pointer flex-shrink-0"
                  onClick={() => {
                    const slug = (pinnedStory as any).slug || pinnedStory.storyId;
                    router.push(pinnedStory.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                  }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/80 via-white/10 to-transparent z-10 pointer-events-none" />
                  <img src={pinnedStory.coverImage} alt={pinnedStory.title} className="w-full h-full object-cover" />
                </div>

                {/* Bilgiler */}
                <div className="flex-1 flex flex-col justify-between text-center sm:text-left min-w-0">
                  <div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        pinnedStory.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'
                      }`}>
                        {pinnedStory.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                      </span>
                      {pinnedStory.stats?.rating ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                          <Star size={11} fill="currentColor" /> {pinnedStory.stats.rating.toFixed(1)}
                        </span>
                      ) : null}
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted/20 text-muted-foreground">
                        {pinnedStory.format === 'webtoon' ? 'Webtoon' : 'Roman'}
                      </span>
                    </div>

                    <h2 
                      onClick={() => {
                        const slug = (pinnedStory as any).slug || pinnedStory.storyId;
                        router.push(pinnedStory.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                      }}
                      className="text-xl sm:text-2xl font-black text-foreground hover:text-primary transition-colors cursor-pointer mb-2"
                    >
                      {pinnedStory.title}
                    </h2>

                    <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4 max-w-2xl">
                      {pinnedStory.summary || 'Bu eser için özet girilmemiş.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
                    <Button
                      variant="primary"
                      onPress={() => {
                        const slug = (pinnedStory as any).slug || pinnedStory.storyId;
                        router.push(pinnedStory.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`);
                      }}
                      className="rounded-full px-6 py-2.5 font-bold text-xs sm:text-sm shadow-lg shadow-primary/25"
                    >
                      Hemen Oku
                    </Button>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Layers size={13} /> {pinnedStory.stats?.chapterCount || 0} Bölüm</span>
                      <span className="flex items-center gap-1"><Eye size={13} /> {pinnedStory.stats?.views || 0}</span>
                      <span className="flex items-center gap-1"><Heart size={13} /> {pinnedStory.stats?.likes || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Eser Format Filtresi (Tümü / Romanlar / Webtoonlar) */}
          <div className="flex items-center justify-between gap-4 border-b border-border/30 pb-3">
            <h3 className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <span>Yayınlanan Tüm Eserler ({filteredStories.length})</span>
            </h3>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border/40 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveStoryFormat('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeStoryFormat === 'all' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tümü
              </button>
              <button
                type="button"
                onClick={() => setActiveStoryFormat('novels')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeStoryFormat === 'novels' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Romanlar
              </button>
              <button
                type="button"
                onClick={() => setActiveStoryFormat('webtoons')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeStoryFormat === 'webtoons' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Webtoonlar
              </button>
            </div>
          </div>

          {/* Eserler Grid Listesi */}
          {filteredStories.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 p-12 text-center bg-card/30">
              <BookOpen size={36} className="text-muted-foreground/40 mx-auto mb-3" />
              <Typography variant="body" className="text-muted-foreground text-sm">
                {isOwnProfile ? "Henüz yayında olan bir eseriniz bulunmuyor." : "Bu yazar henüz bir eser yayınlamamış."}
              </Typography>
              {isOwnProfile && (
                <Button variant="outline" onPress={() => router.push('/studio')} className="mt-4 rounded-full text-xs">
                  Stüdyoya Git ve Yazmaya Başla
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {filteredStories.map(story => {
                const slug = (story as any).slug || story.storyId;
                return (
                  <div
                    key={story.storyId}
                    onClick={() => router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`)}
                    className="group relative flex flex-col cursor-pointer"
                  >
                    {/* 3D Kapak */}
                    <div className="relative aspect-[2/3] w-full rounded-r-xl rounded-l-sm overflow-hidden shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/70 via-white/10 to-transparent z-10 pointer-events-none" />
                      <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />

                      {/* Format Rozeti */}
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold z-10">
                        {story.format === 'webtoon' ? 'Webtoon' : 'Roman'}
                      </div>
                    </div>

                    {/* Bilgiler */}
                    <div className="mt-3 text-center sm:text-left">
                      <h4 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {story.title}
                      </h4>
                      <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-1 text-[11px] text-muted-foreground">
                        <span>{story.stats?.chapterCount || 0} Bölüm</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Eye size={11} /> {story.stats?.views || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SEKME 2: READIXLER ── */}
      {activeTab === 'readixes' && (
        <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
          
          {/* Alt Sekme: Paylaşılanlar vs Bahsedilenler */}
          <div className="flex items-center justify-center gap-2 p-1 rounded-2xl bg-card border border-border/50 max-w-xs mx-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveReadixTab('shared')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                activeReadixTab === 'shared' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Paylaşılanlar ({readixes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveReadixTab('mentions')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                activeReadixTab === 'mentions' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Bahsedilenler ({mentionedReadixes.length})
            </button>
          </div>

          {activeReadixTab === 'shared' ? (
            readixes.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/60 p-12 text-center bg-card/30">
                <MessageCircle size={36} className="text-muted-foreground/40 mx-auto mb-3" />
                <Typography variant="body" className="text-muted-foreground text-sm">
                  {isOwnProfile ? "Henüz bir Readix paylaşmadınız." : "Bu kullanıcı henüz bir Readix paylaşmamış."}
                </Typography>
                {isOwnProfile && (
                  <Button variant="outline" onPress={() => router.push('/readix')} className="mt-4 rounded-full text-xs">
                    İlk Gönderini Paylaş
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {readixes.map((readix) => {
                  const isRepost = !!readix.originalReadix;
                  const targetReadix = isRepost ? readix.originalReadix! : readix;
                  const reposter = isRepost ? profileUser : null;
                  const author = isRepost ? (authors[targetReadix.authorId] || profileUser) : profileUser;

                  return (
                    <ReadixCard
                      key={readix.id}
                      linkedStory={targetReadix.linkedStory}
                      authorName={author.displayName}
                      authorUsername={author.username}
                      authorAvatarUrl={author.avatarUrl}
                      repostOfAuthorName={reposter?.displayName}
                      content={targetReadix.content}
                      mediaUrls={targetReadix.mediaUrls}
                      createdAtStr={targetReadix.createdAt 
                        ? new Date((targetReadix.createdAt as any).seconds ? (targetReadix.createdAt as any).seconds * 1000 : (targetReadix.createdAt as unknown as number)).toLocaleDateString() 
                        : 'Şimdi'}
                      likesCount={targetReadix.stats?.likes || 0}
                      commentsCount={targetReadix.stats?.comments || 0}
                      repostsCount={targetReadix.stats?.reposts || 0}
                      poll={targetReadix.poll as any}
                      isOwner={firebaseUser?.uid === readix.authorId}
                      isPinned={readix.isPinned}
                      onPinPress={() => handleReadixPin(readix.id, !!readix.isPinned)}
                      onLikePress={() => handleReadixLike(targetReadix.id, targetReadix.stats?.likes || 0)}
                      onCommentPress={() => { setSelectedReadix(targetReadix); setCommentModalOpen(true); }}
                      onSharePress={() => openShare(targetReadix, author)}
                      onRepostPress={() => handleRepost(targetReadix.id)}
                      onPress={() => { setSelectedReadix(targetReadix); setCommentModalOpen(true); }}
                      onEditPress={() => { setActiveReadix(readix); setEditReadixModalOpen(true); }}
                      onDeletePress={() => { setActiveReadix(readix); setDeleteConfirmOpen(true); }}
                      onReportPress={() => { setActiveReadix(targetReadix); setReportModalOpen(true); }}
                      onBlockPress={() => { setActiveReadix(targetReadix); setBlockConfirmOpen(true); }}
                    />
                  );
                })}
              </div>
            )
          ) : (
            mentionedReadixes.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/60 p-12 text-center bg-card/30">
                <MessageCircle size={36} className="text-muted-foreground/40 mx-auto mb-3" />
                <Typography variant="body" className="text-muted-foreground text-sm">
                  Bu kullanıcıdan henüz hiçbir Readix'te bahsedilmemiş.
                </Typography>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {mentionedReadixes.map((readix) => {
                  const isRepost = !!readix.originalReadix;
                  const targetReadix = isRepost ? readix.originalReadix! : readix;
                  const reposter = isRepost ? (authors[readix.authorId] || profileUser) : null;
                  const author = authors[targetReadix.authorId] || profileUser;

                  return (
                    <ReadixCard
                      key={readix.id}
                      linkedStory={targetReadix.linkedStory}
                      authorName={author.displayName}
                      authorUsername={author.username}
                      authorAvatarUrl={author.avatarUrl}
                      repostOfAuthorName={reposter?.displayName}
                      content={targetReadix.content}
                      mediaUrls={targetReadix.mediaUrls}
                      createdAtStr={targetReadix.createdAt 
                        ? new Date((targetReadix.createdAt as any).seconds ? (targetReadix.createdAt as any).seconds * 1000 : (targetReadix.createdAt as unknown as number)).toLocaleDateString() 
                        : 'Şimdi'}
                      likesCount={targetReadix.stats?.likes || 0}
                      commentsCount={targetReadix.stats?.comments || 0}
                      repostsCount={targetReadix.stats?.reposts || 0}
                      poll={targetReadix.poll as any}
                      isOwner={firebaseUser?.uid === readix.authorId}
                      isPinned={readix.isPinned}
                      onPinPress={() => handleReadixPin(readix.id, !!readix.isPinned)}
                      onLikePress={() => handleReadixLike(targetReadix.id, targetReadix.stats?.likes || 0)}
                      onCommentPress={() => { setSelectedReadix(targetReadix); setCommentModalOpen(true); }}
                      onSharePress={() => openShare(targetReadix, author)}
                      onRepostPress={() => handleRepost(targetReadix.id)}
                      onPress={() => { setSelectedReadix(targetReadix); setCommentModalOpen(true); }}
                      onEditPress={() => { setActiveReadix(readix); setEditReadixModalOpen(true); }}
                      onDeletePress={() => { setActiveReadix(readix); setDeleteConfirmOpen(true); }}
                      onReportPress={() => { setActiveReadix(targetReadix); setReportModalOpen(true); }}
                      onBlockPress={() => { setActiveReadix(targetReadix); setBlockConfirmOpen(true); }}
                    />
                  );
                })}
              </div>
            )
          )}
        </div>
      )}

      {/* ── SEKME 3: OKUMA LİSTELERİ ── */}
      {activeTab === 'lists' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between gap-4 border-b border-border/30 pb-3">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
                <ListMusic size={18} className="text-primary" />
                <span>Okuma Listeleri ({readingLists.length})</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isOwnProfile ? 'Derlediğiniz tüm okuma listeleri ve seçkiler.' : `${profileUser.displayName} tarafından oluşturulan listeler.`}
              </p>
            </div>

            {isOwnProfile && (
              <Button
                variant="primary"
                onPress={() => router.push('/library')}
                className="rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/25"
              >
                <Plus size={14} />
                <span>Yeni Liste Oluştur</span>
              </Button>
            )}
          </div>

          {readingLists.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 p-12 text-center bg-card/30">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 border border-primary/20">
                <ListMusic size={28} />
              </div>
              <h4 className="font-bold text-sm text-foreground mb-1">Henüz Bir Okuma Listesi Yok</h4>
              <Typography variant="body" className="text-muted-foreground text-xs max-w-sm mx-auto mb-5">
                {isOwnProfile 
                  ? 'Hikayeleri bir araya getirerek tematik listeler oluşturabilir ve story kartı olarak arkadaşlarınızla paylaşabilirsiniz.'
                  : 'Bu kullanıcı henüz herkese açık bir okuma listesi oluşturmamış.'}
              </Typography>
              {isOwnProfile && (
                <Button variant="primary" onPress={() => router.push('/library')} className="rounded-full px-6 text-xs">
                  Kütüphanede İlk Listeni Oluştur
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {readingLists.map(list => (
                <ReadingListCard
                  key={list.id}
                  list={list}
                  covers={listCovers[list.id] || []}
                  isOwner={list.userId === firebaseUser?.uid}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SEKME 4: BAŞARIMLAR ── */}
      {activeTab === 'achievements' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30 pb-4">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
                <Award size={18} className="text-primary" />
                <span>Kazanılan ve Kilitli Başarımlar</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Okuma, yazma ve topluluk etkinlikleriyle açılan özel madalyalar.
              </p>
            </div>

            {/* İlerleme Çubuğu */}
            <div className="flex items-center gap-3 bg-card border border-border/50 px-3.5 py-1.5 rounded-full text-xs font-semibold">
              <span className="text-muted-foreground">Kazanılan:</span>
              <span className="text-primary font-black">
                {profileUser.achievements?.earnedBadges?.length || 0} / {Object.keys(BADGES).length}
              </span>
            </div>
          </div>

          {/* Rozet Kartları Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(BADGES).map(badge => (
              <BadgeCard
                key={badge.id}
                title={badge.title}
                description={badge.description}
                icon={badge.icon}
                tier={badge.tier}
                isUnlocked={profileUser.achievements?.earnedBadges?.includes(badge.id) || false}
                conditionDescription={isOwnProfile ? badge.conditionDescription : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── SEKME 5: HAKKINDA & BİYOGRAFİ ── */}
      {activeTab === 'about' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          
          {/* Biyografi Kartı */}
          <div className="rounded-3xl bg-card border border-border/50 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Info size={16} className="text-primary" />
              <span>Biyografi</span>
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {profileUser.bio || "Bu kullanıcı henüz hakkında bir şey yazmamış."}
            </p>
          </div>

          {/* Konum, İlgi Alanları ve Sosyal Bağlantılar Kartı */}
          <div className="rounded-3xl bg-card border border-border/50 p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Meta Bilgiler (Konum, Dil) */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-foreground/80 font-medium">
                <MapPin size={17} className="text-primary" />
                <span>{profileUser.location || 'Türkiye'}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/80 font-medium">
                <Globe size={17} className="text-primary" />
                <span>Türkçe</span>
              </div>
            </div>

            {/* İlgilendiği Türler */}
            {profileUser.preferredGenres && profileUser.preferredGenres.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-border/30">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  İlgilendiği Edebi Türler
                </span>
                <div className="flex flex-wrap gap-2">
                  {profileUser.preferredGenres.map(genre => (
                    <span
                      key={genre}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sosyal Medya İkonları */}
            {profileUser.socials && Object.values(profileUser.socials).some(Boolean) && (
              <div className="space-y-3 pt-4 border-t border-border/30">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Sosyal Ağlar & Bağlantılar
                </span>
                <div className="flex flex-wrap gap-3">
                  {profileUser.socials.twitter && (
                    <a
                      href={`https://x.com/${profileUser.socials.twitter}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-muted/20 hover:bg-muted/40 text-foreground flex items-center justify-center transition-all hover:scale-105"
                      title="X (Twitter)"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}

                  {profileUser.socials.instagram && (
                    <a
                      href={`https://instagram.com/${profileUser.socials.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-muted/20 hover:bg-pink-500/20 text-foreground hover:text-pink-500 flex items-center justify-center transition-all hover:scale-105"
                      title="Instagram"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                  )}

                  {profileUser.socials.tiktok && (
                    <a
                      href={`https://tiktok.com/@${profileUser.socials.tiktok}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-muted/20 hover:bg-cyan-500/20 text-foreground hover:text-cyan-400 flex items-center justify-center transition-all hover:scale-105"
                      title="TikTok"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.71a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    </a>
                  )}

                  {profileUser.socials.website && (
                    <a
                      href={profileUser.socials.website.startsWith('http') ? profileUser.socials.website : `https://${profileUser.socials.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-muted/20 hover:bg-primary/20 text-foreground hover:text-primary flex items-center justify-center transition-all hover:scale-105"
                      title="Web Sitesi"
                    >
                      <Globe size={18} />
                    </a>
                  )}

                  {profileUser.socials.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${profileUser.socials.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-muted/20 hover:bg-blue-500/20 text-foreground hover:text-blue-500 flex items-center justify-center transition-all hover:scale-105"
                      title="LinkedIn"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  )}

                  {profileUser.socials.youtube && (
                    <a
                      href={`https://youtube.com/@${profileUser.socials.youtube}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-muted/20 hover:bg-red-500/20 text-foreground hover:text-red-500 flex items-center justify-center transition-all hover:scale-105"
                      title="YouTube"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. MODALLAR (Kapak Görseli Tamamen Kaldırıldı)
          ───────────────────────────────────────────────────────────── */}

      {/* Profil Düzenleme Modalı */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto py-6 sm:py-8">
          <div className="bg-card border border-border w-full max-w-md max-h-[90dvh] flex flex-col rounded-3xl shadow-2xl relative overflow-hidden my-auto">
            <div className="p-5 border-b border-border/30 flex items-center justify-between">
              <Typography variant="h2" className="m-0 text-lg sm:text-xl font-bold">Profili Düzenle</Typography>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-muted/20 hover:bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              
              {/* Profil Fotoğrafı Yükleme (Kapak Görseli Yok) */}
              <div className="flex flex-col items-center justify-center pb-2">
                <div className="relative w-24 h-24 rounded-full border-4 border-card bg-muted overflow-hidden flex items-center justify-center group shadow-xl">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-extrabold text-primary uppercase">
                      {(editForm.displayName || profileUser.displayName || 'U').charAt(0)}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <label className="cursor-pointer text-white text-[11px] font-bold px-3 py-1 bg-primary rounded-full shadow-md">
                      Değiştir
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setCropImageSrc(URL.createObjectURL(file));
                            setIsCropping(true);
                            setZoom(1);
                            setCrop({ x: 0, y: 0 });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground mt-2 font-medium">Profil Fotoğrafı</span>
              </div>

              {/* Görünen İsim */}
              <div>
                <Typography variant="caption" className="text-muted-foreground mb-1 block font-semibold">Görünen İsim</Typography>
                <Input
                  value={editForm.displayName}
                  onChangeText={(val) => setEditForm({ ...editForm, displayName: val })}
                  placeholder="İsminiz"
                />
              </div>

              {/* Kullanıcı Adı */}
              <div>
                <Typography variant="caption" className="text-muted-foreground mb-1 block font-semibold">Kullanıcı Adı</Typography>
                <Input
                  value={editForm.username}
                  onChangeText={(val) => setEditForm({ ...editForm, username: val.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  placeholder="kullanici_adiniz"
                />
                <span className="text-[11px] text-muted-foreground/70 mt-1 block">Yalnızca küçük harf, rakam ve alt çizgi.</span>
              </div>

              {/* Konum */}
              <div>
                <Typography variant="caption" className="text-muted-foreground mb-1 block font-semibold">Konum</Typography>
                <Input
                  value={editForm.location}
                  onChangeText={(val) => setEditForm({ ...editForm, location: val })}
                  placeholder="Örn: İstanbul, Türkiye"
                />
              </div>

              {/* İlgilendiği Türler */}
              <div>
                <Typography variant="caption" className="text-muted-foreground mb-1 block font-semibold">İlgilendiği Türler</Typography>
                <Input
                  value={editForm.preferredGenresText}
                  onChangeText={(val) => setEditForm({ ...editForm, preferredGenresText: val })}
                  placeholder="Örn: Fantastik, Bilim Kurgu, Gizem"
                />
                <span className="text-[11px] text-muted-foreground/70 mt-1 block">Virgülle ayırarak maksimum 3 tür yazabilirsiniz.</span>
              </div>

              {/* Biyografi */}
              <div>
                <Typography variant="caption" className="text-muted-foreground mb-1 block font-semibold">Hakkında (Bio)</Typography>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Kendinizden, okuma zevklerinizden veya yazarlık yolculuğunuzdan bahsedin..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none h-24"
                />
              </div>

              {/* Yazarın Sözü */}
              <div>
                <Typography variant="caption" className="text-muted-foreground mb-1 block font-semibold">Yazarın Sözü (Opsiyonel)</Typography>
                <Input
                  value={editForm.authorQuote}
                  onChangeText={(val) => setEditForm({ ...editForm, authorQuote: val })}
                  placeholder="Profilinize estetik bir imza sözü bırakın..."
                />
                <span className="text-[11px] text-muted-foreground/70 mt-1 block">Profil başlığınızın altında italik bir imza olarak sergilenir.</span>
              </div>

              {/* Vitrin Kitabı (Sadece yazarlarda) */}
              {profileUser.isAuthor && stories.length > 0 && (
                <div>
                  <Typography variant="caption" className="text-muted-foreground mb-1 block font-semibold">Vitrin Kitabınız (Gözde Eser)</Typography>
                  <select
                    value={editForm.pinnedStoryId}
                    onChange={(e) => setEditForm({ ...editForm, pinnedStoryId: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="">-- Vitrin Kullanmak İstemiyorum --</option>
                    {stories.map(story => (
                      <option key={story.storyId} value={story.storyId}>
                        {story.title} {story.format === 'webtoon' ? '(Webtoon)' : '(Roman)'}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-muted-foreground/70 mt-1 block">Seçtiğiniz eser profilinizin Eserler sekmesinde en üstte öne çıkar.</span>
                </div>
              )}

              {/* Sosyal Medya */}
              <div className="pt-4 border-t border-border/30 space-y-4">
                <Typography variant="h3" className="text-sm font-bold text-foreground">Sosyal Medya Bağlantıları</Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Typography variant="caption" className="text-muted-foreground text-xs mb-1 block">X (Twitter)</Typography>
                    <Input
                      value={editForm.socials?.twitter || ''}
                      onChangeText={(val) => setEditForm({ ...editForm, socials: { ...editForm.socials, twitter: val.replace('@', '') } })}
                      placeholder="kullanici_adi"
                    />
                  </div>
                  <div>
                    <Typography variant="caption" className="text-muted-foreground text-xs mb-1 block">Instagram</Typography>
                    <Input
                      value={editForm.socials?.instagram || ''}
                      onChangeText={(val) => setEditForm({ ...editForm, socials: { ...editForm.socials, instagram: val.replace('@', '') } })}
                      placeholder="kullanici_adi"
                    />
                  </div>
                  <div>
                    <Typography variant="caption" className="text-muted-foreground text-xs mb-1 block">TikTok</Typography>
                    <Input
                      value={editForm.socials?.tiktok || ''}
                      onChangeText={(val) => setEditForm({ ...editForm, socials: { ...editForm.socials, tiktok: val.replace('@', '') } })}
                      placeholder="kullanici_adi"
                    />
                  </div>
                  <div>
                    <Typography variant="caption" className="text-muted-foreground text-xs mb-1 block">Web Sitesi</Typography>
                    <Input
                      value={editForm.socials?.website || ''}
                      onChangeText={(val) => setEditForm({ ...editForm, socials: { ...editForm.socials, website: val } })}
                      placeholder="siteadi.com"
                    />
                  </div>
                  <div>
                    <Typography variant="caption" className="text-muted-foreground text-xs mb-1 block">LinkedIn</Typography>
                    <Input
                      value={editForm.socials?.linkedin || ''}
                      onChangeText={(val) => setEditForm({ ...editForm, socials: { ...editForm.socials, linkedin: val.replace('@', '') } })}
                      placeholder="kullanici_adi"
                    />
                  </div>
                  <div>
                    <Typography variant="caption" className="text-muted-foreground text-xs mb-1 block">YouTube</Typography>
                    <Input
                      value={editForm.socials?.youtube || ''}
                      onChangeText={(val) => setEditForm({ ...editForm, socials: { ...editForm.socials, youtube: val.replace('@', '') } })}
                      placeholder="kanal_adi"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border/30 bg-card/95 flex gap-3">
              <Button variant="secondary" className="flex-1 rounded-full text-xs" onPress={() => setIsEditModalOpen(false)}>
                İptal
              </Button>
              <Button variant="primary" className="flex-1 rounded-full text-xs font-bold" onPress={handleEditSave} disabled={isSaving}>
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fotoğraf Kırpma Modalı (Sadece Avatar) */}
      {isCropping && cropImageSrc && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto py-6 sm:py-8">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative flex flex-col h-[480px] max-h-[90dvh] my-auto">
            <Typography variant="h2" className="mb-4 text-lg font-bold">Profil Fotoğrafını Kırp</Typography>

            <div className="relative flex-1 bg-black/50 rounded-2xl overflow-hidden mb-5">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="flex items-center gap-4 mb-5">
              <Typography variant="caption" className="text-muted-foreground text-xs w-16">Yakınlaştır</Typography>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-label="Yakınlaştırma"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 rounded-full text-xs" onPress={() => setIsCropping(false)}>
                İptal
              </Button>
              <Button variant="primary" className="flex-1 rounded-full text-xs font-bold" onPress={handleCropSave}>
                Tamamla
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Takipçi / Takip Listesi Modalı */}
      {followModalType && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-md overflow-y-auto py-6 sm:py-8" onClick={() => setFollowModalType(null)}>
          <div className="bg-card w-full max-w-md rounded-3xl p-5 border border-border/60 shadow-2xl flex flex-col max-h-[75dvh] my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/30">
              <Typography variant="h3" className="text-base font-bold">
                {followModalType === 'followers' ? 'Takipçiler' : 'Takip Edilenler'}
              </Typography>
              <button 
                type="button"
                onClick={() => setFollowModalType(null)} 
                className="p-1.5 hover:bg-muted/20 rounded-full transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {isFollowModalLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : followModalUsers.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  {followModalType === 'followers' ? 'Henüz takipçi yok.' : 'Henüz kimseyi takip etmiyor.'}
                </div>
              ) : (
                followModalUsers.map(u => (
                  <div
                    key={u.uid}
                    className="flex items-center gap-3 p-2.5 hover:bg-muted/15 rounded-2xl cursor-pointer transition-colors"
                    onClick={() => {
                      setFollowModalType(null);
                      router.push(`/profile/@${u.username}`);
                    }}
                  >
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.username} className="w-10 h-10 rounded-full object-cover border border-border/30" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold text-sm">
                        {u.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Typography variant="body" className="font-bold text-xs truncate">{u.displayName}</Typography>
                      <Typography variant="caption" className="text-muted-foreground text-[11px] truncate">@{u.username}</Typography>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Readix Modalları */}
      <ReadixCommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        selectedReadix={selectedReadix}
        currentUserId={firebaseUser?.uid || null}
        onCommentAdded={() => {
          if (!selectedReadix) return;
          setReadixes(prev => prev.map(r => r.id === selectedReadix.id ? { ...r, stats: { ...r.stats, comments: (r.stats?.comments || 0) + 1 } } : r));
        }}
        onLikePost={(id, likes) => handleReadixLike(id, likes)}
      />

      <ReadixShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        readix={selectedReadixForShare}
      />

      <EditReadixModal
        isOpen={editReadixModalOpen}
        onClose={() => { setEditReadixModalOpen(false); setActiveReadix(null); }}
        initialContent={activeReadix?.content || ''}
        onSave={handleReadixEditSave}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => { setReportModalOpen(false); setActiveReadix(null); }}
        onSubmit={handleReadixReportSubmit}
      />

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setActiveReadix(null); }}
        onConfirm={handleReadixDeleteConfirm}
        title="Gönderiyi Sil"
        message="Bu gönderiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        variant="danger"
        isLoading={isProcessing}
      />

      <ConfirmationDialog
        isOpen={blockConfirmOpen}
        onClose={() => { setBlockConfirmOpen(false); setActiveReadix(null); }}
        onConfirm={handleBlockConfirm}
        title="Kullanıcıyı Engelle"
        message="Bu kullanıcıyı engellemek istediğinizden emin misiniz? Gönderilerini artık akışta görmeyeceksiniz."
        confirmText="Engelle"
        variant="warning"
        isLoading={isProcessing}
      />
    </div>
  );
}
