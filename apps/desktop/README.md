# Readixon Desktop (Tauri 2.0)

Readixon'un Windows (`.exe` / `.msi`) ve Apple macOS (`.dmg`) için geliştirilmiş ultra hafif native masaüstü uygulamasıdır.

## Mimari Özellikler
- **Tauri 2.0 & Rust Core:** Chromium gerektirmez; Windows'ta yerleşik Edge WebView2, macOS'ta yerleşik WebKit motorunu kullanır.
- **Ultra Düşük Kaynak Tüketimi:** Kurulum boyutu ~10-15 MB, RAM tüketimi ~30-50 MB arasındadır.
- **Canlı Bulut Senkronizasyonu:** Web üzerinde yapılan güncellemeler masaüstü uygulamasına anında yansır; her güncellemede yeni kurulum gerektirmez.

## Yerel Geliştirme (Local Development)

### 1. Ön Koşullar
- **Node.js** (>= 18) & **pnpm** (>= 8)
- **Rust & Cargo:** [https://rustup.rs](https://rustup.rs) veya Windows Terminal'de:
  ```powershell
  winget install Rustlang.Rustup
  ```
  *(Kurulum sonrası terminali yeniden başlatın).*

- **Windows C++ Build Tools (Sadece Windows için):**
  Visual Studio Installer ile "C++ ile Masaüstü Geliştirme" seçeneğinin kurulu olması gerekmektedir.

### 2. Geliştirme Modunda Çalıştırma
```bash
# Web geliştirme sunucusunu başlatın
pnpm --filter @readixon/web dev

# Ayrı bir terminalde Tauri masaüstü uygulamasını başlatın
pnpm --filter @readixon/desktop dev
```

### 3. Kurulum Dosyalarını Derleme (Build)
```bash
# Bulunduğunuz işletim sistemi için otomatik .exe veya .dmg üretir
pnpm --filter @readixon/desktop build
```
Üretilen kurulum dosyaları `apps/desktop/src-tauri/target/release/bundle/` altında yer alır:
- Windows: `nsis/Readixon_0.1.0_x64-setup.exe` ve `msi/Readixon_0.1.0_x64_en-US.msi`
- macOS: `dmg/Readixon_0.1.0_universal.dmg`

## GitHub Actions ile Otomatik Dağıtım (Automated Releases)
Projedeki `.github/workflows/desktop-release.yml` iş akışı sayesinde, GitHub'a yeni bir sürüm etiketi (örneğin `v2.3.1`) gönderildiğinde hem Windows hem de macOS kurulum paketleri bulutta otomatik olarak derlenir ve GitHub Releases sayfasına yüklenir.
