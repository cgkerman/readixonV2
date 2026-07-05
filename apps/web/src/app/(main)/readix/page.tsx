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
  Readix,
  User
} from '@readixon/core';
import { Typography, Button, ReadixCard, Input, ReadixCommentModal } from '@readixon/ui';
import { Loader2, Image as ImageIcon, Send, User as UserIcon } from 'lucide-react';
import { toast } from "sonner";

function ReadixContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hashtag = searchParams.get('hashtag');
  const { firebaseUser, userProfile } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'foryou' | 'following' | 'hashtag'>(hashtag ? 'hashtag' : 'foryou');
  const [readixes, setReadixes] = useState<Readix[]>([]);
  const [authors, setAuthors] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  
  // Create Readix State
  const [newContent, setNewContent] = useState('');
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewContent(value);
    
    const words = value.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('#') && lastWord.length > 0) {
      setActiveHashtag(lastWord.slice(1).toLowerCase());
    } else {
      setActiveHashtag(null);
    }
  };

  const handleTagSelect = (tagId: string) => {
    const words = newContent.trimEnd().split(/\s+/);
    words.pop(); // remove the partial hashtag
    const newText = words.length > 0 ? `${words.join(' ')} #${tagId} ` : `#${tagId} `;
    setNewContent(newText);
    setActiveHashtag(null);
  };

  const [filteredTags, setFilteredTags] = useState<{id: string, count?: number, label?: string}[]>([]);

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

  // Set initial content if hashtag exists and tab is hashtag
  useEffect(() => {
    if (hashtag) {
      setNewContent(`#${hashtag} `);
      setActiveTab('hashtag');
    }
  }, [hashtag]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, [activeTab, firebaseUser]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'hashtag' && hashtag) {
        response = await getReadixesByTag(hashtag, 20);
      } else if (activeTab === 'following' && firebaseUser) {
        response = await getFollowingReadixes(firebaseUser.uid, 20);
      } else {
        response = await getForYouReadixes(20);
      }
      
      setReadixes(response.readixes);
      
      // Fetch missing authors
      const missingAuthorIds = Array.from(new Set(response.readixes.map(r => r.authorId))).filter(id => !authors[id]);
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

  const handlePost = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    if (!newContent.trim() && !selectedFile) return;

    setIsPosting(true);
    try {
      let mediaUrls: string[] = [];
      
      if (selectedFile) {
        // Optimize and upload image
        const compressed = await compressImage(selectedFile, 1200, 1200, 0.85);
        const path = `readixes/${firebaseUser.uid}/${Date.now()}`;
        const url = await uploadFile(compressed, path);
        mediaUrls.push(url);
      }

      const newReadix = await createReadix(
        firebaseUser.uid,
        newContent.trim(),
        mediaUrls
      );

      // Add to feed immediately
      setReadixes([newReadix, ...readixes]);
      if (!authors[firebaseUser.uid] && userProfile) {
        setAuthors({ ...authors, [firebaseUser.uid]: userProfile });
      }
      
      // Reset form
      setNewContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
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
                <div className="w-full h-full flex items-center justify-center text-primary">
                  <UserIcon size={24} />
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <div className="relative">
                <textarea
                  value={newContent}
                  onChange={handleContentChange}
                  placeholder="Hangi kitaptan bahsediyoruz?"
                  className="bg-transparent border-none focus:outline-none text-text resize-none text-lg min-h-[80px] w-full"
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
              </div>
              
              {previewUrl && (
                <div className="relative mb-4 rounded-xl overflow-hidden border border-white/10">
                  <img src={previewUrl} alt="Preview" className="w-full object-contain max-h-64 bg-black/50" />
                  <button 
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/70 text-text rounded-full flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    id="readix-image"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                        setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                  />
                  <label htmlFor="readix-image" className="cursor-pointer text-primary hover:bg-primary/10 p-2 rounded-full inline-flex transition-colors">
                    <ImageIcon size={20} />
                  </label>
                </div>
                
                <Button 
                  variant="primary" 
                  className="rounded-full px-6"
                  disabled={isPosting || (!newContent.trim() && !selectedFile)}
                  onPress={handlePost}
                >
                  {isPosting ? 'Paylaşılıyor...' : 'Paylaş'}
                  {!isPosting && <Send size={16} className="ml-2" />}
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
            readixes.map((readix) => {
              const author = authors[readix.authorId];
              return (
                <ReadixCard
                  key={readix.id}
                  authorName={author?.displayName || 'Bilinmeyen Kullanıcı'}
                  authorUsername={author?.username || 'user'}
                  authorAvatarUrl={author?.avatarUrl}
                  content={readix.content}
                  mediaUrls={readix.mediaUrls}
                  createdAtStr={readix.createdAt ? new Date((readix.createdAt as any).seconds ? (readix.createdAt as any).seconds * 1000 : (readix.createdAt as unknown as number)).toLocaleDateString() : 'Şimdi'}
                  likesCount={readix.stats?.likes || 0}
                  commentsCount={readix.stats?.comments || 0}
                  onAuthorPress={() => author?.username && router.push(`/profile/@${author.username}`)}
                  onLikePress={() => handleLike(readix.id, readix.stats?.likes || 0)}
                  onCommentPress={() => openComments(readix)}
                  onSharePress={() => toast('Paylaşım özelliği çok yakında!')}
                  onPress={() => openComments(readix)}
                />
              );
            })
          )}
        </div>

      </div>

      {/* Right Sidebar (Trending/Suggestions) */}
      <div className="hidden lg:block w-80 pl-10 py-6">
        <Typography variant="h3" className="mb-6 text-text">Gündem</Typography>
        <div className="bg-card/40 rounded-3xl p-6 border border-white/5 flex flex-col gap-6">
          <div>
            <Typography variant="caption" className="text-muted mb-1 block">Türkiye'de Trend</Typography>
            <Typography variant="body" className="font-bold text-text hover:text-primary cursor-pointer transition-colors">#YüzüklerinEfendisi</Typography>
            <Typography variant="caption" className="text-muted mt-1 block">12.4K Gönderi</Typography>
          </div>
          <div>
            <Typography variant="caption" className="text-muted mb-1 block">Popüler Kitap</Typography>
            <Typography variant="body" className="font-bold text-text hover:text-primary cursor-pointer transition-colors">Dune - Frank Herbert</Typography>
            <Typography variant="caption" className="text-muted mt-1 block">8.2K Gönderi</Typography>
          </div>
          <div>
            <Typography variant="caption" className="text-muted mb-1 block">Yeni Çıkanlar</Typography>
            <Typography variant="body" className="font-bold text-text hover:text-primary cursor-pointer transition-colors">Karanlık Zihinler Geri Döndü</Typography>
            <Typography variant="caption" className="text-muted mt-1 block">5K Gönderi</Typography>
          </div>
        </div>
      </div>
      
      <ReadixCommentModal 
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        selectedReadix={selectedReadix}
        currentUserId={firebaseUser?.uid || null}
        onCommentAdded={handleCommentAdded}
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
