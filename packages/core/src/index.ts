/**
 * @readixon/core — Barrel Export
 *
 * Ortak iş mantığı, Firebase servisleri, tipler ve Zustand store'ları
 * buradan export edilir.
 *
 * Kullanım:
 *   import { signUpWithEmail, getUserProfile } from '@readixon/core';
 *   import type { User, Story } from '@readixon/core';
 */

// Firebase singleton & servisler
export { firebaseApp, auth, db, storage } from './firebase';

// Tip tanımları (mimari şemalara birebir uyar)
export type {
  User,
  UserStats,
  CreateUserInput,
  Story,
  StoryStats,
  StoryStatus,
  Chapter,
  ContentBlock,
  ContentBlockType,
  Comment,
  Review,
  Contributor,
  Genre,
  ReadingProgress,
  Readix,
  ReadixComment,
  NotificationType,
  AppNotification,
  Chat,
  Message,
  ChatParticipant,
  ChatStatus,
  Duel,
  DuelTurn,
  DuelAuthor,
  DuelStatus,
  Report,
  ReportStatus,
  ReportTargetType,
  LobbyRoom,
  LobbyParticipant,
  LobbySubmission,
  LobbyVote,
  LobbyStatus,
  CurveballType,
  CurveballConfig,
  CurveballRoom,
  CurveballParticipant,
  CurveballSubmission,
  CurveballVote,
  CurveballStatus,
  Character,
  CharacterRole,
  CharacterRPGStats,
  Announcement,
  SavedQuote,
  UserAchievements,
} from './types';

// Auth servisi
export {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogleCredential,
  signInWithGoogleWeb,
  signOut,
  onAuthStateChanged,
  getCurrentUser,
  getAuthErrorMessage,
  sendVerificationEmail,
  sendPasswordReset,
} from './auth/authService';
export type { AuthResult, AuthError } from './auth/authService';

// Kullanıcı servisi
export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  becomeAuthor,
  getUserByUsername,
  getFeaturedAuthors,
  followUser,
  unfollowUser,
  checkIsFollowing,
  searchUsers,
  getUserFollowingIds,
  getUserFollowerIds,
  getUserFollowers,
  getUserFollowing,
  deleteUserAccount,
  blockUser,
  unblockUser,
  consumeFreeWizard,
  consumeFreeCharacterBook,
} from './services/userService';

// Store (Zustand)
export { useReaderStore, setReaderStorageEngine } from './store/useReaderStore';
export type { ReaderState } from './store/useReaderStore';

// Story Servisi

export * from './services/storyService';
export * from './services/storageService';
export * from './services/interactionService';
export * from './services/readixService';
export * from './services/duelService';
export * from './services/quoteService';
export * from './services/paymentService';
export * from './services/adminService';
export * from './services/notificationService';
export * from './services/chatService';
export * from './services/reportService';
export * from './services/lobbyService';
export * from './services/plannerService';
export * from './types/planner';
export * from './services/curveballService';
export * from './services/pointsService';
export * from './utils/imageUtils';
export * from './utils/cropImageUtils';
export * from './constants/tags';
export * from './utils/slug';

// Auth Store & Hooks
export { useAuthStore } from './store/useAuthStore';
export { useThemeStore } from './store/useThemeStore';
export type { Theme } from './store/useThemeStore';
export { useAuthListener } from './hooks/useAuthListener';
export { useUserProfile } from './hooks/useUserProfile';

// TODO: İlerleyen aşamalarda eklenecekler:
// export * from './store/storyStore';       // Zustand story cache
// export * from './services/commentService'; // Yorum servisi
export * from './services/characterService';
export * from './constants/badges';
export * from './services/achievementService';
export * from './services/systemService';

