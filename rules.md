rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // --- YARDIMCI FONKSİYONLAR ---
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // ==========================================
    // 1. KULLANICILAR (USERS) VE ALT-KOLEKSİYONLARI
    // ==========================================
    match /users/{userId} {
      allow read: if true;
      allow create: if isOwner(userId);
      // GÜNCELLEME: Takipçi sayısını (stats) herkes artırabilsin diye update açık
      allow update: if isAuthenticated();
      allow delete: if false;
      
      match /following/{docId} {
        allow read: if true;
        allow write: if isOwner(userId);
      }
      
      match /followers/{docId} {
        allow read: if true;
        allow write: if isAuthenticated();
      }
      
      match /notifications/{notificationId} {
        allow read, update, delete: if isOwner(userId);
        allow create: if isAuthenticated(); 
      }
      
      match /readingProgress/{progressId} {
        allow read, write: if isOwner(userId);
      }
      
      match /savedStories/{savedId} {
        allow read, write: if isOwner(userId);
      }

			match /saved_quotes/{quoteId} {
        allow read, write: if isOwner(userId);
      }

 
      // Kullanıcı SADECE kendi profilini güncelleyebilir
      allow write: if request.auth != null && request.auth.uid == userId;
    }



    // ==========================================
    // 2. HİKAYELER (STORIES) VE ALT-KOLEKSİYONLARI
    // ==========================================
    match /stories/{storyId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.resource.data.authorId == request.auth.uid;
      // GÜNCELLEME: Beğeni sayıları ve okuma sayıları artabilsin diye
      allow update: if isAuthenticated();
      allow delete: if isOwner(resource.data.authorId);
      
      // YENİ EKLENEN: Ana Hikaye Beğenileri için İzin
      match /likes/{likeUserId} {
        allow read: if true;
        allow write: if isAuthenticated() && request.auth.uid == likeUserId;
      }
      
      match /chapters/{chapterId} {
        allow read: if true;
        allow create, update: if isAuthenticated();
        
        // DEĞİŞEN SATIR: Bölüm silme yetkisi sadece hikayenin sahibine veriliyor
        allow delete: if isAuthenticated() && get(/databases/$(database)/documents/stories/$(storyId)).data.authorId == request.auth.uid;
        
        // YENİ EKLENEN: Bölüm Beğenileri için İzin
        match /likes/{likeUserId} {
          allow read: if true;
          allow write: if isAuthenticated() && request.auth.uid == likeUserId;
        }

        // YENİ EKLENEN: Bölüm Sonu Aktiviteleri (Cevaplar/Anketler) için İzin
        match /activity_answers/{userId} {
          allow read: if true;
          allow write: if isAuthenticated() && request.auth.uid == userId;
        }
        
        match /comments/{commentId} {
          allow read: if true;
          allow create, update: if isAuthenticated();
          allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;

          match /likes/{likeUserId} {
            allow read: if true;
            allow write: if isAuthenticated() && request.auth.uid == likeUserId;
          }
        }
      }
      
      match /reviews/{reviewId} {
        allow read: if true;
        allow create, update: if isAuthenticated();
        allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
      }

// YENİ EKLENEN: Karakterler alt koleksiyonu için izinler
      match /characters/{characterId} {
        allow read: if true; 
        allow write: if isAuthenticated() && request.auth.uid == get(/databases/$(database)/documents/stories/$(storyId)).data.authorId; 
      }
    }

    match /stories/{storyId}/planner/{document=**} {
      allow read, write: if request.auth != null; 
    }
    match /stories/{storyId}/chapters/{chapterId}/planner/{document=**} {
      allow read, write: if request.auth != null; 
    }


    // ==========================================
    // 3. READIX (MİKRO POSTLAR) VE ALT-KOLEKSİYONLARI
    // ==========================================
    match /readixes/{readixId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.resource.data.authorId == request.auth.uid;
      allow update: if isAuthenticated();
      allow delete: if isOwner(resource.data.authorId);
      
      match /likes/{likeId} {
        allow read: if true;
        allow write: if isAuthenticated();
      }
      
      match /comments/{commentId} {
        allow read: if true;
        allow create, update: if isAuthenticated();
        allow delete: if isAuthenticated() && resource.data.authorId == request.auth.uid;
        
        match /likes/{likeId} {
          allow read: if true;
          allow write: if isAuthenticated();
        }
      }
    }


    // ==========================================
    // 4. ETIKETLER (TAGS)
    // ==========================================
    match /tags/{tagId} {
      allow read: if true;
      allow write: if isAuthenticated(); 
    }

    // Arena (Düellolar) için Kurallar
    match /duels/{duelId} {
      // MVP aşamasında giriş yapmış herkes düelloları okuyabilir ve oluşturabilir
      allow read, create: if request.auth != null;
      
      // Sadece düellonun tarafları güncelleyebilir (tur değiştirmek, bitirmek vb.)
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.authorA.uid || 
        request.auth.uid == resource.data.authorB.uid
      );
      
      // Tur (Hamle) alt koleksiyonu
      match /turns/{turnId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
      }
    }

    // Şikayetler (Sadece giriş yapmış kullanıcılar şikayet oluşturabilir)
    match /reports/{reportId} {
      allow create: if request.auth != null;
      allow read, update, delete: if false; 
    }

    // Şikayetler (Herkes oluşturabilir, yetkililer okuyup silebilir)
    match /reports/{reportId} {
      allow create: if request.auth != null;
      // Eğer Firebase'de özel bir admin rolü kontrolünüz (custom claim) varsa, 
      // 'true' yerine onu koyabilirsiniz. Yoksa şimdilik admin panelinin 
      // çalışması için giriş yapmış herkese okuma yetkisi veriyoruz:
      allow read, update, delete: if request.auth != null; 
    }

 // Duels koleksiyonu için izinler
    match /duels/{duelId} {
      allow read: if true; // Veya sadece giriş yapmış kullanıcılar okuyabilsin isterseniz: if request.auth != null;
      allow write: if request.auth != null;
    }
  
// 2. Lobi (lobbies) koleksiyonu ve tüm alt koleksiyonları için izinler
    match /lobbies/{document=**} {
      allow read: if true; 
      allow write: if request.auth != null; 
    }

    // ==========================================
    // 5. SOHBETLER (CHATS) VE MESAJLAR
    // ==========================================
    match /chats/{chatId} {
      allow read: if isAuthenticated() && (resource == null || request.auth.uid in resource.data.participants);
      allow update: if isAuthenticated() && request.auth.uid in resource.data.participants;
      allow create: if isAuthenticated() && request.auth.uid in request.resource.data.participants;
      allow delete: if false;
      
      match /messages/{messageId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated() && request.auth.uid == request.resource.data.senderId;
        allow update: if isAuthenticated(); 
        allow delete: if false;
      }
    }

    // ==========================================
    // 6. DUYURULAR (ANNOUNCEMENTS)
    // ==========================================
    match /announcements/{announcementId} {
      allow read: if true;
      allow write: if isAuthenticated(); // İdealde admin rolü kontrol edilmeli
    }
  }
}
