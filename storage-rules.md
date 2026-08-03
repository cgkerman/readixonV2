rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Herkes (misafirler dahil) yüklenen fotoğrafları, hikaye kapaklarını ve profil resimlerini görebilir
      allow read: if true;
      
      // SADECE giriş yapmış (üyeliği olan) kullanıcılar dosya/fotoğraf yükleyebilir
      allow write: if request.auth != null;
    }
  }
}
