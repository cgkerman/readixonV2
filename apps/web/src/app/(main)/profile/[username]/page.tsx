'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Users, BookOpen, User as UserIcon, Edit2, Bookmark, BookmarkCheck, Check, X, Hash, MessageCircle, Feather, Eye, Heart, MessageSquare, Award, Lock, Calendar, Globe, Link, Star, Layers, MapPin } from 'lucide-react';
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
  const [activeStoryTab, setActiveStoryTab] = useState<'novels' | 'webtoons'>('novels');
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
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
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    username: '',
    authorQuote: '',
    location: '',
    bio: '',
    avatarUrl: '',
    coverUrl: '',
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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Cropper states
  const [isCropping, setIsCropping] = useState(false);
  const [cropType, setCropType] = useState<'avatar' | 'cover'>('avatar');
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
          if (cropType === 'avatar') {
            setAvatarFile(croppedFile);
            setAvatarPreview(URL.createObjectURL(croppedFile));
          } else {
            setCoverFile(croppedFile);
            setCoverPreview(URL.createObjectURL(croppedFile));
          }
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
      let finalCoverUrl = editForm.coverUrl;
      
      // Eğer yeni bir dosya seçildiyse, Storage'a yükle
      if (avatarFile) {
        // Profil fotoğrafları genelde küçüktür (Örn: 400x400)
        const compressedFile = await compressImage(avatarFile, 400, 400, 0.85);
        const path = `users/${firebaseUser.uid}/avatar_${Date.now()}`;
        finalAvatarUrl = await uploadFile(compressedFile, path);
      }
      
      if (coverFile) {
        // Kapak fotoğrafları geniş olur (Örn: 1200x400)
        const compressedFile = await compressImage(coverFile, 1200, 400, 0.85);
        const path = `users/${firebaseUser.uid}/cover_${Date.now()}`;
        finalCoverUrl = await uploadFile(compressedFile, path);
      }
      
      const updateData = {
        displayName: editForm.displayName,
        username: editForm.username,
        authorQuote: editForm.authorQuote,
        location: editForm.location,
        preferredGenres: editForm.preferredGenresText.split(',').map(g => g.trim()).filter(g => g),
        bio: editForm.bio,
        avatarUrl: finalAvatarUrl,
        coverUrl: finalCoverUrl,
        pinnedStoryId: editForm.pinnedStoryId,
        socials: editForm.socials
      };

      await updateUserProfile(firebaseUser.uid, updateData);
      setProfileUser({
        ...profileUser,
        ...updateData
      });
      setIsEditModalOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setCoverFile(null);
      setCoverPreview(null);
      
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
        <div className="h-48 md:h-64 w-full relative overflow-hidden bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/5">
          {profileUser.coverUrl && (
            <img src={profileUser.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {/* Seamless gradient overlay to blend cover with background and ensure text/avatar readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-black/20"></div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 lg:px-10 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 md:-mt-16 mb-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0 z-20">
              <div className="w-[144px] h-[144px] md:w-[184px] md:h-[184px] rounded-full border-[6px] border-background bg-background overflow-hidden shadow-2xl flex items-center justify-center">
                {profileUser.avatarUrl ? (
                  <img src={profileUser.avatarUrl} alt={profileUser.displayName} className="w-full h-full object-cover bg-background" />
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
              <Typography variant="body" className="text-primary font-medium text-lg mb-3 md:mb-4">@{profileUser.username}</Typography>
              
              {/* Premium Stats Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 mt-4 text-[15px]">
                <div 
                  className="flex items-center cursor-pointer hover:opacity-80 transition-opacity group" 
                  onClick={() => openFollowModal('followers')}
                >
                  <span className="text-text font-bold mr-1.5">{profileUser.stats?.followers || 0}</span>
                  <span className="text-muted group-hover:text-white transition-colors">Takipçi</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer hover:opacity-80 transition-opacity group"
                  onClick={() => openFollowModal('following')}
                >
                  <span className="text-text font-bold mr-1.5">{profileUser.stats?.following || 0}</span>
                  <span className="text-muted group-hover:text-white transition-colors">Takip</span>
                </div>

                <div className="flex items-center" title="Okunma Sayısı">
                  <span className="text-text font-bold flex items-center gap-1.5 mr-1.5">
                    <Eye size={16} className="text-primary/80" />
                    {profileUser.isAuthor 
                      ? (stories.reduce((sum, s) => sum + (s.stats?.views || 0), 0) >= 1000 ? (stories.reduce((sum, s) => sum + (s.stats?.views || 0), 0) / 1000).toFixed(1) + 'B' : stories.reduce((sum, s) => sum + (s.stats?.views || 0), 0))
                      : (profileUser.stats?.totalReads || 0)}
                  </span>
                  <span className="text-muted">Okunma</span>
                </div>

                {profileUser.isAuthor && (
                  <>
                    <div className="flex items-center" title="Kazanılan Beğeniler">
                      <span className="text-text font-bold flex items-center gap-1.5 mr-1.5">
                        <Heart size={16} className="text-primary/80" />
                        {stories.reduce((sum, s) => sum + (s.stats?.likes || 0), 0)}
                      </span>
                      <span className="text-muted">Beğeni</span>
                    </div>
                    
                    <div className="flex items-center" title="Yorumlar">
                      <span className="text-text font-bold flex items-center gap-1.5 mr-1.5">
                        <MessageSquare size={16} className="text-primary/80" />
                        {globalTotalComments >= 1000 ? (globalTotalComments / 1000).toFixed(1) + 'B' : globalTotalComments}
                      </span>
                      <span className="text-muted">Yorum</span>
                    </div>

                    {profileUser.stats?.arenaScore && (
                      <div className="flex items-center" title="Arena Puanı">
                        <span className="text-amber-500 font-bold flex items-center gap-1.5 mr-1.5">
                          <Feather size={16} className="text-amber-500" />
                          {Number(profileUser.stats.arenaScore).toFixed(1)}
                        </span>
                        <span className="text-muted">Arena Puanı</span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Katılım Tarihi */}
                {profileUser.createdAt && (() => {
                  try {
                    let d: Date;
                    const ca = profileUser.createdAt as any;
                    if (ca.seconds) d = new Date(ca.seconds * 1000);
                    else d = new Date(ca);
                    
                    if (isNaN(d.getTime())) return null;
                    
                    const m = d.toLocaleString('tr-TR', { month: 'long' });
                    const y = d.getFullYear();
                    return (
                      <div className="flex items-center" title="Katılım Tarihi">
                         <span className="text-muted flex items-center gap-1.5">
                           <Calendar size={16} className="opacity-70" />
                           {m} {y}'dan beri Readixon'da
                         </span>
                      </div>
                    );
                  } catch(e) { return null; }
                })()}
              </div>
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
                      authorQuote: profileUser.authorQuote || '',
                      location: profileUser.location || '',
                      bio: profileUser.bio || '',
                      avatarUrl: profileUser.avatarUrl || '',
                      coverUrl: profileUser.coverUrl || '',
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
                    setCoverFile(null);
                    setCoverPreview(profileUser.coverUrl || null);
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

          {/* Yazar Sözü / Alıntı (Profil ile Grid Arasında) */}
          {profileUser.authorQuote && (
            <div className="w-full flex justify-center mb-10 relative z-10 px-6 mt-4">
              <div className="relative inline-block text-center max-w-2xl px-8 md:px-12 py-2">
                <div className="absolute top-0 left-0 text-primary/15 text-5xl md:text-6xl font-serif leading-none select-none pointer-events-none -mt-2">"</div>
                <div className="absolute top-0 right-0 text-primary/15 text-5xl md:text-6xl font-serif leading-none select-none pointer-events-none -mt-2">"</div>
                <Typography variant="body" className="text-foreground italic font-serif leading-relaxed text-[16px] md:text-[18px] relative z-10 font-medium">
                  {profileUser.authorQuote}
                </Typography>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-8">
            {/* Üst Satır: Başarımlar ve Biyografi */}
            <div className={`w-full grid grid-cols-1 md:grid-cols-3 gap-8`}>
              
              {/* Başarımlar İkonları Sütunu */}
              <div className="md:col-span-1 flex flex-col items-center md:items-start justify-start gap-4 h-full p-6 bg-card/40 border border-border/40 rounded-3xl">
                <div className="flex items-center gap-2 w-full mb-2">
                  <Award size={20} className="text-primary" />
                  <Typography variant="h3" className="font-bold">Başarımlar</Typography>
                </div>
                
                {profileUser.achievements?.earnedBadges && profileUser.achievements.earnedBadges.length > 0 ? (
                  <div className="flex flex-wrap content-start gap-3 items-start justify-center md:justify-start w-full mb-4">
                    {profileUser.achievements.earnedBadges.map(badgeId => {
                      const badgeConfig = BADGES[badgeId];
                      if (!badgeConfig) return null;
                      const Icon = badgeConfig.icon;
                      
                      let colorClass = 'text-primary/70 bg-primary/10 border-primary/20';
                      if (badgeConfig.tier === 'gold') colorClass = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                      if (badgeConfig.tier === 'silver') colorClass = 'text-gray-300 bg-gray-500/10 border-gray-500/20';
                      if (badgeConfig.tier === 'bronze') colorClass = 'text-orange-700 bg-orange-700/10 border-orange-700/20';
                      if (badgeConfig.tier === 'diamond') colorClass = 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
                      if (badgeConfig.tier === 'special') colorClass = 'text-purple-500 bg-purple-500/10 border-purple-500/20';
                      
                      return (
                        <div 
                          key={badgeId} 
                          className={`w-12 h-12 rounded-full flex items-center justify-center border ${colorClass} cursor-help group relative shadow-md transition-all hover:scale-110`}
                        >
                          <Icon size={24} />
                          {/* Tooltip */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs bg-card border border-border p-3 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon size={16} className={colorClass.split(' ')[0]} />
                              <Typography variant="body" className="font-bold text-text">{badgeConfig.title}</Typography>
                            </div>
                            <Typography variant="caption" className="text-muted block text-xs">{badgeConfig.description}</Typography>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center gap-2 opacity-50 py-4 w-full mb-4">
                    <Award size={36} className="text-muted" />
                    <Typography variant="body" className="text-muted text-sm">Henüz başarım kazanılmadı.</Typography>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onPress={() => setIsAchievementsModalOpen(true)} 
                  className="rounded-full w-full mt-auto"
                >
                  Tüm Başarımları Gör
                </Button>
              </div>

              {/* Hakkında İçeriği Sütunu */}
              <div className="bg-card border border-border/50 rounded-3xl p-6 flex flex-col h-full md:col-span-2">
                <Typography variant="h3" className="mb-4">Hakkında</Typography>

                <Typography variant="body" className="text-muted leading-relaxed flex-1">
                  {profileUser.bio || "Bu yazar henüz hakkında bir şey yazmamış."}
                </Typography>
                
                {/* Alt Bilgi Barı: Konum, Dil ve Türler */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mt-6 pt-6 border-t border-border/20">
                   <div className="flex items-center gap-2 text-muted text-sm font-medium">
                      <MapPin size={18} className="text-primary/70" /> {profileUser.location || 'Türkiye'}
                   </div>
                   
                   <div className="flex items-center gap-2 text-muted text-sm font-medium">
                      <Globe size={18} className="text-primary/70" /> Türkçe
                   </div>
                   
                   {profileUser.preferredGenres && profileUser.preferredGenres.length > 0 && (
                     <>
                       {/* Dikey ayırıcı */}
                       <div className="hidden sm:block w-px h-5 bg-border/50"></div>
                       <div className="flex flex-wrap gap-2 items-center">
                         {profileUser.preferredGenres.slice(0, 3).map(genre => (
                           <span key={genre} className="bg-muted/10 text-muted px-3 py-1 rounded-full text-xs font-medium border border-border/30">
                             {genre}
                           </span>
                         ))}
                       </div>
                     </>
                   )}
                </div>

                {profileUser.socials && (profileUser.socials.twitter || profileUser.socials.instagram || profileUser.socials.tiktok || profileUser.socials.website || profileUser.socials.linkedin || profileUser.socials.youtube) && (
                  <div className="mt-6 pt-6 border-t border-border/50 flex flex-wrap gap-3">
                    {profileUser.socials.twitter && (
                      <a href={`https://x.com/${profileUser.socials.twitter}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center text-muted hover:text-white hover:bg-muted/20 transition-all hover:scale-110" title="X (Twitter)">
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}
                    {profileUser.socials.instagram && (
                      <a href={`https://instagram.com/${profileUser.socials.instagram}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center text-muted hover:text-pink-500 hover:bg-pink-500/10 transition-all hover:scale-110" title="Instagram">
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </a>
                    )}
                    {profileUser.socials.tiktok && (
                      <a href={`https://tiktok.com/@${profileUser.socials.tiktok}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center text-muted hover:text-cyan-400 hover:bg-cyan-400/10 transition-all hover:scale-110" title="TikTok">
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.71a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </a>
                    )}
                    {profileUser.socials.website && (
                      <a href={profileUser.socials.website.startsWith('http') ? profileUser.socials.website : `https://${profileUser.socials.website}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center text-muted hover:text-primary hover:bg-primary/10 transition-all hover:scale-110" title="Web Sitesi">
                        <Globe size={18} />
                      </a>
                    )}
                    {profileUser.socials.linkedin && (
                      <a href={`https://linkedin.com/in/${profileUser.socials.linkedin}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center text-muted hover:text-blue-500 hover:bg-blue-500/10 transition-all hover:scale-110" title="LinkedIn">
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                    {profileUser.socials.youtube && (
                      <a href={`https://youtube.com/@${profileUser.socials.youtube}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-500/10 transition-all hover:scale-110" title="YouTube">
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Alt Satır: Vitrin ve Eserler & Readixler */}
            <div className="flex flex-col gap-16 w-full">
              {/* Grid: Vitrin & Eserler */}
              <div className={`w-full grid grid-cols-1 ${profileUser.pinnedStoryId && stories.find(s => s.storyId === profileUser.pinnedStoryId) ? 'md:grid-cols-3' : ''} gap-8`}>

              {profileUser.pinnedStoryId && stories.find(s => s.storyId === profileUser.pinnedStoryId) && (
                <div className="md:col-span-1 bg-gradient-to-b from-purple-500/15 via-card to-card border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col h-full group shadow-[0_0_40px_rgba(168,85,247,0.05)]">
                  {/* Arkaplan Işığı */}
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/30 blur-[100px] pointer-events-none rounded-full" />
                  
                  <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
                    <Award size={180} className="text-primary" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-8 relative z-10">
                    <Award size={24} className="text-primary" />
                    <Typography variant="h3" className="text-primary font-bold tracking-wide">Yazarın Gözdesi</Typography>
                  </div>
                  
                  <div className="flex-1 relative z-10 w-full flex flex-col items-center">
                    {(() => {
                      const story = stories.find(s => s.storyId === profileUser.pinnedStoryId)!;
                      const slug = (story as any).slug || story.storyId;
                      
                      let daysAgoText = '';
                      if (story.status === 'ongoing') {
                        daysAgoText = 'Yeni bölümler yolda';
                        if (story.updatedAt) {
                          try {
                            const ts = story.updatedAt as any;
                            const d = new Date(ts.seconds ? ts.seconds * 1000 : ts);
                            const diffMs = Date.now() - d.getTime();
                            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                            if (diffDays === 0) daysAgoText = 'Son güncelleme • Bugün';
                            else if (diffDays === 1) daysAgoText = 'Son güncelleme • Dün';
                            else if (diffDays < 30) daysAgoText = `Son güncelleme • ${diffDays} gün önce`;
                          } catch(e) {}
                        }
                      }
                      return (
                        <>
                          {/* Premium Kitap Kapağı */}
                          <div 
                            className="relative w-[75%] max-w-[200px] aspect-[2/3] rounded-r-xl rounded-l-md overflow-hidden shadow-[10px_0_20px_-5px_rgba(0,0,0,0.6),_inset_4px_0_15px_rgba(255,255,255,0.3)] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[15px_15px_30px_rgba(0,0,0,0.8)] cursor-pointer z-20"
                            onClick={() => router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`)}
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-[8px] bg-gradient-to-r from-black/80 via-white/10 to-transparent z-20 pointer-events-none" />
                            <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                          </div>
                          
                          {/* Kitap Rafı */}
                          <div className="w-[85%] max-w-[230px] h-3 bg-gradient-to-b from-white/10 to-transparent border-t border-white/20 shadow-[0_15px_30px_rgba(0,0,0,0.7)] z-10 rounded-full mt-[-3px] mb-8" />
                          
                          {/* Bilgiler ve Özet */}
                          <div className="text-center w-full px-2 flex flex-col flex-1">
                            {story.status === 'ongoing' && daysAgoText && (
                              <div className="flex items-center justify-center gap-1.5 mb-2 -mt-4 opacity-80">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <Typography variant="caption" className="text-primary font-medium tracking-wide text-[11px] uppercase">
                                  {daysAgoText}
                                </Typography>
                              </div>
                            )}
                            {/* Rozetler (Kapak dışına alındı) */}
                            <div className="flex items-center justify-center gap-2 mb-3">
                              {story.status && (
                                <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                                  story.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                                  story.status === 'ongoing' ? 'bg-primary/20 text-primary' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {story.status === 'completed' ? 'Tamamlandı' : story.status === 'ongoing' ? 'Devam Ediyor' : 'Taslak'}
                                </div>
                              )}
                              {story.stats?.rating ? (
                                <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold text-yellow-500">
                                  <Star fill="currentColor" size={10} /> {story.stats.rating.toFixed(1)}
                                </div>
                              ) : null}
                            </div>

                            <Typography variant="h3" className="font-extrabold text-xl md:text-2xl mb-3 line-clamp-2 tracking-tight">{story.title}</Typography>
                            
                            <div className="flex flex-wrap items-center justify-center gap-4 mb-6 opacity-70">
                              <span className="flex items-center gap-1.5 text-sm" title={`${story.stats?.chapterCount || 0} Bölüm`}><Layers size={14}/> {story.stats?.chapterCount || 0}</span>
                              <span className="flex items-center gap-1.5 text-sm"><Eye size={14}/> {story.stats?.views >= 1000 ? (story.stats?.views / 1000).toFixed(1) + 'B' : story.stats?.views || 0}</span>
                              <span className="flex items-center gap-1.5 text-sm"><Heart size={14}/> {story.stats?.likes >= 1000 ? (story.stats?.likes / 1000).toFixed(1) + 'B' : story.stats?.likes || 0}</span>
                            </div>

                            <Typography variant="body" className="text-muted/90 text-sm line-clamp-4 leading-relaxed mb-6">
                              "{story.summary || 'Bu eser için henüz bir özet girilmemiş.'}"
                            </Typography>
                            
                            <div className="mt-auto pt-4">
                              <Button 
                                variant="primary" 
                                className="w-full rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white border-0 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all font-bold text-sm h-12"
                                onPress={() => router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`)}
                              >
                                Hemen Okumaya Başla
                              </Button>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Eserler Sütunu */}
              <div className={`${profileUser.pinnedStoryId && stories.find(s => s.storyId === profileUser.pinnedStoryId) ? 'md:col-span-2' : ''} flex flex-col h-full`}>
                
                {/* Yazarın Hikayeleri (Bookshelf) */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-border/50 pb-4 pt-6">
                    <Typography variant="h3" className="font-bold flex items-center gap-2">
                      <BookOpen className="text-primary" size={24} /> Yazarın Eserleri
                    </Typography>
                    
                    {/* Story Sub-Tabs */}
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setActiveStoryTab('novels')}
                        className={`text-sm font-semibold transition-colors relative ${activeStoryTab === 'novels' ? 'text-primary' : 'text-muted hover:text-white'}`}
                      >
                        Romanları
                        {activeStoryTab === 'novels' && <div className="absolute -bottom-4.5 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                      </button>
                      <button 
                        onClick={() => setActiveStoryTab('webtoons')}
                        className={`text-sm font-semibold transition-colors relative ${activeStoryTab === 'webtoons' ? 'text-primary' : 'text-muted hover:text-white'}`}
                      >
                        Webtoonları
                        {activeStoryTab === 'webtoons' && <div className="absolute -bottom-4.5 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const filteredStories = stories.filter(s => activeStoryTab === 'webtoons' ? s.format === 'webtoon' : s.format !== 'webtoon');
                    
                    if (filteredStories.length === 0) {
                      return (
                        <div className="bg-card/30 border border-dashed border-border rounded-3xl p-12 text-center mt-2">
                          <Typography variant="body" className="text-muted">
                            {isOwnProfile ? `Henüz yayında olan bir ${activeStoryTab === 'webtoons' ? 'webtoonunuz' : 'romanınız'} yok.` : `Bu yazar henüz bir ${activeStoryTab === 'webtoons' ? 'webtoon' : 'roman'} yayınlamamış.`}
                          </Typography>
                          {isOwnProfile && (
                            <Button variant="outline" onPress={() => router.push('/studio')} className="mt-4 rounded-full">
                              Stüdyoya Git
                            </Button>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-x-8 gap-y-12 mt-6">
                        {filteredStories.map(story => {
                          const slug = (story as any).slug || story.storyId;
                          return (
                            <div 
                              key={story.storyId} 
                              className="flex flex-col items-center group relative cursor-pointer"
                              onClick={() => router.push(story.format === 'webtoon' ? `/webtoons/${slug}` : `/story/${slug}`)}
                            >
                              <div className="relative w-full flex flex-col items-center">
                                {/* 3D Kitap Kapağı */}
                                <div className="relative w-[90%] aspect-[2/3] rounded-r-md rounded-l-sm overflow-hidden shadow-[4px_0_15px_-3px_rgba(0,0,0,0.5),_inset_4px_0_10px_rgba(255,255,255,0.2)] transition-all duration-300 group-hover:-translate-y-4 group-hover:shadow-[8px_10px_20px_rgba(0,0,0,0.6)] z-10">
                                  {/* Kitap Sırtı Efekti */}
                                  <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-gradient-to-r from-black/60 via-white/10 to-transparent z-20 pointer-events-none" />
                                  <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                                  
                                  {/* Hover Overlay */}
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30">
                                    <Button variant="primary" className="rounded-full px-6 py-2 scale-90 group-hover:scale-100 transition-transform shadow-xl">
                                      Oku
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Şık/Minimal Raf Çizgisi */}
                                <div className="w-[100%] h-2 bg-gradient-to-b from-white/10 to-transparent border-t border-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-0 rounded-full mt-[-2px]" />
                              </div>
                              
                              {/* Minimal Bilgiler */}
                              <div className="mt-4 text-center w-full z-10 px-1">
                                <div className="flex items-center justify-center gap-1.5 mb-2">
                                  {story.status && (
                                    <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                                      story.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                                      story.status === 'ongoing' ? 'bg-primary/20 text-primary' : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                      {story.status === 'completed' ? 'Tamamlandı' : story.status === 'ongoing' ? 'Devam Ediyor' : 'Taslak'}
                                    </div>
                                  )}
                                  {story.stats?.rating ? (
                                    <div className="flex items-center gap-0.5 bg-yellow-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold text-yellow-500">
                                      <Star fill="currentColor" size={8} /> {story.stats.rating.toFixed(1)}
                                    </div>
                                  ) : null}
                                </div>
                                <Typography variant="body" className="font-bold text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors" title={story.title}>{story.title}</Typography>
                                
                                {/* Türler (1-2 adet) */}
                                {story.tags && story.tags.length > 0 && (
                                  <div className="flex items-center justify-center gap-1 mt-2 flex-wrap">
                                    {story.tags.slice(0, 2).map(tag => (
                                      <span key={tag} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-muted/80">{tag}</span>
                                    ))}
                                  </div>
                                )}

                                {/* İstatistikler */}
                                <div className="flex items-center justify-center gap-3 mt-2 opacity-60">
                                  <span className="flex items-center gap-1 text-xs" title={`${story.stats?.chapterCount || 0} Bölüm`}><Layers size={12}/> {story.stats?.chapterCount || 0}</span>
                                  <span className="flex items-center gap-1 text-xs" title="Görüntülenme"><Eye size={12}/> {story.stats?.views >= 1000 ? (story.stats?.views / 1000).toFixed(1) + 'B' : story.stats?.views || 0}</span>
                                  <span className="flex items-center gap-1 text-xs" title="Beğeni"><Heart size={12}/> {story.stats?.likes >= 1000 ? (story.stats?.likes / 1000).toFixed(1) + 'B' : story.stats?.likes || 0}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
              {/* Eserler Grid Sonu */}
            </div>

              {/* Yazarın Readixleri (Grid Altında Ortalanmış Kutu) */}
              <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto mt-4">
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
                              linkedStory={targetReadix.linkedStory}
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
                              linkedStory={targetReadix.linkedStory}
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
          </div>
        </div>
      </div>
    </div>

      {/* Profil Düzenleme Modalı */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="p-6 pb-4 border-b border-border/10">
              <Typography variant="h2" className="m-0 text-xl md:text-2xl">Profili Düzenle</Typography>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="relative mb-8">
                {/* Cover Upload */}
                <div className="h-28 w-full bg-muted rounded-2xl overflow-hidden relative group">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/5"></div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <label className="cursor-pointer text-white text-xs font-semibold px-3 py-1.5 bg-primary/80 rounded-full">
                      Kapak Değiştir
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setCropImageSrc(URL.createObjectURL(file));
                            setCropType('cover');
                            setIsCropping(true);
                            setZoom(1);
                            setCrop({ x: 0, y: 0 });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Avatar Upload */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                  <div className="relative w-20 h-20 rounded-full border-4 border-card bg-muted overflow-hidden flex items-center justify-center group shadow-lg">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-primary uppercase">
                        {(editForm.displayName || profileUser.displayName || 'U').charAt(0)}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <label className="cursor-pointer text-white text-[10px] font-semibold px-2 py-1 bg-primary/80 rounded-full">
                        Değiştir
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setCropImageSrc(URL.createObjectURL(file));
                              setCropType('avatar');
                              setIsCropping(true);
                              setZoom(1);
                              setCrop({ x: 0, y: 0 });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
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
                <Typography variant="caption" className="text-muted mb-1 block">Konum</Typography>
                <Input 
                  value={editForm.location}
                  onChangeText={(val) => setEditForm({...editForm, location: val})}
                  placeholder="Örn: İstanbul, Türkiye"
                />
              </div>

              <div>
                <Typography variant="caption" className="text-muted mb-1 block">İlgilendiği Türler</Typography>
                <Input 
                  value={editForm.preferredGenresText}
                  onChangeText={(val) => setEditForm({...editForm, preferredGenresText: val})}
                  placeholder="Örn: Fantastik, Bilim Kurgu, Romantik"
                />
                <Typography variant="caption" className="text-muted text-xs mt-1 block">Virgülle ayırarak maks. 3 tür yazabilirsiniz.</Typography>
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

              <div>
                <Typography variant="caption" className="text-muted mb-1 block">Yazarın Sözü (Opsiyonel)</Typography>
                <Input 
                  value={editForm.authorQuote}
                  onChangeText={(val) => setEditForm({...editForm, authorQuote: val})}
                  placeholder="Profilinize estetik bir söz bırakın..."
                />
                <Typography variant="caption" className="text-muted text-xs mt-1 block">Profilinizde şık bir imza olarak sergilenecektir. (Maks 120 karakter)</Typography>
              </div>

              {profileUser.isAuthor && stories.length > 0 && (
                <div>
                  <Typography variant="caption" className="text-muted mb-1 block">Vitrin Kitabınız (Gözde Eseriniz)</Typography>
                  <select
                    value={editForm.pinnedStoryId}
                    onChange={(e) => setEditForm({...editForm, pinnedStoryId: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                  >
                    <option value="">-- Vitrin Kullanmak İstemiyorum --</option>
                    {stories.map(story => (
                      <option key={story.storyId} value={story.storyId}>
                        {story.title} {story.format === 'webtoon' ? '(Webtoon)' : '(Roman)'}
                      </option>
                    ))}
                  </select>
                  <Typography variant="caption" className="text-muted text-xs mt-1 block">Seçtiğiniz eser profilinizin hakkında kısmında özel olarak sergilenir.</Typography>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <Typography variant="h3" className="mb-4 text-lg">Sosyal Medya (Opsiyonel)</Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="caption" className="text-muted mb-1 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X (Twitter)
                    </Typography>
                    <Input 
                      value={editForm.socials?.twitter || ''}
                      onChangeText={(val) => setEditForm({...editForm, socials: {...editForm.socials, twitter: val.replace('@', '')}})}
                      placeholder="kullanici_adi"
                    />
                  </div>
                  <div>
                    <Typography variant="caption" className="text-muted mb-1 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                      Instagram
                    </Typography>
                    <Input 
                      value={editForm.socials?.instagram || ''}
                      onChangeText={(val) => setEditForm({...editForm, socials: {...editForm.socials, instagram: val.replace('@', '')}})}
                      placeholder="kullanici_adi"
                    />
                  </div>
                  <div>
                    <Typography variant="caption" className="text-muted mb-1 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.71a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg> 
                      TikTok
                    </Typography>
                    <Input 
                      value={editForm.socials?.tiktok || ''}
                      onChangeText={(val) => setEditForm({...editForm, socials: {...editForm.socials, tiktok: val.replace('@', '')}})}
                      placeholder="kullanici_adi"
                    />
                  </div>
                  <div>
                    <Typography variant="caption" className="text-muted mb-1 flex items-center gap-1.5"><Globe size={14} /> Web Sitesi</Typography>
                    <Input 
                      value={editForm.socials?.website || ''}
                      onChangeText={(val) => setEditForm({...editForm, socials: {...editForm.socials, website: val}})}
                      placeholder="siteadi.com"
                    />
                  </div>
                  <div>
                    <Typography variant="caption" className="text-muted mb-1 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </Typography>
                    <Input 
                      value={editForm.socials?.linkedin || ''}
                      onChangeText={(val) => setEditForm({...editForm, socials: {...editForm.socials, linkedin: val.replace('@', '')}})}
                      placeholder="kullanici_adi"
                    />
                  </div>
                  <div>
                    <Typography variant="caption" className="text-muted mb-1 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      YouTube
                    </Typography>
                    <Input 
                      value={editForm.socials?.youtube || ''}
                      onChangeText={(val) => setEditForm({...editForm, socials: {...editForm.socials, youtube: val.replace('@', '')}})}
                      placeholder="kanal_adi"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-border/10 bg-card/95 flex gap-3">
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
                aspect={cropType === 'avatar' ? 1 : 3}
                cropShape={cropType === 'avatar' ? "round" : "rect"}
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

      {/* Tüm Başarımlar Modalı */}
      {isAchievementsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="p-6 pb-4 border-b border-border/10 flex justify-between items-center">
              <Typography variant="h2" className="m-0 text-xl md:text-2xl flex items-center gap-3">
                <Award className="text-primary" /> Başarımlar Kütüphanesi
              </Typography>
              <button onClick={() => setIsAchievementsModalOpen(false)} className="text-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 styled-scrollbar bg-background/30">
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
          </div>
        </div>
      )}
    </div>
  );
}
