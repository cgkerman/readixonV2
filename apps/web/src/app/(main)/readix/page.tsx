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
  Readix,
  User
} from '@readixon/core';
import { Typography, Button, ReadixCard, Input, ReadixCommentModal, ReadixShareModal, ShareReadixData, EditReadixModal, ReportModal, ConfirmationDialog } from '@readixon/ui';
import { Loader2, Image as ImageIcon, Send, User as UserIcon, Bold, Italic, Smile } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { toast } from "sonner";
import { ReadixSidebar } from './ReadixSidebar';

function ReadixContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hashtag = searchParams.get('hashtag');
  const { firebaseUser, userProfile } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'foryou' | 'following' | 'hashtag'>(hashtag ? 'hashtag' : 'foryou');
  const [readixes, setReadixes] = useState<Readix[]>([]);
  const [authors, setAuthors] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  
  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedReadixForShare, setSelectedReadixForShare] = useState<ShareReadixData | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [activeReadix, setActiveReadix] = useState<Readix | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);

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
      
      // Look for storyId in URL
      const linkedStoryId = searchParams.get('storyId') || undefined;

      const newReadix = await createReadix(
        firebaseUser.uid,
        finalMarkdownContent.trim(),
        mediaUrls,
        linkedStoryId,
        pollData
      );

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

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full p-0 md:p-6 lg:p-10">
      
      {/* Main Feed Column */}
      <div className="flex-1 md:border-r border-white/10 md:pr-10 min-h-screen">
        
        {/* Header & Tabs */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-4 pt-6 px-4 md:px-0">
          <Typography variant="h1" className="text-3xl font-bold mb-6 text-text">Readix</Typography>
          
          <div className="flex border-b border-white/10">
            <button 
              onClick={() => setActiveTab('foryou')}
              className={`flex-1 pb-3 text-center font-semibold transition-colors relative ${activeTab === 'foryou' ? 'text-primary' : 'text-muted hover:text-text'}`}
            >
              Sana Özel
              {activeTab === 'foryou' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => {
                if (!firebaseUser) router.push('/login');
                else setActiveTab('following');
              }}
              className={`flex-1 pb-3 text-center font-semibold transition-colors relative ${activeTab === 'following' ? 'text-primary' : 'text-muted hover:text-text'}`}
            >
              Takip Ettiklerin
              {activeTab === 'following' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
            {activeTab === 'hashtag' && hashtag && (
              <button 
                className="flex-1 pb-3 text-center font-semibold transition-colors relative text-primary"
              >
                #{hashtag}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
              </button>
            )}
          </div>
        </div>

        {/* Create Post Area */}
        <div className="p-4 md:p-6 border border-border/80 bg-card/50 rounded-2xl mx-4 md:mx-0 mb-6 shadow-sm backdrop-blur-sm">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex-shrink-0 border border-white/10 overflow-hidden">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-primary bg-primary/20">
                  <span className="text-xs font-bold uppercase">{(userProfile?.displayName || 'U').charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <div className="relative">
                <ContentEditable
                  innerRef={contentEditableRef}
                  html={newContent}
                  onChange={handleContentChange}
                  tagName="div"
                  className="bg-transparent border-none focus:outline-none text-text resize-none text-[15px] leading-relaxed min-h-[80px] w-full break-words outline-none empty:before:content-['Hangi_kitaptan_bahsediyoruz?'] empty:before:text-muted/50 empty:before:pointer-events-none"
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

              <div className="flex flex-wrap items-center justify-between border-t border-white/5 pt-3 relative gap-y-3">
                <div className="flex items-center gap-0.5 sm:gap-1">
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
                  <label htmlFor="readix-image" className={`cursor-pointer hover:bg-primary/10 p-2 rounded-full inline-flex transition-colors ${selectedFiles.length >= 4 ? 'opacity-50 cursor-not-allowed text-muted' : 'text-primary'}`}>
                    <ImageIcon size={20} />
                  </label>
                  
                  <button 
                    onClick={() => setPollActive(!pollActive)}
                    className={`hover:bg-primary/10 p-2 rounded-full inline-flex transition-colors ${pollActive ? 'text-primary bg-primary/10' : 'text-muted hover:text-primary'}`}
                    title="Anket Ekle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  </button>
                  
                  <button 
                    onClick={() => insertFormat('bold')}
                    className="text-muted hover:text-primary hover:bg-primary/10 p-2 rounded-full inline-flex transition-colors"
                    title="Kalın"
                  >
                    <Bold size={20} />
                  </button>
                  <button 
                    onClick={() => insertFormat('italic')}
                    className="text-muted hover:text-primary hover:bg-primary/10 p-2 rounded-full inline-flex transition-colors"
                    title="İtalik"
                  >
                    <Italic size={20} />
                  </button>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`hover:bg-primary/10 p-2 rounded-full inline-flex transition-colors ${showEmojiPicker ? 'text-primary bg-primary/10' : 'text-muted hover:text-primary'}`}
                      title="Emoji Ekle"
                    >
                      <Smile size={20} />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute top-full left-0 mt-2 z-50 shadow-2xl rounded-2xl overflow-hidden border border-border">
                        <EmojiPicker 
                          onEmojiClick={(emoji) => {
                            onEmojiClick(emoji);
                            setShowEmojiPicker(false);
                          }}
                          theme={Theme.DARK}
                          searchDisabled={true}
                          skinTonesDisabled={true}
                          height={350}
                          width={300}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  variant="primary" 
                  className="!p-0 aspect-square w-11 h-11 rounded-full shrink-0 ml-auto flex items-center justify-center"
                  disabled={isPosting || (!newContent.trim() && selectedFiles.length === 0 && !pollActive)}
                  onPress={handlePost}
                  title="Paylaş"
                >
                  {isPosting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} className="ml-[-2px]" />
                  )}
                </Button>
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
              {readixes.map((readix) => {
                const isRepost = !!readix.originalReadix;
                const targetReadix = isRepost ? readix.originalReadix! : readix;
                const reposter = isRepost ? authors[readix.authorId] : null;
                const author = authors[targetReadix.authorId];
                
                return (
                  <ReadixCard
                    key={readix.id}
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
                    poll={targetReadix.poll as any}
                    isOwner={firebaseUser?.uid === readix.authorId}
                    currentUserId={firebaseUser?.uid}
                    onAuthorPress={() => author?.username && router.push(`/profile/@${author.username}`)}
                    onLikePress={() => handleLike(targetReadix.id, targetReadix.stats?.likes || 0)}
                    onCommentPress={() => openComments(targetReadix)}
                    onSharePress={() => openShare(targetReadix, author)}
                    onRepostPress={() => handleRepost(targetReadix.id)}
                    onPress={() => openComments(targetReadix)}
                    onEditPress={() => { setActiveReadix(readix); setEditModalOpen(true); }}
                    onDeletePress={() => { setActiveReadix(readix); setDeleteConfirmOpen(true); }}
                    onReportPress={() => { setActiveReadix(targetReadix); setReportModalOpen(true); }}
                    onBlockPress={() => { setActiveReadix(targetReadix); setBlockConfirmOpen(true); }}
                  />
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
