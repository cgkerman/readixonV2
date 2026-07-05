/**
 * Readixon — Firebase Authentication Servisi
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Desteklenen auth yöntemleri:
 *  - E-posta / Şifre
 *  - Google Sign-in (expo-auth-session üzerinden OAuth 2.0 → Firebase credential)
 *
 * Mimari doküman referansı:
 *  - Kimlik Doğrulama: Firebase Auth (Email, Google, Apple Sign-in)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  signInWithPopup,
  sendEmailVerification as firebaseSendEmailVerification,
  type User as FirebaseUser,
  type Unsubscribe,
  type UserCredential,
} from 'firebase/auth';

import { auth } from '../firebase';
import { createUserProfile } from '../services/userService';

// ─────────────────────────────────────────────
// Tip Tanımları
// ─────────────────────────────────────────────

export interface AuthResult {
  user: FirebaseUser;
  isNewUser: boolean;
}

export interface AuthError {
  code: string;
  message: string;
}

// ─────────────────────────────────────────────
// E-posta / Şifre ile Kayıt
// ─────────────────────────────────────────────

/**
 * Yeni kullanıcı kaydı oluşturur.
 * Kayıt başarılıysa Firestore'da kullanıcı dokümanını da oluşturur.
 *
 * @param email - Kullanıcı e-postası
 * @param password - En az 6 karakter şifre
 * @param displayName - Görünen ad (zorunlu)
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  username: string,
): Promise<AuthResult> {
  const credential: UserCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const { user } = credential;

  // Firebase Auth profilini güncelle
  await updateProfile(user, { displayName });

  // Firestore'da kullanıcı dokümanı oluştur (mimari şemaya uygun)
  await createUserProfile({
    uid: user.uid,
    username,
    displayName,
    avatarUrl: user.photoURL ?? '',
  });

  return { user, isNewUser: true };
}

// ─────────────────────────────────────────────
// E-posta / Şifre ile Giriş
// ─────────────────────────────────────────────

/**
 * Mevcut kullanıcıyı e-posta ve şifreyle doğrular.
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const credential: UserCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return { user: credential.user, isNewUser: false };
}

// ─────────────────────────────────────────────
// Google ile Giriş (Firebase credential aşaması)
// ─────────────────────────────────────────────

/**
 * Google OAuth akışından alınan `idToken` ile Firebase'e giriş yapar.
 *
 * Bu fonksiyon doğrudan çağrılmaz; `apps/mobile/src/hooks/useGoogleAuth.ts`
 * tarafından OAuth akışı tamamlandıktan sonra çağrılır.
 *
 * Akış:
 *  1. Kullanıcı butona basar
 *  2. expo-auth-session Google OAuth sayfasını açar
 *  3. Kullanıcı onaylar → idToken döner
 *  4. Bu fonksiyon çağrılır → Firebase'e kaydedilir
 *
 * @param idToken - Google'dan alınan OAuth ID token
 * @param isNewUser - Yeni kullanıcı mı? (Google akışında ek kontrol yapılır)
 */
export async function signInWithGoogleCredential(
  idToken: string,
  isNewUser: boolean = false,
): Promise<AuthResult> {
  const googleCredential = GoogleAuthProvider.credential(idToken);
  const result: UserCredential = await signInWithCredential(auth, googleCredential);

  const { user } = result;

  // Yeni kullanıcıysa Firestore profili oluştur
  if (isNewUser) {
    let avatarUrl = user.photoURL ?? '';
    // Google profil fotoğrafını yüksek çözünürlüklü yap (96px -> 400px)
    if (avatarUrl.includes('=s96-c')) {
      avatarUrl = avatarUrl.replace('=s96-c', '=s400-c');
    }

    await createUserProfile({
      uid: user.uid,
      displayName: user.displayName ?? '',
      avatarUrl,
    });
  }

  return { user, isNewUser };
}

// ─────────────────────────────────────────────
// Google ile Giriş (Web)
// ─────────────────────────────────────────────

/**
 * Web için Google OAuth akışını popup üzerinden başlatır ve Firebase'e giriş yapar.
 */
export async function signInWithGoogleWeb(): Promise<AuthResult> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const { user } = result;
  
  // Yeni kullanıcı mı yoksa mevcut mu kontrol edebiliriz (creationTime ile lastSignInTime yakınsa yeni kabul edilebilir)
  // Ancak en güvenlisi Firestore'da profil var mı diye bakmak
  const { getUserProfile } = await import('../services/userService');
  let isNewUser = false;
  
  const existingProfile = await getUserProfile(user.uid);
  if (!existingProfile) {
    isNewUser = true;
    let avatarUrl = user.photoURL ?? '';
    // Google profil fotoğrafını yüksek çözünürlüklü yap (96px -> 400px)
    if (avatarUrl.includes('=s96-c')) {
      avatarUrl = avatarUrl.replace('=s96-c', '=s400-c');
    }

    await createUserProfile({
      uid: user.uid,
      displayName: user.displayName ?? '',
      avatarUrl,
    });
  }

  return { user, isNewUser };
}

// ─────────────────────────────────────────────
// Oturum Kapatma
// ─────────────────────────────────────────────

/**
 * Mevcut kullanıcının oturumunu kapatır.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ─────────────────────────────────────────────
// Auth Durumu Dinleyicisi
// ─────────────────────────────────────────────

/**
 * Auth durumu değişikliklerini dinler (giriş/çıkış, token yenileme).
 * `useAuth` hook'u tarafından kullanılır.
 *
 * @param callback - Kullanıcı değiştiğinde çağrılır (null = çıkış yapıldı)
 * @returns Unsubscribe fonksiyonu (cleanup için)
 */
export function onAuthStateChanged(
  callback: (user: FirebaseUser | null) => void,
): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}

// ─────────────────────────────────────────────
// Mevcut Kullanıcı
// ─────────────────────────────────────────────

/**
 * Anlık auth durumunu döner. Reaktif değil; anlık snapshot.
 * Reaktif kullanım için `onAuthStateChanged` veya `useAuth` hook'unu kullan.
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

// ─────────────────────────────────────────────
// Firebase Hata Kodları → Türkçe Mesajlar
// ─────────────────────────────────────────────

/**
 * Firebase auth hata kodlarını kullanıcı dostu Türkçe mesajlara çevirir.
 * Ekranlarda `error.message` yerine bu fonksiyon kullanılmalı.
 */
export function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/user-not-found': 'Bu e-posta adresine ait hesap bulunamadı.',
    'auth/wrong-password': 'Hatalı şifre. Lütfen tekrar dene.',
    'auth/invalid-credential': 'E-posta veya şifre hatalı.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
    'auth/too-many-requests': 'Çok fazla başarısız deneme. Lütfen bekle.',
    'auth/network-request-failed': 'İnternet bağlantını kontrol et.',
    'auth/popup-closed-by-user': 'Google girişi iptal edildi.',
    'auth/cancelled-popup-request': 'Google girişi iptal edildi.',
  };

  return messages[code] ?? 'Beklenmeyen bir hata oluştu. Lütfen tekrar dene.';
}

// ─────────────────────────────────────────────
// E-posta Doğrulama
// ─────────────────────────────────────────────

/**
 * Oturumu açık olan kullanıcıya doğrulama e-postası gönderir.
 */
export async function sendVerificationEmail(user: FirebaseUser): Promise<void> {
  try {
    await firebaseSendEmailVerification(user);
  } catch (error: any) {
    console.error('Doğrulama e-postası gönderme hatası:', error);
    throw error;
  }
}
