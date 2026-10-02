# 📱 Readixon Mobil Uygulama & Mimari Hafıza Kaydı

Bu doküman, Readixon projesinin Capacitor 8 Android mobil dönüşümü, Google Sign-In entegrasyonu, tasarım bileşenleri ve teknik yapılandırmalarını kalıcı olarak hafızada tutmak için hazırlanmıştır.

---

## 1. Proje & Paket Bilgileri
- **Uygulama Adı:** Readixon
- **Android Package Name (Application ID):** `com.readixon.app`
- **Capacitor Sürümü:** 8.5.2
- **Gradle Sürümü:** Gradle 9.6.0 & Android Gradle Plugin (AGP) 9.4.1
- **Target / Compile SDK:** 36 | **Min SDK:** 24
- **Canlı URL:** `https://www.readixon.com` (`apps/web/capacitor.config.ts`)

---

## 2. Google OAuth & Firebase Kimlik Doğrulama
- **Eklenti:** `@capawesome/capacitor-google-sign-in` (Capacitor 8 ve Android Credential Manager resmi eklentisi)
- **Web Client ID (Server Client ID):**
  `812011581796-qrc8cjbt5ob0rg89vask9tto9ptjdvlv.apps.googleusercontent.com`
- **Firebase Proje ID:** `readixon-754ec`
- **Firebase Yapılandırma Dosyası:** `apps/web/android/app/google-services.json`
- **Yerel Geliştirme Keystore SHA Parmak İzleri:**
  - **SHA-1:** `FA:D2:E9:F4:7C:22:29:B5:57:E0:41:4D:ED:FD:2B:E6:FF:AB:7B:52`
  - **SHA-256:** `C1:2D:0B:1D:0E:26:60:36:15:B8:B7:04:82:BE:92:FF:07:FC:4D:E0:96:45:6D:8A:9C:E8:6A:43:87:AD:BB:71`

### Kritik MainActivity Yapılandırması:
Capacitor'ün Android köprüsünde GoogleSignIn eklentisini garanti olarak tanıması için `apps/web/android/app/src/main/java/com/readixon/app/MainActivity.java`:
```java
package com.readixon.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import io.capawesome.capacitorjs.plugins.googlesignin.GoogleSignInPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GoogleSignInPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
```

---

## 3. Giriş Bileşeni (Login11AuthCard) Çalışma Mantığı
[Login11AuthCard.tsx](file:///c:/dev/readixondev/apps/web/src/components/auth/Login11AuthCard.tsx):
- `Capacitor.isNativePlatform()` veya `window.androidBridge` kontrolü ile cihazın mobilde olup olmadığı belirlenir.
- **Mobilde ise:** `@capawesome/capacitor-google-sign-in` dinamik olarak çağrılır (`GoogleSignIn.initialize` + `GoogleSignIn.signIn`). Alınan `idToken`, Firebase Auth `signInWithGoogleCredential(idToken, true)` metoduna verilerek oturum açılır. (Asla web popup'ı açılmaz).
- **Masaüstü Web'de ise:** Standart `signInWithGoogleWeb()` (Firebase `signInWithPopup`) devreye girer.

---

## 4. Özel Mobil Arayüz Bileşenleri
- **Uygulama İkonları:** `apps/web/src/app/icon.png` dosyasından `scripts/generate-android-icons.ps1` ile tüm `mipmap-*` çözünürlükleri üretilmiştir.
- **Mobil Onboarding Ekranı:** [MobileAppOnboarding.tsx](file:///c:/dev/readixondev/apps/web/src/components/MobileAppOnboarding.tsx) (Sadece native platformda ana sayfada açılır).
- **Mobil Üst Bar:** [MobileAppHeader.tsx](file:///c:/dev/readixondev/apps/web/src/components/navigation/MobileAppHeader.tsx)
- **Mobil Yüzen Alt Bar (Dock):** [MobileAppBottomNav.tsx](file:///c:/dev/readixondev/apps/web/src/components/navigation/MobileAppBottomNav.tsx)
- **Mobil Yan Çekmece:** [MobileAppDrawer.tsx](file:///c:/dev/readixondev/apps/web/src/components/navigation/MobileAppDrawer.tsx)
- **İndirme Bannerı:** [AppDownloadBanner.tsx](file:///c:/dev/readixondev/apps/web/src/components/AppDownloadBanner.tsx) (`/feed` sayfasında yer alır).

---

## 5. Güncelleme Döngüsü
- **Web UI & İçerik Değişiklikleri:** Canlı URL (`https://www.readixon.com`) yüklendiği için, web sitesine yapılan her commit/deploy APK'yı güncellemeye gerek kalmadan kullanıcılara anında yansır.
- **Yeni APK Gerektiren Durumlar:** Native eklenti ekleme/çıkarma, uygulama simgesi/adı değiştirme veya AndroidManifest izin değişikliklerinde yeni APK derlenir.
