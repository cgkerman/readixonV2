'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, Loader2, Compass, Hash } from 'lucide-react';
import { Typography, Button, Input, StoryCard, AuthorCard } from '@readixon/ui';
import { searchStories, searchUsers, POPULAR_TAGS, generateStorySlug, followUser, unfollowUser, useAuthStore } from '@readixon/core';
import type { Story, User } from '@readixon/core';
import { toast } from "sonner";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTag = searchParams.get('tag');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(urlTag);
  
  // URL parametresi değiştiğinde etiketi güncelle
  useEffect(() => {
    const tag = searchParams.get('tag');
    if (tag) {
      setSelectedTag(tag);
      setSearchType('stories'); // Etiket aramaları sadece hikayeler içindir
    }
  }, [searchParams]);
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Story[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchType, setSearchType] = useState<'stories' | 'users'>('stories');
  
  const { firebaseUser, followingIds, toggleFollowingId } = useAuthStore();

  // Debounce (gecikmeli) arama yapmak için basit bir mekanizma
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim() || selectedTag) {
        performSearch(searchTerm, selectedTag, searchType);
      } else {
        setResults([]);
        setUserResults([]);
        setHasSearched(false);
      }
    }, 500); // Kullanıcı yazmayı bıraktıktan 500ms sonra arar

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedTag, searchType]);

  const performSearch = async (term: string, tag: string | null, type: 'stories' | 'users') => {
    setLoading(true);
    setHasSearched(true);
    try {
      if (type === 'stories') {
        const tagsToSearch = tag ? [tag] : [];
        const stories = await searchStories(term, tagsToSearch);
        setResults(stories);
        setUserResults([]);
      } else {
        const users = await searchUsers(term);
        setUserResults(users);
        setResults([]);
      }
    } catch (error) {
      console.error("Arama yapılırken hata oluştu:", error);
      setResults([]);
      setUserResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    if (selectedTag === tagId) {
      setSelectedTag(null); // İptal et
    } else {
      setSelectedTag(tagId);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center p-12 mt-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      );
    }

    if (hasSearched && ((searchType === 'stories' && results.length === 0) || (searchType === 'users' && userResults.length === 0))) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center mt-8">
          <div className="w-24 h-24 rounded-full bg-muted/5 flex items-center justify-center mb-6">
            <SearchIcon size={40} className="text-muted/40" />
          </div>
          <Typography variant="h3" className="mb-3 text-text/90 tracking-tight">Sonuç Bulunamadı</Typography>
          <Typography variant="body" className="text-muted max-w-sm mx-auto mb-8">
            "{searchTerm}" aramasına uyan hiçbir {searchType === 'stories' ? 'hikaye' : 'yazar'} bulamadık. Lütfen farklı kelimelerle tekrar deneyin.
          </Typography>
          <Button variant="outline" onPress={() => { setSearchTerm(''); setSelectedTag(null); }} className="rounded-full px-6">
            Aramayı Temizle
          </Button>
        </div>
      );
    }

    if (!hasSearched) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center opacity-50 pointer-events-none">
          <Compass size={48} className="text-muted/30 mb-4" />
          <Typography variant="h3" className="text-muted">Keşfetmeye Hazır Mısınız?</Typography>
        </div>
      );
    }

    if (searchType === 'stories') {
      return (
        <div className="mt-8">
          <Typography variant="h3" className="mb-4 text-text/80">
            {results.length} sonuç bulundu
          </Typography>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {results.map((story) => (
              <StoryCard
                key={story.storyId}
                title={story.title}
                authorName={story.authorName || `Yazar: ${story.authorId.substring(0, 6)}`}
                authorUsername={story.authorUsername}
                coverImage={story.coverImage}
                views={story.stats?.views || 0}
                likes={story.stats?.likes || 0}
                tags={story.tags || []}
                onPress={() => router.push(`/story/${generateStorySlug(story.title, story.storyId)}`)}
              />
            ))}
          </div>
        </div>
      );
    }

    // Users
    return (
      <div className="mt-8">
        <Typography variant="h3" className="mb-4 text-text/80">
          {userResults.length} yazar bulundu
        </Typography>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {userResults.map((author) => (
            <div key={author.uid} className="w-full transition-transform duration-300 hover:-translate-y-2">
              <AuthorCard
                name={author.displayName}
                username={author.username || 'bilinmiyor'}
                avatarUrl={author.avatarUrl}
                followers={author.stats?.followers || 0}
                isFollowing={followingIds.includes(author.uid)}
                isPremium={author.status === 'premium'}
                onPress={() => {
                  if (author.username) {
                    router.push(`/profile/@${author.username}`);
                  } else {
                    toast('Bu yazar henüz bir kullanıcı adı belirlememiş.');
                  }
                }}
                onFollowPress={async (e) => {
                  e.stopPropagation();
                  if (!firebaseUser) {
                    router.push('/login');
                    return;
                  }
                  const isCurrentlyFollowing = followingIds.includes(author.uid);
                  toggleFollowingId(author.uid);
                  try {
                    if (isCurrentlyFollowing) {
                      await unfollowUser(firebaseUser.uid, author.uid);
                    } else {
                      await followUser(firebaseUser.uid, author.uid);
                    }
                  } catch (error) {
                    console.error("Takip işlemi başarısız:", error);
                    toggleFollowingId(author.uid);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="mb-8 max-w-3xl">
        <Typography variant="h1" className="font-bold tracking-tight mb-2 text-text">Ara ve Keşfet</Typography>
        <Typography variant="body" className="text-muted mb-8">
          Milyonlarca hikaye arasında kaybol. İlgini çeken bir yazar, kitap adı veya kategori ara.
        </Typography>

        {/* Sekmeler (Tabs) */}
        <div className="flex items-center gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setSearchType('stories')}
            className={`pb-3 text-lg font-semibold transition-all border-b-2 ${
              searchType === 'stories' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text'
            }`}
          >
            Hikayeler
          </button>
          <button
            onClick={() => setSearchType('users')}
            className={`pb-3 text-lg font-semibold transition-all border-b-2 ${
              searchType === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text'
            }`}
          >
            Yazarlar
          </button>
        </div>

        {/* Arama Kutusu */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted z-10 pointer-events-none">
            <SearchIcon size={20} />
          </div>
          <Input 
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder={searchType === 'stories' ? "Hikaye adı veya etiket ara..." : "Yazar adı veya kullanıcı adı ara..."}
            className="[&>input]:pl-12 [&>input]:h-14 [&>input]:text-lg [&>input]:bg-card/50 [&>input]:backdrop-blur-sm"
          />
        </div>

        {/* Etiketler (Chips) Sadece Hikayelerde Göster */}
        {searchType === 'stories' && (
          <div className="mt-6">
            <Typography variant="caption" className="text-muted font-medium mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Hash size={14} /> Popüler Kategoriler
            </Typography>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTag === tag.id
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                      : 'bg-card/60 text-muted hover:bg-card hover:text-text border border-border/40'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sonuç Alanı */}
      {renderContent()}
    </div>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>}>
      <SearchContent />
    </React.Suspense>
  );
}
