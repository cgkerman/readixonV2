'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Typography } from './Typography';
import { Button } from './Button';
import { Readix, ReadixComment, User, getReadixComments, addReadixComment, toggleReadixCommentLike, getUserProfile } from '@readixon/core';
import { Heart, Reply } from 'lucide-react';

export interface ReadixCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReadix: Readix | null;
  currentUserId: string | null;
  onCommentAdded: (newComment: any) => void;
}

export const ReadixCommentModal: React.FC<ReadixCommentModalProps> = ({
  isOpen,
  onClose,
  selectedReadix,
  currentUserId,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<ReadixComment[]>([]);
  const [authors, setAuthors] = useState<Record<string, User>>({});
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  
  // Reply State
  const [replyingTo, setReplyingTo] = useState<ReadixComment | null>(null);

  useEffect(() => {
    if (isOpen && selectedReadix) {
      const fetchComments = async () => {
        setLoadingComments(true);
        try {
          const res = await getReadixComments(selectedReadix.id, 100);
          setComments(res.comments);

          // Fetch unique authors
          const authorIds = Array.from(new Set(res.comments.map(c => c.authorId)));
          const authorMap: Record<string, User> = {};
          await Promise.all(
            authorIds.map(async (id) => {
              const user = await getUserProfile(id);
              if (user) authorMap[id] = user;
            })
          );
          setAuthors(authorMap);

        } catch (e) {
          console.error(e);
        } finally {
          setLoadingComments(false);
        }
      };
      fetchComments();
    } else {
      setComments([]);
      setNewComment('');
      setReplyingTo(null);
    }
  }, [isOpen, selectedReadix]);

  const handlePostComment = async () => {
    if (!currentUserId || !selectedReadix || !newComment.trim()) return;
    try {
      const comment = await addReadixComment(
        selectedReadix.id, 
        currentUserId, 
        newComment.trim(),
        replyingTo ? replyingTo.id : undefined
      );
      setComments([...comments, comment]);
      setNewComment('');
      setReplyingTo(null);
      
      // Ensure we have current user in authors map
      if (!authors[currentUserId]) {
        const user = await getUserProfile(currentUserId);
        if (user) setAuthors(prev => ({ ...prev, [currentUserId]: user }));
      }
      
      onCommentAdded(comment);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLikeComment = async (commentId: string, currentLikes: number) => {
    if (!currentUserId || !selectedReadix) return;
    
    // Optimistic
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c));
    try {
      const liked = await toggleReadixCommentLike(currentUserId, selectedReadix.id, commentId);
      if (!liked) {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: Math.max(0, currentLikes - 1) } : c));
      }
    } catch (e) {
      console.error(e);
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: currentLikes } : c));
    }
  };

  // Group comments
  const rootComments = comments.filter(c => !c.replyToId);
  const repliesMap = comments.filter(c => c.replyToId).reduce((acc, reply) => {
    if (!acc[reply.replyToId!]) acc[reply.replyToId!] = [];
    acc[reply.replyToId!].push(reply);
    return acc;
  }, {} as Record<string, ReadixComment[]>);

  const renderComment = (c: ReadixComment, isReply = false) => {
    const author = authors[c.authorId];
    const isPostOwner = c.authorId === selectedReadix?.authorId;
    const dateStr = c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : 'Şimdi';

    return (
      <div key={c.id} className={`flex gap-3 bg-text/5 p-3 rounded-2xl ${isReply ? 'ml-8 mt-2' : ''}`}>
        <a href={author?.username ? `/profile/@${author.username}` : '#'} className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center font-bold text-xs overflow-hidden border border-border hover:border-primary transition-colors">
          {author?.avatarUrl ? <img src={author.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (author?.displayName?.charAt(0) || 'U')}
        </a>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <a href={author?.username ? `/profile/@${author.username}` : '#'} className="text-text/90 text-sm font-semibold hover:underline">
              {author?.displayName || 'Bir okuyucu'}
            </a>
            <span className="text-muted/60 text-xs">• {dateStr}</span>
            {isPostOwner && (
              <span className="bg-primary/20 text-primary text-[10px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">Readix Sahibi</span>
            )}
          </div>
          <Typography variant="body" className="text-sm text-text/90 mb-2">{c.content}</Typography>
          
          <div className="flex items-center gap-4 text-xs font-medium">
            <button onClick={() => handleLikeComment(c.id, c.likes || 0)} className="flex items-center gap-1 text-muted hover:text-pink-500 transition-colors">
              <Heart size={14} />
              <span>{c.likes || 0}</span>
            </button>
            <button onClick={() => setReplyingTo(c)} className="flex items-center gap-1 text-muted hover:text-blue-400 transition-colors">
              <Reply size={14} />
              <span>Yanıtla</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen || !selectedReadix) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex justify-between items-center bg-card">
          <Typography variant="h3" className="font-bold">Yorumlar</Typography>
          <button onClick={onClose} className="text-muted hover:text-text p-2">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Orijinal Gönderi Özeti */}
          <div className="pb-4 border-b border-border mb-2">
            <div className="text-text/80 whitespace-pre-wrap text-[15px] leading-relaxed mb-3">
              {selectedReadix.content.split(/(#[\p{L}\d_]+|@[\p{L}\d_]+)/gu).map((part, index) => {
                if (part.startsWith('#')) {
                  return (
                    <a 
                      key={index} 
                      href={`/readix?hashtag=${part.slice(1)}`}
                      className="text-primary hover:underline"
                    >
                      {part}
                    </a>
                  );
                } else if (part.startsWith('@')) {
                  return (
                    <a 
                      key={index} 
                      href={`/profile/${part}`}
                      className="text-blue-400 font-medium hover:underline"
                    >
                      {part}
                    </a>
                  );
                }
                return part;
              })}
            </div>
            
            {selectedReadix.mediaUrls && selectedReadix.mediaUrls.length > 0 && (
              <div className={`grid gap-2 ${selectedReadix.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {selectedReadix.mediaUrls.map((url, index) => (
                  <div key={index} className="rounded-2xl overflow-hidden border border-border bg-background/50 aspect-[4/3] max-h-64">
                    <img src={url} alt="Readix Media" className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {loadingComments ? (
            <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted py-10">Henüz yorum yok. İlk yorumu sen yap!</div>
          ) : (
            <div className="flex flex-col gap-3">
              {rootComments.map(c => (
                <div key={c.id}>
                  {renderComment(c)}
                  {repliesMap[c.id] && repliesMap[c.id].map(reply => renderComment(reply, true))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-card flex flex-col gap-2">
          {replyingTo && (
            <div className="flex items-center justify-between text-xs text-muted px-2">
              <span><strong>{authors[replyingTo.authorId]?.displayName || 'Kullanıcı'}</strong>'na yanıt veriliyor...</span>
              <button onClick={() => setReplyingTo(null)} className="hover:text-text">İptal</button>
            </div>
          )}
          <div className="flex gap-3">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Yorumunu yaz..."
              className="flex-1 bg-background/50 border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-text"
              onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
            />
            <Button variant="primary" className="rounded-full px-4" onPress={handlePostComment} disabled={!newComment.trim()}>Gönder</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
