'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  useAuthStore, 
  getForYouReadixes, 
  getFollowingReadixes, 
  getReadixesByTag,
  createReadix,
  toggleReadixLike,
  getUserProfile,
  addReadixComment,
  getReadixComments,
  uploadFile,
  compressImage,
  searchTags,
  updateReadix,
  deleteReadix,
  reportContent,
  blockUser,
  getReadixById,
  searchUsers,
  getTrendingReadixes,
  toggleReadixBookmark,
  getActiveQuote,
  AdminQuote,
  Readix,
  User,
  Story
} from '@readixon/core';
import { Typography, Button, ReadixCard, Input, ReadixCommentModal, ReadixShareModal, ShareReadixData, EditReadixModal, ReportModal, ConfirmationDialog, StorySearchModal, QuillIcon } from '@readixon/ui';
import { Loader2, Image as ImageIcon, Send, User as UserIcon, Bold, Italic, Smile, BookOpen, Award, Sparkles, BarChart2, ImagePlus, BookPlus, Feather } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { toast } from "sonner";
import { ReadixSidebar } from './ReadixSidebar';

function ReadixContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hashtag = searchParams.get('hashtag');
  const { firebaseUser, userProfile } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'foryou' | 'following' | 'trending' | 'webtoon' | 'hashtag'>(hashtag ? 'hashtag' : 'foryou');
  const [readixes, setReadixes] = useState<Readix[]>([]);
  const [authors, setAuthors] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [dailyQuote, setDailyQuote] = useState<AdminQuote | null>(null);

  useEffect(() => {
    getActiveQuote().then(setDailyQuote).catch(console.error);
  }, []);
  
  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedReadixForShare, setSelectedReadixForShare] = useState<ShareReadixData | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [activeReadix, setActiveReadix] = useState<Readix | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isStorySearchOpen, setIsStorySearchOpen] = useState(false);

  const handleEditSave = async (newContent: string) => {
    if (!activeReadix) return;
    try {
      await updateReadix(activeReadix.id, newContent);
      setReadixes(prev => prev.map(r => r.id === activeReadix.id ? { ...r, content: newContent } : r));
      toast.success('Gönderi güncellendi.');
    } catch (e) {
      toast.error('Güncelleme başarısız.');
    }
  };

  const handleDeleteConfirm = async () => {
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

  const handleReportSubmit = async (reason: string, details: string) => {
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
    if (!activeReadix || !firebaseUser || !userProfile) return;
    setIsProcessing(true);
    try {
      await blockUser(firebaseUser.uid, activeReadix.authorId);
      setReadixes(prev => prev.filter(r => r.authorId !== activeReadix.authorId));
      
      useAuthStore.getState().setUserProfile({
        ...userProfile,
        blockedUsers: [...(userProfile?.blockedUsers || []), activeReadix.authorId]
      });
      
      setBlockConfirmOpen(false);
      toast.success('Kullanıcı engellendi.');
    } catch (e) {
      toast.error('Engelleme başarısız.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openShare = (readix: Readix, author: User | undefined) => {
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

  // Create Readix State
  const quoteParam = searchParams.get('quote');
  const contentEditableRef = React.useRef<HTMLElement>(null);
  const [newContent, setNewContent] = useState(quoteParam || ''); // this stores HTML
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [activeMention, setActiveMention] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const htmlToMarkdown = (html: string) => {
    let markdown = html;
    // Replace divs/brs with newlines
    markdown = markdown.replace(/<div>/gi, '\n').replace(/<\/div>/gi, '');
    markdown = markdown.replace(/<br\s*[\/]?>/gi, '\n');
    // Replace bold
    markdown = markdown.replace(/<(b|strong)[^>]*>(.*?)<\/\1>/gi, '**$2**');
    // Replace italic
    markdown = markdown.replace(/<(i|em)[^>]*>(.*?)<\/\1>/gi, '*$2*');
    // Strip all other tags
    markdown = markdown.replace(/<[^>]+>/g, '');
    // Decode html entities
    markdown = markdown.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return markdown;
  };

  const insertFormat = (command: string) => {
    document.execCommand(command, false);
    if (contentEditableRef.current) {
      setNewContent(contentEditableRef.current.innerHTML);
    }
  };

  const onEmojiClick = (emojiData: any) => {
    document.execCommand('insertText', false, emojiData.emoji);
    if (contentEditableRef.current) {
      setNewContent(contentEditableRef.current.innerHTML);
    }
  };

  const handleContentChange = (e: ContentEditableEvent) => {
    const value = e.target.value;
    setNewContent(value);
    
    // Fallback simple parsing for hashtag/mention detection (stripping tags)
    const plainText = value.replace(/<[^>]+>/g, '');
    const words = plainText.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('#') && lastWord.length > 0) {
      setActiveHashtag(lastWord.slice(1).toLowerCase());
      setActiveMention(null);
    } else if (lastWord.startsWith('@') && lastWord.length > 0) {
      setActiveMention(lastWord.slice(1).toLowerCase());
      setActiveHashtag(null);
    } else {
      setActiveHashtag(null);
      setActiveMention(null);
    }
  };

  const handleTagSelect = (tagId: string) => {
    const words = newContent.trimEnd().split(/\s+/);
    words.pop(); // remove the partial hashtag
    const newText = words.length > 0 ? `${words.join(' ')} #${tagId} ` : `#${tagId} `;
    setNewContent(newText);
    setActiveHashtag(null);
  };

  const handleMentionSelect = (username: string) => {
    const words = newContent.trimEnd().split(/\s+/);
    words.pop(); // remove the partial mention
    const newText = words.length > 0 ? `${words.join(' ')} @${username} ` : `@${username} `;
    setNewContent(newText);
    setActiveMention(null);
  };

  const [filteredTags, setFilteredTags] = useState<{id: string, count?: number, label?: string}[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!activeHashtag) {
      setFilteredTags([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      const results = await searchTags(activeHashtag);
      setFilteredTags(results);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeHashtag]);

  useEffect(() => {
    if (!activeMention) {
      setFilteredUsers([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      const results = await searchUsers(activeMention);
      setFilteredUsers(results);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeMention]);

  // Handle specific readix from URL
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      const fetchSpecific = async () => {
        const readix = await getReadixById(idParam);
        if (readix) {
          // fetch author
          if (!authors[readix.authorId]) {
            const user = await getUserProfile(readix.authorId);
            if (user) setAuthors(prev => ({ ...prev, [readix.authorId]: user }));
          }
          openComments(readix);
        }
      };
      fetchSpecific();
    }
  }, [searchParams.get('id')]);

  // Set initial content if hashtag exists and tab is hashtag
  useEffect(() => {
    if (hashtag) {
      setNewContent(`#${hashtag} `);
      setActiveTab('hashtag');
    }
  }, [hashtag]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  
  // Poll State
  const [pollActive, setPollActive] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollDuration, setPollDuration] = useState(1); // days

  // Feed State
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, [activeTab, firebaseUser]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'hashtag' && hashtag) {
        response = await getReadixesByTag(hashtag, 20, undefined, userProfile?.blockedUsers);
      } else if (activeTab === 'following' && firebaseUser) {
        response = await getFollowingReadixes(firebaseUser.uid, 20, undefined, userProfile?.blockedUsers);
      } else if (activeTab === 'trending') {
        response = await getTrendingReadixes(20, undefined, userProfile?.blockedUsers);
      } else if (activeTab === 'webtoon') {
        response = { readixes: [], lastDoc: null, hasMore: false };
      } else {
        response = await getForYouReadixes(20, undefined, userProfile?.blockedUsers);
      }
      
      setReadixes(response.readixes);
      setLastDoc(response.lastDoc);
      setHasMore(response.hasMore);
      
      // Fetch missing authors
      const missingAuthorIds = Array.from(new Set(response.readixes.flatMap(r => [r.authorId, r.originalReadix?.authorId]))).filter(id => id && !authors[id]) as string[];
      if (missingAuthorIds.length > 0) {
        const newAuthors = { ...authors };
        await Promise.all(missingAuthorIds.map(async (id) => {
          const user = await getUserProfile(id);
          if (user) newAuthors[id] = user;
        }));
        setAuthors(newAuthors);
      }
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || !lastDoc) return;
    setLoadingMore(true);
    try {
      let response;
      if (activeTab === 'hashtag' && hashtag) {
        response = await getReadixesByTag(hashtag, 20, lastDoc, userProfile?.blockedUsers);
      } else if (activeTab === 'following' && firebaseUser) {
        response = await getFollowingReadixes(firebaseUser.uid, 20, lastDoc, userProfile?.blockedUsers);
      } else if (activeTab === 'trending') {
        response = await getTrendingReadixes(20, lastDoc, userProfile?.blockedUsers);
      } else if (activeTab === 'webtoon') {
        response = { readixes: [], lastDoc: null, hasMore: false };
      } else {
        response = await getForYouReadixes(20, lastDoc, userProfile?.blockedUsers);
      }
      
      setReadixes(prev => [...prev, ...response.readixes]);
      setLastDoc(response.lastDoc);
      setHasMore(response.hasMore);
      
      const missingAuthorIds = Array.from(new Set(response.readixes.flatMap(r => [r.authorId, r.originalReadix?.authorId]))).filter(id => id && !authors[id]) as string[];
      if (missingAuthorIds.length > 0) {
        const newAuthors = { ...authors };
        await Promise.all(missingAuthorIds.map(async (id) => {
          const user = await getUserProfile(id);
          if (user) newAuthors[id] = user;
        }));
        setAuthors(newAuthors);
      }
    } catch (error) {
      console.error("Daha fazla yüklenemedi", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePost = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    if (!newContent.trim() && selectedFiles.length === 0 && !pollActive) return;

    setIsPosting(true);
    try {
      let mediaUrls: string[] = [];
      
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const compressed = await compressImage(file, 1200, 1200, 0.85);
          const path = `readixes/${firebaseUser.uid}/${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const url = await uploadFile(compressed, path);
          mediaUrls.push(url);
        }
      }

      let pollData = null;
      if (pollActive && pollQuestion.trim() && pollOptions[0].trim() && pollOptions[1].trim()) {
        const validOptions = pollOptions.filter(o => o.trim() !== '');
        if (validOptions.length >= 2) {
          const expiresAtDate = new Date();
          expiresAtDate.setDate(expiresAtDate.getDate() + pollDuration);
          pollData = {
            question: pollQuestion.trim(),
            options: validOptions.map(o => ({ id: Math.random().toString(36).substr(2, 9), text: o, votes: 0 })),
            expiresAt: expiresAtDate,
            voterIds: []
          };
        }
      }

      const finalMarkdownContent = htmlToMarkdown(newContent);
      
      // Look for storyId in state or URL
      const linkedStoryId = selectedStory?.storyId || searchParams.get('storyId') || undefined;

      const newReadix = await createReadix(
        firebaseUser.uid,
        finalMarkdownContent.trim(),
        mediaUrls,
        linkedStoryId,
        pollData
      );

      if (selectedStory) {
        newReadix.linkedStory = {
          storyId: selectedStory.storyId,
          title: selectedStory.title,
          coverUrl: selectedStory.coverImage,
          authorName: selectedStory.authorName || 'Bilinmiyor',
        };
      }

      // Add to feed immediately
      setReadixes([newReadix, ...readixes]);
      if (!authors[firebaseUser.uid] && userProfile) {
        setAuthors({ ...authors, [firebaseUser.uid]: userProfile });
      }
      
      // Reset form
      setNewContent('');
      setSelectedFiles([]);
      setPreviewUrls([]);
      setPollActive(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      setPollDuration(1);
      setSelectedStory(null);
    } catch (e) {
      console.error("Paylaşım yapılamadı", e);
      toast.error("Bir hata oluştu.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (readixId: string, currentLikes: number) => {
    if (!firebaseUser) return router.push('/login');
    
    // Optimistic UI Update
    setReadixes(prev => prev.map(r => {
      if (r.id === readixId) {
        return { ...r, stats: { ...r.stats, likes: currentLikes + 1 } };
      }
      return r;
    }));

    try {
      const isLikedNow = await toggleReadixLike(firebaseUser.uid, readixId);
      // Correct it if we just unliked it
      if (!isLikedNow) {
        setReadixes(prev => prev.map(r => {
          if (r.id === readixId) {
            return { ...r, stats: { ...r.stats, likes: Math.max(0, currentLikes - 1) } };
          }
          return r;
        }));
      }
    } catch (e) {
      console.error(e);
      // Revert on error
      setReadixes(prev => prev.map(r => {
        if (r.id === readixId) {
          return { ...r, stats: { ...r.stats, likes: currentLikes } };
        }
        return r;
      }));
    }
  };

  const handleBookmark = async (readixId: string) => {
    if (!firebaseUser) return router.push('/login');
    
    // Optimistic UI Update
    setReadixes(prev => prev.map(r => {
      if (r.id === readixId) {
        return { ...r, stats: { ...r.stats, bookmarks: (r.stats?.bookmarks || 0) + 1 } };
      }
      return r;
    }));

    // Update user profile optimistically
    if (userProfile) {
      const currentBookmarks = userProfile.bookmarkedReadixIds || [];
      if (!currentBookmarks.includes(readixId)) {
        useAuthStore.getState().setUserProfile({
          ...userProfile,
          bookmarkedReadixIds: [...currentBookmarks, readixId]
        });
      }
    }

    try {
      const isBookmarkedNow = await toggleReadixBookmark(firebaseUser.uid, readixId);
      if (!isBookmarkedNow) {
        // Revert optimistically
        setReadixes(prev => prev.map(r => {
          if (r.id === readixId) {
            return { ...r, stats: { ...r.stats, bookmarks: Math.max(0, (r.stats?.bookmarks || 0) - 1) } };
          }
          return r;
        }));
        if (userProfile) {
          useAuthStore.getState().setUserProfile({
            ...userProfile,
            bookmarkedReadixIds: (userProfile.bookmarkedReadixIds || []).filter(id => id !== readixId)
          });
        }
      } else {
        toast.success("Gönderi kaydedildi.");
      }
    } catch (e) {
      console.error(e);
      toast.error("İşlem başarısız.");
    }
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
      
      const original = readixes.find(r => r.id === readixId);
      if (original) {
        newReadix.originalReadix = original.originalReadix || original;
      }
      
      // If we are on 'foryou' or 'following', we might want to push it to top
      if (activeTab !== 'hashtag') {
        setReadixes(prev => [newReadix, ...prev]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Alıntılanamadı");
    }
  };

  // Yorum Modalı States
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

  // Character Limit Logic
  const plainTextContent = newContent.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const charCount = plainTextContent.length;
  const maxChars = 500;
  const isOverLimit = charCount > maxChars;
  
  const circleRadius = 10;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (Math.min(charCount / maxChars, 1)) * circleCircumference;
  const isWarning = charCount >= maxChars - 20;

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full p-0 md:p-6 lg:p-10">
      
      {/* Main Feed Column */}
      <div className="flex-1 min-w-0 md:border-r border-white/10 md:pr-10 min-h-screen">
        
        {/* Header & Tabs */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-0 pt-6 px-4 md:px-0 border-b border-border mb-6">
          <Typography variant="h1" className="text-3xl font-bold mb-6 text-text">Readix<span className="text-primary">.</span></Typography>
          
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveTab('foryou')}
              className={`pb-3 text-center font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'foryou' ? 'text-primary' : 'text-muted hover:text-text'}`}
            >
              Sana Özel
              {activeTab === 'foryou' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => {
                if (!firebaseUser) router.push('/login');
                else setActiveTab('following');
              }}
              className={`pb-3 text-center font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'following' ? 'text-primary' : 'text-muted hover:text-text'}`}
            >
              Takip Ettiklerin
              {activeTab === 'following' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('trending')}
              className={`pb-3 text-center font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'trending' ? 'text-primary' : 'text-muted hover:text-text'}`}
            >
              Trend
              {activeTab === 'trending' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('webtoon')}
              className={`pb-3 text-center font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'webtoon' ? 'text-primary' : 'text-muted hover:text-text'}`}
            >
              Webtoon
              {activeTab === 'webtoon' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />}
            </button>
            {activeTab === 'hashtag' && hashtag && (
              <button 
                className="pb-3 text-center font-semibold transition-colors relative whitespace-nowrap text-primary"
              >
                #{hashtag}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
              </button>
            )}
          </div>
        </div>

        {/* Create Post Area */}
        <div className="p-4 md:p-6 bg-card/60 backdrop-blur-xl rounded-3xl mx-4 md:mx-0 mb-6 shadow-sm border border-border/50 transition-all focus-within:bg-card focus-within:border-primary/30 focus-within:shadow-md">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex-shrink-0 border border-primary/20 overflow-hidden shadow-sm">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-primary bg-primary/20">
                  <span className="text-xs font-bold uppercase">{(userProfile?.displayName || 'U').charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col min-w-0 pt-1">
              <div className="relative">
                <ContentEditable
                  innerRef={contentEditableRef}
                  html={newContent}
                  onChange={handleContentChange}
                  tagName="div"
                  className="bg-transparent border-none focus:outline-none text-text resize-none text-[16px] leading-relaxed min-h-[60px] w-full break-words outline-none empty:before:content-['Neler_okuyorsun?_Düşüncelerini_paylaş...'] empty:before:text-muted/60 empty:before:font-medium empty:before:pointer-events-none"
                />
                {activeHashtag !== null && filteredTags.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden z-50">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagSelect(tag.id)}
                        className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors flex flex-col"
                      >
                        <span className="font-semibold text-text">#{tag.id}</span>
                        <span className="text-xs text-muted">
                          {tag.count ? `${tag.count} gönderi` : (tag.label || '')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {activeMention !== null && filteredUsers.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden z-50">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.uid}
                        onClick={() => handleMentionSelect(user.username!)}
                        className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-primary font-bold">{user.displayName?.charAt(0) || 'U'}</span>}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-text">{user.displayName}</span>
                          <span className="text-xs text-muted">@{user.username}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedStory && (
                <div className="relative mb-4 p-3 bg-background/50 border border-primary/20 rounded-xl flex items-center gap-3">
                  <img src={selectedStory.coverImage} alt={selectedStory.title} className="w-10 h-14 object-cover rounded-md" />
                  <div className="flex-1 min-w-0">
                    <Typography variant="body" className="font-semibold text-text truncate leading-tight">{selectedStory.title}</Typography>
                    <Typography variant="body" className="text-[13px] text-muted truncate mt-0.5">{selectedStory.authorName || 'Bilinmiyor'}</Typography>
                  </div>
                  <button 
                    onClick={() => setSelectedStory(null)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-black/20 text-muted hover:text-text rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {previewUrls.length > 0 && (
                <div className="relative mb-4 rounded-xl overflow-x-auto flex gap-2 pb-2 snap-x">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-48 h-48 rounded-xl overflow-hidden border border-white/10 snap-center">
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover bg-black/50" />
                      <button 
                        onClick={() => {
                          const newFiles = [...selectedFiles];
                          newFiles.splice(idx, 1);
                          setSelectedFiles(newFiles);
                          
                          const newUrls = [...previewUrls];
                          URL.revokeObjectURL(newUrls[idx]);
                          newUrls.splice(idx, 1);
                          setPreviewUrls(newUrls);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/70 text-text rounded-full flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {pollActive && (
                <div className="mb-4 bg-background/50 border border-border rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <Typography variant="body" className="font-bold text-primary">Anket Oluştur</Typography>
                    <button onClick={() => setPollActive(false)} className="text-muted hover:text-text">✕</button>
                  </div>
                  <input
                    type="text"
                    placeholder="Soru sor..."
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary mb-3 text-text"
                  />
                  {pollOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Seçenek ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[idx] = e.target.value;
                        setPollOptions(newOpts);
                      }}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary mb-2 text-text"
                    />
                  ))}
                  {pollOptions.length < 4 && (
                    <button 
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      className="text-xs text-primary hover:underline mb-3"
                    >
                      + Seçenek Ekle
                    </button>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Typography variant="caption" className="text-muted">Süre:</Typography>
                    <select
                      value={pollDuration}
                      onChange={(e) => setPollDuration(Number(e.target.value))}
                      className="bg-card border border-border rounded text-xs px-2 py-1 text-text focus:outline-none"
                    >
                      <option value={1}>1 Gün</option>
                      <option value={3}>3 Gün</option>
                      <option value={7}>7 Gün</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between border-t border-border/40 pt-3 mt-2 relative gap-y-3">
                <div className="flex items-center gap-1 sm:gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    id="readix-image"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files).slice(0, 4 - selectedFiles.length);
                        if (files.length > 0) {
                          setSelectedFiles([...selectedFiles, ...files]);
                          const urls = files.map(f => URL.createObjectURL(f));
                          setPreviewUrls([...previewUrls, ...urls]);
                        }
                      }
                    }}
                  />
                  <label htmlFor="readix-image" className={`cursor-pointer hover:bg-primary/10 p-2.5 rounded-full inline-flex items-center justify-center transition-colors ${selectedFiles.length >= 4 ? 'opacity-50 cursor-not-allowed text-muted' : 'text-primary'}`}>
                    <ImagePlus size={20} strokeWidth={2.2} />
                  </label>
                  
                  <button 
                    onClick={() => setPollActive(!pollActive)}
                    className={`hover:bg-primary/10 p-2.5 rounded-full inline-flex items-center justify-center transition-colors ${pollActive ? 'text-primary bg-primary/10' : 'text-primary'}`}
                    title="Anket Ekle"
                  >
                    <BarChart2 size={20} strokeWidth={2.2} className="rotate-90" />
                  </button>

                  <button 
                    onClick={() => setIsStorySearchOpen(true)}
                    className={`hover:bg-primary/10 p-2.5 rounded-full inline-flex items-center justify-center transition-colors ${selectedStory ? 'text-primary bg-primary/10' : 'text-primary'}`}
                    title="Kitap Ekle"
                  >
                    <BookPlus size={20} strokeWidth={2.2} />
                  </button>
                  
                  {charCount > 0 && (
                    <>
                      <div className="w-px h-6 bg-border/60 mx-1"></div>
                      
                      <button 
                        onClick={() => insertFormat('bold')}
                        className="text-muted hover:text-primary hover:bg-primary/10 p-2.5 rounded-full inline-flex items-center justify-center transition-colors"
                        title="Kalın"
                      >
                        <Bold size={18} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => insertFormat('italic')}
                        className="text-muted hover:text-primary hover:bg-primary/10 p-2.5 rounded-full inline-flex items-center justify-center transition-colors"
                        title="İtalik"
                      >
                        <Italic size={18} strokeWidth={2.5} />
                      </button>
                    </>
                  )}
                </div>
                
                <div className="ml-auto flex items-center gap-2">
                  {/* Character Limit Ring */}
                  {charCount > 0 && (
                    <div className="flex items-center">
                      <div className="relative flex items-center justify-center transition-all duration-300 w-8 h-8">
                        <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 24 24">
                          <circle
                            cx="12"
                            cy="12"
                            r={circleRadius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white/10"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r={circleRadius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={circleCircumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className={`transition-all duration-300 ease-out ${
                              isOverLimit ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-primary'
                            }`}
                          />
                        </svg>
                        
                        <span className={`absolute text-[10px] font-bold ${isOverLimit ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-muted'}`}>
                          {maxChars - charCount}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-white/10 mx-3"></div>
                    </div>
                  )}

                  <Button 
                    variant="primary" 
                    className="rounded-full px-6 py-2 h-10 font-bold"
                    disabled={isPosting || (!newContent.trim() && selectedFiles.length === 0 && !pollActive) || isOverLimit}
                  onPress={handlePost}
                >
                  {isPosting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    'Yayınla'
                  )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feed List */}
        <div className="flex flex-col gap-4 px-4 md:px-0">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : readixes.length === 0 ? (
            <div className="py-20 text-center text-muted">
              Henüz bir paylaşım yok. İlk paylaşan sen ol!
            </div>
          ) : (
            <>
              {readixes.map((readix, index) => {
                const isRepost = !!readix.originalReadix;
                const targetReadix = isRepost ? readix.originalReadix! : readix;
                const reposter = isRepost ? authors[readix.authorId] : null;
                const author = authors[targetReadix.authorId];
                
                return (
                  <React.Fragment key={readix.id}>
                    <ReadixCard
                      linkedStory={targetReadix.linkedStory}
                      authorName={author?.displayName || 'Bilinmeyen Kullanıcı'}
                      authorUsername={author?.username || 'user'}
                      authorAvatarUrl={author?.avatarUrl}
                      repostOfAuthorName={reposter?.displayName}
                      content={targetReadix.content}
                      mediaUrls={targetReadix.mediaUrls}
                      createdAtStr={targetReadix.createdAt ? new Date((targetReadix.createdAt as any).seconds ? (targetReadix.createdAt as any).seconds * 1000 : (targetReadix.createdAt as unknown as number)).toLocaleDateString() : 'Şimdi'}
                      likesCount={targetReadix.stats?.likes || 0}
                      commentsCount={targetReadix.stats?.comments || 0}
                      repostsCount={targetReadix.stats?.reposts || 0}
                      bookmarksCount={targetReadix.stats?.bookmarks || 0}
                      poll={targetReadix.poll as any}
                      isOwner={firebaseUser?.uid === readix.authorId}
                      currentUserId={firebaseUser?.uid}
                      isBookmarked={userProfile?.bookmarkedReadixIds?.includes(targetReadix.id) || false}
                      onAuthorPress={() => author?.username && router.push(`/profile/@${author.username}`)}
                      onLikePress={() => handleLike(targetReadix.id, targetReadix.stats?.likes || 0)}
                      onCommentPress={() => openComments(targetReadix)}
                      onSharePress={() => openShare(targetReadix, author)}
                      onRepostPress={() => handleRepost(targetReadix.id)}
                      onBookmarkPress={() => handleBookmark(targetReadix.id)}
                      onPress={() => openComments(targetReadix)}
                      onEditPress={() => { setActiveReadix(readix); setEditModalOpen(true); }}
                      onDeletePress={() => { setActiveReadix(readix); setDeleteConfirmOpen(true); }}
                      onReportPress={() => { setActiveReadix(targetReadix); setReportModalOpen(true); }}
                      onBlockPress={() => { setActiveReadix(targetReadix); setBlockConfirmOpen(true); }}
                    />
                    
                    {/* Günün Alıntısı (Interstitial) */}
                    {index === 0 && dailyQuote && activeTab !== 'hashtag' && (
                      <div className="relative my-4 p-6 sm:p-8 bg-gradient-to-r from-purple-500/5 via-background to-primary/10 border border-border/50 rounded-[2rem] overflow-hidden flex items-center shadow-sm">
                        
                        {/* Decorative Icon (Right aligned) */}
                        <div className="absolute right-0 top-0 bottom-0 w-1/3 min-w-[150px] pointer-events-none flex items-center justify-end pr-2 sm:pr-8">
                          <QuillIcon className="w-32 h-32 sm:w-40 sm:h-40 -rotate-12" />
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10 flex flex-col justify-center w-[65%] sm:w-[70%]">
                          <div className="flex items-center gap-2 mb-2 sm:hidden">
                            <Typography variant="body" className="text-primary font-semibold text-sm">Günün Alıntısı</Typography>
                          </div>
                          <Typography variant="body" className="hidden sm:block text-primary font-semibold text-sm mb-1">Günün Alıntısı</Typography>
                            
                            <Typography variant="h3" className="text-base sm:text-lg font-bold text-text leading-snug mb-3">
                              “{dailyQuote.text}”
                            </Typography>
                            
                            <div className="flex flex-col">
                              {dailyQuote.author && <Typography variant="body" className="text-muted text-sm font-medium">- {dailyQuote.author}</Typography>}
                            </div>
                        </div>
                      </div>
                    )}

                    {/* Editörün Seçimi (Placeholder Interstitial) */}
                    {index === 3 && activeTab !== 'hashtag' && (
                      <div className="relative group/section opacity-80 mt-2 mb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <Award className="text-primary" size={24} />
                              <Typography variant="h2" className="text-xl font-bold flex items-center gap-2">
                                Editörün Seçimi
                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-1">Yakında</span>
                              </Typography>
                            </div>
                            <Typography variant="body" className="text-muted text-sm mt-1">Editörlerimiz tarafından özenle seçilmiş ve mutlaka okumanız gereken başyapıtlar.</Typography>
                          </div>
                        </div>
                        <div className="h-32 border-2 border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center bg-card/10 gap-2">
                          <Typography variant="body" className="text-muted font-medium flex items-center gap-2">
                            <Sparkles size={16} />
                            Burası yakında çok şenlenecek!
                          </Typography>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              {hasMore && (
                <div className="py-8 flex justify-center">
                  <Button 
                    variant="outline" 
                    onPress={loadMore} 
                    disabled={loadingMore}
                    className="rounded-full"
                  >
                    {loadingMore ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Right Sidebar (Trending/Suggestions) */}
      <ReadixSidebar />
      
      <ReadixCommentModal 
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        selectedReadix={selectedReadix}
        currentUserId={firebaseUser?.uid || null}
        onCommentAdded={handleCommentAdded}
        onLikePost={(id, likes) => handleLike(id, likes)}
      />
      <ReadixShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        readix={selectedReadixForShare}
      />

      <EditReadixModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setActiveReadix(null); }}
        initialContent={activeReadix?.content || ''}
        onSave={handleEditSave}
      />
      
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => { setReportModalOpen(false); setActiveReadix(null); }}
        onSubmit={handleReportSubmit}
      />
      
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setActiveReadix(null); }}
        onConfirm={handleDeleteConfirm}
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
      <StorySearchModal 
        isOpen={isStorySearchOpen} 
        onClose={() => setIsStorySearchOpen(false)} 
        onSelect={(story) => setSelectedStory(story)} 
      />
    </div>
  );
}

export default function ReadixPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>}>
      <ReadixContent />
    </React.Suspense>
  );
}
