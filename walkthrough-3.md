# Aşama 3 — Veri Yönetimi Katmanı (Zustand & React Query) Tamamlandı ✅

Bu aşamada, projenin durum (state) yönetimi ve sunucu-istemci senkronizasyonu için gerekli iskeleti kurduk. Uygulamaların çevrimdışı (offline-first) yeteneklere sahip olabilmesi ve performansı için kritik bir adımdır.

## Oluşturulan / Güncellenen Dosyalar

### 1. `packages/core` (Ortak İş Mantığı)
| Dosya | İçerik |
|-------|--------|
| [`src/store/useReaderStore.ts`](file:///c:/Users/cgker/OneDrive/Masaüstü/readixondev/packages/core/src/store/useReaderStore.ts) | Okuma ekranı için tema (light/dark/sepia) ve font boyutunu tutan Zustand Store. Monorepo için `universalStorage` ile geliştirildi. |
| [`src/services/storyService.ts`](file:///c:/Users/cgker/OneDrive/Masaüstü/readixondev/packages/core/src/services/storyService.ts) | Firestore'dan `/stories` çekmek için yazılan asenkron `fetchStories` fonksiyonu. Sonsuz kaydırma (startAfter) destekli. |
| [`src/index.ts`](file:///c:/Users/cgker/OneDrive/Masaüstü/readixondev/packages/core/src/index.ts) | `useReaderStore` ve `storyService` dışa aktarımları eklendi. |

### 2. `apps/web` (Next.js - Yazar Platformu)
| Dosya | İçerik |
|-------|--------|
| [`src/app/providers.tsx`](file:///c:/Users/cgker/OneDrive/Masaüstü/readixondev/apps/web/src/app/providers.tsx) | `QueryClientProvider` tanımı. React Server Components uyumlu hale getirildi. |
| [`src/app/layout.tsx`](file:///c:/Users/cgker/OneDrive/Masaüstü/readixondev/apps/web/src/app/layout.tsx) | `Providers` bileşeni en dış sarmalayıcı (wrapper) olarak eklendi. |

### 3. `apps/mobile` (Expo - Okuyucu Platformu)
| Dosya | İçerik |
|-------|--------|
| [`App.tsx`](file:///c:/Users/cgker/OneDrive/Masaüstü/readixondev/apps/mobile/App.tsx) | `QueryClientProvider` kuruldu ve Zustand store'u için kalıcı bellek motoru (storage engine) olarak `AsyncStorage` sisteme enjekte edildi. |

---

## 🏗️ Mimari Detaylar

### Cross-Platform Persist (Kalıcı Bellek)
Zustand kullanırken kalıcı depolama için Web tarafında `localStorage`, React Native tarafında ise `AsyncStorage` kullanılmalıdır. `core` paketi platform bağımsız olduğu için akıllı bir `universalStorage` motoru tasarlandı:
1. Web'de çalışıyorsa otomatik `localStorage` kullanır.
2. React Native'de çalışıyorsa uygulamanın giriş noktası olan `App.tsx` üzerinden `@react-native-async-storage/async-storage` modülü enjekte edilir.

### React Query Yapılandırması
Hem Web hem de Mobil için varsayılan `staleTime` **5 dakika (300000ms)** olarak belirlendi. Böylece veritabanına gereksiz okuma istekleri engellenerek maliyet düşürüldü.

---

> [!TIP]
> Yeni kütüphaneler (`zustand`, `@tanstack/react-query`) eklendiği için geliştirme sunucularını (`pnpm start` ve `pnpm dev`) **yeniden başlatmanız** gerekebilir.
