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
  StoryHighlight,
  StoryWithLatestChapter,
  StoryStats,
  StoryStatus,
  Chapter,
  ChapterStats,
  ChapterReadingMetric,
  StoryReadingAnalytics,
  ChapterChoice,
  ChapterEndingType,
  ChatStoryCharacter,
  ChatStoryMessage,
  ChatStoryMessageType,
  ContentBlock,
  ContentBlockType,
  Comment,
  Review,
  ReviewAuthorReply,
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
  HeroBanner,
  SavedQuote,
  UserAchievements,
  ChapterActivity,
  ChapterActivityType,
  ActivityAnswer,
  AdminPoll,
  AdminPollOption,
  AdminQuote,
  EditorialReview,
  SitePopup,
  ChapterAudioTrack,
  ReadingList,
  LegalDocType,
  LegalSection,
  LegalDocument,
  // Seri Tipleri
  Series,
  SeriesBookItem,
  SeriesStats,
  SeriesStatus,
  // Evren Tipleri
  Universe,
  UniverseVisibility,
  UniverseGenre,
  UniverseStats,
  CharacterArc,
  CharacterRelationship,
  CharacterPNGGallery,
  UniverseLocation,
  LocationType,
  UniverseTimelineEvent,
  TimelineEventType,
  UniverseOrganization,
  OrganizationType,
  UniverseItem,
  UniversePowerSystem,
  PowerTier,
  UniverseGlossaryTerm,
  UniverseLore,
  LoreCategory,
  UniverseMap,
  UniverseMapMarker,
  UniverseMapRoute,
  MapMarkerIcon,
  MapType,
  UniverseRace,
  UniverseCreature,
  CreatureType,
  CreatureDangerLevel,
  UniverseCulture,
  CultureCategory,
  UniverseMedia,
  MediaCategory,
  UniverseSoundtrack,
  SoundtrackTheme,
  UniverseCanonRule,
  CanonRuleCategory,
  UniversePlotThread,
  PlotThreadStatus,
  PlotThreadImportance,
  PlotThreadClue,
  InlineEntityType,
  InlineUniverseEntity,
  UniverseMemberRole,
  UniverseMember,
} from './types';

export {
  UNIVERSE_GENRE_LABELS,
  getUniverseGenreLabel,
  LOCATION_TYPE_LABELS,
  CANON_RULE_CATEGORY_LABELS,
  PLOT_THREAD_STATUS_LABELS,
  PLOT_THREAD_IMPORTANCE_LABELS,
  UNIVERSE_MEMBER_ROLE_CONFIG,
  getUserUniverseRole,
  canManageUniverseMembers,
  canEditUniverseLore,
  canManageUniverseStories,
  canManageUniverseMedia,
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
  searchUsersByQuery,
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
export type { ReaderState, ReaderTheme, ReaderFontFamily, ReaderLineHeight, ReaderTextAlign, ReaderPaddingX } from './store/useReaderStore';

// Story Servisi

export * from './services/storyService';
export * from './services/seriesService';
export * from './services/universeService';
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
export * from './services/editorialService';
export * from './services/popupService';
export * from './services/readingListService';
export * from './services/legalService';
export * from './services/readingAnalyticsService';
export * from './utils/imageUtils';
export * from './utils/cropImageUtils';
export * from './utils/audioUtils';
export * from './constants/tags';
export * from './constants/genres';
export * from './services/genreFinder';
export * from './utils/slug';
export * from './utils/sanitize';
export * from './utils/loreAnnotation';
export * from './utils/blockParser';

// Auth Store & Hooks
export { useAuthStore } from './store/useAuthStore';
export { useThemeStore, isDarkTheme, defaultCustomColors, isColorDark } from './store/useThemeStore';
export type { Theme, CustomColors } from './store/useThemeStore';
export { useAuthListener } from './hooks/useAuthListener';
export { useUserProfile } from './hooks/useUserProfile';

// TODO: İlerleyen aşamalarda eklenecekler:
// export * from './store/storyStore';       // Zustand story cache
// export * from './services/commentService'; // Yorum servisi
export * from './services/characterService';
export * from './constants/badges';
export * from './services/achievementService';
export * from './services/systemService';
export * from './services/activityService';
export { slugify } from './utils/slugify';