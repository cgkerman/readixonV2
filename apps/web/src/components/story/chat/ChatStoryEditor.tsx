'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Send, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Smartphone, 
  Play, 
  RotateCcw, 
  Image as ImageIcon, 
  Clock, 
  UserPlus, 
  Check, 
  Sparkles, 
  MessageSquare, 
  Save, 
  Eye, 
  X,
  Volume2,
  VolumeX,
  Upload,
  Maximize2,
  Minimize2,
  Columns,
  Edit3,
  ZoomIn,
  ZoomOut,
  PlusCircle,
  FileText,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import type { 
  Story, 
  Chapter, 
  ChatStoryCharacter, 
  ChatStoryMessage, 
  ChatStoryMessageType 
} from '@readixon/core';
import { uploadFile, compressImage } from '@readixon/core';
import { useBackButton } from '@/hooks/useBackButton';

interface ChatStoryEditorProps {
  story: Story;
  chapter: Chapter;
  allChapters?: Chapter[];
  onCreateChapter?: () => Promise<void>;
  onSave: (updatedChapter: Partial<Chapter>, updatedStory?: Partial<Story>) => Promise<void>;
  isSaving: boolean;
}

// Web Audio API ile pıt mesaj sesi (dosya indirmeden anlık sentezlenir)
const playPopSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // ignore
  }
};

// Saate dakika ekleme/çıkarma (24 saatlik formatı korur: örn. 23:55 + 10 dk -> 00:05)
const addMinutesToTimeStr = (timeStr: string, minutesToAdd: number): string => {
  const [hStr, mStr] = (timeStr || '12:00').split(':');
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10);
  if (isNaN(h)) h = 12;
  if (isNaN(m)) m = 0;

  let totalMinutes = h * 60 + m + minutesToAdd;
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;

  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

// İki saat arasındaki dakika farkını hesapla
const getTimeDiffMinutes = (fromTime: string, toTime: string): number => {
  const [h1, m1] = (fromTime || '12:00').split(':').map((v) => parseInt(v, 10) || 0);
  const [h2, m2] = (toTime || '12:00').split(':').map((v) => parseInt(v, 10) || 0);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
};

const DEFAULT_CHARACTERS: ChatStoryCharacter[] = [
  { id: 'c1', name: 'Ben', isSelf: true, color: '#10b981' },
  { id: 'c2', name: 'Gizemli Kişi', isSelf: false, color: '#6366f1' }
];

type ViewMode = 'split' | 'editor' | 'preview';

export const ChatStoryEditor: React.FC<ChatStoryEditorProps> = ({
  story,
  chapter,
  allChapters,
  onCreateChapter,
  onSave,
  isSaving
}) => {
  const router = useRouter();

  // Karakterler ve Mesajlar
  const [characters, setCharacters] = useState<ChatStoryCharacter[]>(
    story.chatCharacters && story.chatCharacters.length > 0 
      ? story.chatCharacters 
      : DEFAULT_CHARACTERS
  );
  const [messages, setMessages] = useState<ChatStoryMessage[]>(
    chapter.chatMessages || []
  );

  // Aktif Konuşmacı
  const [activeSenderId, setActiveSenderId] = useState<string>(
    characters[0]?.id || 'c1'
  );

  // Mesaj Giriş Alanı
  const [inputText, setInputText] = useState('');
  const [isSystemMode, setIsSystemMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Masaüstü Görünüm Modu ('split': İkili | 'editor': Sadece Yazım | 'preview': Sadece Simülatör)
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [phoneScale, setPhoneScale] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState(false);

  // Mesaj Satır İçi Düzenleme (Inline Edit)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingTime, setEditingTime] = useState('');

  // Kurgusal Zaman Yönetimi (Hikaye Saati)
  const [storyTime, setStoryTime] = useState<string>(() => {
    if (chapter.chatMessages && chapter.chatMessages.length > 0) {
      const last = chapter.chatMessages[chapter.chatMessages.length - 1];
      if (last.time && /^\d{2}:\d{2}$/.test(last.time)) {
        return last.time;
      }
    }
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  // Her mesajda otomatik +1 dk ilerleme modu
  const [autoAdvanceTime, setAutoAdvanceTime] = useState<boolean>(false);

  // Readixon Özel Saat Seçici Modalı (Hikaye Saati ve Mesaj Zamanı)
  const [timePicker, setTimePicker] = useState<{
    isOpen: boolean;
    target: 'story' | 'message';
    messageId?: string;
    originalTime: string;
    hours: number;
    minutes: number;
    shiftRemaining: boolean;
  }>({
    isOpen: false,
    target: 'story',
    originalTime: '12:00',
    hours: 12,
    minutes: 0,
    shiftRemaining: false,
  });

  // Görsel Yükleme / URL Modalı
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Karakter Ekleme & Düzenleme Modalı
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [newCharName, setNewCharName] = useState('');
  const [newCharColor, setNewCharColor] = useState('#3b82f6');
  const [newCharIsSelf, setNewCharIsSelf] = useState(false);
  const [newCharAvatar, setNewCharAvatar] = useState('');

  // Simülatör "Dokunarak Oku" Canlı Test Modu
  const [isTestMode, setIsTestMode] = useState(false);
  const [revealedCount, setRevealedCount] = useState<number>(0);

  // Mobil Görünüm Sekmesi (Mesaj Yazımı vs Telefon Simülatörü)
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorEndRef = useRef<HTMLDivElement>(null);
  const simulatorContainerRef = useRef<HTMLDivElement>(null);
  const simulatorEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const chapterDropdownRef = useRef<HTMLDivElement>(null);

  const [chapterTitle, setChapterTitle] = useState(chapter.title || 'Sohbet 1');
  const [chapterStatus, setChapterStatus] = useState<'draft' | 'published' | 'scheduled'>(chapter.status || 'draft');

  // Tam Ekran Görsel Önizleme (Lightbox)
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Mobil Android Geri Tuşu Yönetimi (LIFO)
  useBackButton(() => {
    setPreviewImage(null);
    return true;
  }, previewImage !== null);

  useBackButton(() => {
    setTimePicker((prev) => ({ ...prev, isOpen: false }));
    return true;
  }, timePicker.isOpen && previewImage === null);

  useBackButton(() => {
    setIsCharModalOpen(false);
    return true;
  }, isCharModalOpen && !timePicker.isOpen && previewImage === null);

  useBackButton(() => {
    setIsImageModalOpen(false);
    return true;
  }, isImageModalOpen && previewImage === null);

  useBackButton(() => {
    setMobileTab('editor');
    return true;
  }, mobileTab === 'preview' && !isCharModalOpen && !isImageModalOpen && previewImage === null);

  // Hem editör hem simülatör ekranını en alttaki son mesaja kaydır
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    // 1. Editör mesaj akışı
    if (editorContainerRef.current) {
      editorContainerRef.current.scrollTo({
        top: editorContainerRef.current.scrollHeight,
        behavior
      });
    } else if (editorEndRef.current) {
      editorEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }

    // 2. Canlı simülatör
    if (simulatorContainerRef.current) {
      simulatorContainerRef.current.scrollTo({
        top: simulatorContainerRef.current.scrollHeight,
        behavior
      });
    } else if (simulatorEndRef.current) {
      simulatorEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  // Editör içi kaydırma takipçisi (Yazar yukarı çıktığında 'En Son Mesaj' butonu göster)
  const handleEditorScroll = () => {
    if (!editorContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = editorContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottomBtn(distanceFromBottom > 150);
  };

  // 1. İlk açılışta ve bölüm değiştiğinde en son mesaja otomatik odaklan (animasyonsuz, anında)
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom('auto');
    }, 80);
    return () => clearTimeout(timer);
  }, [chapter.chapterId]);

  // 2. Yeni mesaj eklendiğinde, silindiğinde veya test modunda yumuşakça en son mesaja kaydır
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom('smooth');
    }, 40);
    return () => clearTimeout(timer);
  }, [messages.length, revealedCount, isTestMode]);

  // 3. Mobil sekme (Editör <-> Simülatör) veya masaüstü mod ('split', 'editor', 'preview') değiştiğinde görünür olan paneli en alta konumla
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom('auto');
    }, 60);
    return () => clearTimeout(timer);
  }, [mobileTab, viewMode]);

  // Dış tıklamada bölüm menüsünü kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chapterDropdownRef.current && !chapterDropdownRef.current.contains(e.target as Node)) {
        setIsChapterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fullscreen State Listener
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Otomatik Kaydetme Tetikleyici
  const handleSaveAll = async () => {
    await onSave(
      { 
        chatMessages: messages,
        title: chapterTitle.trim() || chapter.title,
        status: chapterStatus
      },
      { chatCharacters: characters }
    );
    toast.success('Sohbet ve karakterler kaydedildi.');
  };

  // Masaüstü Klavye Kısayolları (Ctrl+S, Alt+1..9 konuşmacı, Esc)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S ile Kaydet
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveAll();
        return;
      }

      // Esc ile modalları veya düzenlemeyi kapat
      if (e.key === 'Escape') {
        if (previewImage) {
          setPreviewImage(null);
          return;
        }
        if (timePicker.isOpen) {
          setTimePicker((prev) => ({ ...prev, isOpen: false }));
          return;
        }
        if (editingMessageId) setEditingMessageId(null);
        if (isCharModalOpen) setIsCharModalOpen(false);
        if (isImageModalOpen) setIsImageModalOpen(false);
        if (isChapterMenuOpen) setIsChapterMenuOpen(false);
        return;
      }

      // Alt + 1 .. Alt + 9 ile hızlı konuşmacı değiştirme
      if (e.altKey && !isNaN(Number(e.key)) && Number(e.key) > 0) {
        const charIdx = Number(e.key) - 1;
        if (characters[charIdx]) {
          e.preventDefault();
          setActiveSenderId(characters[charIdx].id);
          setIsSystemMode(false);
          messageInputRef.current?.focus();
          toast.info(`Konuşmacı: ${characters[charIdx].name}`);
        }
      }

      // Alt + 0 veya Alt + S ile Olay/Zaman Bildirimi moduna geç
      if (e.altKey && (e.key === '0' || e.key.toLowerCase() === 's')) {
        e.preventDefault();
        setIsSystemMode((prev) => !prev);
        messageInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [messages, characters, chapterTitle, chapterStatus, editingMessageId, isCharModalOpen, isImageModalOpen, isChapterMenuOpen, timePicker.isOpen]);

  // Yeni Mesaj Ekleme
  const handleSendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const timeStr = storyTime;

    const newMsg: ChatStoryMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: isSystemMode ? 'system' : 'text',
      senderId: isSystemMode ? undefined : activeSenderId,
      text: trimmed,
      time: timeStr
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setIsSystemMode(false);
    if (soundEnabled) playPopSound();

    if (autoAdvanceTime) {
      setStoryTime((prev) => addMinutesToTimeStr(prev, 1));
    }

    // Mesaj kutusuna yeniden odaklan ve en son mesaja kaydır
    setTimeout(() => {
      messageInputRef.current?.focus();
      scrollToBottom('smooth');
    }, 30);
  };

  // Enter tuşu ile hızlı gönderme (Shift+Enter yeni satır)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Fotoğraf Mesajı Ekleme
  const handleAddImageMessage = (url: string) => {
    if (!url.trim()) return;

    const timeStr = storyTime;

    const newMsg: ChatStoryMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'image',
      senderId: activeSenderId,
      mediaUrl: url.trim(),
      time: timeStr
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsImageModalOpen(false);
    setImageUrlInput('');
    if (soundEnabled) playPopSound();

    if (autoAdvanceTime) {
      setStoryTime((prev) => addMinutesToTimeStr(prev, 1));
    }

    setTimeout(() => {
      scrollToBottom('smooth');
    }, 50);
  };

  // Fotoğraf Dosyası Yükleme (İstemci Tarafı Otomatik Görsel Optimizasyonu)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // 1. Sunucuyu yormamak ve hızlı açılmasını sağlamak için görseli istemcide sıkıştır (1280x1600, 0.82 kalite)
      const optimizedFile = await compressImage(file, 1280, 1600, 0.82);

      // 2. Optimize edilmiş dosyayı yükle
      const downloadUrl = await uploadFile(
        optimizedFile,
        `stories/${story.storyId}/chat_media/${Date.now()}_${optimizedFile.name}`
      );
      handleAddImageMessage(downloadUrl);
      toast.success('Görsel optimize edilerek eklendi.');
    } catch (err) {
      console.error('Görsel yükleme hatası:', err);
      toast.error('Görsel yüklenemedi.');
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // Karakter Profil Fotoğrafı Yükleme (İstemcide 256x256 Web JPEG sıkıştırma)
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const optimizedAvatar = await compressImage(file, 256, 256, 0.85);
      const downloadUrl = await uploadFile(
        optimizedAvatar,
        `stories/${story.storyId}/avatars/${Date.now()}_${optimizedAvatar.name}`
      );
      setNewCharAvatar(downloadUrl);
      toast.success('Profil fotoğrafı optimize edilerek yüklendi.');
    } catch (err) {
      console.error('Avatar yükleme hatası:', err);
      toast.error('Profil fotoğrafı yüklenemedi.');
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  // Yeni Karakter Ekleme Dialogunu Aç
  const handleOpenNewCharacter = () => {
    setEditingCharId(null);
    setNewCharName('');
    setNewCharColor('#3b82f6');
    setNewCharIsSelf(false);
    setNewCharAvatar('');
    setIsCharModalOpen(true);
  };

  // Mevcut Karakteri Düzenleme Dialogunu Aç
  const handleOpenEditCharacter = (char: ChatStoryCharacter) => {
    setEditingCharId(char.id);
    setNewCharName(char.name);
    setNewCharColor(char.color || '#3b82f6');
    setNewCharIsSelf(Boolean(char.isSelf));
    setNewCharAvatar(char.avatarUrl || '');
    setIsCharModalOpen(true);
  };

  // Karakter Kaydetme (Yeni veya Güncelleme)
  const handleSaveCharacter = () => {
    const trimmed = newCharName.trim();
    if (!trimmed) {
      toast.error('Lütfen bir isim yazın.');
      return;
    }

    if (editingCharId) {
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === editingCharId
            ? {
                ...c,
                name: trimmed,
                color: newCharColor,
                isSelf: newCharIsSelf,
                avatarUrl: newCharAvatar.trim() || undefined
              }
            : c
        )
      );
      setIsCharModalOpen(false);
      setEditingCharId(null);
      toast.success(`${trimmed} güncellendi.`);
    } else {
      const newChar: ChatStoryCharacter = {
        id: `char_${Date.now()}`,
        name: trimmed,
        color: newCharColor,
        isSelf: newCharIsSelf,
        avatarUrl: newCharAvatar.trim() || undefined
      };

      setCharacters((prev) => [...prev, newChar]);
      setActiveSenderId(newChar.id);
      setIsCharModalOpen(false);
      toast.success(`${newChar.name} konuşmacı olarak eklendi.`);
    }
  };

  // Karakter Silme
  const handleDeleteCharacter = (charId: string) => {
    if (characters.length <= 1) {
      toast.error('En az bir konuşmacı kalmalıdır.');
      return;
    }
    const remaining = characters.filter((c) => c.id !== charId);
    setCharacters(remaining);
    if (activeSenderId === charId && remaining[0]) {
      setActiveSenderId(remaining[0].id);
    }
    setIsCharModalOpen(false);
    setEditingCharId(null);
    toast.success('Konuşmacı silindi.');
  };

  // Mesaj Sıralamasını Değiştirme
  const handleMoveMessage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === messages.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const copy = [...messages];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setMessages(copy);
  };

  // Hikaye Saati Hızlı Ayarları
  const handleAdjustStoryTime = (deltaMinutes: number) => {
    setStoryTime((prev) => addMinutesToTimeStr(prev, deltaMinutes));
  };

  const handleResetToCurrentTime = () => {
    const now = new Date();
    const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setStoryTime(nowStr);
    toast.info(`Hikaye saati şimdiki zamana (${nowStr}) eşitlendi.`);
  };

  // Readixon Özel Saat Seçici Fonksiyonları
  const handleOpenStoryTimePicker = () => {
    const [hStr, mStr] = (storyTime || '12:00').split(':');
    const h = Math.min(23, Math.max(0, parseInt(hStr, 10) || 0));
    const m = Math.min(59, Math.max(0, parseInt(mStr, 10) || 0));
    setTimePicker({
      isOpen: true,
      target: 'story',
      originalTime: storyTime,
      hours: h,
      minutes: m,
      shiftRemaining: false,
    });
  };

  const handleOpenMessageTimePicker = (msg: ChatStoryMessage) => {
    const msgTime = msg.time || storyTime || '12:00';
    const [hStr, mStr] = msgTime.split(':');
    const h = Math.min(23, Math.max(0, parseInt(hStr, 10) || 0));
    const m = Math.min(59, Math.max(0, parseInt(mStr, 10) || 0));
    setTimePicker({
      isOpen: true,
      target: 'message',
      messageId: msg.id,
      originalTime: msgTime,
      hours: h,
      minutes: m,
      shiftRemaining: false,
    });
  };

  const changeHour = (delta: number) => {
    setTimePicker((prev) => ({
      ...prev,
      hours: (prev.hours + delta + 24) % 24,
    }));
  };

  const changeMinute = (delta: number) => {
    setTimePicker((prev) => {
      const total = prev.hours * 60 + prev.minutes + delta;
      const normalized = ((total % 1440) + 1440) % 1440;
      return {
        ...prev,
        hours: Math.floor(normalized / 60),
        minutes: normalized % 60,
      };
    });
  };

  const setExactTime = (h: number, m: number) => {
    setTimePicker((prev) => ({
      ...prev,
      hours: Math.min(23, Math.max(0, h)),
      minutes: Math.min(59, Math.max(0, m)),
    }));
  };

  const handleApplyTimePicker = () => {
    const formattedTime = `${String(timePicker.hours).padStart(2, '0')}:${String(timePicker.minutes).padStart(2, '0')}`;

    if (timePicker.target === 'story') {
      setStoryTime(formattedTime);
      setTimePicker((prev) => ({ ...prev, isOpen: false }));
      toast.success(`Hikaye saati ${formattedTime} olarak ayarlandı.`);
      return;
    }

    if (!timePicker.messageId) {
      setTimePicker((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    const targetIndex = messages.findIndex((m) => m.id === timePicker.messageId);
    if (targetIndex === -1) {
      setTimePicker((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    const originalTime = messages[targetIndex].time || '12:00';
    const diffMinutes = getTimeDiffMinutes(originalTime, formattedTime);

    setMessages((prev) =>
      prev.map((m, idx) => {
        if (idx === targetIndex) {
          return { ...m, time: formattedTime };
        }
        if (timePicker.shiftRemaining && idx > targetIndex && diffMinutes !== 0) {
          return { ...m, time: addMinutesToTimeStr(m.time || formattedTime, diffMinutes) };
        }
        return m;
      })
    );

    if (targetIndex === messages.length - 1) {
      setStoryTime(formattedTime);
    }

    setTimePicker((prev) => ({ ...prev, isOpen: false }));
    toast.success(
      timePicker.shiftRemaining && diffMinutes !== 0
        ? `Mesaj saati ${formattedTime} yapıldı ve sonraki mesajlar ${diffMinutes > 0 ? '+' : ''}${diffMinutes} dk ötelendi.`
        : `Mesaj saati ${formattedTime} olarak güncellendi.`
    );
  };

  // Mesaj Düzenleme (Inline Edit)
  const handleStartEdit = (msg: ChatStoryMessage) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.text || '');
    setEditingTime(msg.time || storyTime);
  };

  const handleSaveEdit = (msgId: string) => {
    if (!editingText.trim()) {
      toast.error('Mesaj içeriği boş olamaz.');
      return;
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, text: editingText.trim(), time: editingTime.trim() || m.time || storyTime }
          : m
      )
    );
    setEditingMessageId(null);
    setEditingText('');
    setEditingTime('');
    toast.success('Mesaj güncellendi.');
  };

  // Mesaj Silme
  const handleDeleteMessage = (index: number) => {
    setMessages((prev) => prev.filter((_, i) => i !== index));
  };

  // Simülatör Dokunarak İlerleme (Tap-to-reveal)
  const handleSimulatorTap = () => {
    if (!isTestMode) return;
    if (revealedCount < messages.length) {
      setRevealedCount((prev) => prev + 1);
      if (soundEnabled) playPopSound();
    }
  };

  // Tam Ekran Aç / Kapat
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const activeChar = characters.find((c) => c.id === activeSenderId) || characters[0];

  // Aktif bölümdeki konuşmacıların analizi (Grup veya Tekil Partner)
  const activeSenderIds = useMemo(() => {
    const ids = new Set<string>();
    messages.forEach((m) => {
      if (m.type !== 'system' && m.senderId) ids.add(m.senderId);
    });
    return ids;
  }, [messages]);

  const activePartners = useMemo(() => {
    const active = characters.filter((c) => !c.isSelf && activeSenderIds.has(c.id));
    if (active.length > 0) return active;
    const allNonSelf = characters.filter((c) => !c.isSelf);
    return allNonSelf;
  }, [characters, activeSenderIds]);

  const isGroupChat = activePartners.length > 1;
  const partnerChar = activePartners[0] || characters.find((c) => !c.isSelf) || characters[0];

  const displayedMessages = isTestMode 
    ? messages.slice(0, revealedCount) 
    : messages;

  // İstatistikler (Kelime sayısı ve tahmini okuma süresi)
  const totalWords = messages.reduce((acc, m) => acc + (m.text ? m.text.trim().split(/\s+/).length : 0), 0);
  const estimatedReadingSeconds = Math.max(15, messages.length * 2.5);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background select-none overflow-hidden h-[100dvh] w-full">
      {/* ── ÜST BAR: Başlık, Bölüm Seçici & Kaydet (Mobilde Tek Satır, Ferah) ── */}
      <header className="pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2 px-3 sm:px-6 border-b border-border/60 bg-card/80 backdrop-blur-xl flex items-center justify-between shrink-0 z-30 min-h-[60px] sm:min-h-[64px]">
        {/* Sol: Geri Tuşu & Bölüm Bilgisi */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Link
            href={`/studio/story/${story.storyId}`}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-card hover:bg-muted/20 border border-border/50 flex items-center justify-center text-muted hover:text-foreground active:scale-90 transition-all shrink-0"
            title="Hikaye Yönetimine Dön"
          >
            <ArrowLeft size={17} />
          </Link>

          <div className="flex flex-col min-w-0" ref={chapterDropdownRef}>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="hidden sm:inline-flex text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
                Mesaj Hikayesi
              </span>

              {/* Bölüm Listesi Seçici Dropdown */}
              {allChapters && allChapters.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsChapterMenuOpen(!isChapterMenuOpen)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-card/80 hover:bg-card border border-border/50 text-[10px] sm:text-[11px] font-bold text-foreground transition-all cursor-pointer"
                    title="Bölümler arasında geçiş yap"
                  >
                    <FileText size={11} className="text-emerald-400 shrink-0" />
                    <span className="truncate max-w-[80px] sm:max-w-[140px]">{chapterTitle}</span>
                    <ChevronDown size={11} className={`text-muted transition-transform shrink-0 ${isChapterMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menü İçeriği */}
                  {isChapterMenuOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-64 bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted border-b border-border/40 flex items-center justify-between">
                        <span>Tüm Sohbetler ({allChapters.length})</span>
                        {onCreateChapter && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsChapterMenuOpen(false);
                              onCreateChapter();
                            }}
                            className="text-primary hover:underline flex items-center gap-1 text-[10px] font-bold"
                          >
                            <PlusCircle size={12} />
                            <span>Yeni Ekle</span>
                          </button>
                        )}
                      </div>

                      <div className="max-h-56 overflow-y-auto space-y-1 py-1">
                        {allChapters.map((c) => {
                          const isCurrent = c.chapterId === chapter.chapterId;
                          return (
                            <button
                              key={c.chapterId}
                              type="button"
                              onClick={() => {
                                setIsChapterMenuOpen(false);
                                if (!isCurrent) {
                                  router.push(`/studio/story/${story.storyId}/chapter/${c.chapterId}`);
                                }
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-all ${
                                isCurrent
                                  ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
                                  : 'text-foreground/90 hover:bg-muted/15'
                              }`}
                            >
                              <span className="truncate max-w-[140px]">{c.title || 'İsimsiz Sohbet'}</span>
                              <span className="text-[9px] font-mono opacity-70">
                                {c.chatMessages?.length || 0} Mesaj
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Yayında / Taslak Butonu */}
              <button
                type="button"
                onClick={() => setChapterStatus(prev => prev === 'published' ? 'draft' : 'published')}
                className={`text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full border transition-all cursor-pointer shrink-0 ${
                  chapterStatus === 'published'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
                title="Tıklayarak yayında / taslak durumunu değiştirin"
              >
                {chapterStatus === 'published' ? '● Yayında' : '○ Taslak'}
              </button>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Sohbet Başlığı..."
                className="text-xs sm:text-sm font-extrabold text-foreground bg-transparent border-b border-transparent hover:border-border/60 focus:border-emerald-500 focus:outline-none transition-colors max-w-[100px] sm:max-w-xs px-0 py-0.5 truncate"
                title="Bölüm başlığını düzenle"
              />
              <span className="text-xs text-muted/60 hidden md:inline truncate max-w-[180px]">
                • {story.title}
              </span>
            </div>
          </div>
        </div>

        {/* ── ORTA: Sadece Masaüstünde Görünen Mod Seçici (İkili | Yazım Odaklı | Simülatör) ── */}
        <div className="hidden lg:flex items-center p-1 rounded-2xl bg-muted/15 border border-border/40 select-none shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'split' ? 'bg-card text-foreground shadow-sm border border-border/40' : 'text-muted hover:text-foreground'
            }`}
            title="İkili Bölünmüş Görünüm (Editör + Simülatör Yan Yana)"
          >
            <Columns size={14} className={viewMode === 'split' ? 'text-emerald-400' : ''} />
            <span>İkili Çalışma</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'editor' ? 'bg-card text-foreground shadow-sm border border-border/40' : 'text-muted hover:text-foreground'
            }`}
            title="Yazım Odaklı Mod (Tam Ekran Metin Girişi)"
          >
            <MessageSquare size={14} className={viewMode === 'editor' ? 'text-emerald-400' : ''} />
            <span>Yazım Odaklı</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'preview' ? 'bg-card text-foreground shadow-sm border border-border/40' : 'text-muted hover:text-foreground'
            }`}
            title="Simülatör Test Modu (Büyük Canlı Önizleme)"
          >
            <Smartphone size={14} className={viewMode === 'preview' ? 'text-emerald-400' : ''} />
            <span>Simülatör</span>
          </button>
        </div>

        {/* Sağ: İstatistikler, Ses, Tam Ekran & Kaydet Butonu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-card border border-border/40 text-xs font-semibold text-muted select-none">
            <span className="text-foreground font-bold">{messages.length}</span>
            <span>Mesaj</span>
            <span className="opacity-40">•</span>
            <span className="text-foreground font-bold">{totalWords}</span>
            <span>Kelime</span>
            <span className="opacity-40">•</span>
            <span className="text-foreground font-bold">~{Math.round(estimatedReadingSeconds / 60) || 1}</span>
            <span>dk</span>
          </div>

          {/* Ses Kontrolü */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-card hover:bg-muted/20 border border-border/40 flex items-center justify-center text-muted hover:text-foreground active:scale-95 transition-all cursor-pointer"
            title={soundEnabled ? 'Mesaj sesini kapat' : 'Mesaj sesini aç'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Tam Ekran Modu (Masaüstü) */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden sm:flex w-9 h-9 rounded-xl bg-card hover:bg-muted/20 border border-border/40 items-center justify-center text-muted hover:text-foreground active:scale-95 transition-all cursor-pointer"
            title={isFullscreen ? 'Tam ekrandan çık' : 'Tam ekrana geç (Masaüstü Odak Modu)'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Kaydet Butonu */}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all flex items-center gap-1 sm:gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Kaydet (Ctrl+S)"
          >
            <Save size={14} />
            <span>{isSaving ? '...' : 'Kaydet'}</span>
            <span className="hidden sm:inline-block text-[9px] font-mono opacity-60 bg-black/15 px-1 rounded ml-0.5">Ctrl+S</span>
          </button>
        </div>
      </header>

      {/* ── MOBİL ALT SEKME ÇUBUĞU (lg:hidden) - ÜST BARI RAHATLATAN GENİŞ SEGMENTED KONTROL ── */}
      <div className="lg:hidden flex items-center px-3 py-1.5 bg-card/90 backdrop-blur-md border-b border-border/40 shrink-0 select-none">
        <div className="flex-1 grid grid-cols-2 gap-1 bg-muted/20 p-1 rounded-xl border border-border/30">
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mobileTab === 'editor'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <MessageSquare size={13} />
            <span>Editör ({messages.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Smartphone size={13} />
            <span>Canlı Simülatör</span>
          </button>
        </div>
      </div>

      {/* ── ANA ÇALIŞMA ALANI (SPLIT / ADAPTIVE WORKSTATION) ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── SOL BÖLME: MESAJ YAZIMI & LİSTE (Masaüstünde %58-60 veya %100 Odak Modu) ── */}
        <div
          className={`flex flex-col h-full border-r border-border/50 bg-background transition-all duration-200 ${
            // Mobil ekran:
            mobileTab === 'editor' ? 'flex w-full' : 'hidden'
          } ${
            // Masaüstü ekran:
            viewMode === 'split' 
              ? 'lg:flex lg:w-[58%] xl:w-[60%]' 
              : viewMode === 'editor' 
              ? 'lg:flex lg:w-full' 
              : 'lg:hidden'
          }`}
        >
          {/* 1. Konuşmacı / Karakter Barı & Hızlı Kısayollar */}
          <div className="p-3.5 sm:p-4 border-b border-border/40 bg-card/30 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                <MessageSquare size={13} className="text-emerald-500" />
                <span>Konuşmacılar</span>
                <span className="text-[9px] font-normal opacity-60 hidden sm:inline">
                  (Alt+1, Alt+2 ile hızlı geçiş)
                </span>
              </span>
              <button
                type="button"
                onClick={handleOpenNewCharacter}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Yeni Karakter Ekle</span>
              </button>
            </div>

            {/* Karakter Seçici Butonlar */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              {characters.map((char, index) => {
                const isSelected = char.id === activeSenderId && !isSystemMode;
                return (
                  <div
                    key={char.id}
                    onClick={() => {
                      setActiveSenderId(char.id);
                      setIsSystemMode(false);
                      messageInputRef.current?.focus();
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer group ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-xs ring-1 ring-emerald-500/30'
                        : 'border-border/50 bg-card/60 text-muted hover:text-foreground hover:bg-card'
                    }`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: char.color || '#10b981' }}
                    />
                    <span>{char.name}</span>
                    <span className="text-[9px] opacity-60 font-mono">
                      [Alt+{index + 1}]
                    </span>
                    <span className="text-[9px] opacity-60">
                      {char.isSelf ? '(Ben/Sağ)' : '(Sol)'}
                    </span>

                    {/* Karakter Düzenleme Butonu */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditCharacter(char);
                      }}
                      className="ml-0.5 p-1 rounded-md hover:bg-foreground/10 text-muted hover:text-foreground transition-colors cursor-pointer"
                      title={`${char.name} karakterini düzenle`}
                    >
                      <Edit3 size={11} />
                    </button>
                  </div>
                );
              })}

              {/* Sistem / Zaman Bildirimi Seçeneği */}
              <button
                type="button"
                onClick={() => {
                  setIsSystemMode(true);
                  messageInputRef.current?.focus();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSystemMode
                    ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-xs ring-1 ring-amber-500/30'
                    : 'border-border/50 bg-card/60 text-muted hover:text-foreground hover:bg-card'
                }`}
              >
                <Clock size={13} className="text-amber-500" />
                <span>Olay / Zaman Bildirimi</span>
                <span className="text-[9px] opacity-60 font-mono hidden sm:inline">[Alt+0]</span>
              </button>
            </div>
          </div>

          {/* 2. Mesaj Listesi (Kaydırılabilir & Geniş Ekrana Uyumlu max-w-3xl) */}
          <div 
            ref={editorContainerRef}
            onScroll={handleEditorScroll}
            className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5 relative scroll-smooth"
          >
            <div className="max-w-3xl mx-auto w-full space-y-2.5 pb-2">
              {messages.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center p-6 text-muted">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                    <MessageSquare size={26} />
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">
                    Sohbet Henüz Boş
                  </h3>
                  <p className="text-xs max-w-sm">
                    Aşağıdaki alandan bir konuşmacı seçin, ilk mesajınızı yazıp Enter'a basın. Canlı simülatörde anında belirecektir.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const sender = characters.find((c) => c.id === msg.senderId);
                  const isSystem = msg.type === 'system';
                  const isEditing = editingMessageId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all group ${
                        isSystem
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : sender?.isSelf
                          ? 'bg-emerald-500/10 border-emerald-500/25'
                          : 'bg-card/70 border-border/50'
                      }`}
                    >
                      {/* Sol: Sıra No & Karakter Bilgisi & İçerik */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-[10px] font-mono text-muted/60 shrink-0 w-6">
                          #{index + 1}
                        </span>

                        {!isSystem && sender && (
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: sender.color || '#10b981' }}
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className="text-xs font-black"
                              style={{ color: isSystem ? '#f59e0b' : sender?.color || '#10b981' }}
                            >
                              {isSystem ? 'Zaman / Olay Bildirimi' : sender?.name || 'Bilinmeyen'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenMessageTimePicker(msg)}
                              className="text-[10px] font-mono text-muted hover:text-emerald-500 bg-muted/15 hover:bg-emerald-500/10 border border-border/50 px-1.5 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                              title="Mesaj saatini değiştirmek için tıklayın"
                            >
                              <Clock size={10} className="text-emerald-500 shrink-0" />
                              <span>{msg.time || '12:00'}</span>
                            </button>
                          </div>

                          {isEditing ? (
                            <div className="flex items-center gap-2 my-1 flex-wrap">
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(msg.id);
                                  if (e.key === 'Escape') setEditingMessageId(null);
                                }}
                                className="flex-1 min-w-[180px] bg-background border border-emerald-500/60 rounded-xl px-2.5 py-1.5 text-xs text-text focus:outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenMessageTimePicker(msg)}
                                className="flex items-center gap-1.5 bg-background hover:bg-card border border-border rounded-xl px-2.5 py-1.5 text-xs text-text transition-colors cursor-pointer"
                                title="Saati değiştirmek için tıklayın"
                              >
                                <Clock size={11} className="text-emerald-500 shrink-0" />
                                <span className="font-mono font-bold">{msg.time || storyTime}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(msg.id)}
                                className="p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
                                title="Kaydet (Enter)"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingMessageId(null)}
                                className="p-1.5 rounded-lg bg-muted/20 text-muted hover:text-text transition-colors"
                                title="Vazgeç (Esc)"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : msg.type === 'image' ? (
                            <div 
                              onClick={() => setPreviewImage(msg.mediaUrl || null)}
                              className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/60 bg-black/20 my-1 cursor-pointer group shadow-sm shrink-0"
                              title="Büyük görmek için tıklayın"
                            >
                              <img src={msg.mediaUrl} alt="Medya" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Maximize2 size={16} />
                              </div>
                            </div>
                          ) : (
                            <p 
                              onClick={() => handleStartEdit(msg)}
                              className="text-xs text-foreground/90 leading-snug break-words cursor-pointer hover:text-primary transition-colors"
                              title="Düzenlemek için tıklayın"
                            >
                              {msg.text}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Sağ: Düzenleme Butonları (Düzenle, Yukarı, Aşağı, Sil) */}
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        {!isEditing && msg.type !== 'image' && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(msg)}
                            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-muted/20 transition-colors"
                            title="Mesajı düzenle"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleMoveMessage(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-muted/20 disabled:opacity-30 transition-colors"
                          title="Yukarı taşı"
                        >
                          <ChevronUp size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveMessage(index, 'down')}
                          disabled={index === messages.length - 1}
                          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-muted/20 disabled:opacity-30 transition-colors"
                          title="Aşağı taşı"
                        >
                          <ChevronDown size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(index)}
                          className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Mesajı sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
              {/* Listenin en sonuna sabitleyen görünmez referans */}
              <div ref={editorEndRef} className="h-4" />
            </div>

            {/* En Son Mesaja Git Yüzen Düğmesi (Yazar yukarı kaydırdıysa görünür) */}
            {showScrollBottomBtn && (
              <button
                type="button"
                onClick={() => scrollToBottom('smooth')}
                className="sticky bottom-3 float-right mr-3 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150 z-20 cursor-pointer active:scale-95"
                title="En son mesaja git"
              >
                <ChevronDown size={14} className="stroke-[2.5]" />
                <span>En Son Mesaja İn</span>
              </button>
            )}
          </div>

          {/* 3. Mesaj Giriş Barı (Composer) - Sabit Alt Konsol */}
          <div className="p-3 sm:p-4 border-t border-border/50 bg-card/40 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
            <div className="max-w-3xl mx-auto w-full space-y-2">
              <div className="flex items-center justify-between text-xs text-muted px-1">
                <span className="flex items-center gap-1.5 font-bold">
                  {isSystemMode ? (
                    <span className="text-amber-500 flex items-center gap-1">
                      <Clock size={13} /> Zaman / Durum Metni Yazılıyor
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: activeChar?.color || '#10b981' }}
                      />
                      <span className="text-foreground">{activeChar?.name}</span>
                      <span className="text-[10px] text-muted">olarak yazıyorsunuz</span>
                    </span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon size={14} />
                  <span>Fotoğraf Ekle</span>
                </button>
              </div>

              {/* ── Kurgusal Zaman Çubuğu (Story Time Controls) ── */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 p-1.5 px-2.5 rounded-2xl bg-card border border-border shadow-xs text-xs">
                {/* Sol: Saat Tetikleyici & Sıfırlama */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenStoryTimePicker}
                    className="flex items-center gap-1.5 bg-background hover:bg-card border border-border hover:border-emerald-500/60 px-2.5 py-1 rounded-xl transition-all shadow-2xs group cursor-pointer"
                    title="Hikaye saatini detaylı ayarlamak için tıklayın"
                  >
                    <Clock size={13} className="text-emerald-500 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="text-[11px] font-semibold text-muted select-none hidden sm:inline">Hikaye Saati:</span>
                    <span className="font-mono font-black text-xs text-text group-hover:text-emerald-500 transition-colors">
                      {storyTime}
                    </span>
                    <ChevronDown size={12} className="text-muted group-hover:text-text transition-colors shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToCurrentTime}
                    className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-muted/15 transition-colors cursor-pointer"
                    title="Şimdiki gerçek zamana eşitle"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>

                {/* Sağ: Hızlı İleri / Geri Adımlar (Mobilde yatay kaydırılabilir) */}
                <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none max-w-full">
                  <span className="text-[10px] font-semibold text-muted mr-0.5 hidden lg:inline select-none">Kaydır:</span>
                  <button
                    type="button"
                    onClick={() => handleAdjustStoryTime(-5)}
                    className="px-1.5 py-0.5 rounded-lg bg-background hover:bg-muted/20 border border-border text-muted hover:text-text font-mono text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                    title="5 dakika geri al"
                  >
                    -5 dk
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustStoryTime(-1)}
                    className="px-1.5 py-0.5 rounded-lg bg-background hover:bg-muted/20 border border-border text-muted hover:text-text font-mono text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                    title="1 dakika geri al"
                  >
                    -1 dk
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustStoryTime(1)}
                    className="px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 font-mono text-[10px] font-black border border-emerald-500/30 transition-all active:scale-95 cursor-pointer"
                    title="1 dakika ileri al"
                  >
                    +1 dk
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustStoryTime(5)}
                    className="px-1.5 py-0.5 rounded-lg bg-background hover:bg-muted/20 border border-border text-muted hover:text-text font-mono text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                    title="5 dakika ileri al"
                  >
                    +5 dk
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustStoryTime(15)}
                    className="px-1.5 py-0.5 rounded-lg bg-background hover:bg-muted/20 border border-border text-muted hover:text-text font-mono text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                    title="15 dakika ileri al"
                  >
                    +15 dk
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustStoryTime(60)}
                    className="px-1.5 py-0.5 rounded-lg bg-background hover:bg-muted/20 border border-border text-muted hover:text-text font-mono text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                    title="1 saat ileri al"
                  >
                    +1 sa
                  </button>

                  <div className="w-[1px] h-3.5 bg-border mx-1 shrink-0 hidden sm:block" />

                  {/* Otomatik +1 dk İlerleme Aç/Kapa */}
                  <button
                    type="button"
                    onClick={() => setAutoAdvanceTime((prev) => !prev)}
                    className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer active:scale-95 ${
                      autoAdvanceTime
                        ? 'bg-primary/15 text-primary border border-primary/40'
                        : 'bg-background hover:bg-muted/20 border border-border text-muted hover:text-text'
                    }`}
                    title="Her mesaj gönderildiğinde saati otomatik +1 dakika ilerlet"
                  >
                    <Sparkles size={10} />
                    <span>Oto +1dk: {autoAdvanceTime ? 'Açık' : 'Kapalı'}</span>
                  </button>
                </div>
              </div>

              {/* Hızlı Zaman Atlama Şablonları (Sistem Mesajı Modunda) */}
              {isSystemMode && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs animate-in fade-in slide-in-from-top-1 duration-150 scrollbar-none">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Clock size={11} /> Şablonlar:
                  </span>
                  {[
                    { label: '15 Dk Sonra', text: '15 dakika sonra...', addMins: 15 },
                    { label: '30 Dk Sonra', text: 'Yarım saat sonra...', addMins: 30 },
                    { label: '1 Saat Sonra', text: '1 saat sonra...', addMins: 60 },
                    { label: '3 Saat Sonra', text: '3 saat sonra...', addMins: 180 },
                    { label: 'Ertesi Sabah (08:30)', text: 'Ertesi sabah...', setTime: '08:30' },
                    { label: 'Gece Yarısı (00:00)', text: 'Gece yarısı...', setTime: '00:00' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInputText(preset.text);
                        if (preset.addMins) {
                          setStoryTime((prev) => addMinutesToTimeStr(prev, preset.addMins));
                        } else if (preset.setTime) {
                          setStoryTime(preset.setTime);
                        }
                        messageInputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium shrink-0 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2 bg-background border border-border/60 focus-within:border-emerald-500/70 rounded-2xl p-2 transition-colors shadow-sm">
                <textarea
                  ref={messageInputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isSystemMode
                      ? 'Örn: Gece 03:15... veya Can kapıyı kilitledi.'
                      : `${activeChar?.name || 'Karakter'} bir şey söylüyor... (Enter ile gönder, Shift+Enter yeni satır)`
                  }
                  rows={2}
                  className="flex-1 bg-transparent text-base sm:text-sm text-foreground placeholder:text-muted focus:outline-none resize-none leading-relaxed p-1"
                />

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shrink-0 active:scale-95 transition-all disabled:opacity-40 shadow-sm cursor-pointer"
                  title="Gönder (Enter)"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── SAĞ BÖLME: CANLI TELEFON SİMÜLATÖRÜ (Masaüstü Ekran Yüksekliğine & Boyutuna Kusursuz Adapte) ── */}
        <div
          className={`h-full flex-col items-center justify-center p-3 sm:p-5 bg-muted/10 overflow-hidden relative transition-all duration-200 ${
            // Mobil ekran:
            mobileTab === 'preview' ? 'flex w-full' : 'hidden'
          } ${
            // Masaüstü ekran:
            viewMode === 'split' 
              ? 'lg:flex lg:w-[42%] xl:w-[40%]' 
              : viewMode === 'preview' 
              ? 'lg:flex lg:w-full' 
              : 'lg:hidden'
          }`}
        >
          {/* Simülatör Üst Kontrolleri (Önizleme Başlığı, Ölçekleme & Dokunarak Test) */}
          <div className="w-full max-w-sm flex items-center justify-between gap-2 mb-2.5 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-muted flex items-center gap-1">
                <Smartphone size={14} className="text-emerald-500" />
                <span>Canlı Önizleme</span>
              </span>
              <span className="text-[11px] font-mono text-muted/70">
                {messages.length} Mesaj
              </span>
            </div>

            {/* Ölçekleme & Test Butonları */}
            <div className="flex items-center gap-1.5">
              {/* Ölçek Düğmesi */}
              <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-card border border-border/40 text-[10px] font-bold text-muted">
                <button
                  type="button"
                  onClick={() => setPhoneScale((prev) => Math.max(0.85, Number((prev - 0.1).toFixed(2))))}
                  className="hover:text-foreground p-0.5"
                  title="Küçült"
                >
                  <ZoomOut size={12} />
                </button>
                <span className="font-mono">{Math.round(phoneScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setPhoneScale((prev) => Math.min(1.15, Number((prev + 0.1).toFixed(2))))}
                  className="hover:text-foreground p-0.5"
                  title="Büyüt"
                >
                  <ZoomIn size={12} />
                </button>
              </div>

              {/* Dokunarak Test Et Butonu */}
              {isTestMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => setRevealedCount(0)}
                    className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted/20 border border-border/50 text-[11px] font-bold text-muted hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
                    title="Başa sar"
                  >
                    <RotateCcw size={12} />
                    <span>Başa Sar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTestMode(false);
                      setRevealedCount(messages.length);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted/20 border border-border/50 text-[11px] font-bold text-muted hover:text-foreground transition-all cursor-pointer"
                  >
                    Tümünü Gör
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsTestMode(true);
                    setRevealedCount(0);
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[11px] font-black text-emerald-400 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                  title="Okuyucu gibi dokunarak tek tek aç"
                >
                  <Play size={12} />
                  <span>Dokunarak Test Et</span>
                </button>
              )}
            </div>
          </div>

          {/* Akıllı Telefon Mockup Çerçevesi (Masaüstü Ekran Yüksekliğine Tam Adapte 9:19.2 Aspect Ratio) */}
          <div
            onClick={handleSimulatorTap}
            style={{
              height: `min(calc(100dvh - 130px), ${viewMode === 'preview' ? '860px' : '800px'})`,
              aspectRatio: '9 / 19.2',
              transform: phoneScale !== 1 ? `scale(${phoneScale})` : undefined,
              transformOrigin: 'center center',
            }}
            className={`w-auto max-w-full rounded-[40px] border-[7px] border-border/80 bg-background shadow-2xl shadow-black/40 flex flex-col overflow-hidden relative cursor-pointer select-none transition-all duration-200 ${
              isTestMode ? 'ring-2 ring-emerald-500/60 shadow-emerald-500/10' : ''
            }`}
          >
            {/* Telefon Üst Çentik & Hoparlör */}
            <div className="h-6 bg-card/90 flex items-center justify-between px-6 text-[10px] font-semibold text-muted shrink-0 z-10 border-b border-border/20">
              <span>09:41</span>
              <div className="w-14 h-3.5 bg-background rounded-full border border-border/30" />
              <span>%100</span>
            </div>

            {/* WhatsApp / Chat Üst Barı */}
            <div className="p-3 bg-card/90 border-b border-border/30 flex items-center gap-2.5 shrink-0 z-10">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                {isGroupChat ? (
                  <Users size={16} />
                ) : partnerChar.avatarUrl ? (
                  <img src={partnerChar.avatarUrl} alt={partnerChar.name} className="w-full h-full object-cover" />
                ) : (
                  partnerChar.name.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-foreground block truncate max-w-[130px]">
                    {isGroupChat ? (chapterTitle || story.title) : partnerChar.name}
                  </span>
                  {isGroupChat && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                      {activePartners.length} Kişi
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold leading-none mt-0.5">
                  {isGroupChat ? (
                    <span className="text-muted truncate block text-[9px] max-w-[160px]">
                      {activePartners.map(p => p.name).join(', ')}
                    </span>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>çevrimiçi</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Sohbet Gövdesi / Balonlar */}
            <div 
              ref={simulatorContainerRef}
              className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-gradient-to-b from-card/30 via-background to-card/20 relative scroll-smooth"
            >
              {displayedMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted p-4">
                  <span className="text-xs">
                    {isTestMode
                      ? '👉 Mesajları açmak için ekrana dokunun!'
                      : 'Henüz mesaj eklenmedi.'}
                  </span>
                </div>
              ) : (
                displayedMessages.map((msg) => {
                  const sender = characters.find((c) => c.id === msg.senderId);
                  const isSelf = sender?.isSelf || false;
                  const isSystem = msg.type === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2 animate-in fade-in zoom-in-95 duration-200">
                        <span className="px-3 py-1 rounded-full bg-card/80 border border-border/50 text-[10px] font-bold text-amber-400 text-center shadow-xs">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                    >
                      {!isSelf && (
                        <span
                          className="text-[10px] font-bold px-1 mb-0.5"
                          style={{ color: sender?.color || '#3b82f6' }}
                        >
                          {sender?.name}
                        </span>
                      )}

                      {msg.type === 'image' && msg.mediaUrl ? (
                        <div
                          className={`relative max-w-[82%] rounded-2xl overflow-hidden shadow-md group cursor-pointer select-none transition-all ${
                            isSelf ? 'rounded-br-xs' : 'rounded-bl-xs'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(msg.mediaUrl || null);
                          }}
                          title="Büyük görmek için tıklayın"
                        >
                          <img
                            src={msg.mediaUrl}
                            alt="Medya"
                            className="w-full max-h-56 object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md">
                              <Maximize2 size={16} />
                            </span>
                          </div>
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-mono flex items-center gap-1 shadow-sm select-none z-10">
                            <span>{msg.time || '12:00'}</span>
                            {isSelf && <Check size={11} className="text-sky-300 inline" />}
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm relative ${
                            isSelf
                              ? 'bg-emerald-600 text-white rounded-br-xs'
                              : 'bg-card border border-border/60 text-foreground rounded-bl-xs'
                          }`}
                        >
                          <p className="break-words">{msg.text}</p>
                          <span className="text-[9px] opacity-70 block text-right mt-1 font-mono">
                            {msg.time}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              {/* Listenin en sonuna sabitleyen görünmez referans */}
              <div ref={simulatorEndRef} className="h-4" />
            </div>

            {/* Test Modu Dokunma İpucu (Altta) */}
            {isTestMode && (
              <div className="p-2.5 bg-card/90 border-t border-border/40 text-center shrink-0 text-[10px] font-bold text-emerald-400">
                {revealedCount < messages.length ? (
                  <span>👆 Dokunarak sonraki mesajı getir ({revealedCount}/{messages.length})</span>
                ) : (
                  <span>🎉 Tüm mesajlar görüntülendi!</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL 1: YENİ KONUŞMACI / KARAKTER EKLEME ── */}
      {isCharModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-extrabold text-base text-foreground">
                {editingCharId ? 'Karakteri Düzenle' : 'Yeni Konuşmacı Ekle'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCharModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-muted/10 hover:bg-muted/20 flex items-center justify-center text-muted cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted block mb-1">Karakter Adı *</label>
                <input
                  type="text"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  placeholder="Örn: Ece veya Bilinmeyen Numara"
                  className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1">Balon Rengi</label>
                <div className="flex items-center gap-2">
                  {['#10b981', '#3b82f6', '#6366f1', '#ec4899', '#f59e0b', '#ef4444'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCharColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        newCharColor === color ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1">Profil Fotoğrafı (İsteğe bağlı)</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-border/60 hover:border-emerald-500/50 cursor-pointer bg-background/50 text-xs font-bold text-muted hover:text-foreground transition-all shrink-0">
                    <Upload size={14} />
                    <span>{isUploadingAvatar ? 'Yükleniyor...' : 'Fotoğraf Yükle'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      disabled={isUploadingAvatar}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={newCharAvatar}
                    onChange={(e) => setNewCharAvatar(e.target.value)}
                    placeholder="veya https://..."
                    className="flex-1 bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {newCharAvatar && (
                  <div className="flex items-center gap-2 mt-2">
                    <img src={newCharAvatar} alt="Önizleme" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                    <span className="text-[10px] text-muted truncate">{newCharAvatar}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isSelfCheck"
                  checked={newCharIsSelf}
                  onChange={(e) => setNewCharIsSelf(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="isSelfCheck" className="text-xs font-bold text-foreground cursor-pointer">
                  Bu karakter "Ben" (Sağ yeşil balon) olsun
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
              {editingCharId && characters.length > 1 ? (
                <button
                  type="button"
                  onClick={() => handleDeleteCharacter(editingCharId)}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Sil</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCharModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-card hover:bg-muted/20 text-xs font-bold text-muted cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleSaveCharacter}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-extrabold hover:bg-emerald-400 transition-all cursor-pointer"
                >
                  {editingCharId ? 'Güncelle' : 'Karakteri Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: GÖRSEL / FOTOĞRAF EKLEME ── */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-extrabold text-base text-foreground">Sohbete Fotoğraf Ekle</h3>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-muted/10 hover:bg-muted/20 flex items-center justify-center text-muted cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-muted">Görsel Dosyası Yükle</label>
                  <span className="text-[10px] text-emerald-400 font-semibold">⚡ Otomatik optimize edilir</span>
                </div>
                <label className="flex flex-col items-center justify-center gap-1.5 w-full p-4 rounded-xl border border-dashed border-border/60 hover:border-emerald-500/50 cursor-pointer bg-background/50 text-xs font-bold text-muted hover:text-foreground transition-all text-center">
                  <Upload size={20} className="text-emerald-400" />
                  <span>{isUploadingImage ? 'Optimize ediliyor ve yükleniyor...' : 'Cihazdan Fotoğraf Seç'}</span>
                  <span className="text-[10px] text-muted font-normal">Maks. 1280px web formatına sıkıştırılır, depolama ve sunucu korunur</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center text-[10px] text-muted font-bold uppercase tracking-wider">veya</div>

              <div>
                <label className="text-xs font-bold text-muted block mb-1">Görsel Bağlantısı (URL)</label>
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-card hover:bg-muted/20 text-xs font-bold text-muted cursor-pointer"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={() => handleAddImageMessage(imageUrlInput)}
                disabled={!imageUrlInput.trim()}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-extrabold hover:bg-emerald-400 transition-all disabled:opacity-40 cursor-pointer"
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: READIXON ÖZEL HİKAYE VE MESAJ SAATİ SEÇİCİ ── */}
      {timePicker.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-5 sm:p-6 space-y-4 shadow-2xl shadow-black/40 animate-in zoom-in-95 duration-200 text-text">
            {/* Başlık & Kapat */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-text">
                    {timePicker.target === 'story' ? 'Hikaye Saatini Ayarla' : 'Mesaj Saatini Düzenle'}
                  </h3>
                  <p className="text-[11px] text-muted">
                    {timePicker.target === 'story' ? 'Kurgudaki anlık sohbet zamanı' : 'Bu mesajın kurgusal zamanı'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTimePicker((prev) => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-xl bg-muted/10 hover:bg-muted/20 flex items-center justify-center text-muted hover:text-text transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Dijital Saat Göstergesi & Stepper'lar */}
            <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-center gap-4 select-none">
              {/* Saat Sütunu */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => changeHour(1)}
                  className="w-16 h-8 rounded-xl bg-card hover:bg-muted/20 text-muted hover:text-text flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-border"
                  title="1 saat ileri"
                >
                  <ChevronUp size={16} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={String(timePicker.hours).padStart(2, '0')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
                    if (!isNaN(val)) setTimePicker((prev) => ({ ...prev, hours: Math.min(23, Math.max(0, val)) }));
                    else if (e.target.value === '') setTimePicker((prev) => ({ ...prev, hours: 0 }));
                  }}
                  className="w-16 h-16 rounded-2xl bg-card border-2 border-border focus:border-emerald-500 text-center font-mono text-3xl font-black text-text focus:outline-none transition-colors shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => changeHour(-1)}
                  className="w-16 h-8 rounded-xl bg-card hover:bg-muted/20 text-muted hover:text-text flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-border"
                  title="1 saat geri"
                >
                  <ChevronDown size={16} />
                </button>
                <span className="text-[10px] font-extrabold text-muted tracking-wider uppercase mt-0.5">Saat</span>
              </div>

              {/* İki Nokta (Yanıp sönen şık ayrım) */}
              <div className="flex flex-col items-center justify-center pb-6">
                <span className="text-3xl font-black text-emerald-500 animate-pulse">:</span>
              </div>

              {/* Dakika Sütunu */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => changeMinute(1)}
                  className="w-16 h-8 rounded-xl bg-card hover:bg-muted/20 text-muted hover:text-text flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-border"
                  title="1 dakika ileri"
                >
                  <ChevronUp size={16} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={String(timePicker.minutes).padStart(2, '0')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
                    if (!isNaN(val)) setTimePicker((prev) => ({ ...prev, minutes: Math.min(59, Math.max(0, val)) }));
                    else if (e.target.value === '') setTimePicker((prev) => ({ ...prev, minutes: 0 }));
                  }}
                  className="w-16 h-16 rounded-2xl bg-card border-2 border-border focus:border-emerald-500 text-center font-mono text-3xl font-black text-text focus:outline-none transition-colors shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => changeMinute(-1)}
                  className="w-16 h-8 rounded-xl bg-card hover:bg-muted/20 text-muted hover:text-text flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-border"
                  title="1 dakika geri"
                >
                  <ChevronDown size={16} />
                </button>
                <span className="text-[10px] font-extrabold text-muted tracking-wider uppercase mt-0.5">Dakika</span>
              </div>
            </div>

            {/* Hızlı Dakika Adımları */}
            <div>
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block mb-1.5">
                Hızlı Adımlar:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[-15, -5, -1, 1, 5, 10, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => changeMinute(mins)}
                    className={`py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all active:scale-95 cursor-pointer border ${
                      mins > 0
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                        : 'bg-background hover:bg-muted/20 text-muted hover:text-text border-border'
                    }`}
                  >
                    {mins > 0 ? `+${mins}` : mins} dk
                  </button>
                ))}
              </div>
            </div>

            {/* Kurgusal Atmosfer Şablonları */}
            <div>
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block mb-1.5">
                Kurgusal Atmosfer Şablonları:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '🌅 08:00 Sabah', h: 8, m: 0 },
                  { label: '☀️ 13:00 Öğlen', h: 13, m: 0 },
                  { label: '🌇 18:30 Akşamüstü', h: 18, m: 30 },
                  { label: '🌃 21:30 Gece', h: 21, m: 30 },
                  { label: '🕯️ 00:00 Gece Yarısı', h: 0, m: 0 },
                  { label: '👻 03:30 Tekinsiz', h: 3, m: 30 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setExactTime(preset.h, preset.m)}
                    className="px-2.5 py-1 rounded-xl bg-background hover:bg-card text-text border border-border text-[11px] font-medium transition-all active:scale-95 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setExactTime(now.getHours(), now.getMinutes());
                  }}
                  className="px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                >
                  ⚡ Şu Anki Saat
                </button>
              </div>
            </div>

            {/* Mesaj Modu İçin Zincirleme Öteleme Seçeneği */}
            {timePicker.target === 'message' && (
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-muted/10 border border-border cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={timePicker.shiftRemaining}
                  onChange={(e) => setTimePicker((prev) => ({ ...prev, shiftRemaining: e.target.checked }))}
                  className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <span className="font-extrabold text-text block">Sonraki mesajları da bu fark kadar ötele</span>
                  <span className="text-[11px] text-muted leading-tight block mt-0.5">
                    Sohbet akışının temposunu korumak için sonraki tüm mesajlar zincirleme güncellenir.
                  </span>
                </div>
              </label>
            )}

            {/* Aksiyon Butonları */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={() => setTimePicker((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-card hover:bg-muted/20 border border-border text-xs font-bold text-muted hover:text-text transition-all cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleApplyTimePicker}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Uygula ({String(timePicker.hours).padStart(2, '0')}:{String(timePicker.minutes).padStart(2, '0')})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: GÖRSEL BÜYÜTME (LIGHTBOX - GERİ DÖNÜŞ VE ESC DESTEKLİ) ── */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          {/* Üst Bar: Sohbete Dön & Kapat */}
          <div className="absolute top-[calc(1rem+env(safe-area-inset-top,0px))] right-4 sm:right-6 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="px-3.5 py-1.5 rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer backdrop-blur-sm shadow-sm"
              aria-label="Sohbete Dön"
            >
              <ArrowLeft size={16} />
              <span>Sohbete Dön</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 active:scale-90 transition-all cursor-pointer backdrop-blur-sm shadow-sm"
              aria-label="Kapat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Görsel Konteyneri */}
          <div 
            className="max-w-4xl max-h-[85vh] p-2 flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Önizleme"
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
