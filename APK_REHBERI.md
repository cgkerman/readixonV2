# 📱 Readixon Android APK Çıktısı Alma Rehberi

Bu rehber, Capacitor ile hazırladığımız Android projesinden doğrudan telefonlara kurulabilen `.apk` dosyasını nasıl üreteceğinizi anlatır.

---

### Gereksinimler
- Bilgisayarınızda **Android Studio** kurulu olmalıdır. (Kurulu değilse: [developer.android.com/studio](https://developer.android.com/studio))

---

### Adım 1: Projeyi Android Studio ile Açın

1. **Android Studio**'yu başlatın.
2. Açılış ekranında **Open** (Aç) butonuna tıklayın.
3. Proje dizininden şu klasörü seçin:
   ```
   C:\dev\readixondev\apps\web\android
   ```
4. Projenin açılmasını ve sağ alttaki **Gradle build/sync** işleminin tamamlanmasını bekleyin.

> 💡 **Terminalden Hızlı Açma Kısayolu:**
> VS Code / Terminal üzerinden doğrudan açmak isterseniz:
> ```bash
> pnpm --filter @readixon/web cap:open:android
> ```

---

### Adım 2: APK Dosyasını Derleyin (Build APK)

1. Android Studio üst menüsünden:
   **Build > Build Bundle(s) / APK(s) > Build APK(s)** seçeneğine tıklayın.
2. Alt durum çubuğunda Gradle derleme işlemi başlar (yaklaşık 1-2 dakika sürer).

---

### Adım 3: Üretilen APK Dosyasını Alın

1. Derleme bittiğinde sağ altta **"APK(s) generated successfully"** baloncuk bildirimi çıkar.
2. Bildirimdeki mavi **locate** linkine tıklayın.
3. Açılan klasörde `app-debug.apk` dosyasını göreceksiniz.
   - Doğrudan dosya yolu:
     ```
     C:\dev\readixondev\apps\web\android\app\build\outputs\apk\debug\app-debug.apk
     ```

---

### Adım 4: Siteden İndirmeye Açın

1. Bu dosyanın adını **`readixon.apk`** olarak değiştirin.
2. Dosyayı projenizdeki şu klasöre kopyalayın:
   ```
   C:\dev\readixondev\apps\web\public\downloads\readixon.apk
   ```

🎉 **Tebrikler!** Artık Feed sayfasının en altındaki **"Android APK İndir"** butonuna basan herkes bu dosyayı anında indirip telefonuna kurabilir.

---

### 🔄 Web Sitenizde Değişiklik Yaptığınızda Ne Olur?
`capacitor.config.ts` dosyamız canlı domaininizi (`https://www.readixon.com`) çekecek şekilde yapılandırılmıştır. Dolayısıyla web sitenize eklediğiniz yeni bölümler, webtoonlar veya tasarımlar **uygulamayı tekrar derlemeye gerek kalmadan** tüm kullanıcılarda anında güncellenir!

---

### 🔐 Google ile Giriş & Parmak İzi Bilgileri
Uygulama yerel Google Kimlik Doğrulama (`@capawesome/capacitor-google-sign-in`) kullanır.
- **Paket Adı:** `com.readixon.app`
- **Web Client ID:** `812011581796-qrc8cjbt5ob0rg89vask9tto9ptjdvlv.apps.googleusercontent.com`
- **Debug SHA-1:** `FA:D2:E9:F4:7C:22:29:B5:57:E0:41:4D:ED:FD:2B:E6:FF:AB:7B:52`
- **Debug SHA-256:** `C1:2D:0B:1D:0E:26:60:36:15:B8:B7:04:82:BE:92:FF:07:FC:4D:E0:96:45:6D:8A:9C:E8:6A:43:87:AD:BB:71`
- **MainActivity Kaydı:** `MainActivity.java` içinde `registerPlugin(GoogleSignInPlugin.class)` kayıtlıdır.
