/**
 * READIXON TÜR DEFTERİ (GENRE TAXONOMY)
 * 
 * Bu dosya readixon_tur_defteri.md kılavuzundaki 30 Ana Tür ve 393 Alt Türü içerir.
 * Kural: Her eser için 1 Ana Tür (mainGenre) ve seçilen ana türe ait sınırsız Alt Tür (subGenres) seçilebilir.
 */

export interface SubGenreItem {
  id: string;
  name: string;
  description: string;
}

export interface MainGenreItem {
  order: number;
  id: string;
  name: string;
  emoji: string;
  lucideIconName: string;
  description: string;
  subGenres: SubGenreItem[];
}

export const MAIN_GENRES: MainGenreItem[] = [
  {
    "order": 1,
    "id": "fantastik",
    "name": "Fantastik",
    "emoji": "🧙‍♂️",
    "lucideIconName": "Wand2",
    "description": "Fantastik, gerçek dünyanın fiziksel ve doğal kurallarının dışında işleyen büyü, doğaüstü varlıklar, farklı dünyalar, efsaneler veya olağanüstü güçler üzerine kurulu eserleri kapsayan geniş bir ana türdür. Fantastik eserlerde dünya tamamen kurgusal olabileceği gibi, gerçek dünyanın içerisine gizlenmiş doğaüstü unsurlar da bulunabilir.",
    "subGenres": [
      {
        "id": "epik-fantastik",
        "name": "Epik Fantastik",
        "description": "Büyük savaşlar, krallıklar, kadim tehditler, uzun yolculuklar ve geniş çaplı çatışmalar etrafında şekillenen fantastik eserlerdir."
      },
      {
        "id": "yuksek-fantastik",
        "name": "Yüksek Fantastik",
        "description": "Tamamen özgün ve bağımsız bir fantastik dünyada geçen; kendine ait tarih, coğrafya, toplum, büyü sistemi ve kültür barındıran eserlerdir."
      },
      {
        "id": "dusuk-fantastik",
        "name": "Düşük Fantastik",
        "description": "Gerçek veya gerçekçi bir dünyada geçen, fantastik unsurların sınırlı veya sıra dışı biçimde hikâyeye dâhil olduğu eserlerdir."
      },
      {
        "id": "karanlik-fantastik",
        "name": "Karanlık Fantastik",
        "description": "Fantastik unsurları karanlık atmosfer, ölüm, korku, yozlaşma, ahlaki belirsizlik ve tehdit duygusuyla birleştiren eserlerdir."
      },
      {
        "id": "grimdark",
        "name": "Grimdark",
        "description": "Kahramanlığın idealize edilmediği; sert şiddet, ahlaki gri karakterler, politik yozlaşma ve umutsuzluğun öne çıktığı karanlık fantastik türüdür."
      },
      {
        "id": "sehir-fantastigi",
        "name": "Şehir Fantastiği",
        "description": "Modern veya tarihsel bir şehir ortamında büyü, yaratıklar, gizli topluluklar veya doğaüstü olayların yer aldığı fantastik eserlerdir."
      },
      {
        "id": "portal-fantastik",
        "name": "Portal Fantastik",
        "description": "Karakterlerin kendi dünyalarından başka bir evrene, boyuta veya fantastik dünyaya geçtiği eserlerdir."
      },
      {
        "id": "romantik-fantastik",
        "name": "Romantik Fantastik",
        "description": "Fantastik olay örgüsüyle romantik ilişkinin güçlü biçimde iç içe geçtiği eserlerdir."
      },
      {
        "id": "masalsi-fantastik",
        "name": "Masalsı Fantastik",
        "description": "Masal dili, arketipler, büyülü nesneler, kadim ormanlar, lanetler ve sembolik anlatımlardan beslenen fantastik eserlerdir."
      },
      {
        "id": "buyu-akademisi",
        "name": "Büyü Akademisi",
        "description": "Büyü eğitimi, akademiler, ustalık sistemleri, öğrenciler ve büyülü disiplinler çevresinde gelişen hikâyelerdir."
      },
      {
        "id": "kilic-ve-buyu",
        "name": "Kılıç ve Büyü",
        "description": "Bireysel kahramanlar, macera, savaş, büyü, canavarlar ve tehlikeli yolculukların öne çıktığı hızlı tempolu fantastik eserlerdir."
      },
      {
        "id": "kahramansi-fantastik",
        "name": "Kahramansı Fantastik",
        "description": "Bir kahramanın yükselişi, kaderi, fedakârlıkları ve büyük bir tehditle mücadelesi üzerine kurulu fantastik anlatılardır."
      },
      {
        "id": "askeri-fantastik",
        "name": "Askerî Fantastik",
        "description": "Fantastik dünyalarda ordular, savaş stratejileri, askerî birlikler ve büyü destekli çatışmalar etrafında gelişen eserlerdir."
      },
      {
        "id": "politik-fantastik",
        "name": "Politik Fantastik",
        "description": "Krallıklar, hanedanlar, taht mücadeleleri, diplomasi, entrika ve güç savaşlarının merkezde olduğu fantastik eserlerdir."
      },
      {
        "id": "gotik-fantastik",
        "name": "Gotik Fantastik",
        "description": "Gotik mimari, lanetler, melankoli, karanlık aile geçmişleri ve doğaüstü unsurları bir araya getiren fantastik eserlerdir."
      },
      {
        "id": "peri-masali-yeniden-anlatimi",
        "name": "Peri Masalı Yeniden Anlatımı",
        "description": "Klasik masalları yeni karakterler, farklı bakış açıları veya çağdaş temalarla yeniden yorumlayan eserlerdir."
      },
      {
        "id": "mitolojik-fantastik",
        "name": "Mitolojik Fantastik",
        "description": "Mitolojik tanrılar, kahramanlar, yaratıklar ve inanç sistemlerinden yoğun biçimde beslenen fantastik hikâyelerdir."
      },
      {
        "id": "elemental-fantastik",
        "name": "Elemental Fantastik",
        "description": "Ateş, su, hava, toprak, yıldırım, buz veya benzeri elementlerin güç ve büyü sisteminin temelini oluşturduğu eserlerdir."
      },
      {
        "id": "ejderha-fantastigi",
        "name": "Ejderha Fantastiği",
        "description": "Ejderhaların dünyanın kültüründe, savaşında, siyasetinde veya karakter ilişkilerinde merkezî rol oynadığı eserlerdir."
      },
      {
        "id": "buyulu-gercekcilik",
        "name": "Büyülü Gerçekçilik",
        "description": "Gerçekçi bir dünyanın içinde olağanüstü olayların sıradan ve doğal kabul edildiği, gerçek ile büyünün sınırlarını belirsizleştiren eserlerdir."
      },
      {
        "id": "progression-fantasy",
        "name": "Progression Fantasy",
        "description": "Karakterin güç, yetenek, büyü, rütbe veya ustalık bakımından sistematik biçimde gelişmesinin anlatının temel unsurlarından biri olduğu fantastik eserlerdir."
      },
      {
        "id": "litrpg",
        "name": "LitRPG",
        "description": "Seviye, sınıf, yetenek, görev, istatistik veya oyun benzeri mekaniklerin hikâye dünyasında açık biçimde bulunduğu eserlerdir."
      },
      {
        "id": "sistem-fantastigi",
        "name": "Sistem Fantastiği",
        "description": "Karakterlerin yalnızca kendilerinin veya tüm dünyanın erişebildiği görev, yetenek, seviye veya ödül sistemiyle ilerlediği fantastik eserlerdir."
      },
      {
        "id": "dungeon-zindan-fantastigi",
        "name": "Dungeon / Zindan Fantastiği",
        "description": "Zindanlar, yaratıklar, ganimetler, katmanlar, kapılar veya keşif bölgelerinin hikâyenin merkezinde olduğu eserlerdir."
      }
    ]
  },
  {
    "order": 2,
    "id": "bilim-kurgu",
    "name": "Bilim Kurgu",
    "emoji": "🚀",
    "lucideIconName": "Rocket",
    "description": "Bilim Kurgu, bilimsel veya teknolojik gelişmelerin insan, toplum, dünya ve evren üzerindeki olası etkilerini araştıran kurgu türüdür. Gelecek, uzay, yapay zekâ, alternatif gerçeklikler ve ileri teknoloji bilim kurgunun temel çalışma alanlarıdır.",
    "subGenres": [
      {
        "id": "hard-science-fiction",
        "name": "Hard Science Fiction",
        "description": "Bilimsel doğruluk, fizik, astronomi, biyoloji veya mühendislik gibi alanlarda mümkün olduğunca gerçekçi ve tutarlı olmaya çalışan bilim kurgu eserleridir."
      },
      {
        "id": "soft-science-fiction",
        "name": "Soft Science Fiction",
        "description": "Teknolojik ayrıntılardan çok toplum, psikoloji, kültür, siyaset ve insan ilişkilerine odaklanan bilim kurgu eserleridir."
      },
      {
        "id": "uzay-operasi",
        "name": "Uzay Operası",
        "description": "Galaksiler arası savaşlar, büyük uygarlıklar, yıldız gemileri ve geniş ölçekli maceralar üzerine kurulu bilim kurgu türüdür."
      },
      {
        "id": "uzay-kesfi",
        "name": "Uzay Keşfi",
        "description": "Bilinmeyen gezegenlerin, yıldız sistemlerinin veya kozmik bölgelerin keşfine odaklanan eserlerdir."
      },
      {
        "id": "ilk-temas",
        "name": "İlk Temas",
        "description": "İnsanlığın dünya dışı bir uygarlıkla ilk kez karşılaşmasını konu alan bilim kurgu eserleridir."
      },
      {
        "id": "dunya-disi-yasam",
        "name": "Dünya Dışı Yaşam",
        "description": "Uzaylı türlerin, biyolojilerin, kültürlerin ve uygarlıkların merkezde olduğu eserlerdir."
      },
      {
        "id": "yapay-zeka",
        "name": "Yapay Zekâ",
        "description": "Bilinçli makineler, yapay zekâ etiği, insan-makine ilişkisi ve teknolojik özerklik üzerine kurulu eserlerdir."
      },
      {
        "id": "robotik",
        "name": "Robotik",
        "description": "Robotların, androidlerin veya sentetik yaşam biçimlerinin merkezî rol oynadığı bilim kurgu eserleridir."
      },
      {
        "id": "siberpunk",
        "name": "Siberpunk",
        "description": "Yüksek teknoloji ile toplumsal çöküşü birleştiren; mega şirketler, siber uzay, beden modifikasyonları ve karanlık şehirlerle karakterize edilen eserlerdir."
      },
      {
        "id": "biopunk",
        "name": "Biopunk",
        "description": "Genetik mühendisliği, biyoteknoloji, sentetik organizmalar ve biyolojik manipülasyonun merkezde olduğu bilim kurgu eserleridir."
      },
      {
        "id": "solarpunk",
        "name": "Solarpunk",
        "description": "Sürdürülebilir teknoloji, ekolojik yaşam ve daha umutlu gelecek tasarımlarına odaklanan bilim kurgu türüdür."
      },
      {
        "id": "steampunk",
        "name": "Steampunk",
        "description": "Buhar teknolojisinin gelişmiş biçimlerini tarihsel veya alternatif dünyalarla birleştiren bilim kurgu türüdür."
      },
      {
        "id": "dieselpunk",
        "name": "Dieselpunk",
        "description": "Dizel teknolojisi, sanayi, savaş dönemi estetiği ve alternatif tarih unsurlarını birleştiren eserlerdir."
      },
      {
        "id": "atompunk",
        "name": "Atompunk",
        "description": "Atom çağı, retrofütürizm ve 1940–1960 döneminin gelecek tasavvurlarından beslenen bilim kurgu türüdür."
      },
      {
        "id": "zaman-yolculugu",
        "name": "Zaman Yolculuğu",
        "description": "Karakterlerin geçmişe veya geleceğe fiziksel ya da teknolojik yollarla yolculuk yaptığı eserlerdir."
      },
      {
        "id": "zaman-dongusu",
        "name": "Zaman Döngüsü",
        "description": "Karakterlerin belirli bir zaman aralığını tekrar tekrar yaşadığı ve bu döngüyü kırmaya çalıştığı eserlerdir."
      },
      {
        "id": "paralel-evren",
        "name": "Paralel Evren",
        "description": "Birden fazla gerçeklik, alternatif dünya veya farklı olasılıkların eş zamanlı biçimde var olduğu bilim kurgu eserleridir."
      },
      {
        "id": "coklu-evren",
        "name": "Çoklu Evren",
        "description": "Birden fazla evrenin ve farklı gerçeklik katmanlarının hikâyenin doğrudan parçası olduğu eserlerdir."
      },
      {
        "id": "alternatif-tarih",
        "name": "Alternatif Tarih",
        "description": "Geçmişteki önemli bir olayın farklı gerçekleşmesi sonucunda ortaya çıkan alternatif dünyaları konu alan eserlerdir."
      },
      {
        "id": "askeri-bilim-kurgu",
        "name": "Askerî Bilim Kurgu",
        "description": "Geleceğin savaşları, uzay orduları, askerî teknoloji ve stratejik çatışmaları merkezine alan eserlerdir."
      },
      {
        "id": "kolonilesme-bilim-kurgusu",
        "name": "Kolonileşme Bilim Kurgusu",
        "description": "İnsanlığın başka gezegenlerde veya uzay bölgelerinde koloni kurma süreçlerini anlatan eserlerdir."
      },
      {
        "id": "terraforming",
        "name": "Terraforming",
        "description": "Gezegenlerin insan yaşamına uygun hâle getirilmesini ve bunun sonuçlarını konu alan bilim kurgu eserleridir."
      },
      {
        "id": "transhumanizm",
        "name": "Transhümanizm",
        "description": "İnsan bedeninin veya zihninin teknolojiyle geliştirilmesi, dönüştürülmesi ve insanlığın sınırlarının aşılması üzerine kurulu eserlerdir."
      },
      {
        "id": "posthumanizm",
        "name": "Posthümanizm",
        "description": "İnsanlığın mevcut biyolojik veya zihinsel biçiminin ötesine geçtiği gelecek senaryolarını ele alan eserlerdir."
      },
      {
        "id": "sanal-gerceklik",
        "name": "Sanal Gerçeklik",
        "description": "Sanal dünyalar, simülasyonlar ve dijital gerçekliklerin merkezde olduğu bilim kurgu eserleridir."
      },
      {
        "id": "simulasyon-kurgusu",
        "name": "Simülasyon Kurgusu",
        "description": "Yaşanılan gerçekliğin yapay, bilgisayar üretimi veya kontrollü bir simülasyon olabileceği fikrine dayanan eserlerdir."
      },
      {
        "id": "kiyamet-sonrasi-bilim-kurgu",
        "name": "Kıyamet Sonrası Bilim Kurgu",
        "description": "Büyük bir felaketin ardından insanlığın hayatta kalma ve yeniden yapılanma mücadelesini anlatan bilim kurgu eserleridir."
      },
      {
        "id": "iklim-bilim-kurgusu",
        "name": "İklim Bilim Kurgusu",
        "description": "İklim değişikliği, çevresel krizler ve ekolojik dönüşümlerin gelecekteki sonuçlarını konu alan eserlerdir."
      }
    ]
  },
  {
    "order": 3,
    "id": "romantik",
    "name": "Romantik",
    "emoji": "💖",
    "lucideIconName": "Heart",
    "description": "Romantik, duygusal veya romantik ilişkinin hikâyenin temel eksenlerinden biri olduğu eserleri kapsar. Karakterlerin yakınlaşması, çatışmaları, ayrılıkları, bağlılıkları ve kişisel dönüşümleri türün merkezindedir.",
    "subGenres": [
      {
        "id": "cagdas-romantik",
        "name": "Çağdaş Romantik",
        "description": "Günümüz dünyasında geçen romantik ilişkileri konu alan eserlerdir."
      },
      {
        "id": "tarihi-romantik",
        "name": "Tarihî Romantik",
        "description": "Geçmiş dönemlerde geçen ve tarihsel atmosferle romantik ilişkiyi birleştiren eserlerdir."
      },
      {
        "id": "romantik-komedi",
        "name": "Romantik Komedi",
        "description": "Romantik ilişkiyi mizah, yanlış anlaşılmalar ve eğlenceli olaylarla birleştiren eserlerdir."
      },
      {
        "id": "romantik-dram",
        "name": "Romantik Dram",
        "description": "Aşk ilişkisini ağır duygusal çatışmalar, kayıplar ve dramatik olaylarla ele alan eserlerdir."
      },
      {
        "id": "dark-romance",
        "name": "Dark Romance",
        "description": "Tehlike, saplantı, güç dengesizliği veya ahlaki açıdan karanlık karakterlerin bulunduğu yetişkin odaklı romantik eserlerdir."
      },
      {
        "id": "fantastik-romantik",
        "name": "Fantastik Romantik",
        "description": "Büyü, fantastik dünyalar veya doğaüstü varlıklarla romantik ilişkiyi birleştiren eserlerdir."
      },
      {
        "id": "paranormal-romantik",
        "name": "Paranormal Romantik",
        "description": "Vampir, kurtadam, cadı, ruh veya benzeri doğaüstü varlıklarla romantik unsurları birleştiren eserlerdir."
      },
      {
        "id": "bilim-kurgu-romantigi",
        "name": "Bilim Kurgu Romantiği",
        "description": "Gelecek, uzay, teknoloji veya bilim kurgu ortamında gelişen romantik hikâyelerdir."
      },
      {
        "id": "genclik-romantigi",
        "name": "Gençlik Romantiği",
        "description": "Genç karakterlerin ilk aşk, okul hayatı, kimlik gelişimi ve ilişkilerini konu alan eserlerdir."
      },
      {
        "id": "universite-kampus-romantigi",
        "name": "Üniversite / Kampüs Romantiği",
        "description": "Üniversite veya kampüs ortamında gelişen romantik ilişkileri merkezine alan eserlerdir."
      },
      {
        "id": "ofis-romantigi",
        "name": "Ofis Romantiği",
        "description": "İş ortamında başlayan veya gelişen romantik ilişkileri konu alan eserlerdir."
      },
      {
        "id": "spor-romantigi",
        "name": "Spor Romantiği",
        "description": "Sporcular veya spor dünyası çevresinde gelişen romantik hikâyelerdir."
      },
      {
        "id": "arkadastan-sevgiliye",
        "name": "Arkadaştan Sevgiliye",
        "description": "Uzun süredir arkadaş olan karakterlerin romantik ilişkiye dönüşmesini anlatan eserlerdir."
      },
      {
        "id": "dusmandan-sevgiliye",
        "name": "Düşmandan Sevgiliye",
        "description": "Başlangıçta karşıt veya düşman olan karakterlerin zamanla romantik yakınlık geliştirdiği eserlerdir."
      },
      {
        "id": "sahte-iliski",
        "name": "Sahte İlişki",
        "description": "Karakterlerin belirli bir amaç için ilişki yaşıyormuş gibi davranması ve bunun gerçek duygulara dönüşmesini konu alan eserlerdir."
      },
      {
        "id": "anlasmali-evlilik",
        "name": "Anlaşmalı Evlilik",
        "description": "Siyasi, ekonomik, ailevi veya kişisel nedenlerle yapılan anlaşmalı evliliğin romantik ilişkiye dönüşmesini anlatan eserlerdir."
      },
      {
        "id": "yasak-ask",
        "name": "Yasak Aşk",
        "description": "Toplum, aile, statü, görev veya başka engeller nedeniyle yasaklanan ilişkileri konu alan eserlerdir."
      },
      {
        "id": "ikinci-sans",
        "name": "İkinci Şans",
        "description": "Geçmişte ayrılmış karakterlerin yeniden karşılaşarak ilişkilerine ikinci bir fırsat vermesini anlatan eserlerdir."
      },
      {
        "id": "slow-burn",
        "name": "Slow Burn",
        "description": "Romantik ilişkinin uzun süre boyunca yavaş ve kademeli biçimde geliştiği eserlerdir."
      },
      {
        "id": "zit-kutuplar",
        "name": "Zıt Kutuplar",
        "description": "Karakter özellikleri ve yaşam tarzları birbirinden çok farklı kişilerin romantik yakınlaşmasını konu alan eserlerdir."
      },
      {
        "id": "tek-tarafli-ask",
        "name": "Tek Taraflı Aşk",
        "description": "Karakterlerden yalnızca birinin romantik duygular taşıdığı veya aşkın uzun süre karşılıksız kaldığı eserlerdir."
      },
      {
        "id": "ruh-esi",
        "name": "Ruh Eşi",
        "description": "Karakterler arasında kader, büyü veya metafizik bağ bulunduğu romantik eserlerdir."
      }
    ]
  },
  {
    "order": 4,
    "id": "gizem-ve-polisiye",
    "name": "Gizem ve Polisiye",
    "emoji": "🔍",
    "lucideIconName": "Search",
    "description": "Gizem ve Polisiye, açıklanmamış olayların, suçların, sırların veya bilmecelerin çözülmesini merkezine alan eserlerdir. Okuyucu çoğu zaman karakterlerle birlikte gerçeği parça parça keşfeder.",
    "subGenres": [
      {
        "id": "dedektif-kurgusu",
        "name": "Dedektif Kurgusu",
        "description": "Bir dedektifin veya araştırmacının suç ya da gizem çözmesini konu alan eserlerdir."
      },
      {
        "id": "cinayet-gizemi",
        "name": "Cinayet Gizemi",
        "description": "Bir cinayetin failini, motivasyonunu ve olayın ardındaki gerçeği ortaya çıkarmaya odaklanan eserlerdir."
      },
      {
        "id": "suc-kurgusu",
        "name": "Suç Kurgusu",
        "description": "Suçlular, suç örgütleri, polis, adalet sistemi veya suç dünyasının merkezde olduğu eserlerdir."
      },
      {
        "id": "polis-proseduru",
        "name": "Polis Prosedürü",
        "description": "Polis teşkilatının soruşturma yöntemlerini ve operasyonlarını gerçekçi ayrıntılarla ele alan eserlerdir."
      },
      {
        "id": "adli-polisiye",
        "name": "Adli Polisiye",
        "description": "Adli tıp, kriminal laboratuvar, DNA, balistik ve bilimsel delil analizlerinin önemli olduğu eserlerdir."
      },
      {
        "id": "hukuk-polisiye",
        "name": "Hukuk Polisiye",
        "description": "Mahkemeler, avukatlar, savcılar ve hukuki mücadeleler çevresinde gelişen suç hikâyeleridir."
      },
      {
        "id": "cozy-mystery",
        "name": "Cozy Mystery",
        "description": "Şiddetin daha geri planda kaldığı, küçük topluluklarda geçen ve daha hafif atmosferli gizem eserleridir."
      },
      {
        "id": "noir",
        "name": "Noir",
        "description": "Karanlık şehir atmosferi, suç, yozlaşma ve ahlaki gri karakterlerle şekillenen polisiye eserleridir."
      },
      {
        "id": "neo-noir",
        "name": "Neo-Noir",
        "description": "Noir geleneğini çağdaş dönem, teknoloji veya modern toplumsal sorunlarla yeniden yorumlayan eserlerdir."
      },
      {
        "id": "kapali-oda-gizemi",
        "name": "Kapalı Oda Gizemi",
        "description": "Suçun fiziksel olarak imkânsız görünen bir ortamda işlendiği ve mantıksal çözüm gerektirdiği eserlerdir."
      },
      {
        "id": "amator-dedektif",
        "name": "Amatör Dedektif",
        "description": "Profesyonel olmayan bir karakterin olayları araştırdığı gizem eserleridir."
      },
      {
        "id": "tarihi-polisiye",
        "name": "Tarihî Polisiye",
        "description": "Geçmiş bir dönemde geçen suç ve soruşturma hikâyeleridir."
      },
      {
        "id": "casusluk-gizemi",
        "name": "Casusluk Gizemi",
        "description": "İstihbarat, gizli görevler, ajanlar ve devlet sırları çevresinde gelişen eserlerdir."
      },
      {
        "id": "komplo-gizemi",
        "name": "Komplo Gizemi",
        "description": "Gizli örgütler, örtbas edilmiş olaylar ve büyük ölçekli komploların çözülmesini konu alan eserlerdir."
      },
      {
        "id": "akademik-gizem",
        "name": "Akademik Gizem",
        "description": "Üniversite, okul, araştırma kurumu veya akademik çevrede geçen gizem hikâyeleridir."
      },
      {
        "id": "arkeolojik-gizem",
        "name": "Arkeolojik Gizem",
        "description": "Antik eserler, kayıp uygarlıklar, tarihi belgeler ve arkeolojik keşiflerin merkezde olduğu eserlerdir."
      }
    ]
  },
  {
    "order": 5,
    "id": "gerilim",
    "name": "Gerilim",
    "emoji": "⚡",
    "lucideIconName": "Zap",
    "description": "Gerilim, okuyucuda sürekli bir tehlike, belirsizlik, baskı ve beklenti duygusu oluşturmayı amaçlayan eserleri kapsar. Hikâyeler çoğunlukla yüksek riskli olaylar ve giderek artan tehdit üzerine kuruludur.",
    "subGenres": [
      {
        "id": "psikolojik-gerilim",
        "name": "Psikolojik Gerilim",
        "description": "Karakterlerin zihinsel çatışmaları, algı bozuklukları, paranoya ve psikolojik manipülasyon üzerine kurulu eserlerdir."
      },
      {
        "id": "suc-gerilimi",
        "name": "Suç Gerilimi",
        "description": "Suç dünyası, soruşturma veya suçlular arasındaki mücadeleyi yüksek tempoyla anlatan eserlerdir."
      },
      {
        "id": "politik-gerilim",
        "name": "Politik Gerilim",
        "description": "Devlet, iktidar, diplomasi, seçimler, bürokrasi veya siyasi komplolar etrafında gelişen eserlerdir."
      },
      {
        "id": "casusluk-gerilimi",
        "name": "Casusluk Gerilimi",
        "description": "Ajanlar, istihbarat örgütleri, gizli operasyonlar ve uluslararası tehditleri konu alan eserlerdir."
      },
      {
        "id": "teknolojik-gerilim",
        "name": "Teknolojik Gerilim",
        "description": "Siber saldırılar, yapay zekâ, teknoloji şirketleri veya dijital tehditleri merkezine alan eserlerdir."
      },
      {
        "id": "hukuk-gerilimi",
        "name": "Hukuk Gerilimi",
        "description": "Mahkeme süreçleri, hukuki mücadeleler ve adalet sistemi içindeki yüksek riskli çatışmaları konu alan eserlerdir."
      },
      {
        "id": "tibbi-gerilim",
        "name": "Tıbbi Gerilim",
        "description": "Hastaneler, salgınlar, deneyler, biyolojik tehditler veya tıbbi komplolar çevresinde gelişen eserlerdir."
      },
      {
        "id": "finansal-gerilim",
        "name": "Finansal Gerilim",
        "description": "Finans piyasaları, şirketler, ekonomik suçlar ve büyük para hareketleri etrafında gelişen eserlerdir."
      },
      {
        "id": "hayatta-kalma-gerilimi",
        "name": "Hayatta Kalma Gerilimi",
        "description": "Karakterlerin ölümcül bir ortamdan, felaketten veya takipten kurtulmaya çalıştığı eserlerdir."
      },
      {
        "id": "komplo-gerilimi",
        "name": "Komplo Gerilimi",
        "description": "Büyük ve gizli bir yapılanmanın ortaya çıkarılmasını konu alan yüksek tempolu eserlerdir."
      },
      {
        "id": "takip-kacis-gerilimi",
        "name": "Takip / Kaçış Gerilimi",
        "description": "Karakterlerin sürekli takip edildiği, kaçtığı veya bir hedefi takip ettiği eserlerdir."
      },
      {
        "id": "ev-ici-gerilim",
        "name": "Ev İçi Gerilim",
        "description": "Aile, evlilik, komşuluk veya yakın ilişkiler içinde gelişen tehdit ve sırları konu alan eserlerdir."
      },
      {
        "id": "doga-gerilimi",
        "name": "Doğa Gerilimi",
        "description": "Vahşi doğa, afetler, hayvan saldırıları veya tehlikeli çevresel koşullar içinde geçen gerilim eserleridir."
      }
    ]
  },
  {
    "order": 6,
    "id": "korku",
    "name": "Korku",
    "emoji": "👻",
    "lucideIconName": "Ghost",
    "description": "Korku, okuyucuda korku, tedirginlik, dehşet veya tekinsizlik duygusu yaratmayı amaçlayan eserleri kapsar. Tehdit doğaüstü, psikolojik, fiziksel veya tamamen bilinmeyen bir kaynaktan gelebilir.",
    "subGenres": [
      {
        "id": "psikolojik-korku",
        "name": "Psikolojik Korku",
        "description": "Zihin, paranoya, travma, halüsinasyon ve gerçeklik algısının bozulması üzerine kurulu korku eserleridir."
      },
      {
        "id": "dogaustu-korku",
        "name": "Doğaüstü Korku",
        "description": "Hayaletler, lanetler, ruhlar veya açıklanamayan doğaüstü olayları konu alan eserlerdir."
      },
      {
        "id": "gotik-korku",
        "name": "Gotik Korku",
        "description": "Eski yapılar, aile sırları, melankoli, çürüme ve doğaüstü tehditleri birleştiren korku türüdür."
      },
      {
        "id": "kozmik-korku",
        "name": "Kozmik Korku",
        "description": "İnsanlığın evrendeki önemsizliğini ve kavranması mümkün olmayan kozmik güçleri konu alan eserlerdir."
      },
      {
        "id": "folk-horror",
        "name": "Folk Horror",
        "description": "Yerel inançlar, kırsal topluluklar, ritüeller ve halk kültürü kaynaklı korkuları konu alan eserlerdir."
      },
      {
        "id": "body-horror",
        "name": "Body Horror",
        "description": "Bedenin dönüşümü, bozulması veya kontrol dışı değişimini korku unsuru olarak kullanan eserlerdir."
      },
      {
        "id": "slasher",
        "name": "Slasher",
        "description": "Bir katilin veya saldırganın bir grup insanı sistematik biçimde hedef aldığı korku eserleridir."
      },
      {
        "id": "hayalet-korkusu",
        "name": "Hayalet Korkusu",
        "description": "Ölü ruhlar ve musallat olaylarının merkezde olduğu eserlerdir."
      },
      {
        "id": "perili-ev",
        "name": "Perili Ev",
        "description": "Bir ev, bina veya mekânın doğaüstü güçler tarafından ele geçirilmesini konu alan eserlerdir."
      },
      {
        "id": "okult-korku",
        "name": "Okült Korku",
        "description": "Gizli ritüeller, şeytani varlıklar, yasak bilgiler ve karanlık inanç sistemleri üzerine kurulu eserlerdir."
      },
      {
        "id": "seytani-korku",
        "name": "Şeytani Korku",
        "description": "Şeytan, demon, possession veya benzeri kötücül doğaüstü varlıkların merkezde olduğu eserlerdir."
      },
      {
        "id": "vampir-korkusu",
        "name": "Vampir Korkusu",
        "description": "Vampirlerin tehdit unsuru olarak öne çıktığı korku eserleridir."
      },
      {
        "id": "kurtadam-korkusu",
        "name": "Kurtadam Korkusu",
        "description": "Kurtadamlar ve kontrol edilemeyen dönüşüm temasının merkezde olduğu eserlerdir."
      },
      {
        "id": "zombi-korkusu",
        "name": "Zombi Korkusu",
        "description": "Zombi salgını, enfeksiyon veya yaşayan ölüler üzerinden korku ve hayatta kalma temalarını işleyen eserlerdir."
      },
      {
        "id": "canavar-korkusu",
        "name": "Canavar Korkusu",
        "description": "Bilinmeyen veya doğaüstü yaratıkların tehdit oluşturduğu eserlerdir."
      },
      {
        "id": "analog-korku",
        "name": "Analog Korku",
        "description": "Eski medya kayıtları, kasetler, yayınlar veya sahte belgesel estetiği üzerinden tekinsizlik oluşturan modern korku türüdür."
      },
      {
        "id": "internet-korkusu",
        "name": "İnternet Korkusu",
        "description": "Dijital platformlar, forumlar, çevrim içi efsaneler ve internet kültürü üzerinden gelişen korku hikâyeleridir."
      }
    ]
  },
  {
    "order": 7,
    "id": "aksiyon-ve-macera",
    "name": "Aksiyon ve Macera",
    "emoji": "⚔️",
    "lucideIconName": "Swords",
    "description": "Aksiyon ve Macera, hareket, tehlike, keşif, mücadele ve yüksek tempolu olayların ön planda olduğu eserleri kapsar. Karakterler çoğunlukla fiziksel tehditlerle, zorlu görevlerle veya bilinmeyen bölgelerle karşılaşır.",
    "subGenres": [
      {
        "id": "klasik-macera",
        "name": "Klasik Macera",
        "description": "Keşif, yolculuk, tehlike ve bilinmeyene doğru ilerleme üzerine kurulu eserlerdir."
      },
      {
        "id": "aksiyon-macera",
        "name": "Aksiyon Macera",
        "description": "Yoğun çatışma sahneleriyle macera unsurlarını birleştiren eserlerdir."
      },
      {
        "id": "hazine-avi",
        "name": "Hazine Avı",
        "description": "Kayıp hazineler, haritalar, bilmeceler ve keşiflerin merkezde olduğu eserlerdir."
      },
      {
        "id": "kesif-macerasi",
        "name": "Keşif Macerası",
        "description": "Bilinmeyen bölgeleri, şehirleri, kıtaları veya dünyaları keşfetmeye odaklanan eserlerdir."
      },
      {
        "id": "hayatta-kalma",
        "name": "Hayatta Kalma",
        "description": "Doğal, toplumsal veya fiziksel bir tehdide karşı yaşam mücadelesini konu alan eserlerdir."
      },
      {
        "id": "dovus-sanatlari",
        "name": "Dövüş Sanatları",
        "description": "Dövüş disiplinleri, ustalar, eğitim ve fiziksel mücadelelerin merkezde olduğu eserlerdir."
      },
      {
        "id": "turnuva",
        "name": "Turnuva",
        "description": "Karakterlerin farklı aşamalardan oluşan yarışma, dövüş veya eleme sistemlerine katıldığı eserlerdir."
      },
      {
        "id": "super-guc",
        "name": "Süper Güç",
        "description": "Karakterlerin olağanüstü güçlere sahip olduğu ve bu güçleri çatışmalarda kullandığı eserlerdir."
      },
      {
        "id": "kahramanlik",
        "name": "Kahramanlık",
        "description": "Cesaret, fedakârlık ve büyük görevler üzerine kurulu aksiyon eserleridir."
      },
      {
        "id": "casusluk-aksiyonu",
        "name": "Casusluk Aksiyonu",
        "description": "Gizli görevler, ajanlar, sabotaj ve operasyonları yüksek tempoyla anlatan eserlerdir."
      },
      {
        "id": "askeri-aksiyon",
        "name": "Askerî Aksiyon",
        "description": "Askerî operasyonlar, birlikler ve savaş görevleri üzerine kurulu eserlerdir."
      },
      {
        "id": "denizcilik-macerasi",
        "name": "Denizcilik Macerası",
        "description": "Gemiler, deniz yolculukları, okyanus keşifleri ve deniz çatışmalarını konu alan eserlerdir."
      },
      {
        "id": "korsan-macerasi",
        "name": "Korsan Macerası",
        "description": "Korsanlar, hazine, açık deniz ve özgürlük temalarını merkezine alan eserlerdir."
      },
      {
        "id": "arkeolojik-macera",
        "name": "Arkeolojik Macera",
        "description": "Antik kalıntılar, kayıp şehirler ve tarihi sırların peşinde geçen macera eserleridir."
      },
      {
        "id": "felaket-macerasi",
        "name": "Felaket Macerası",
        "description": "Deprem, fırtına, yangın, çöküş veya büyük afetler sırasında hayatta kalma ve kaçış mücadelesini anlatan eserlerdir."
      }
    ]
  },
  {
    "order": 8,
    "id": "tarihi-kurgu",
    "name": "Tarihî Kurgu",
    "emoji": "🏛️",
    "lucideIconName": "Landmark",
    "description": "Tarihî Kurgu, geçmişte belirli bir dönem, toplum veya tarihsel olay çevresinde geçen kurmaca eserleri kapsar. Gerçek tarihsel unsurlar kurmaca karakterler veya olaylarla bir araya getirilebilir.",
    "subGenres": [
      {
        "id": "antik-cag-kurgusu",
        "name": "Antik Çağ Kurgusu",
        "description": "Antik uygarlıklar ve eski çağ toplumlarında geçen eserlerdir."
      },
      {
        "id": "orta-cag-kurgusu",
        "name": "Orta Çağ Kurgusu",
        "description": "Orta Çağ toplumları, feodal sistem, şövalyeler ve tarihsel çatışmalar çevresinde gelişen eserlerdir."
      },
      {
        "id": "osmanli-donemi",
        "name": "Osmanlı Dönemi",
        "description": "Osmanlı İmparatorluğu'nun farklı dönemlerinde geçen tarihî kurgu eserleridir."
      },
      {
        "id": "selcuklu-donemi",
        "name": "Selçuklu Dönemi",
        "description": "Selçuklu dünyası, Anadolu ve çevresindeki tarihsel süreçleri konu alan eserlerdir."
      },
      {
        "id": "cumhuriyet-donemi",
        "name": "Cumhuriyet Dönemi",
        "description": "Türkiye Cumhuriyeti'nin farklı dönemlerinde geçen tarihî kurgu eserleridir."
      },
      {
        "id": "yakin-tarih",
        "name": "Yakın Tarih",
        "description": "Yakın geçmişte yaşanan toplumsal veya siyasi olaylar çevresinde gelişen eserlerdir."
      },
      {
        "id": "antik-yunan",
        "name": "Antik Yunan",
        "description": "Antik Yunan şehir devletleri, kültürü, savaşları ve toplumsal yaşamını konu alan eserlerdir."
      },
      {
        "id": "antik-roma",
        "name": "Antik Roma",
        "description": "Roma Cumhuriyeti veya Roma İmparatorluğu döneminde geçen eserlerdir."
      },
      {
        "id": "viking-cagi",
        "name": "Viking Çağı",
        "description": "İskandinav toplumları, keşifler, savaşçılar ve Viking kültürü çevresinde gelişen eserlerdir."
      },
      {
        "id": "ronesans",
        "name": "Rönesans",
        "description": "Rönesans döneminin sanat, bilim, siyaset ve toplum yapısını konu alan eserlerdir."
      },
      {
        "id": "viktorya-donemi",
        "name": "Viktorya Dönemi",
        "description": "19. yüzyıl Britanya toplumunda geçen tarihî eserlerdir."
      },
      {
        "id": "birinci-dunya-savasi",
        "name": "Birinci Dünya Savaşı",
        "description": "I. Dünya Savaşı döneminde askerler, siviller veya cephe gerisini konu alan eserlerdir."
      },
      {
        "id": "ikinci-dunya-savasi",
        "name": "İkinci Dünya Savaşı",
        "description": "II. Dünya Savaşı'nın cephelerini, işgalleri ve sivil yaşamı konu alan eserlerdir."
      },
      {
        "id": "tarihi-macera",
        "name": "Tarihî Macera",
        "description": "Geçmiş dönemleri aksiyon, keşif ve macera unsurlarıyla birleştiren eserlerdir."
      },
      {
        "id": "tarihi-dram",
        "name": "Tarihî Dram",
        "description": "Tarihsel dönemi güçlü kişisel ve toplumsal çatışmalarla ele alan eserlerdir."
      },
      {
        "id": "tarihi-romantik",
        "name": "Tarihî Romantik",
        "description": "Geçmiş bir tarihsel dönemde gelişen romantik ilişkileri konu alan eserlerdir."
      },
      {
        "id": "alternatif-tarih",
        "name": "Alternatif Tarih",
        "description": "Gerçek tarihte yaşanan bir olayın farklı sonuçlanması üzerine kurulu alternatif geçmiş anlatılarıdır."
      }
    ]
  },
  {
    "order": 9,
    "id": "dram",
    "name": "Dram",
    "emoji": "🎭",
    "lucideIconName": "Theater",
    "description": "Dram, karakterlerin duygusal, kişisel, toplumsal veya ailevi çatışmalarını merkezine alan eserleri kapsar. Türün temel amacı karakterlerin yaşadığı dönüşümü, kaybı, mücadeleyi ve insan ilişkilerini derinlemesine işlemektir.",
    "subGenres": [
      {
        "id": "aile-drami",
        "name": "Aile Dramı",
        "description": "Aile içindeki ilişkiler, çatışmalar, sırlar ve kuşak farklılıklarını konu alan eserlerdir."
      },
      {
        "id": "toplumsal-dram",
        "name": "Toplumsal Dram",
        "description": "Toplumsal eşitsizlikler, kültürel baskılar ve sosyal sorunları kişisel hikâyeler üzerinden anlatan eserlerdir."
      },
      {
        "id": "psikolojik-dram",
        "name": "Psikolojik Dram",
        "description": "Karakterlerin iç dünyasını, travmalarını ve zihinsel çatışmalarını merkeze alan eserlerdir."
      },
      {
        "id": "romantik-dram",
        "name": "Romantik Dram",
        "description": "Romantik ilişkileri yoğun duygusal çatışmalarla birleştiren eserlerdir."
      },
      {
        "id": "genclik-drami",
        "name": "Gençlik Dramı",
        "description": "Genç karakterlerin aile, okul, arkadaşlık ve kimlik sorunlarını konu alan eserlerdir."
      },
      {
        "id": "trajedi",
        "name": "Trajedi",
        "description": "Kaçınılmaz kayıplar, ağır sonuçlar ve karakterlerin çöküşü üzerine kurulu dramatik eserlerdir."
      },
      {
        "id": "melodram",
        "name": "Melodram",
        "description": "Yoğun duygular, büyük fedakârlıklar, dramatik tesadüfler ve güçlü çatışmaları merkeze alan eserlerdir."
      },
      {
        "id": "sosyal-gercekcilik",
        "name": "Sosyal Gerçekçilik",
        "description": "Gündelik yaşamı ve toplumsal sorunları gerçekçi biçimde ele alan eserlerdir."
      },
      {
        "id": "kusak-drami",
        "name": "Kuşak Dramı",
        "description": "Birden fazla neslin yaşamını ve aile içindeki tarihsel değişimleri konu alan eserlerdir."
      },
      {
        "id": "yas-ve-kayip",
        "name": "Yas ve Kayıp",
        "description": "Ölüm, ayrılık veya büyük kayıpların karakterler üzerindeki etkisini ele alan eserlerdir."
      },
      {
        "id": "hastalik-drami",
        "name": "Hastalık Dramı",
        "description": "Hastalık, bakım, yaşam mücadelesi ve aile ilişkilerini konu alan eserlerdir."
      },
      {
        "id": "mahkeme-drami",
        "name": "Mahkeme Dramı",
        "description": "Hukuki süreçlerin ve adalet arayışının karakterler üzerindeki etkisini merkeze alan eserlerdir."
      }
    ]
  },
  {
    "order": 10,
    "id": "edebi-kurgu",
    "name": "Edebi Kurgu",
    "emoji": "📜",
    "lucideIconName": "BookOpen",
    "description": "Edebi Kurgu, olay örgüsünden çok dil, karakter derinliği, tema, insan doğası ve anlatım biçimine önem veren eserleri kapsar. Eserler çoğunlukla çok katmanlı anlamlar, güçlü karakter çözümlemeleri ve özgün anlatım teknikleri içerir.",
    "subGenres": [
      {
        "id": "cagdas-edebi-kurgu",
        "name": "Çağdaş Edebi Kurgu",
        "description": "Günümüz insanını ve toplumunu edebi bir anlatım anlayışıyla ele alan eserlerdir."
      },
      {
        "id": "modernist-kurgu",
        "name": "Modernist Kurgu",
        "description": "Bilinç akışı, parçalı anlatım ve bireyin iç dünyasına odaklanan eserlerdir."
      },
      {
        "id": "postmodern-kurgu",
        "name": "Postmodern Kurgu",
        "description": "Üstkurmaca, ironi, metinlerarasılık ve anlatı oyunlarını kullanan eserlerdir."
      },
      {
        "id": "deneysel-kurgu",
        "name": "Deneysel Kurgu",
        "description": "Geleneksel anlatı biçimlerini kırarak farklı yapı ve teknikler deneyen eserlerdir."
      },
      {
        "id": "varolussal-kurgu",
        "name": "Varoluşsal Kurgu",
        "description": "İnsan yaşamının anlamı, özgürlük, yalnızlık ve ölüm gibi varoluşsal meseleleri ele alan eserlerdir."
      },
      {
        "id": "felsefi-kurgu",
        "name": "Felsefi Kurgu",
        "description": "Felsefi soruları ve düşünsel tartışmaları olay örgüsü ve karakterler üzerinden işleyen eserlerdir."
      },
      {
        "id": "sosyal-kurgu",
        "name": "Sosyal Kurgu",
        "description": "Toplum yapısını, sınıf ilişkilerini ve sosyal değişimi edebi bakış açısıyla ele alan eserlerdir."
      },
      {
        "id": "aile-ve-kusak-anlatisi",
        "name": "Aile ve Kuşak Anlatısı",
        "description": "Bir ailenin veya birden fazla kuşağın yaşamını uzun dönemli biçimde anlatan eserlerdir."
      },
      {
        "id": "metaforik-kurgu",
        "name": "Metaforik Kurgu",
        "description": "Olayları ve karakterleri güçlü semboller ve metaforlar üzerinden kuran eserlerdir."
      },
      {
        "id": "bilinc-akisi",
        "name": "Bilinç Akışı",
        "description": "Karakterin düşünce, duygu ve çağrışımlarını kesintisiz biçimde aktarmaya dayanan eserlerdir."
      },
      {
        "id": "minimalist-kurgu",
        "name": "Minimalist Kurgu",
        "description": "Sade dil, sınırlı olay ve yoğun alt metin kullanımıyla kurulan eserlerdir."
      }
    ]
  },
  {
    "order": 11,
    "id": "psikolojik-kurgu",
    "name": "Psikolojik Kurgu",
    "emoji": "🧠",
    "lucideIconName": "Brain",
    "description": "Psikolojik Kurgu, karakterlerin zihinsel süreçlerini, iç çatışmalarını, duygusal dönüşümlerini ve gerçeklik algılarını merkeze alan eserleri kapsar.",
    "subGenres": [
      {
        "id": "icsel-yolculuk",
        "name": "İçsel Yolculuk",
        "description": "Karakterin kendi kimliğini, geçmişini ve duygularını keşfetmesine odaklanan eserlerdir."
      },
      {
        "id": "travma-kurgusu",
        "name": "Travma Kurgusu",
        "description": "Geçmişte yaşanan ağır olayların karakterin bugünkü yaşamına etkisini ele alan eserlerdir."
      },
      {
        "id": "kimlik-kurgusu",
        "name": "Kimlik Kurgusu",
        "description": "Benlik, kişilik, aidiyet ve kişinin kendisini tanımlama sürecini konu alan eserlerdir."
      },
      {
        "id": "hafiza-kurgusu",
        "name": "Hafıza Kurgusu",
        "description": "Hafıza kaybı, yanlış anılar veya geçmişin yeniden hatırlanması üzerinden gelişen eserlerdir."
      },
      {
        "id": "guvenilmez-anlatici",
        "name": "Güvenilmez Anlatıcı",
        "description": "Okuyucunun anlatıcının aktardığı olayların doğruluğundan emin olamadığı eserlerdir."
      },
      {
        "id": "paranoya-kurgusu",
        "name": "Paranoya Kurgusu",
        "description": "Karakterin çevresine, olaylara veya kendi algısına duyduğu güvenin giderek bozulduğu eserlerdir."
      },
      {
        "id": "obsesyon-kurgusu",
        "name": "Obsesyon Kurgusu",
        "description": "Bir kişi, amaç, fikir veya olay üzerine gelişen yoğun takıntıyı merkeze alan eserlerdir."
      },
      {
        "id": "manipulasyon-kurgusu",
        "name": "Manipülasyon Kurgusu",
        "description": "Psikolojik kontrol, gaslighting ve güç ilişkilerinin merkezde olduğu eserlerdir."
      },
      {
        "id": "yalnizlik-kurgusu",
        "name": "Yalnızlık Kurgusu",
        "description": "İzolasyon, yabancılaşma ve insanın kendisiyle ilişkisini konu alan eserlerdir."
      },
      {
        "id": "ahlaki-ikilem",
        "name": "Ahlaki İkilem",
        "description": "Karakterlerin doğru ile yanlış arasında kesin cevabı olmayan seçimlerle karşı karşıya kaldığı eserlerdir."
      }
    ]
  },
  {
    "order": 12,
    "id": "genc-kurgu",
    "name": "Genç Kurgu",
    "emoji": "🎒",
    "lucideIconName": "Smile",
    "description": "Genç Kurgu, gençlik dönemindeki karakterlerin kimlik, arkadaşlık, aile, eğitim, aşk ve gelecek gibi meselelerini merkezine alan eserleri kapsar.",
    "subGenres": [
      {
        "id": "genc-yetiskin",
        "name": "Genç Yetişkin",
        "description": "Genellikle ergenlik sonu ve genç yetişkinlik dönemindeki karakterlerin yaşamını konu alan eserlerdir."
      },
      {
        "id": "yeni-yetiskin",
        "name": "Yeni Yetişkin",
        "description": "Üniversite, ilk iş, bağımsız yaşam ve yetişkinliğe geçiş sürecindeki karakterleri konu alan eserlerdir."
      },
      {
        "id": "okul-kurgusu",
        "name": "Okul Kurgusu",
        "description": "Okul yaşamı, sınıf ilişkileri, öğretmenler ve öğrenciler çevresinde gelişen eserlerdir."
      },
      {
        "id": "lise-kurgusu",
        "name": "Lise Kurgusu",
        "description": "Lise çağındaki karakterlerin sosyal ve kişisel hayatlarını konu alan eserlerdir."
      },
      {
        "id": "kampus-kurgusu",
        "name": "Kampüs Kurgusu",
        "description": "Üniversite veya yükseköğretim ortamında geçen gençlik eserleridir."
      },
      {
        "id": "coming-of-age",
        "name": "Coming-of-Age",
        "description": "Bir karakterin çocukluktan veya gençlikten yetişkinliğe geçiş sürecini konu alan eserlerdir."
      },
      {
        "id": "arkadaslik",
        "name": "Arkadaşlık",
        "description": "Arkadaş grupları, dostluk, sadakat ve sosyal ilişkileri merkeze alan eserlerdir."
      },
      {
        "id": "ilk-ask",
        "name": "İlk Aşk",
        "description": "Karakterlerin ilk romantik deneyimlerini konu alan eserlerdir."
      },
      {
        "id": "genclik-drami",
        "name": "Gençlik Dramı",
        "description": "Genç karakterlerin ciddi kişisel, ailevi veya toplumsal sorunlarla mücadelesini anlatan eserlerdir."
      },
      {
        "id": "genclik-gizemi",
        "name": "Gençlik Gizemi",
        "description": "Genç karakterlerin sırları, kayıpları veya suçları araştırdığı eserlerdir."
      },
      {
        "id": "genclik-fantastigi",
        "name": "Gençlik Fantastiği",
        "description": "Fantastik olayları genç karakterlerin gelişim hikâyesiyle birleştiren eserlerdir."
      },
      {
        "id": "genclik-bilim-kurgusu",
        "name": "Gençlik Bilim Kurgusu",
        "description": "Bilim kurgu ortamını genç karakterlerin bakış açısıyla anlatan eserlerdir."
      },
      {
        "id": "genclik-distopyasi",
        "name": "Gençlik Distopyası",
        "description": "Baskıcı veya çökmüş toplumlarda genç karakterlerin mücadele ettiği eserlerdir."
      }
    ]
  },
  {
    "order": 13,
    "id": "komedi-ve-mizah",
    "name": "Komedi ve Mizah",
    "emoji": "😂",
    "lucideIconName": "Laugh",
    "description": "Komedi ve Mizah, okuyucuyu eğlendirmeyi, güldürmeyi veya olayları mizahi bir bakış açısıyla yorumlamayı amaçlayan eserleri kapsar.",
    "subGenres": [
      {
        "id": "durum-komedisi",
        "name": "Durum Komedisi",
        "description": "Karakterlerin günlük yaşamlarında ortaya çıkan komik durumları merkeze alan eserlerdir."
      },
      {
        "id": "romantik-komedi",
        "name": "Romantik Komedi",
        "description": "Romantik ilişkileri mizahi olaylarla birleştiren eserlerdir."
      },
      {
        "id": "kara-mizah",
        "name": "Kara Mizah",
        "description": "Ölüm, suç, felaket veya toplumsal sorunlar gibi ciddi konuları karanlık bir mizah anlayışıyla ele alan eserlerdir."
      },
      {
        "id": "absurt-komedi",
        "name": "Absürt Komedi",
        "description": "Mantık dışı, beklenmedik ve gerçeküstü durumlar üzerinden mizah üreten eserlerdir."
      },
      {
        "id": "satir",
        "name": "Satir",
        "description": "Toplumsal, siyasi veya kültürel kurumları eleştirel mizahla ele alan eserlerdir."
      },
      {
        "id": "parodi",
        "name": "Parodi",
        "description": "Başka türleri, eserleri veya anlatı kalıplarını mizahi biçimde taklit eden eserlerdir."
      },
      {
        "id": "ironik-kurgu",
        "name": "İronik Kurgu",
        "description": "Karakterler, olaylar veya toplumsal durumlar arasındaki çelişkileri ironi yoluyla ele alan eserlerdir."
      },
      {
        "id": "is-yeri-komedisi",
        "name": "İş Yeri Komedisi",
        "description": "Ofis, şirket veya çalışma ortamındaki ilişkileri mizahla anlatan eserlerdir."
      },
      {
        "id": "aile-komedisi",
        "name": "Aile Komedisi",
        "description": "Aile yaşamındaki çatışma ve ilişkileri eğlenceli biçimde ele alan eserlerdir."
      },
      {
        "id": "genclik-komedisi",
        "name": "Gençlik Komedisi",
        "description": "Okul, arkadaşlık ve gençlik yaşamını mizahi biçimde anlatan eserlerdir."
      }
    ]
  },
  {
    "order": 14,
    "id": "paranormal-ve-dogaustu",
    "name": "Paranormal ve Doğaüstü",
    "emoji": "🔮",
    "lucideIconName": "Moon",
    "description": "Paranormal ve Doğaüstü, gerçek dünyada açıklanamayan güçlerin, varlıkların ve metafizik olayların merkezde olduğu eserleri kapsar.",
    "subGenres": [
      {
        "id": "vampir",
        "name": "Vampir",
        "description": "Vampirlerin toplum, aşk, çatışma veya güç ilişkilerinde merkezî rol oynadığı eserlerdir."
      },
      {
        "id": "kurtadam",
        "name": "Kurtadam",
        "description": "Kurtadama dönüşüm, sürüler ve insan-hayvan ikiliğini konu alan eserlerdir."
      },
      {
        "id": "cadi",
        "name": "Cadı",
        "description": "Cadılar, büyücülük gelenekleri, ritüeller ve büyülü toplulukları konu alan eserlerdir."
      },
      {
        "id": "hayalet",
        "name": "Hayalet",
        "description": "Ölü ruhlar ve yaşayanlarla kurdukları ilişkileri anlatan eserlerdir."
      },
      {
        "id": "ruhlar",
        "name": "Ruhlar",
        "description": "Ruhani varlıklar ve metafizik boyutlarla etkileşimi konu alan eserlerdir."
      },
      {
        "id": "melek",
        "name": "Melek",
        "description": "Meleklerin veya göksel varlıkların hikâyede aktif rol oynadığı eserlerdir."
      },
      {
        "id": "demon",
        "name": "Demon",
        "description": "Demonlar, şeytani varlıklar ve bunlarla mücadeleyi konu alan eserlerdir."
      },
      {
        "id": "medyum",
        "name": "Medyum",
        "description": "Ruhlarla iletişim kurabilen veya doğaüstü algılara sahip karakterleri konu alan eserlerdir."
      },
      {
        "id": "paranormal-arastirma",
        "name": "Paranormal Araştırma",
        "description": "Doğaüstü olayları araştıran ekip, kurum veya bireyleri merkeze alan eserlerdir."
      },
      {
        "id": "lanet",
        "name": "Lanet",
        "description": "Bir kişi, aile, nesne veya mekân üzerinde etkili olan doğaüstü lanetleri konu alan eserlerdir."
      },
      {
        "id": "reenkarnasyon",
        "name": "Reenkarnasyon",
        "description": "Bir ruhun ölümden sonra başka bir bedende yeniden doğmasını konu alan eserlerdir."
      },
      {
        "id": "gecmis-yasam",
        "name": "Geçmiş Yaşam",
        "description": "Karakterlerin önceki yaşamlarına ait anıları, bağları veya sırları keşfetmesini anlatan eserlerdir."
      },
      {
        "id": "psisik-gucler",
        "name": "Psişik Güçler",
        "description": "Telepati, telekinezi, önsezi ve benzeri zihinsel yeteneklere sahip karakterleri konu alan eserlerdir."
      }
    ]
  },
  {
    "order": 15,
    "id": "distopya-ve-spekulatif-kurgu",
    "name": "Distopya ve Spekülatif Kurgu",
    "emoji": "☣️",
    "lucideIconName": "ShieldAlert",
    "description": "Distopya ve Spekülatif Kurgu, mevcut dünyanın farklı koşullar altında nasıl değişebileceğini araştıran; toplum, siyaset, teknoloji ve insan doğası üzerine varsayımsal dünyalar kuran eserleri kapsar.",
    "subGenres": [
      {
        "id": "distopya",
        "name": "Distopya",
        "description": "Baskıcı, eşitsiz veya totaliter toplum düzenlerini konu alan eserlerdir."
      },
      {
        "id": "utopya",
        "name": "Ütopya",
        "description": "İdeal veya kusursuz olduğu düşünülen toplum modellerini konu alan eserlerdir."
      },
      {
        "id": "politik-distopya",
        "name": "Politik Distopya",
        "description": "Devlet baskısı, propaganda, sansür ve otoriter yönetimleri merkeze alan eserlerdir."
      },
      {
        "id": "teknolojik-distopya",
        "name": "Teknolojik Distopya",
        "description": "Teknolojinin birey ve toplum üzerindeki baskıcı veya yıkıcı etkilerini konu alan eserlerdir."
      },
      {
        "id": "kurumsal-distopya",
        "name": "Kurumsal Distopya",
        "description": "Mega şirketlerin veya ekonomik yapıların toplum üzerinde aşırı güç sahibi olduğu eserlerdir."
      },
      {
        "id": "ekolojik-distopya",
        "name": "Ekolojik Distopya",
        "description": "Çevresel çöküş, kıtlık ve iklim krizleri sonucu oluşan toplumları konu alan eserlerdir."
      },
      {
        "id": "kiyamet",
        "name": "Kıyamet",
        "description": "Dünyayı veya uygarlığı sona erdirebilecek büyük felaket sürecini anlatan eserlerdir."
      },
      {
        "id": "kiyamet-sonrasi",
        "name": "Kıyamet Sonrası",
        "description": "Büyük bir felaket sonrasındaki hayatta kalma ve yeniden yapılanma süreçlerini anlatan eserlerdir."
      },
      {
        "id": "alternatif-toplum",
        "name": "Alternatif Toplum",
        "description": "Gerçek dünyadan farklı sosyal, ekonomik veya kültürel sistemlere sahip toplumları konu alan eserlerdir."
      },
      {
        "id": "yakin-gelecek",
        "name": "Yakın Gelecek",
        "description": "Mevcut teknolojik veya toplumsal eğilimlerin yakın gelecekteki sonuçlarını araştıran eserlerdir."
      },
      {
        "id": "sosyal-spekulasyon",
        "name": "Sosyal Spekülasyon",
        "description": "Toplumsal normlarda yapılacak bir değişikliğin insanların yaşamına etkisini araştıran eserlerdir."
      }
    ]
  },
  {
    "order": 16,
    "id": "mitolojik-kurgu",
    "name": "Mitolojik Kurgu",
    "emoji": "👑",
    "lucideIconName": "Crown",
    "description": "Mitolojik Kurgu, dünya mitolojilerindeki tanrılar, kahramanlar, yaratıklar, efsaneler ve kutsal anlatılardan beslenen eserleri kapsar.",
    "subGenres": [
      {
        "id": "turk-mitolojisi",
        "name": "Türk Mitolojisi",
        "description": "Türk ve Orta Asya mitolojilerinden, destanlarından ve inanç sistemlerinden beslenen eserlerdir."
      },
      {
        "id": "yunan-mitolojisi",
        "name": "Yunan Mitolojisi",
        "description": "Antik Yunan tanrıları, kahramanları ve efsanelerini konu alan eserlerdir."
      },
      {
        "id": "roma-mitolojisi",
        "name": "Roma Mitolojisi",
        "description": "Roma tanrıları, efsaneleri ve kültürel mitlerinden beslenen eserlerdir."
      },
      {
        "id": "iskandinav-mitolojisi",
        "name": "İskandinav Mitolojisi",
        "description": "Odin, Thor, Loki, Ragnarök ve İskandinav mitolojik dünyasını konu alan eserlerdir."
      },
      {
        "id": "misir-mitolojisi",
        "name": "Mısır Mitolojisi",
        "description": "Antik Mısır tanrıları, ölüm inançları ve efsanelerinden beslenen eserlerdir."
      },
      {
        "id": "mezopotamya-mitolojisi",
        "name": "Mezopotamya Mitolojisi",
        "description": "Sümer, Akad, Babil ve Mezopotamya mitolojilerinden beslenen eserlerdir."
      },
      {
        "id": "japon-mitolojisi",
        "name": "Japon Mitolojisi",
        "description": "Kami, yokai ve Japon halk inançlarından beslenen eserlerdir."
      },
      {
        "id": "cin-mitolojisi",
        "name": "Çin Mitolojisi",
        "description": "Çin efsaneleri, tanrıları, ölümsüzleri ve geleneksel kozmolojiden beslenen eserlerdir."
      },
      {
        "id": "hint-mitolojisi",
        "name": "Hint Mitolojisi",
        "description": "Hint destanları, tanrıları ve mitolojik anlatılarından beslenen eserlerdir."
      },
      {
        "id": "kelt-mitolojisi",
        "name": "Kelt Mitolojisi",
        "description": "Kelt efsaneleri, tanrıları ve halk anlatılarından beslenen eserlerdir."
      },
      {
        "id": "slav-mitolojisi",
        "name": "Slav Mitolojisi",
        "description": "Slav halk inançları, ruhları ve mitolojik varlıklarından beslenen eserlerdir."
      },
      {
        "id": "anadolu-mitolojisi",
        "name": "Anadolu Mitolojisi",
        "description": "Anadolu uygarlıkları, yerel efsaneler ve mitolojik geleneklerden beslenen eserlerdir."
      },
      {
        "id": "mitolojik-yeniden-anlatim",
        "name": "Mitolojik Yeniden Anlatım",
        "description": "Klasik mitolojik hikâyeleri farklı bakış açılarıyla yeniden yorumlayan eserlerdir."
      },
      {
        "id": "modern-mitoloji",
        "name": "Modern Mitoloji",
        "description": "Mitolojik varlıkları veya tanrıları çağdaş dünyaya taşıyan eserlerdir."
      }
    ]
  },
  {
    "order": 17,
    "id": "dogu-ve-asya-kurgu",
    "name": "Doğu ve Asya Kurgu",
    "emoji": "⛩️",
    "lucideIconName": "Scroll",
    "description": "Doğu ve Asya Kurgu, özellikle Çin, Kore, Japonya ve Doğu Asya anlatı geleneklerinden gelişen ilerleme, dövüş, ruhsal gelişim ve yeniden doğuş temelli kurgu biçimlerini kapsar.",
    "subGenres": [
      {
        "id": "wuxia",
        "name": "Wuxia",
        "description": "Dövüş sanatları ustaları, onur, mezhepler ve kahramanlık temalarını konu alan Çin kökenli kurgu türüdür."
      },
      {
        "id": "xianxia",
        "name": "Xianxia",
        "description": "Ölümsüzlük, ruhsal gelişim, cultivation, büyü ve kozmik güçler üzerine kurulu Çin fantastik türüdür."
      },
      {
        "id": "xuanhuan",
        "name": "Xuanhuan",
        "description": "Çin mitolojisi ve cultivation unsurlarını farklı fantastik sistemlerle birleştiren eserlerdir."
      },
      {
        "id": "murim",
        "name": "Murim",
        "description": "Dövüş sanatları mezhepleri, klanlar ve güç hiyerarşileri üzerine kurulu Kore kökenli kurgu türüdür."
      },
      {
        "id": "cultivation",
        "name": "Cultivation",
        "description": "Karakterin ruhsal, fiziksel veya enerji temelli eğitimle sürekli güçlendiği eserlerdir."
      },
      {
        "id": "isekai",
        "name": "İsekai",
        "description": "Karakterin başka bir dünyaya taşındığı, çağrıldığı veya yeniden doğduğu eserlerdir."
      },
      {
        "id": "ters-isekai",
        "name": "Ters İsekai",
        "description": "Fantastik bir dünyadan gelen karakterlerin modern veya gerçek dünyaya geçtiği eserlerdir."
      },
      {
        "id": "reenkarnasyon",
        "name": "Reenkarnasyon",
        "description": "Karakterin öldükten sonra aynı veya farklı bir dünyada yeniden doğduğu eserlerdir."
      },
      {
        "id": "regresyon",
        "name": "Regresyon",
        "description": "Karakterin geçmişteki kendi bedenine veya yaşamının önceki bir dönemine geri dönmesini konu alan eserlerdir."
      },
      {
        "id": "otome-isekai",
        "name": "Otome Isekai",
        "description": "Romantik oyun, saray veya aristokrasi temelli bir dünyaya taşınan ya da yeniden doğan karakterleri konu alan eserlerdir."
      },
      {
        "id": "villainess",
        "name": "Villainess",
        "description": "Karakterin bir hikâye veya oyundaki kötü kadın karakter rolünde yeniden doğduğu veya bu rolü üstlendiği eserlerdir."
      },
      {
        "id": "sistem-seviye-atlama",
        "name": "Sistem / Seviye Atlama",
        "description": "Karakterin görevler, seviyeler ve yetenek ekranları üzerinden güçlendiği eserlerdir."
      },
      {
        "id": "kule-tirmanisi",
        "name": "Kule Tırmanışı",
        "description": "Katmanlardan oluşan kule, sınav veya meydan okuma sisteminde ilerleyen karakterleri konu alan eserlerdir."
      },
      {
        "id": "avci-hunter",
        "name": "Avcı / Hunter",
        "description": "Canavarlar, kapılar, zindanlar ve profesyonel avcıların bulunduğu modern fantastik dünyaları konu alan eserlerdir."
      },
      {
        "id": "dungeon",
        "name": "Dungeon",
        "description": "Zindan keşfi, yaratıklarla mücadele ve ödül sistemleri üzerine kurulu eserlerdir."
      },
      {
        "id": "akademi",
        "name": "Akademi",
        "description": "Fantastik, dövüş veya güç sistemlerini öğreten akademilerde geçen eserlerdir."
      },
      {
        "id": "murim-reenkarnasyonu",
        "name": "Murim Reenkarnasyonu",
        "description": "Modern veya farklı dünyadan bir karakterin murim dünyasında yeniden doğmasını konu alan eserlerdir."
      }
    ]
  },
  {
    "order": 18,
    "id": "gunluk-yasam",
    "name": "Günlük Yaşam",
    "emoji": "☕",
    "lucideIconName": "Coffee",
    "description": "Günlük Yaşam, büyük savaşlar veya olağanüstü olaylardan çok karakterlerin gündelik hayatlarına, ilişkilerine ve küçük fakat anlamlı deneyimlerine odaklanan eserleri kapsar.",
    "subGenres": [
      {
        "id": "slice-of-life",
        "name": "Slice of Life",
        "description": "Karakterlerin günlük yaşamlarından kesitleri doğal ve sakin biçimde anlatan eserlerdir."
      },
      {
        "id": "aile-yasami",
        "name": "Aile Yaşamı",
        "description": "Aile ilişkileri ve ev hayatını merkeze alan günlük yaşam eserleridir."
      },
      {
        "id": "arkadaslik",
        "name": "Arkadaşlık",
        "description": "Dostluk ilişkilerini ve birlikte geçirilen zamanı merkeze alan eserlerdir."
      },
      {
        "id": "okul-yasami",
        "name": "Okul Yaşamı",
        "description": "Öğrencilerin gündelik okul deneyimlerini anlatan eserlerdir."
      },
      {
        "id": "kampus-yasami",
        "name": "Kampüs Yaşamı",
        "description": "Üniversite ve kampüs ortamındaki gündelik hayatı konu alan eserlerdir."
      },
      {
        "id": "is-hayati",
        "name": "İş Hayatı",
        "description": "Çalışma ortamı, kariyer ve iş arkadaşlıklarını günlük yaşam perspektifiyle anlatan eserlerdir."
      },
      {
        "id": "mahalle-hikayesi",
        "name": "Mahalle Hikâyesi",
        "description": "Belirli bir mahalle veya yerel toplulukta yaşayan insanların ilişkilerini konu alan eserlerdir."
      },
      {
        "id": "kucuk-kasaba",
        "name": "Küçük Kasaba",
        "description": "Küçük yerleşimlerdeki toplumsal ilişkiler ve gündelik yaşamı anlatan eserlerdir."
      },
      {
        "id": "sehir-yasami",
        "name": "Şehir Yaşamı",
        "description": "Büyük şehirlerdeki gündelik yaşam, yalnızlık, ilişkiler ve kariyer deneyimlerini konu alan eserlerdir."
      },
      {
        "id": "sakin-yasam",
        "name": "Sakin Yaşam",
        "description": "Huzur, rutinler, doğa ve küçük mutlulukları merkeze alan düşük çatışmalı eserlerdir."
      },
      {
        "id": "iyilestirici-kurgu",
        "name": "İyileştirici Kurgu",
        "description": "Okuyucuya huzur, umut ve duygusal rahatlama vermeyi amaçlayan sıcak ve sakin hikâyelerdir."
      },
      {
        "id": "yemek-ve-mutfak-kurgusu",
        "name": "Yemek ve Mutfak Kurgusu",
        "description": "Yemek, restoran, mutfak kültürü veya aşçılık çevresinde gelişen günlük yaşam eserleridir."
      }
    ]
  },
  {
    "order": 19,
    "id": "savas-ve-askeri-kurgu",
    "name": "Savaş ve Askerî Kurgu",
    "emoji": "🪖",
    "lucideIconName": "Crosshair",
    "description": "Savaş ve Askerî Kurgu, askerler, ordular, savaş stratejileri ve çatışmaların bireyler ve toplumlar üzerindeki etkisini merkeze alan eserleri kapsar.",
    "subGenres": [
      {
        "id": "tarihi-savas",
        "name": "Tarihî Savaş",
        "description": "Gerçek tarihsel savaşlar veya dönemler çevresinde gelişen eserlerdir."
      },
      {
        "id": "modern-savas",
        "name": "Modern Savaş",
        "description": "Çağdaş askerî çatışmaları konu alan eserlerdir."
      },
      {
        "id": "askeri-dram",
        "name": "Askerî Dram",
        "description": "Askerlerin kişisel yaşamlarını ve savaşın duygusal sonuçlarını anlatan eserlerdir."
      },
      {
        "id": "askeri-aksiyon",
        "name": "Askerî Aksiyon",
        "description": "Operasyon, çatışma ve görevlerin ön planda olduğu yüksek tempolu eserlerdir."
      },
      {
        "id": "ozel-kuvvetler",
        "name": "Özel Kuvvetler",
        "description": "Özel askerî birlikler ve gizli operasyonları konu alan eserlerdir."
      },
      {
        "id": "direnis",
        "name": "Direniş",
        "description": "İşgal veya baskıcı güçlere karşı örgütlenen direniş hareketlerini anlatan eserlerdir."
      },
      {
        "id": "gerilla-savasi",
        "name": "Gerilla Savaşı",
        "description": "Düzensiz birlikler ve küçük ölçekli savaş taktiklerini konu alan eserlerdir."
      },
      {
        "id": "deniz-savasi",
        "name": "Deniz Savaşı",
        "description": "Donanmalar, savaş gemileri ve deniz çatışmalarını konu alan eserlerdir."
      },
      {
        "id": "hava-savasi",
        "name": "Hava Savaşı",
        "description": "Pilotlar, hava kuvvetleri ve hava çatışmalarını konu alan eserlerdir."
      },
      {
        "id": "savas-sonrasi",
        "name": "Savaş Sonrası",
        "description": "Savaş bittikten sonra toplumların ve bireylerin yeniden yaşam kurma süreçlerini anlatan eserlerdir."
      },
      {
        "id": "cephe-gerisi",
        "name": "Cephe Gerisi",
        "description": "Savaş sırasında sivillerin, ailelerin ve toplumun yaşadığı olaylara odaklanan eserlerdir."
      }
    ]
  },
  {
    "order": 20,
    "id": "western",
    "name": "Western",
    "emoji": "🤠",
    "lucideIconName": "Compass",
    "description": "Western, özellikle 19. yüzyıl Amerikan sınır bölgelerinin kültüründen doğan; kanun, özgürlük, hayatta kalma ve sınır yaşamı temalarını işleyen eserleri kapsar.",
    "subGenres": [
      {
        "id": "klasik-western",
        "name": "Klasik Western",
        "description": "Kovboylar, kasabalar, kanun adamları ve haydutlar çevresinde gelişen eserlerdir."
      },
      {
        "id": "spaghetti-western",
        "name": "Spaghetti Western",
        "description": "Daha sert, stilize ve ahlaki açıdan gri western anlatılarıdır."
      },
      {
        "id": "weird-west",
        "name": "Weird West",
        "description": "Western dünyasını korku, fantastik veya doğaüstü unsurlarla birleştiren eserlerdir."
      },
      {
        "id": "neo-western",
        "name": "Neo-Western",
        "description": "Western temalarını modern dönem veya farklı coğrafyalara uyarlayan eserlerdir."
      },
      {
        "id": "kanun-adami",
        "name": "Kanun Adamı",
        "description": "Şerifler, marshaller ve suçlular arasındaki mücadeleyi konu alan eserlerdir."
      },
      {
        "id": "haydut-western",
        "name": "Haydut Western",
        "description": "Kanun kaçakları ve suç çetelerinin bakış açısından anlatılan eserlerdir."
      },
      {
        "id": "sinir-yasami",
        "name": "Sınır Yaşamı",
        "description": "Yeni yerleşimler, vahşi doğa ve sınır bölgelerinde hayatta kalmayı konu alan eserlerdir."
      }
    ]
  },
  {
    "order": 21,
    "id": "spor-kurgusu",
    "name": "Spor Kurgusu",
    "emoji": "⚽",
    "lucideIconName": "Trophy",
    "description": "Spor Kurgusu, sporcuların kariyerlerini, rekabetlerini, takım ilişkilerini ve kişisel gelişimlerini merkeze alan eserleri kapsar.",
    "subGenres": [
      {
        "id": "futbol",
        "name": "Futbol",
        "description": "Futbolcular, kulüpler, takımlar ve rekabetler üzerine kurulu eserlerdir."
      },
      {
        "id": "basketbol",
        "name": "Basketbol",
        "description": "Basketbol dünyası ve oyuncuların gelişimini konu alan eserlerdir."
      },
      {
        "id": "voleybol",
        "name": "Voleybol",
        "description": "Voleybol takımları, turnuvalar ve sporcu ilişkilerini konu alan eserlerdir."
      },
      {
        "id": "dovus-sporlari",
        "name": "Dövüş Sporları",
        "description": "Boks, kickboks, MMA ve benzeri sporları konu alan eserlerdir."
      },
      {
        "id": "motor-sporlari",
        "name": "Motor Sporları",
        "description": "Otomobil, motosiklet ve yarış dünyasını konu alan eserlerdir."
      },
      {
        "id": "e-spor",
        "name": "E-Spor",
        "description": "Profesyonel oyun, takımlar ve dijital rekabet dünyasını konu alan eserlerdir."
      },
      {
        "id": "bireysel-spor",
        "name": "Bireysel Spor",
        "description": "Tek başına yapılan spor dallarında kariyer ve kişisel mücadeleyi konu alan eserlerdir."
      },
      {
        "id": "spor-drami",
        "name": "Spor Dramı",
        "description": "Spor dünyasını güçlü duygusal çatışmalar ve kişisel kayıplarla birleştiren eserlerdir."
      },
      {
        "id": "spor-romantigi",
        "name": "Spor Romantiği",
        "description": "Spor dünyasında gelişen romantik ilişkileri konu alan eserlerdir."
      },
      {
        "id": "spor-akademisi",
        "name": "Spor Akademisi",
        "description": "Spor eğitimi veren okul, akademi veya kulüplerde geçen eserlerdir."
      },
      {
        "id": "turnuva-kurgusu",
        "name": "Turnuva Kurgusu",
        "description": "Turnuva yapısı ve rekabet aşamalarının anlatının temelini oluşturduğu eserlerdir."
      }
    ]
  },
  {
    "order": 22,
    "id": "cocuk-ve-orta-yas-grubu-kurgu",
    "name": "Çocuk ve Orta Yaş Grubu Kurgu",
    "emoji": "🎈",
    "lucideIconName": "Sparkles",
    "description": "Çocuk ve Orta Yaş Grubu Kurgu, çocuk ve erken gençlik dönemindeki okurlar için yazılan; yaşa uygun dil, tema ve çatışma yapısına sahip eserleri kapsar.",
    "subGenres": [
      {
        "id": "cocuk-macerasi",
        "name": "Çocuk Macerası",
        "description": "Çocuk karakterlerin keşif ve maceralarını konu alan eserlerdir."
      },
      {
        "id": "cocuk-fantastigi",
        "name": "Çocuk Fantastiği",
        "description": "Büyülü dünyaları ve fantastik olayları çocuk karakterlerin bakış açısından anlatan eserlerdir."
      },
      {
        "id": "cocuk-gizemi",
        "name": "Çocuk Gizemi",
        "description": "Çocuk karakterlerin sırları veya küçük gizemleri çözdüğü eserlerdir."
      },
      {
        "id": "okul-hikayesi",
        "name": "Okul Hikâyesi",
        "description": "Okul yaşamı, arkadaşlık ve öğrencilik deneyimlerini konu alan eserlerdir."
      },
      {
        "id": "hayvan-hikayesi",
        "name": "Hayvan Hikâyesi",
        "description": "Hayvan karakterlerin veya insan-hayvan ilişkilerinin merkezde olduğu eserlerdir."
      },
      {
        "id": "aile-hikayesi",
        "name": "Aile Hikâyesi",
        "description": "Çocukların aile ilişkileri ve ev yaşamını konu alan eserlerdir."
      },
      {
        "id": "orta-yas-grubu-fantastik",
        "name": "Orta Yaş Grubu Fantastik",
        "description": "Yaklaşık 8–12 yaş grubuna yönelik fantastik macera eserleridir."
      },
      {
        "id": "orta-yas-grubu-macera",
        "name": "Orta Yaş Grubu Macera",
        "description": "Çocukluk ile gençlik arasındaki yaş grubuna yönelik keşif ve macera eserleridir."
      },
      {
        "id": "egitici-kurgu",
        "name": "Eğitici Kurgu",
        "description": "Bir bilgi veya değeri hikâye yoluyla aktarmayı amaçlayan eserlerdir."
      }
    ]
  },
  {
    "order": 23,
    "id": "siir",
    "name": "Şiir",
    "emoji": "🪶",
    "lucideIconName": "PenTool",
    "description": "Şiir, duygu, düşünce, imge ve dilin ritmik veya yoğunlaştırılmış biçimde kullanıldığı edebi eserleri kapsar. Şiirler belirli biçim kurallarına bağlı olabileceği gibi tamamen serbest yapıda da yazılabilir.",
    "subGenres": [
      {
        "id": "lirik-siir",
        "name": "Lirik Şiir",
        "description": "Şairin kişisel duygularını ve iç dünyasını merkeze alan şiirlerdir."
      },
      {
        "id": "ask-siiri",
        "name": "Aşk Şiiri",
        "description": "Aşk, özlem, ayrılık ve romantik duyguları konu alan şiirlerdir."
      },
      {
        "id": "epik-siir",
        "name": "Epik Şiir",
        "description": "Kahramanlık, savaş ve büyük tarihsel olayları anlatan uzun şiir türüdür."
      },
      {
        "id": "pastoral-siir",
        "name": "Pastoral Şiir",
        "description": "Doğa, kırsal yaşam ve doğal güzellikleri konu alan şiirlerdir."
      },
      {
        "id": "didaktik-siir",
        "name": "Didaktik Şiir",
        "description": "Bilgi, düşünce veya öğreti aktarmayı amaçlayan şiirlerdir."
      },
      {
        "id": "satirik-siir",
        "name": "Satirik Şiir",
        "description": "Toplumsal veya bireysel kusurları eleştirel ve mizahi biçimde işleyen şiirlerdir."
      },
      {
        "id": "elegi",
        "name": "Elegi",
        "description": "Kayıp, ölüm, yas ve hüzün temalarını işleyen şiirlerdir."
      },
      {
        "id": "serbest-siir",
        "name": "Serbest Şiir",
        "description": "Belirli ölçü veya kafiye düzenine bağlı kalmadan yazılan şiirlerdir."
      },
      {
        "id": "anlati-siiri",
        "name": "Anlatı Şiiri",
        "description": "Bir olay veya hikâyeyi şiir biçiminde anlatan eserlerdir."
      },
      {
        "id": "duzyazi-siir",
        "name": "Düzyazı Şiir",
        "description": "Şiirsel dili düzyazı biçimiyle birleştiren eserlerdir."
      },
      {
        "id": "deneysel-siir",
        "name": "Deneysel Şiir",
        "description": "Geleneksel şiir biçimlerinin dışına çıkan yenilikçi yapı ve dil deneylerini kullanan şiirlerdir."
      },
      {
        "id": "haiku",
        "name": "Haiku",
        "description": "Kısa, yoğun ve çoğunlukla doğa veya anlık gözlem üzerine kurulu Japon şiir biçimidir."
      },
      {
        "id": "sonnet",
        "name": "Sonnet",
        "description": "Belirli dize ve kafiye düzenine sahip klasik şiir biçimidir."
      },
      {
        "id": "halk-siiri",
        "name": "Halk Şiiri",
        "description": "Halk edebiyatı geleneklerinden, hece ölçüsünden ve sözlü kültürden beslenen şiirlerdir."
      },
      {
        "id": "tasavvufi-siir",
        "name": "Tasavvufi Şiir",
        "description": "Maneviyat, ilahi aşk, insan ve varoluş üzerine kurulu şiirlerdir."
      }
    ]
  },
  {
    "order": 24,
    "id": "deneysel-ve-hibrit-kurgu",
    "name": "Deneysel ve Hibrit Kurgu",
    "emoji": "🧪",
    "lucideIconName": "FlaskConical",
    "description": "Deneysel ve Hibrit Kurgu, geleneksel tür sınırlarını bilinçli biçimde aşan, birden fazla anlatı türünü veya farklı anlatım tekniklerini bir araya getiren eserleri kapsar.",
    "subGenres": [
      {
        "id": "turlerarasi-kurgu",
        "name": "Türlerarası Kurgu",
        "description": "Birden fazla ana türün belirgin özelliklerini eşit derecede kullanan eserlerdir."
      },
      {
        "id": "meta-kurgu",
        "name": "Meta Kurgu",
        "description": "Kendi kurmaca yapısının farkında olan ve anlatının oluşum sürecini doğrudan konu edinen eserlerdir."
      },
      {
        "id": "interaktif-kurgu",
        "name": "İnteraktif Kurgu",
        "description": "Okuyucu seçimlerinin olayların yönünü veya sonunu değiştirebildiği eserlerdir."
      },
      {
        "id": "parcali-anlati",
        "name": "Parçalı Anlatı",
        "description": "Hikâyeyi kronolojik olmayan, farklı parçalar veya bakış açıları üzerinden kuran eserlerdir."
      },
      {
        "id": "epistolary-belge-anlatisi",
        "name": "Epistolary / Belge Anlatısı",
        "description": "Mektup, günlük, mesaj, e-posta, rapor veya belge biçimleri üzerinden anlatılan eserlerdir."
      },
      {
        "id": "buluntu-belge-kurgusu",
        "name": "Buluntu Belge Kurgusu",
        "description": "Okuyucuya anlatının sonradan bulunmuş kayıtlar veya belgeler olduğu izlenimini veren eserlerdir."
      },
      {
        "id": "coklu-bakis-acisi",
        "name": "Çoklu Bakış Açısı",
        "description": "Aynı olayları farklı karakterlerin bakış açısından anlatan eserlerdir."
      },
      {
        "id": "dogrusal-olmayan-kurgu",
        "name": "Doğrusal Olmayan Kurgu",
        "description": "Olayları kronolojik sıraya bağlı olmadan aktaran eserlerdir."
      },
      {
        "id": "alternatif-sonlu-kurgu",
        "name": "Alternatif Sonlu Kurgu",
        "description": "Birden fazla olası sona veya farklı anlatı yollarına sahip eserlerdir."
      },
      {
        "id": "multimedya-kurgu",
        "name": "Multimedya Kurgu",
        "description": "Metin anlatısını görsel, ses, müzik veya başka medya biçimleriyle bütünleştiren eserlerdir."
      }
    ]
  },
  {
    "order": 25,
    "id": "toplumsal-ve-politik-kurgu",
    "name": "Toplumsal ve Politik Kurgu",
    "emoji": "⚖️",
    "lucideIconName": "Scale",
    "description": "Toplumsal ve Politik Kurgu, toplum yapısını, iktidarı, sınıfları, kurumları ve sosyal değişimleri hikâyenin merkezine alan eserleri kapsar.",
    "subGenres": [
      {
        "id": "politik-kurgu",
        "name": "Politik Kurgu",
        "description": "Siyasi sistemler, ideolojiler ve iktidar mücadeleleri çevresinde gelişen eserlerdir."
      },
      {
        "id": "secim-kurgusu",
        "name": "Seçim Kurgusu",
        "description": "Seçim kampanyaları, adaylar ve politik rekabeti konu alan eserlerdir."
      },
      {
        "id": "burokrasi-kurgusu",
        "name": "Bürokrasi Kurgusu",
        "description": "Devlet kurumları ve bürokratik sistemler içinde geçen eserlerdir."
      },
      {
        "id": "devrim-kurgusu",
        "name": "Devrim Kurgusu",
        "description": "Toplumsal ayaklanmalar, devrim hareketleri ve rejim değişikliklerini konu alan eserlerdir."
      },
      {
        "id": "sinif-kurgusu",
        "name": "Sınıf Kurgusu",
        "description": "Sosyal sınıflar, ekonomik eşitsizlik ve sınıflar arası çatışmayı konu alan eserlerdir."
      },
      {
        "id": "goc-kurgusu",
        "name": "Göç Kurgusu",
        "description": "Göç, yer değiştirme, aidiyet ve yeni bir toplumda yaşam kurma süreçlerini anlatan eserlerdir."
      },
      {
        "id": "kentlesme-kurgusu",
        "name": "Kentleşme Kurgusu",
        "description": "Şehirleşmenin insanlar ve toplum üzerindeki etkilerini konu alan eserlerdir."
      },
      {
        "id": "toplumsal-elestiri",
        "name": "Toplumsal Eleştiri",
        "description": "Toplumun kurumlarını, normlarını veya sorunlarını eleştirel biçimde ele alan eserlerdir."
      },
      {
        "id": "medya-kurgusu",
        "name": "Medya Kurgusu",
        "description": "Basın, televizyon, sosyal medya ve kamuoyu üzerindeki güç mücadelelerini konu alan eserlerdir."
      },
      {
        "id": "kurumsal-kurgu",
        "name": "Kurumsal Kurgu",
        "description": "Şirketler, organizasyonlar ve kurumsal güç ilişkileri çevresinde gelişen eserlerdir."
      }
    ]
  },
  {
    "order": 26,
    "id": "gizli-tarih-ve-akademik-kurgu",
    "name": "Gizli Tarih ve Akademik Kurgu",
    "emoji": "🗝️",
    "lucideIconName": "GraduationCap",
    "description": "Gizli Tarih ve Akademik Kurgu, bilgi, araştırma, geçmişin sırları, üniversite ortamları ve entelektüel topluluklar çevresinde gelişen eserleri kapsar.",
    "subGenres": [
      {
        "id": "dark-academia",
        "name": "Dark Academia",
        "description": "Akademik çevre, klasik sanatlar, entelektüel takıntılar, rekabet ve karanlık sırları birleştiren eserlerdir."
      },
      {
        "id": "light-academia",
        "name": "Light Academia",
        "description": "Eğitim, sanat, dostluk ve entelektüel merakı daha sıcak ve iyimser atmosferle işleyen eserlerdir."
      },
      {
        "id": "universite-gizemi",
        "name": "Üniversite Gizemi",
        "description": "Üniversite veya araştırma ortamında gelişen gizemleri konu alan eserlerdir."
      },
      {
        "id": "akademik-dram",
        "name": "Akademik Dram",
        "description": "Akademisyenler, öğrenciler ve eğitim kurumlarındaki kişisel çatışmaları konu alan eserlerdir."
      },
      {
        "id": "gizli-cemiyet",
        "name": "Gizli Cemiyet",
        "description": "Gizli topluluklar, kadim örgütler ve kapalı gruplar çevresinde gelişen eserlerdir."
      },
      {
        "id": "kayip-el-yazmasi",
        "name": "Kayıp El Yazması",
        "description": "Unutulmuş belgeler, kitaplar veya el yazmalarının peşinde gelişen eserlerdir."
      },
      {
        "id": "tarihsel-sir",
        "name": "Tarihsel Sır",
        "description": "Geçmişte gizlenmiş olayların günümüzde araştırılmasını konu alan eserlerdir."
      },
      {
        "id": "kutuphane-kurgusu",
        "name": "Kütüphane Kurgusu",
        "description": "Kütüphane, arşiv veya kitap koleksiyonlarının merkezî rol oynadığı eserlerdir."
      }
    ]
  },
  {
    "order": 27,
    "id": "manevi-ve-metafizik-kurgu",
    "name": "Manevî ve Metafizik Kurgu",
    "emoji": "🧘",
    "lucideIconName": "Sun",
    "description": "Manevî ve Metafizik Kurgu, insanın varoluş, ruh, ölüm, kader, bilinç ve manevi deneyimler üzerine sorularını kurmaca yoluyla ele alan eserleri kapsar.",
    "subGenres": [
      {
        "id": "ruhsal-yolculuk",
        "name": "Ruhsal Yolculuk",
        "description": "Karakterin manevi veya içsel dönüşümünü konu alan eserlerdir."
      },
      {
        "id": "olum-sonrasi",
        "name": "Ölüm Sonrası",
        "description": "Ölümden sonraki yaşam veya bilinç deneyimleri üzerine kurulu eserlerdir."
      },
      {
        "id": "kader-kurgusu",
        "name": "Kader Kurgusu",
        "description": "Kader, seçim ve özgür irade arasındaki ilişkiyi konu alan eserlerdir."
      },
      {
        "id": "reenkarnasyon-drami",
        "name": "Reenkarnasyon Dramı",
        "description": "Yeniden doğuş temasını karakterlerin duygusal ve insani ilişkileri üzerinden ele alan eserlerdir."
      },
      {
        "id": "metafizik-gizem",
        "name": "Metafizik Gizem",
        "description": "Gerçeklik, bilinç veya varoluşla ilgili açıklanamayan olayları konu alan eserlerdir."
      },
      {
        "id": "spirituel-fantastik",
        "name": "Spiritüel Fantastik",
        "description": "Manevi kavramları fantastik dünya veya doğaüstü olaylarla birleştiren eserlerdir."
      },
      {
        "id": "ruya-kurgusu",
        "name": "Rüya Kurgusu",
        "description": "Rüyaların ve bilinçaltının hikâye gerçekliği üzerinde belirleyici olduğu eserlerdir."
      },
      {
        "id": "astral-kurgu",
        "name": "Astral Kurgu",
        "description": "Astral yolculuk, ruhsal düzlemler veya fiziksel gerçekliğin ötesindeki boyutları konu alan eserlerdir."
      }
    ]
  },
  {
    "order": 28,
    "id": "hayvan-kurgusu",
    "name": "Hayvan Kurgusu",
    "emoji": "🐾",
    "lucideIconName": "PawPrint",
    "description": "Hayvan Kurgusu, hayvanların hikâyenin merkezinde olduğu, hayvanların bakış açısından anlatılan veya insan-hayvan ilişkilerinin temel tema hâline geldiği eserleri kapsar.",
    "subGenres": [
      {
        "id": "hayvan-bakis-acisi",
        "name": "Hayvan Bakış Açısı",
        "description": "Hikâyenin doğrudan bir hayvan karakterin bakış açısından anlatıldığı eserlerdir."
      },
      {
        "id": "konusan-hayvanlar",
        "name": "Konuşan Hayvanlar",
        "description": "İnsan gibi konuşabilen veya düşünebilen hayvan karakterleri konu alan eserlerdir."
      },
      {
        "id": "evcil-hayvan-hikayesi",
        "name": "Evcil Hayvan Hikâyesi",
        "description": "İnsanlar ile evcil hayvanlar arasındaki bağa odaklanan eserlerdir."
      },
      {
        "id": "vahsi-yasam",
        "name": "Vahşi Yaşam",
        "description": "Doğal yaşam ve vahşi hayvanlar çevresinde gelişen eserlerdir."
      },
      {
        "id": "hayvan-macerasi",
        "name": "Hayvan Macerası",
        "description": "Hayvan karakterlerin yolculuk veya maceralarını konu alan eserlerdir."
      },
      {
        "id": "fantastik-hayvan-kurgusu",
        "name": "Fantastik Hayvan Kurgusu",
        "description": "Hayvan toplumları, büyülü hayvanlar veya fantastik yaratıklar üzerine kurulu eserlerdir."
      },
      {
        "id": "insan-hayvan-dostlugu",
        "name": "İnsan-Hayvan Dostluğu",
        "description": "İnsan karakterlerle hayvanlar arasındaki güçlü ilişkiyi merkeze alan eserlerdir."
      }
    ]
  },
  {
    "order": 29,
    "id": "karanlik-kurgu",
    "name": "Karanlık Kurgu",
    "emoji": "🌑",
    "lucideIconName": "Skull",
    "description": "Karanlık Kurgu, tek başına korku olmak zorunda olmayan; suç, şiddet, ahlaki bozulma, saplantı, trajedi ve rahatsız edici insan davranışlarını yoğun biçimde ele alan eserleri kapsar.",
    "subGenres": [
      {
        "id": "dark-fiction",
        "name": "Dark Fiction",
        "description": "Karanlık temaları farklı türlerle birleştiren genel karanlık kurgu eserleridir."
      },
      {
        "id": "southern-gothic",
        "name": "Southern Gothic",
        "description": "Çürümüş toplum yapıları, aile sırları ve gotik atmosferi kırsal veya güney kültürüyle birleştiren eserlerdir."
      },
      {
        "id": "neo-gothic",
        "name": "Neo-Gothic",
        "description": "Gotik edebiyatın temalarını çağdaş dünyaya taşıyan eserlerdir."
      },
      {
        "id": "psikolojik-karanlik-kurgu",
        "name": "Psikolojik Karanlık Kurgu",
        "description": "İnsanın karanlık zihinsel yönlerini ve yıkıcı davranışlarını merkeze alan eserlerdir."
      },
      {
        "id": "suc-odakli-karanlik-kurgu",
        "name": "Suç Odaklı Karanlık Kurgu",
        "description": "Suç dünyasının en sert ve rahatsız edici yönlerini ele alan eserlerdir."
      },
      {
        "id": "trajik-karanlik-kurgu",
        "name": "Trajik Karanlık Kurgu",
        "description": "Kaçınılmaz kayıp ve çöküş duygusunun yoğun olduğu eserlerdir."
      },
      {
        "id": "ahlaki-gri-kurgu",
        "name": "Ahlaki Gri Kurgu",
        "description": "Net iyi ve kötü ayrımının bulunmadığı, karakterlerin zor seçimlerle karşılaştığı eserlerdir."
      }
    ]
  },
  {
    "order": 30,
    "id": "macera-fantastigi-ve-oyunlasmis-kurgu",
    "name": "Macera Fantastiği ve Oyunlaşmış Kurgu",
    "emoji": "🎮",
    "lucideIconName": "Gamepad2",
    "description": "Macera Fantastiği ve Oyunlaşmış Kurgu, keşif, görev, gelişim, seviye, sınıf ve mücadele mekaniklerini fantastik macerayla birleştiren eserleri kapsar.",
    "subGenres": [
      {
        "id": "gamelit",
        "name": "GameLit",
        "description": "Oyun mantığını ve oyun kültürünü anlatıya taşıyan ancak doğrudan RPG istatistikleri kullanmak zorunda olmayan eserlerdir."
      },
      {
        "id": "litrpg",
        "name": "LitRPG",
        "description": "İstatistik, seviye, sınıf ve yetenek gibi RPG mekaniklerinin açık biçimde kullanıldığı eserlerdir."
      },
      {
        "id": "sistem",
        "name": "Sistem",
        "description": "Karaktere görev, ödül ve gelişim sağlayan görünür veya görünmez bir sistemin bulunduğu eserlerdir."
      },
      {
        "id": "seviye-atlama",
        "name": "Seviye Atlama",
        "description": "Karakterin güç seviyesini belirli aşamalarla yükselttiği eserlerdir."
      },
      {
        "id": "sinif-sistemi",
        "name": "Sınıf Sistemi",
        "description": "Karakterlerin savaşçı, büyücü, destek veya benzeri sınıflara ayrıldığı eserlerdir."
      },
      {
        "id": "beceri-agaci",
        "name": "Beceri Ağacı",
        "description": "Karakterlerin farklı yetenek yollarından gelişim seçebildiği eserlerdir."
      },
      {
        "id": "gorev-sistemi",
        "name": "Görev Sistemi",
        "description": "Ana ve yan görevlerin karakter gelişiminde temel rol oynadığı eserlerdir."
      },
      {
        "id": "zindan",
        "name": "Zindan",
        "description": "Katmanlı veya bağımsız zindanların keşfedildiği eserlerdir."
      },
      {
        "id": "raid",
        "name": "Raid",
        "description": "Takım hâlinde büyük düşmanlara veya zindanlara karşı yapılan mücadeleleri konu alan eserlerdir."
      },
      {
        "id": "lonca",
        "name": "Lonca",
        "description": "Lonca, klan veya birliklerin sosyal ve ekonomik düzenin merkezinde olduğu eserlerdir."
      },
      {
        "id": "kule",
        "name": "Kule",
        "description": "Katlar veya aşamalardan oluşan büyük bir yapıda ilerlemeyi konu alan eserlerdir."
      },
      {
        "id": "hayatta-kalma-oyunu",
        "name": "Hayatta Kalma Oyunu",
        "description": "Karakterlerin ölümcül kurallar veya oyun mekanikleri içinde hayatta kalmaya çalıştığı eserlerdir."
      },
      {
        "id": "sanal-dunya",
        "name": "Sanal Dünya",
        "description": "Karakterlerin oyun veya sanal gerçeklik dünyasında yaşadığı maceraları konu alan eserlerdir."
      },
      {
        "id": "npc-perspektifi",
        "name": "NPC Perspektifi",
        "description": "Oyun benzeri bir dünyada NPC veya dünya sakini bakış açısından anlatılan eserlerdir."
      },
      {
        "id": "guc-fantezisi",
        "name": "Güç Fantezisi",
        "description": "Karakterin olağanüstü hızla güçlendiği ve üstün yetenekler kazandığı eserlerdir."
      }
    ]
  }
];

/**
 * ID ile Ana Tür getirir.
 */
export function getMainGenreById(id?: string | null): MainGenreItem | undefined {
  if (!id) return undefined;
  const clean = id.trim().toLowerCase();
  return MAIN_GENRES.find(
    (g) => g.id === clean || g.id === id || g.name.toLowerCase() === clean
  );
}

/**
 * Ana Tür ID ve Alt Tür ID ile Alt Tür getirir.
 */
export function getSubGenreById(mainGenreId?: string | null, subGenreId?: string | null): SubGenreItem | undefined {
  if (!mainGenreId || !subGenreId) return undefined;
  const main = getMainGenreById(mainGenreId);
  if (!main) return undefined;
  return main.subGenres.find((s) => s.id === subGenreId);
}

/**
 * Ana Tür Başlığını (veya etiketini) döner.
 */
export function getMainGenreName(id?: string | null): string {
  if (!id) return '';
  const main = getMainGenreById(id);
  return main ? main.name : id;
}

/**
 * Seçilen alt türlerin isimlerini dizi olarak döner.
 */
export function getSubGenreNames(mainGenreId?: string | null, subGenreIds?: string[] | null): string[] {
  if (!mainGenreId || !subGenreIds || subGenreIds.length === 0) return [];
  const main = getMainGenreById(mainGenreId);
  if (!main) return subGenreIds;
  return subGenreIds.map((sid) => {
    const sub = main.subGenres.find((s) => s.id === sid);
    return sub ? sub.name : sid;
  });
}
