"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useAuthStore, 
  subscribeToMessages, 
  sendMessage, 
  markChatAsRead, 
  acceptChatRequest, 
  declineChatRequest,
  Chat,
  Message,
  db,
  uploadFile,
  updateTypingStatus,
  Story
} from '@readixon/core';
import { Typography, ChatBubble, Button, StorySearchModal } from '@readixon/ui';
import { ArrowLeft, Send, CheckCircle, XCircle, MoreVertical, Loader2, Image as ImageIcon, BookOpen, Mic, Trash2, Square } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import TextareaAutosize from 'react-textarea-autosize';

import { toast } from 'sonner';

export default function ActiveChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;
  
  const { firebaseUser } = useAuthStore();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat details
  useEffect(() => {
    if (!firebaseUser || !chatId) return;

    const chatRef = doc(db, 'chats', chatId);
    const unsubChat = onSnapshot(chatRef, (snap) => {
      if (snap.exists()) {
        const chatData = { id: snap.id, ...snap.data() } as Chat;
        setChat(chatData);
        
        // Mark as read if unread count is > 0
        if (chatData.unreadCounts[firebaseUser.uid] > 0) {
          markChatAsRead(chatId, firebaseUser.uid);
        }
      } else {
        router.push('/messages'); // Chat deleted or not found
      }
      setLoading(false);
    });

    const unsubMessages = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => scrollToBottom(), 100);
    });

    return () => {
      unsubChat();
      unsubMessages();
    };
  }, [chatId, firebaseUser, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    
    // Typing debounce
    if (firebaseUser && chatId) {
      updateTypingStatus(chatId, firebaseUser.uid, true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        updateTypingStatus(chatId, firebaseUser.uid, false);
      }, 3000);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText.trim() && !imageFile && !selectedStory && !audioBlob) || !firebaseUser || !chat) return;

    setSending(true);
    let imageUrl = '';
    let audioUrl = '';
    
    try {
      if (imageFile) {
        setUploadingImage(true);
        // Upload image to storage
        imageUrl = await uploadFile(imageFile, `chats/${chatId}/${Date.now()}_${imageFile.name}`);
        setUploadingImage(false);
      }
      
      if (audioBlob) {
        setUploadingImage(true);
        const file = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
        audioUrl = await uploadFile(file, `chats/${chatId}/audio/${Date.now()}.webm`);
        setUploadingImage(false);
      }
      
      const linkedStory = selectedStory ? {
        id: selectedStory.storyId,
        title: selectedStory.title,
        coverUrl: selectedStory.coverImage,
        authorName: selectedStory.authorName || 'Bilinmiyor'
      } : undefined;

      await sendMessage(chatId, firebaseUser.uid, inputText.trim(), imageUrl, linkedStory, audioUrl);
      
      setInputText('');
      setImageFile(null);
      setSelectedStory(null);
      setAudioBlob(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Clear typing status immediately
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        updateTypingStatus(chatId, firebaseUser.uid, false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Mesaj gönderilemedi.');
      setUploadingImage(false);
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Mikrofon izni alınamadı", err);
      alert("Ses kaydı için mikrofon izni gereklidir.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setAudioBlob(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = async () => {
    try {
      await acceptChatRequest(chatId);
      toast.success('Mesaj isteği kabul edildi.');
    } catch (error) {
      toast.error('Hata oluştu.');
    }
  };

  const handleDecline = async () => {
    try {
      await declineChatRequest(chatId);
      toast('Mesaj isteği reddedildi.');
    } catch (error) {
      toast.error('Hata oluştu.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!chat || !firebaseUser) return null;

  const otherUserId = chat.participants.find(id => id !== firebaseUser.uid) || '';
  const otherUser = chat.participantDetails[otherUserId];
  const isPendingReceiver = chat.status === 'pending' && chat.requestedBy !== firebaseUser.uid;
  const isPendingSender = chat.status === 'pending' && chat.requestedBy === firebaseUser.uid;

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/messages')}
            className="md:hidden p-2 rounded-full hover:bg-muted/10 -ml-2"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div 
            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={() => router.push(`/profile/@${otherUser?.username}`)}
          >
            {otherUser?.avatarUrl ? (
              <img src={otherUser.avatarUrl} alt={otherUser.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold">{otherUser?.displayName?.charAt(0)}</span>
            )}
          </div>
          
          <div>
            <Typography 
              variant="body" 
              className="font-bold text-text cursor-pointer hover:underline"
              onClick={() => router.push(`/profile/@${otherUser?.username}`)}
            >
              {otherUser?.displayName}
            </Typography>
            <Typography variant="body" className="text-xs text-muted">
              @{otherUser?.username}
            </Typography>
          </div>
        </div>
        <button className="p-2 text-muted hover:text-text rounded-full hover:bg-muted/10 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
        {messages.map((msg, index) => {
          let timeText = '';
          let showDateDivider = false;
          let dividerText = '';

          if (msg.createdAt) {
            const date = msg.createdAt.toDate();
            timeText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Önceki mesajla tarih karşılaştırması
            let prevDate: Date | null = null;
            if (index > 0 && messages[index - 1].createdAt) {
              prevDate = messages[index - 1].createdAt.toDate();
            }

            if (!prevDate || 
                date.getDate() !== prevDate.getDate() || 
                date.getMonth() !== prevDate.getMonth() || 
                date.getFullYear() !== prevDate.getFullYear()) {
              
              showDateDivider = true;
              
              const now = new Date();
              const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

              if (isToday) {
                dividerText = 'Bugün';
              } else if (isYesterday) {
                dividerText = 'Dün';
              } else {
                dividerText = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
              }
            }
          }

              let status: 'sent' | 'read' = 'sent';
              if (msg.senderId === firebaseUser.uid && msg.createdAt && chat.lastSeenAt?.[otherUserId]) {
                if (msg.createdAt.toMillis() <= chat.lastSeenAt[otherUserId].toMillis()) {
                  status = 'read';
                }
              }

              return (
                <React.Fragment key={msg.id}>
                  {showDateDivider && (
                    <div className="flex justify-center my-4">
                      <div className="bg-text/5 border border-border/40 text-text/60 text-xs px-3 py-1 rounded-full font-medium">
                        {dividerText}
                      </div>
                    </div>
                  )}
                  <ChatBubble
                    id={msg.id}
                    text={msg.text}
                    imageUrl={msg.imageUrl}
                    audioUrl={msg.audioUrl}
                    linkedStory={msg.linkedStory}
                    isOwnMessage={msg.senderId === firebaseUser.uid}
                    timeText={timeText}
                    status={status}
                    onStoryClick={(id) => router.push(`/story/${id}`)}
                  />
                </React.Fragment>
              );
        })}
        {chat.typingStatuses?.[otherUserId] && (Date.now() - chat.typingStatuses[otherUserId].toMillis() < 5000) && (
          <div className="flex items-center gap-2 text-muted text-xs font-medium italic animate-pulse mb-2">
            <span>{otherUser?.displayName} yazıyor</span>
            <span className="flex gap-0.5">
              <span className="animate-bounce delay-75">.</span>
              <span className="animate-bounce delay-150">.</span>
              <span className="animate-bounce delay-300">.</span>
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Request Actions Overlay */}
      {isPendingReceiver && (
        <div className="p-4 bg-card border-t border-border/50 flex flex-col gap-3 items-center shrink-0">
          <Typography variant="body" className="text-sm text-center text-muted">
            <strong className="text-text">{otherUser?.displayName}</strong> size mesaj göndermek istiyor. Mesaj gönderebilmek için isteği kabul etmelisiniz.
          </Typography>
          <div className="flex gap-3 w-full max-w-sm">
            <Button variant="secondary" className="flex-1 rounded-full text-red-500 hover:bg-red-500/10 border-red-500/20" onPress={handleDecline}>
              <XCircle size={18} className="mr-2" /> Reddet
            </Button>
            <Button variant="primary" className="flex-1 rounded-full" onPress={handleAccept}>
              <CheckCircle size={18} className="mr-2" /> Kabul Et
            </Button>
          </div>
        </div>
      )}

      {isPendingSender && (
        <div className="p-4 bg-card border-t border-border/50 flex flex-col items-center shrink-0">
          <Typography variant="body" className="text-sm text-center text-muted">
            Mesaj isteği gönderildi. <strong className="text-text">{otherUser?.displayName}</strong> isteği kabul edene kadar yeni mesaj gönderemezsiniz.
          </Typography>
        </div>
      )}

      {/* Message Input */}
      {chat.status === 'accepted' && (
        <div className="p-4 bg-background border-t border-border/50 shrink-0 pb-6 md:pb-4 flex flex-col gap-2">
          {imageFile && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border shrink-0">
              <img src={URL.createObjectURL(imageFile)} alt="Upload preview" className="w-full h-full object-cover opacity-80" />
              <button 
                type="button" 
                onClick={() => setImageFile(null)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500"
              >
                <XCircle size={16} />
              </button>
            </div>
          )}
          {selectedStory && (
            <div className="relative inline-flex items-center gap-3 p-2 pr-10 rounded-xl border border-border bg-card/50 max-w-sm shrink-0">
              <button 
                type="button" 
                onClick={() => setSelectedStory(null)}
                className="absolute top-2 right-2 text-muted hover:text-red-500 bg-background rounded-full p-0.5"
              >
                <XCircle size={16} />
              </button>
              {selectedStory.coverImage ? (
                <img src={selectedStory.coverImage} alt={selectedStory.title} className="w-10 h-14 object-cover rounded-md shrink-0" />
              ) : (
                <div className="w-10 h-14 bg-muted/20 rounded-md flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-muted" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <Typography variant="body" className="font-semibold text-sm truncate">{selectedStory.title}</Typography>
                <Typography variant="caption" className="text-muted truncate">{selectedStory.authorName || 'Bilinmiyor'}</Typography>
              </div>
            </div>
          )}
          {audioBlob && !isRecording && (
            <div className="relative inline-flex items-center gap-3 p-2 pr-10 rounded-xl border border-border bg-card/50 max-w-sm shrink-0">
              <button 
                type="button" 
                onClick={() => setAudioBlob(null)}
                className="absolute top-2 right-2 text-muted hover:text-red-500 bg-background rounded-full p-0.5"
              >
                <XCircle size={16} />
              </button>
              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0">
                <Mic size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <Typography variant="body" className="font-semibold text-sm truncate">Sesli Mesaj</Typography>
                <Typography variant="caption" className="text-muted truncate">Hazır (Gönderilebilir)</Typography>
              </div>
            </div>
          )}
          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-muted hover:text-primary rounded-full hover:bg-muted/10 transition-colors shrink-0 mb-1"
            >
              <ImageIcon size={22} />
            </button>
            
            <button
              type="button"
              onClick={() => setStoryModalOpen(true)}
              className="p-3 text-muted hover:text-primary rounded-full hover:bg-muted/10 transition-colors shrink-0 mb-1 -ml-1"
            >
              <BookOpen size={22} />
            </button>
            
            {isRecording ? (
              <div className="flex-1 min-h-[48px] bg-red-500/10 rounded-2xl flex items-center justify-between px-4 border border-red-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  <Typography variant="body" className="text-red-500 font-mono font-medium">
                    {formatTime(recordingTime)}
                  </Typography>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={cancelRecording} className="p-2 text-muted hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                  <button type="button" onClick={stopRecording} className="p-2 text-primary hover:text-primary/80 transition-colors">
                    <CheckCircle size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <TextareaAutosize
                minRows={1}
                maxRows={5}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Bir mesaj yazın..."
                className="flex-1 bg-card border border-border/50 rounded-2xl px-5 py-3.5 text-sm text-text focus:outline-none focus:border-primary/50 transition-colors resize-none scrollbar-hide"
              />
            )}
            
            {!inputText.trim() && !imageFile && !selectedStory && !audioBlob && !isRecording ? (
              <Button 
                type="button" 
                variant="outline" 
                onPress={startRecording}
                className="w-12 h-12 rounded-full flex items-center justify-center p-0 flex-shrink-0 mb-0.5 bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white"
              >
                <Mic size={22} className="shrink-0" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                variant="primary" 
                className="w-12 h-12 rounded-full flex items-center justify-center p-0 flex-shrink-0 mb-0.5"
                disabled={(!inputText.trim() && !imageFile && !selectedStory && !audioBlob) || sending || uploadingImage}
              >
                {sending || uploadingImage ? <Loader2 size={24} className="animate-spin text-white shrink-0" /> : <Send size={24} className="text-white shrink-0" />}
              </Button>
            )}
          </form>
        </div>
      )}
      
      <StorySearchModal 
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        onSelect={(story) => {
          setSelectedStory(story);
          setStoryModalOpen(false);
        }}
      />
    </div>
  );
}
