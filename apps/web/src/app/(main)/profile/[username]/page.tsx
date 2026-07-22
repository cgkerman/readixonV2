'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Users, BookOpen, User as UserIcon, Edit2, Bookmark, BookmarkCheck, Check, X, Hash, MessageCircle, Feather, Eye, Heart, MessageSquare, Award, Lock } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Typography, Button, StoryCard, Input, ReadixCard, ReadixCommentModal, ReadixShareModal, ShareReadixData, EditReadixModal, ReportModal, ConfirmationDialog, BadgeCard } from '@readixon/ui';
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
  getSavedStories,
  uploadFile,
  compressImage,
  getCroppedImg,
  getUserReadixes,
  getMentionedReadixes,
  toggleReadixLike,
  addReadixComment,
  getReadixComments,
  createOrGetChat,
  createReadix,
  updateReadix,
  deleteReadix,
  reportContent,
  blockUser,
  toggleReadixPin,
  BADGES
} from '@readixon/core';
import type { User, Story, Readix } from '@readixon/core';
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  
  // Extract and decode username from URL (e.g. "%40kitapkurdu" -> "kitapkurdu")
  const rawUsernameParam = typeof params.username === 'string' ? params.username : '';
  const decodedParam = decodeURIComponent(rawUsernameParam);
  const targetUsername = decodedParam.startsWith('@') ? decodedParam.slice(1) : decodedParam;

  const { userProfile: currentUser, firebaseUser } = useAuthStore();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [readixes, setReadixes] = useState<Readix[]>([]);
  const [mentionedReadixes, setMentionedReadixes] = useState<Readix[]>([]);
  const [authors, setAuthors] = useState<Record<string, User>>({});
  const [activeReadixTab, setActiveReadixTab] = useState<'shared' | 'mentions'>('shared');
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'stories' | 'readixes' | 'badges'>('stories');
  
  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedReadixForShare, setSelectedReadixForShare] = useState<ShareReadixData | null>(null);

  const [editReadixModalOpen, setEditReadixModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [activeReadix, setActiveReadix] = useState<Readix | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      console.error('Şikayet gönderilirken hata:', e);
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
      createdAtStr: readix.createdAt ? new Date((readix.createdAt as any).seconds ? (readix.createdAt as any).seconds * 1000 : (readix.createdAt as unknown as number)).toLocaleDateString() : 'Şimdi'
    });
    setShareModalOpen(true);
  };

  
  // Follow States
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    username: '',
    bio: '',
    avatarUrl: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Cropper states
  const [isCropping, setIsCropping] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Global Comments
  const [globalTotalComments, setGlobalTotalComments] = useState(0);

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
              total += storyTotal;
              total += story.stats?.reviewCount || 0;
            } catch (e) {
              total += story.stats?.commentCount || 0;
              total += story.stats?.reviewCount || 0;
            }
          })
        );
        setGlobalTotalComments(total);
      }
    };
    fetchGlobalComments();
  }, [profileUser, stories]);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Follow Modal States
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);
  const [followModalUsers, setFollowModalUsers] = useState<User[]>([]);
  const [isFollowModalLoading, setIsFollowModalLoading] = useState(false);

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
      }
    }
    setIsCropping(false);
  };

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

        // Fetch user's stories if they are an author
        if (user.isAuthor) {
          unsubscribeStories = subscribeToPublishedAuthorStories(user.uid, (publishedStories) => {
            setStories(publishedStories);
          });
        }

        // Fetch user's readixes
        const userReadixes = await getUserReadixes(user.uid, 20);
        const sortedReadixes = [...userReadixes.readixes].sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0;
        });
        setReadixes(sortedReadixes);
        
        // Fetch mentioned readixes
        const mentions = await getMentionedReadixes(user.username!, 20);
        setMentionedReadixes(mentions.readixes);

        // Fetch authors for mentioned readixes
        // Fetch authors for mentioned readixes and reposts in user's readixes
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
        
        // Takip durumunu kontrol et
        if (firebaseUser && firebaseUser.uid !== user.uid) {
          const following = await checkIsFollowing(firebaseUser.uid, user.uid);
          setIsFollowing(following);
        }

      } catch (error) {
        console.error("Profil yüklenirken hata:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();

    return () => {
      if (unsubscribeStories) unsubscribeStories();
    };
  }, [targetUsername, firebaseUser, currentUser?.uid]);

  const isOwnProfile = currentUser?.uid === profileUser?.uid;

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
          stats: { ...profileUser.stats, followers: (profileUser.stats?.followers || 1) - 1 }
        });
      } else {
        await followUser(firebaseUser.uid, profileUser.uid);
        setIsFollowing(true);
        setProfileUser({
          ...profileUser,
          stats: { ...profileUser.stats, followers: (profileUser.stats?.followers || 0) + 1 }
        });
      }
    } catch (err) {
      console.error("Takip işlemi başarısız:", err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!profileUser || !firebaseUser || !editForm.displayName || !editForm.username) return;
    setIsSaving(true);
    try {
      let finalAvatarUrl = editForm.avatarUrl;
      
      // Eğer yeni bir dosya seçildiyse, Storage'a yükle
      if (avatarFile) {
        // Profil fotoğrafları genelde küçüktür (Örn: 400x400)
        const compressedFile = await compressImage(avatarFile, 400, 400, 0.85);
        const path = `users/${firebaseUser.uid}/avatar_${Date.now()}`;
        finalAvatarUrl = await uploadFile(compressedFile, path);
      }
      
      const updateData = {
        displayName: editForm.displayName,
        username: editForm.username,
        bio: editForm.bio,
        avatarUrl: finalAvatarUrl
      };

      await updateUserProfile(firebaseUser.uid, updateData);
      setProfileUser({
        ...profileUser,
        ...updateData
      });
      setIsEditModalOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Update store
      useAuthStore.getState().setUserProfile({
        ...currentUser!,
        ...updateData
      });
      
      // If username changed, redirect
      if (editForm.username !== profileUser.username) {
        router.replace(`/profile/@${editForm.username}`);
      }
    } catch (err) {
      console.error("Profil güncellenemedi:", err);
      toast.error("Profil güncellenirken bir hata oluştu. Kullanıcı adı alınmış olabilir.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReadixPin = async (readixId: string, currentStatus: boolean) => {
    try {
      const newStatus = await toggleReadixPin(readixId, currentStatus);
      // update local state
      setReadixes(prev => {
        const updated = prev.map(r => r.id === readixId ? { ...r, isPinned: newStatus } : r);
        return updated.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0;
        });
      });
      setMentionedReadixes(prev => prev.map(r => r.id === readixId ? { ...r, isPinned: newStatus } : r));
      toast.success(newStatus ? 'Gönderi profile sabitlendi' : 'Sabitleme kaldırıldı');
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleReadixLike = async (readixId: string, currentLikes: number) => {
    if (!firebaseUser) return router.push('/login');
    
    // Optimistic Update
    setReadixes(prev => prev.map(r => r.id === readixId ? { ...r, stats: { ...r.stats, likes: currentLikes + 1 } } : r));
    try {
      const isLikedNow = await toggleReadixLike(firebaseUser.uid, readixId);
      if (!isLikedNow) {
        setReadixes(prev => prev.map(r => r.id === readixId ? { ...r, stats: { ...r.stats, likes: Math.max(0, currentLikes - 1) } } : r));
      }
    } catch (e) {
      console.error(e);
      setReadixes(prev => prev.map(r => r.id === readixId ? { ...r, stats: { ...r.stats, likes: currentLikes } } : r));
    }
  };

  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedReadix, setSelectedReadix] = useState<Readix | null>(null);

  const openComments = (readix: Readix) => {
    setSelectedReadix(readix);
    setCommentModalOpen(true);
  };

  const handleCommentAdded = () => {
    if (!selectedReadix) return;
    setReadixes(prev => prev.map(r => r.id === selectedReadix.id ? { ...r, stats: { ...r.stats, comments: (r.stats?.comments || 0) + 1 } } : r));
  };

  const handleRepost = async (readixId: string) => {
    if (!firebaseUser) return router.push('/login');
    try {
      const newReadix = await createReadix(
        firebaseUser.uid,
        '',
        [],
        undefined,
        null,
        readixId
      );
      toast.success("Gönderi başarıyla alıntılandı!");
      
      const original = readixes.find(r => r.id === readixId) || mentionedReadixes.find(r => r.id === readixId);
      if (original) {
        newReadix.originalReadix = original.originalReadix || original;
      }
      
      // Kendi profilindeyken anında listeye ekle
      if (isOwnProfile && activeReadixTab === 'shared') {
        setReadixes(prev => [newReadix, ...prev]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Alıntılanamadı");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (notFound || !profileUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
        <div className="w-24 h-24 rounded-full bg-muted/10 flex items-center justify-center mb-6">
          <UserIcon size={48} className="text-muted/50" />
        </div>
        <Typography variant="h2" className="mb-2">Kullanıcı Bulunamadı</Typography>
        <Typography variant="body" className="text-muted max-w-sm mx-auto mb-8">
          Aradığınız profile ulaşılamıyor. URL'i kontrol edip tekrar deneyin.
        </Typography>
        <Button variant="primary" onPress={() => router.push('/')} className="rounded-full px-8">
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-20">
      {/* Kapak Görseli ve Profil Bilgileri */}
      <div className="relative">
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/5 w-full"></div>
        
        <div className="max-w-6xl mx-auto px-6 lg:px-10 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20 md:-mt-24 mb-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-card overflow-hidden shadow-2xl flex items-center justify-center">
                {profileUser.avatarUrl ? (
                  <img src={profileUser.avatarUrl} alt={profileUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-bold text-primary uppercase">
                    {profileUser.displayName?.charAt(0) || profileUser.username?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              {profileUser.status === 'premium' && (
                <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full p-1.5 md:p-2 border-4 border-background shadow-lg" title="Premium Üye">
                  <Check size={16} className="text-white" strokeWidth={4} />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center md:text-left mb-2 md:mb-4">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 mb-1">
                <Typography variant="h1">{profileUser.displayName}</Typography>
                <div className="flex items-center gap-2 mt-1 md:mt-0">
                  {profileUser.isAdmin && (
                    <span className="bg-red-500/10 text-red-500 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      yönetici
                    </span>
                  )}
                  {profileUser.status === 'premium' && (
                    <span className="bg-purple-500/10 text-purple-500 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      premium
                    </span>
                  )}
                </div>
              </div>
              <Typography variant="body" className="text-primary font-medium text-lg">@{profileUser.username}</Typography>
            </div>

            {/* Actions */}
            <div className="flex gap-3 md:mb-6">
              {isOwnProfile ? (
                <Button 
                  variant="outline" 
                  onPress={() => {
                    setEditForm({
                      displayName: profileUser.displayName || '',
                      username: profileUser.username || '',
                      bio: profileUser.bio || '',
                      avatarUrl: profileUser.avatarUrl || ''
                    });
                    setAvatarFile(null);
                    setAvatarPreview(profileUser.avatarUrl || null);
                    setCropImageSrc(null);
                    setIsCropping(false);
                    setIsEditModalOpen(true);
                  }} 
                  className="rounded-full px-6 flex items-center gap-2"
                >
                  <Edit2 size={16} /> Profili Düzenle
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
                    className="rounded-full px-4 flex items-center justify-center bg-card hover:bg-card/80 border border-border"
                  >
                    <MessageCircle size={20} className="text-text" />
                  </Button>
                  <Button 
                    variant={isFollowing ? "outline" : "primary"} 
                    onPress={handleFollowToggle} 
                    className={`rounded-full px-8 ${isFollowing ? 'border-primary text-primary' : ''}`}
                  >
                    {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sol Kolon (Biyografi & İstatistikler) */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-card border border-border/50 rounded-3xl p-6">
                <Typography variant="h3" className="mb-4">Hakkında</Typography>
                <Typography variant="body" className="text-muted leading-relaxed">
                  {profileUser.bio || "Bu yazar henüz hakkında bir şey yazmamış."}
                </Typography>
                
                {profileUser.preferredGenres && profileUser.preferredGenres.length > 0 && (
                  <div className="mt-6">
                    <Typography variant="caption" className="font-semibold uppercase tracking-wider mb-3 block">Favori Türler</Typography>
                    <div className="flex flex-wrap gap-2">
                      {profileUser.preferredGenres.map(genre => (
                        <span key={genre} className="bg-muted/10 text-muted px-3 py-1 rounded-full text-xs font-medium">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-card border border-border/50 rounded-3xl p-6 grid grid-cols-2 gap-4">
                <div 
                  className="text-center cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => openFollowModal('followers')}
                >
                  <Typography variant="h2" className="text-primary mb-1">{profileUser.stats?.followers || 0}</Typography>
                  <Typography variant="caption" className="text-muted font-medium uppercase">Takipçi</Typography>
                </div>
                <div 
                  className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openFollowModal('following')}
                >
                  <Typography variant="h2" className="mb-1">{profileUser.stats?.following || 0}</Typography>
                  <Typography variant="caption" className="text-muted font-medium uppercase">Takip</Typography>
                </div>
                <div className="col-span-2 pt-4 border-t border-border/50 flex justify-center gap-8 items-center mt-2">
                  <div className="flex items-center gap-2">
                    <Eye size={20} className="text-primary" />
                    <Typography variant="h3" className="text-text">
                      {profileUser.isAuthor 
                        ? stories.reduce((sum, s) => sum + (s.stats?.views || 0), 0) 
                        : (profileUser.stats?.totalReads || 0)}
                    </Typography>
                  </div>
                  {profileUser.isAuthor && (
                    <>
                      <div className="flex items-center gap-2">
                        <Heart size={20} className="text-primary" />
                        <Typography variant="h3" className="text-text">
                          {stories.reduce((sum, s) => sum + (s.stats?.likes || 0), 0)}
                        </Typography>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare size={20} className="text-primary" />
                        <Typography variant="h3" className="text-text">
                          {globalTotalComments}
                        </Typography>
                      </div>
                    </>
                  )}
                </div>
                {profileUser.isAuthor && (
                  <div className="col-span-2 pt-4 border-t border-border/50 text-center mt-2 flex items-center justify-center gap-2">
                    <Feather size={20} className="text-amber-500" />
                    <div>
                      <Typography variant="h3" className="text-amber-500 mb-1">
                        {profileUser.stats?.arenaScore ? Number(profileUser.stats.arenaScore).toFixed(1) : "0.0"}
                      </Typography>
                      <Typography variant="caption" className="text-muted font-medium uppercase">Arena Puanı</Typography>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sağ Kolon (İçerikler) */}
            <div className="md:col-span-2">
              <div className="flex border-b border-border mb-6">
                <button 
                  onClick={() => setActiveProfileTab('stories')}
                  className={`flex-1 pb-3 text-center font-semibold transition-colors relative flex items-center justify-center gap-2 ${activeProfileTab === 'stories' ? 'text-primary' : 'text-muted hover:text-white'}`}
                >
                  <BookOpen size={20} />
                  Hikayeleri
                  {activeProfileTab === 'stories' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                </button>
                <button 
                  onClick={() => setActiveProfileTab('readixes')}
                  className={`flex-1 pb-3 text-center font-semibold transition-colors relative flex items-center justify-center gap-2 ${activeProfileTab === 'readixes' ? 'text-primary' : 'text-muted hover:text-white'}`}
                >
                  <Hash size={20} />
                  Readixleri
                  {activeProfileTab === 'readixes' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                </button>
                <button 
                  onClick={() => setActiveProfileTab('badges')}
                  className={`flex-1 pb-3 text-center font-semibold transition-colors relative flex items-center justify-center gap-2 ${activeProfileTab === 'badges' ? 'text-primary' : 'text-muted hover:text-white'}`}
                >
                  <Award size={20} />
                  Başarımlar
                  {activeProfileTab === 'badges' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                </button>
              </div>

              {activeProfileTab === 'stories' ? (
                stories.length === 0 ? (
                  <div className="bg-card/30 border border-dashed border-border rounded-3xl p-12 text-center">
                    <Typography variant="body" className="text-muted">
                      {isOwnProfile ? "Henüz yayında olan bir hikayeniz yok." : "Bu yazar henüz bir hikaye yayınlamamış."}
                    </Typography>
                    {isOwnProfile && (
                      <Button variant="outline" onPress={() => router.push('/studio')} className="mt-4 rounded-full">
                        Stüdyoya Git
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {stories.map(story => (
                      <StoryCard
                        key={story.storyId}
                        title={story.title}
                        authorName={profileUser.displayName}
                        authorUsername={profileUser.username}
                        coverImage={story.coverImage}
                        views={story.stats?.views || 0}
                        likes={story.stats?.likes || 0}
                        tags={story.tags || []}
                        onPress={() => router.push(`/story/${story.storyId}`)}
                      />
                    ))}
                  </div>
                )
              ) : activeProfileTab === 'readixes' ? (
                <div className="flex flex-col gap-6">
                  {/* Readix Sub-Tabs */}
                  <div className="flex gap-4 border-b border-white/5 pb-2">
                    <button 
                      onClick={() => setActiveReadixTab('shared')}
                      className={`text-sm font-semibold transition-colors relative ${activeReadixTab === 'shared' ? 'text-primary' : 'text-muted hover:text-white'}`}
                    >
                      Paylaşılanlar
                      {activeReadixTab === 'shared' && <div className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                    </button>
                    <button 
                      onClick={() => setActiveReadixTab('mentions')}
                      className={`text-sm font-semibold transition-colors relative ${activeReadixTab === 'mentions' ? 'text-primary' : 'text-muted hover:text-white'}`}
                    >
                      Bahsedilenler
                      {activeReadixTab === 'mentions' && <div className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                    </button>
                  </div>

                  {activeReadixTab === 'shared' ? (
                    readixes.length === 0 ? (
                      <div className="bg-card/30 border border-dashed border-border rounded-3xl p-12 text-center mt-4">
                        <Typography variant="body" className="text-muted">
                          {isOwnProfile ? "Henüz bir readix paylaşmadınız." : "Bu yazar henüz bir readix paylaşmamış."}
                        </Typography>
                        {isOwnProfile && (
                          <Button variant="outline" onPress={() => router.push('/readix')} className="mt-4 rounded-full">
                            İlk Readix'ini Paylaş
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
                              authorName={author.displayName}
                              authorUsername={author.username}
                              authorAvatarUrl={author.avatarUrl}
                              repostOfAuthorName={reposter?.displayName}
                              content={targetReadix.content}
                              mediaUrls={targetReadix.mediaUrls}
                              createdAtStr={targetReadix.createdAt ? new Date((targetReadix.createdAt as any).seconds ? (targetReadix.createdAt as any).seconds * 1000 : (targetReadix.createdAt as unknown as number)).toLocaleDateString() : 'Şimdi'}
                              likesCount={targetReadix.stats?.likes || 0}
                              commentsCount={targetReadix.stats?.comments || 0}
                              repostsCount={targetReadix.stats?.reposts || 0}
                              poll={targetReadix.poll as any}
                              isOwner={firebaseUser?.uid === readix.authorId}
                              isPinned={readix.isPinned}
                              onPinPress={() => handleReadixPin(readix.id, !!readix.isPinned)}
                              onLikePress={() => handleReadixLike(targetReadix.id, targetReadix.stats?.likes || 0)}
                              onCommentPress={() => openComments(targetReadix)}
                              onSharePress={() => openShare(targetReadix, author)}
                              onRepostPress={() => handleRepost(targetReadix.id)}
                              onPress={() => openComments(targetReadix)}
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
                      <div className="bg-card/30 border border-dashed border-border rounded-3xl p-12 text-center mt-4">
                        <Typography variant="body" className="text-muted">
                          {isOwnProfile ? "Henüz hiçbir readix'te bahsedilmediniz." : "Bu yazardan henüz bahsedilmemiş."}
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
                              authorName={author.displayName}
                              authorUsername={author.username}
                              authorAvatarUrl={author.avatarUrl}
                              repostOfAuthorName={reposter?.displayName}
                              content={targetReadix.content}
                              mediaUrls={targetReadix.mediaUrls}
                              createdAtStr={targetReadix.createdAt ? new Date((targetReadix.createdAt as any).seconds ? (targetReadix.createdAt as any).seconds * 1000 : (targetReadix.createdAt as unknown as number)).toLocaleDateString() : 'Şimdi'}
                              likesCount={targetReadix.stats?.likes || 0}
                              commentsCount={targetReadix.stats?.comments || 0}
                              repostsCount={targetReadix.stats?.reposts || 0}
                              poll={targetReadix.poll as any}
                              isOwner={firebaseUser?.uid === readix.authorId}
                              isPinned={readix.isPinned}
                              onPinPress={() => handleReadixPin(readix.id, !!readix.isPinned)}
                              onLikePress={() => handleReadixLike(targetReadix.id, targetReadix.stats?.likes || 0)}
                              onCommentPress={() => openComments(targetReadix)}
                              onSharePress={() => openShare(targetReadix, author)}
                              onRepostPress={() => handleRepost(targetReadix.id)}
                              onPress={() => openComments(targetReadix)}
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
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profil Düzenleme Modalı */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <Typography variant="h2" className="mb-6">Profili Düzenle</Typography>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="relative w-24 h-24 rounded-full border-2 border-border bg-muted overflow-hidden flex items-center justify-center group mb-2">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary uppercase">
                      {(editForm.displayName || profileUser.displayName || 'U').charAt(0)}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <label className="cursor-pointer text-white text-xs font-semibold px-2 py-1 bg-primary/80 rounded-full">
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
                <Typography variant="caption" className="text-muted text-xs">Profil resmini değiştirmek için tıklayın</Typography>
              </div>

              <div>
                <Typography variant="caption" className="text-muted mb-1 block">Görünen İsim</Typography>
                <Input 
                  value={editForm.displayName}
                  onChangeText={(val) => setEditForm({...editForm, displayName: val})}
                  placeholder="İsminiz"
                />
              </div>
              
              <div>
                <Typography variant="caption" className="text-muted mb-1 block">Kullanıcı Adı</Typography>
                <Input 
                  value={editForm.username}
                  onChangeText={(val) => setEditForm({...editForm, username: val.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                  placeholder="Kullanıcı adınız"
                />
                <Typography variant="caption" className="text-muted text-xs mt-1 block">Sadece küçük harf, rakam ve alt çizgi.</Typography>
              </div>
              
              <div>
                <Typography variant="caption" className="text-muted mb-1 block">Hakkında (Bio)</Typography>
                <textarea 
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Kendinizden bahsedin..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary/50 transition-colors resize-none h-24"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="secondary" className="flex-1 rounded-full" onPress={() => setIsEditModalOpen(false)}>
                İptal
              </Button>
              <Button variant="primary" className="flex-1 rounded-full" onPress={handleEditSave} disabled={isSaving}>
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fotoğraf Kırpma Modalı */}
      {isCropping && cropImageSrc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative flex flex-col h-[500px]">
            <Typography variant="h2" className="mb-4">Fotoğrafı Kırp</Typography>
            
            <div className="relative flex-1 bg-black/50 rounded-2xl overflow-hidden mb-6">
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
            
            <div className="flex items-center gap-4 mb-6">
              <Typography variant="caption" className="text-muted w-12">Yakınlaştır</Typography>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 rounded-full" onPress={() => setIsCropping(false)}>
                <X size={18} className="mr-2" /> İptal
              </Button>
              <Button variant="primary" className="flex-1 rounded-full" onPress={handleCropSave}>
                <Check size={18} className="mr-2" /> Tamamla
              </Button>
            </div>
          </div>
        </div>
      )}

      <ReadixCommentModal 
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        selectedReadix={selectedReadix}
        currentUserId={firebaseUser?.uid || null}
        onCommentAdded={handleCommentAdded}
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

      {/* Follow List Modal */}
      {followModalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setFollowModalType(null)}>
          <div className="bg-card w-full max-w-md rounded-3xl p-6 border border-border/50 shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h3">{followModalType === 'followers' ? 'Takipçiler' : 'Takip Edilenler'}</Typography>
              <button onClick={() => setFollowModalType(null)} className="p-2 hover:bg-muted/10 rounded-full transition-colors text-muted hover:text-text">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {isFollowModalLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : followModalUsers.length === 0 ? (
                <div className="text-center py-8 text-muted">
                  {followModalType === 'followers' ? 'Henüz takipçi yok.' : 'Henüz kimseyi takip etmiyor.'}
                </div>
              ) : (
                followModalUsers.map(u => (
                  <div 
                    key={u.uid} 
                    className="flex items-center gap-3 p-2 hover:bg-muted/5 rounded-xl cursor-pointer transition-colors"
                    onClick={() => {
                      setFollowModalType(null);
                      router.push(`/profile/${u.username}`);
                    }}
                  >
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.username} className="w-10 h-10 rounded-full object-cover border border-border/30" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <UserIcon size={20} className="text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Typography variant="body" className="font-semibold truncate">{u.displayName}</Typography>
                      <Typography variant="caption" className="text-muted truncate">@{u.username}</Typography>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
