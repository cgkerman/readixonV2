/**
 * Firebase Client — Uygulama Başlatma & Servis Exportları
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Bu dosya Firebase istemci SDK'sını başlatır ve uygulama genelinde
 * tek bir FirebaseApp örneğinin (singleton) çalışmasını garantiler.
 *
 * KURULUM ADIMLARI:
 * 1. Firebase Console'dan (https://console.firebase.google.com) bir proje oluştur.
 * 2. "Proje Ayarları > Genel > Uygulamalarınız" altında yeni bir Web uygulaması ekle.
 * 3. Sağlanan firebaseConfig nesnesini kopyala.
 * 4. apps/mobile/.env ve apps/web/.env.local dosyalarına aşağıdaki değişkenleri ekle:
 *
 *    EXPO_PUBLIC_FIREBASE_API_KEY=...
 *    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
 *    EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
 *    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
 *    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
 *    EXPO_PUBLIC_FIREBASE_APP_ID=...
 *
 * ⚠️  GÜVENLİK: Bu dosyaya kesinlikle gerçek API anahtarı yazma.
 *    Tüm credentials .env dosyasından okunacak.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// ─────────────────────────────────────────────
// Firebase Konfigürasyon Tipi
// ─────────────────────────────────────────────

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// ─────────────────────────────────────────────
// Konfigürasyon Nesnesi
// Expo: EXPO_PUBLIC_ prefix ile env değişkenleri okunur.
// Next.js: NEXT_PUBLIC_ prefix kullanılır (apps/web'de override edilir).
// ─────────────────────────────────────────────

const firebaseConfig: FirebaseConfig = {
  apiKey:
    process.env['EXPO_PUBLIC_FIREBASE_API_KEY'] ??
    process.env['NEXT_PUBLIC_FIREBASE_API_KEY'] ??
    'mock-api-key',
  authDomain:
    process.env['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'] ??
    process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] ??
    'mock-auth-domain',
  projectId:
    process.env['EXPO_PUBLIC_FIREBASE_PROJECT_ID'] ??
    process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] ??
    'mock-project-id',
  storageBucket:
    process.env['EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'] ??
    process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] ??
    'mock-storage-bucket',
  messagingSenderId:
    process.env['EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] ??
    process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] ??
    'mock-sender-id',
  appId:
    process.env['EXPO_PUBLIC_FIREBASE_APP_ID'] ??
    process.env['NEXT_PUBLIC_FIREBASE_APP_ID'] ??
    'mock-app-id',
};

// ─────────────────────────────────────────────
// Singleton Başlatma
// Hot-reload ortamlarında (Next.js dev, Expo Metro) birden fazla
// initializeApp çağrısını önler.
// ─────────────────────────────────────────────

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

/** Readixon Firebase uygulama örneği (singleton) */
export const firebaseApp: FirebaseApp = getFirebaseApp();

/** Firebase Authentication servisi */
export const auth: Auth = getAuth(firebaseApp);

/** Firestore veritabanı servisi */
export const db: Firestore = getFirestore(firebaseApp);

/** Firebase Storage servisi */
export const storage: FirebaseStorage = getStorage(firebaseApp);
