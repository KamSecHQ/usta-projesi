# Kalfahane: 100 fazlık yol haritası

Bu belge, Kalfahane'yi erken erişim aşamasından profesyonel bir pazaryerine taşıyacak 100 fazı
10 iz hâlinde sıralar. Her faz tek başına yayına çıkabilecek büyüklüktedir. Sıra, etkiye ve
bağımlılığa göredir: önce akıcılık ve güven, sonra büyüme.

**Durumlar:** ✅ tamamlandı · ⏳ sırada (kod tarafında yapılabilir) · 🔒 senin kararın, erişimin ya da canlı veritabanı onayın gerekir

Son güncelleme: 17 Ekim 2026 (yayında: `main`, `165f0fe`)

---

## Ölçülen sonuç: kasma

Anasayfa, Apple M4, Chrome, görünür pencere, video açık, 16 sn'de baştan sona kaydırma (`npm run olc`):

| | Önce | Sonra |
|---|---|---|
| Ortalama kare hızı | 58 FPS | 60 FPS |
| En uzun kare | 183 ms | 19 ms |
| 25 ms'yi aşan kare | 8 | 0 |
| Kaydırma sırasında uzun görev (>50 ms) | 2 (en uzunu 141 ms) | 0 |
| Shader derlemesi yüzünden bekleme | 342 ms (ilk ziyarette 1,4 sn'ye kadar) | 15 ms |
| Hero videosunun döngü noktası (her 10 sn) | 24 kare art arda 30 FPS (~0,8 sn) | 0 yavaş kare |

Kasmanın üç kaynağı vardı:
1. **Shader'lar ekrana girdikleri anda derleniyordu.** Fizik, robot, bant ve sikke sahneleri ilk görüldükleri karede ana iş parçacığını kilitliyordu. Lenis kaydırması da ana iş parçacığında çalıştığı için bu, sayfanın donması olarak hissediliyordu.
2. **Hero videosu her 10 saniyede bir iki video arasında saydamlık geçişi yapıyordu.** macOS'te bu, videoyu donanım katmanından çıkarıp tam çözünürlükte birleştirmeye zorluyor ve tüm sayfayı ~0,8 sn boyunca 30 kareye düşürüyordu.
3. **Metal çizim hattı ilk çizimde kuruluyordu.** Derlenmiş shader'la bile ilk karede 100+ ms GPU beklemesi oluyordu.

---

## İz A: Akıcılık ve 3D performansı

| # | Faz | Durum |
|---|---|---|
| 1 | Shader ısıtma: her 3D sahne ekrana gelmeden boşta kalan zamanda paralel derlenir, dokuları GPU'ya yüklenir, tek piksele bir kez çizilir (`atolye/Isitici.jsx`) | ✅ |
| 2 | Hero videosu: tek video + son kareyi tuvale kopyalayıp söndüren döngü geçişi; ikinci video ve saydamlık geçişi kalktı | ✅ |
| 3 | Fizik sahnesi: keskinlik 1.25x'te sabit, zorlanınca 1x; dar ekran ve az çekirdekli cihazda N8AO kapalı | ✅ |
| 4 | Teknoloji bandı: yazı tipi yüklenince eski dokuların GPU'da kalması (sızıntı) ve gereksiz malzeme yeniden derlemesi giderildi | ✅ |
| 5 | Akıcılık ölçüm aracı: `npm run olc` (kare süreleri, uzun görevler, bölüm bölüm takılmalar) | ✅ |
| 6 | Lenis ve R3F'yi tek kare döngüsünde birleştirmek (3D görünümler DOM ile aynı karede konumlansın) | ⏳ |
| 7 | Robot kod ekranı netliği: kod yazısı 17 → 24 px, doku 2x (2048×1200), en yüksek yönlü süzme, tarama çizgileri kalktı, 3D tuval retina'da 2x | ✅ |
| 8 | Fizik parçalarını `InstancedMesh` ile çizme (18 çizim çağrısı → 7) | ⏳ |
| 9 | Safari (WebKit) ölçümü ve Safari'ye özel kalite profili | ⏳ |
| 10 | Düşük güç modu: pil tasarrufu açıkken 3D sahneleri tek kare ya da durağan çizme | ⏳ |

## İz B: Yükleme hızı ve paket

| # | Faz | Durum |
|---|---|---|
| 11 | Sayfa bazlı kod bölme: iç sayfaların ilk uygulama kodu 681 KB → 53 KB (gzip 181 → 14 KB) | ✅ |
| 12 | Kütüphane parçaları (`react`, `supabase`, `three`): yeni yayında yalnızca uygulama kodu yeniden iner | ✅ |
| 13 | Telefonda ve veri tasarrufunda 38 MB'lık video yerine poster | ✅ |
| 14 | Veritabanı bağlantısının önceden açılması (`preconnect`), video ağı için `dns-prefetch` | ✅ |
| 15 | Yayından sonra eski sekmede eksik parça hatası: sayfa bir kez kendini yeniler (`vite:preloadError`) | ✅ |
| 16 | Rapier fizik paketini (2,5 MB) yalnızca kullanıcı hero'dan aşağı inmeye başlayınca yüklemek | ⏳ |
| 17 | Yazı tipleri: Onest ve Bricolage yalnızca 3D dokuların olduğu anasayfa parçasında (yapıldı); kalan: yalnızca latin + latin-ext alt kümeleri | ⏳ |
| 18 | Görseller: Supabase Storage dönüşümüyle boyutlandırma, `srcset`, `loading="lazy"` | ⏳ |
| 19 | Bağlantının üzerine gelince sayfa parçasını önceden indirme; sorgularda `select('*')` yerine gereken sütunlar, listelerde sayfalama | ⏳ |
| 20 | İlanlarım: ilan başına sıralı teklif sorgusu (N+1) tek sorguya indirildi | ✅ |

## İz C: SEO ve paylaşım

| # | Faz | Durum |
|---|---|---|
| 21 | Paylaşım görseli `og-image.png` (1200×630, şablon `scripts/og-gorsel.html`); `index.html`'de tam adres | ✅ |
| 22 | `robots.txt` (kişisel sayfalar taranmaz) ve `sitemap.xml` (sabit sayfalar) | ✅ |
| 23 | Sayfa başına açıklama, `og:title`, `og:url` ve kanonik adres (`useSayfaBasligi(baslik, aciklama)`) | ✅ |
| 24 | Yapılandırılmış veri: Organization ve WebSite + arama kutusu (JSON-LD) | ✅ |
| 25 | 404 sayfası `noindex` | ✅ |
| 26 | Usta profilleri, ilanlar ve blog yazıları için dinamik site haritası (Vercel fonksiyonu) | ⏳ |
| 27 | Usta için `Person`, ilan için `JobPosting`, yazı için `Article` yapılandırılmış verisi | ⏳ |
| 28 | Ön işleme (prerender): arama motorlarına içerikli HTML | ⏳ |
| 29 | Usta profili için dinamik paylaşım kartı (isim, unvan, kıdem) | ⏳ |
| 30 | Google Search Console ve Bing doğrulaması | 🔒 |

## İz D: Erişilebilirlik

| # | Faz | Durum |
|---|---|---|
| 31 | "İçeriğe geç" bağlantısı (klavyede ilk odak) | ✅ |
| 32 | Yeni sayfaya geçince başa dönme; geri/ileri gezinmede konum korunur | ✅ |
| 33 | Odak halkası: genel kural hap düğmelerin köşesini kutuya çeviriyordu, düzeltildi; yıldız seçici ve gizli radyo düğmelerinde görünür halka; imleç ve onay kutuları mor | ✅ |
| 34 | Formlarda `label`, `aria-describedby` ve ekran okuyucuya hata duyurusu: ortak `Alan` ve `SifreAlani` (`components/form/Alan.jsx`); giriş, hesap oluşturma, şifre yenileme, profil düzenleme, ayarlar, ajans ve blog formları taşındı; tarayıcının otomatik doldurması için `autoComplete` | ✅ |
| 35 | Kontrast: yarı saydam gri metinler (2,7:1) ve yer tutucular (3,8:1) 4,8-5,8:1'e çıkarıldı; ikon yerine kullanılan ✓ ★ 📍 🏢 📞 karakterleri çizgi ikonlarla değişti | ✅ |
| 36 | 3D sahnelerin metin karşılıklarının ve `aria-hidden` düzeninin denetimi | ⏳ |
| 37 | Fizik ve bant etkileşimlerine klavye karşılıkları | ⏳ |
| 38 | Mesajlarda VoiceOver testi: canlı bölgeler, odak sırası | ⏳ |
| 39 | `confirm()` yerine erişilebilir onay diyaloğu (tarayıcının kipli `<dialog>`'u, `useOnay()`) | ✅ |
| 40 | Hareket azaltma tercihinin tüm sayfalarda denetimi | ⏳ |

## İz E: Tasarım sistemi ve arayüz kalitesi

| # | Faz | Durum |
|---|---|---|
| 41 | Usta araması: Türkçe harf ve büyük/küçük duyarsız ("ios" = "İOS"), arama adreste | ✅ |
| 42 | Uygulama genelinde hata sınırı: beyaz ekran yerine kurtarma ekranı | ✅ |
| 43 | Eski bakırcı ve stüdyo tokenları (20 renk, `font-display`) `index.css`'ten silindi; hiçbiri kullanılmıyordu | ✅ |
| 44 | Ortak arayüz bileşenleri: Düğme, Girdi, Kart, Rozet, Diyalog (`src/ui/`) | ⏳ |
| 45 | `/ustalar` uzay temasında: anasayfayla ortak ışıklı kart, gerçek veriden teknoloji çipleri, müsaitlik anahtarı, sıralama, süzme adreste; favoriler tek sorguda | ✅ |
| 46 | `/is-ilanlari`: ışıklı ilan kartları, teknoloji ve bütçe süzgeci, bütçeye göre sıralama, boş durum ve ilan daveti | ✅ |
| 47 | Uygulama geneli bildirim (toast) sistemi (`useBildirim()`); `alert()` ve `confirm()` kalktı | ✅ |
| 48 | Mobilde alt sekme çubuğu (Panel, Mesajlar, İlanlar) | ⏳ |
| 49 | Sayfa geçiş animasyonları (View Transitions API) | ⏳ |
| 50 | Kendi yapımımız hero: gerçek zamanlı noktalı WebGL küre (Natural Earth kıtaları, İstanbul merkezli ağ, kendi posteri); 38 MB video kalktı | ✅ |

## İz F: İş veren akışı (ilan ve teklif)

| # | Faz | Durum |
|---|---|---|
| 51 | Dört adımlı ilan sihirbazı: canlı kart önizlemesi, ilan netliği göstergesi, tarayıcıda otomatik kaydedilen taslak | ✅ |
| 52 | Yedi ilan şablonu: başlık önerisi, teknoloji önerileri ve iyi teklif getiren yönlendirici sorular (fiyat önerisi uydurulmaz) | ✅ |
| 53 | Teklif karşılaştırma tablosu: tutar, bütçeye göre konum, teknoloji uyumu, portföy, onay, müsaitlik; her satırda en iyi değer işaretli | ✅ |
| 54 | Kısa liste ve teklif durum zaman çizelgesi | ⏳ |
| 55 | İş tamamlama akışı ve kıdemin işlenmesi | 🔒 veritabanı |
| 56 | Değerlendirme: iş tamamlanınca iş veren ustayı (İlanlarım), usta iş vereni (Tekliflerim) puanlar; profilde ortalama, dağılım ve yorumlar | ✅ |
| 57 | İlanlarda tam metin arama (Postgres) | 🔒 veritabanı |
| 58 | Ustaya teknolojilerine uyan ilan önerileri | ⏳ |
| 59 | Eşleşen yeni ilan e-postası | 🔒 e-posta altyapısı |
| 60 | Emanet ödeme (iyzico / PayTR) araştırması; o zamana kadar "yakında" | 🔒 |

## İz G: Usta profili ve güven

| # | Faz | Durum |
|---|---|---|
| 61 | Profil gücü rehberi: düzenleme ekranında yazdıkça güncellenen ilerleme, eksik maddeye tıklayınca ilgili bölüme gidip vurgulama; panelle aynı ortak hesap (`profilGucu.js`) | ✅ |
| 62 | Portföy görseli yükleme ve kırpma (Supabase Storage) | 🔒 depolama kovası |
| 63 | GitHub entegrasyonu: herkese açık depolar ve dil dağılımı | ⏳ |
| 64 | Kimlik ve telefon doğrulama akışı (yönetici onaylı rozet) | 🔒 |
| 65 | Usta profil sayfası yeniden tasarlandı: vitrin şeridi, büyük kimlik alanı, yapışık çalışma paneli (müsaitlik, ücret, portföy, puan), yeni portföy kartları, değerlendirmeler | ✅ |
| 66 | Usta karşılaştırma (2-3 profil yan yana) | ⏳ |
| 67 | Profil görüntülenme istatistikleri (panelde) | 🔒 veritabanı |
| 68 | Ajans sayfası: ekip ve ortak portföy | ⏳ |
| 69 | Herkese açık tamamlanan iş sayısı (`tamamlanan_is_sayilari`): kıdem profilde herkese, usta kartlarında ve ilan sahibinde görünür; Ustalar'da "tamamlanan işe göre" sıralama. Teklifsiz ilanı tamamlamak kıdem kazandırmaz. Kalan: hızlı yanıt, zamanında teslim rozetleri | ✅ (kıdem) · 🔒 diğer rozetler |
| 70 | Şikâyet ve moderasyon mekanizması | 🔒 veritabanı |

## İz H: Mesajlaşma ve bildirimler

| # | Faz | Durum |
|---|---|---|
| 71 | "Son görülme" nabzı hatası: sorgu hiç gönderilmiyordu (Supabase sorguları `then` olmadan çalışmaz), çevrimiçi göstergesi artık güncellenir | ✅ |
| 72 | Gerçek iki hesapla uçtan uca mesajlaşma testi | 🔒 test hesapları |
| 73 | Dosya ve görsel ekleri | 🔒 depolama |
| 74 | Okunmamış mesaj e-posta özeti | 🔒 e-posta |
| 75 | Tarayıcı bildirimleri (Web Push) | ⏳ |
| 76 | Görüşme bağlantısı kartı (Meet / Zoom) | ⏳ |
| 77 | Mesaj listesinde sonsuz kaydırma (şu an 200 konuşma sınırı) | ⏳ |
| 78 | Engelleme | 🔒 veritabanı |
| 79 | Hazır yanıtlar | ⏳ |
| 80 | Bildirim merkezi: teklif, davet ve mesaj tek listede | ⏳ |

## İz I: Güvenlik, gizlilik ve KVKK

| # | Faz | Durum |
|---|---|---|
| 81 | Güvenlik başlıkları: HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; hash'li dosyalara kalıcı önbellek (`vercel.json`) | ✅ |
| 82 | İçerik Güvenlik Politikası (CSP): önce rapor modunda, sonra zorunlu | ⏳ |
| 83 | Sızdırılmış şifre koruması (Supabase → Authentication → Attack Protection) | 🔒 panel |
| 84 | `merhaba@kalfahane.com` için MX kaydı (KVKK talepleri bu adrese geliyor) | 🔒 DNS |
| 85 | KVKK aydınlatma metni, çerez politikası, açık rıza kayıtları | ⏳ |
| 86 | Kendi kendine hesap silme | 🔒 veritabanı |
| 87 | Mesaj ve teklif için hız sınırı (spam koruması) | 🔒 veritabanı |
| 88 | Kayıtta bot koruması (Cloudflare Turnstile) | 🔒 hesap |
| 89 | RLS politikaları için otomatik testler | 🔒 veritabanı |
| 90 | Hero videosunun lisansı: faz 50 ile video tamamen kaldırıldı, tüm görsel kendi üretimimiz | ✅ |

## İz J: Mühendislik altyapısı

| # | Faz | Durum |
|---|---|---|
| 91 | Ölü kod temizliği: rotada olmayan `KayitOl.jsx`, `IsVer.jsx` | ✅ |
| 92 | Lint uyarıları 11 → 0 (hook bağımlılıkları `useCallback` ile, kullanılmayan değişkenler, hızlı yenileme dışa aktarımları) | ✅ |
| 93 | Birim testleri: Node'un yerleşik test çalıştırıcısıyla (yeni bağımlılık yok) 33 test; `npm test` | ✅ |
| 94 | Uçtan uca testler (Playwright): kayıt, ilan, teklif, mesaj | ⏳ |
| 95 | GitHub Actions: lint (uyarı da hata) + test + build + ilk yük bütçesi (`npm run butce`, gzip ≤ 200 KB) | ✅ (ilk push'ta doğrulanacak) |
| 96 | Hata izleme (Sentry) ve Web Vitals | 🔒 hesap |
| 97 | Supabase adresi ve anahtarının ortam değişkenine taşınması | ⏳ |
| 98 | TypeScript'e kademeli geçiş (`checkJs` ile başlayarak) | ⏳ |
| 99 | Eski tabloların SQL'inin `supabase/migrations`'a alınması (şema tek kaynaktan kurulabilsin) | 🔒 veritabanı |
| 100 | Her dal için Vercel önizlemesi + Supabase dal veritabanı | 🔒 hesap |

---

## Faz dışı iyileştirmeler (17 Ekim, ikinci tur)

- Anasayfa düğmeleri saydam ışık haplarına dönüştü (`.isik-hap`): kenar imlecin olduğu yerde yanar, içte mor ışık izler; hero'nun ana düğmesinde dönen yörünge ışığı. Hero, teknoloji çipleri, Ustalar ve kapanış bölümü.
- Ustalar bölümü: portföy vitrinli, imlece eğilen ışıklı kartlar (`.isik-kart`), profil fotoğrafı, çevrimiçi göstergesi, gerçek portföy sayısı; boş yerlerde uydurma profil yerine "boş tezgâh" ve "ilan aç" davetleri. Projeler tek sorguda gelir.
- Hizmet kategorilerine kısa açıklamalar.
- Dokuzuncu tur (17 Ekim): faz 50, hero küresi. Video yerine canlı WebGL küre; kıtalar Natural Earth (kamu malı) verisinden 11 KB'lık maskeyle, İstanbul'dan dünyaya ağ ve ışık darbeleri, kendi 102 KB posteri. Ölçüm 60 FPS, takılan kare 0.
- Sekizinci tur (17 Ekim, ilk Mac'e dönüş): blog listesi, blog yazısı (içindekiler, okuma süresi, `Article` JSON-LD), gizlilik politikası (sistemin gerçek veri akışına ve KVKK m.11'e göre yeniden yazıldı), proje detayı ve 404 uzay temasına taşındı. YouTube gömmeleri çerezsiz modda. Ardından yönetim paneli (arama, profil gücü, onay diyalogları) ve blog yönetimi (canlı önizlemeli editör) de taşındı; eski görünümde sayfa kalmadı. Faz 69 (herkese açık kıdem) kullanıcı onayıyla canlıya alındı.
- Yedinci tur: hesap sayfaları baştan yazıldı (giriş, hesap oluşturma; ortak `HesapCercevesi`). **Şifremi unuttum** akışı yoktu: artık sıfırlama bağlantısı gönderilir, `/sifre-yenile` sayfasında yeni şifre belirlenir (hesabın var olup olmadığı yanıttan anlaşılmaz). Supabase hataları Türkçe (`hesapHatasi`); ham İngilizce mesaj gösterilmez. Profil düzenleme uzay temasında; ayarlara "tüm cihazlarda oturumu kapat" eklendi. Ajans sayfası oturum kapalıyken sonsuza dek "Yükleniyor" gösteriyordu, düzeltildi; reddedilen davet kaldırılıp yeniden gönderilebiliyor, yazarken eski arama yanıtları yenisini ezmiyor.
- Altıncı tur: panelde kanıtsız ve yanlış bir cümle vardı ("İş verenler en çok bu profillere teklif gönderiyor"; teklifi ustalar verir), düzeltildi. Portföy kartında bağlantı içinde bağlantı vardı (geçersiz HTML, klavyede tek odak), canlı bağlantı kartın dışına alındı. Prizde ölçüm: 3/3 koşuda 60 FPS, takılma yok.
- Beşinci tur: Tekliflerim uzay temasında (duruma göre süzme, bütçeye göre konum, sıradaki adım). Kıdem rozeti teklif verisinden hesaplanıyor ve teklifleri yalnızca taraflar okuyabildiği için ziyaretçiler herkesi "Çırak" görüyordu; rozet şimdilik yalnızca profil sahibine gösteriliyor. Herkese açık doğru sayaç için veritabanı fonksiyonu gerekiyor (faz 69, onay bekliyor).
- Dördüncü tur: ilan detayı yeniden tasarlandı (sihirbazın soru-cevap blokları başlıklı bölümler, yapışık bütçe kutusu, ustanın teknoloji uyumu, bütçeye göre konumu canlı gösteren teklif formu). İlanlarım uzay temasında; teklif kabul/ret, ilanı kapatma ve tamamlama onay diyaloğuyla. Kartlardaki ok ikonları görünmüyordu (boyutsuz SVG), düzeltildi. 3D tuvalin keskinlik artışı kaydırma bitince uygulanıyor (robot bölümündeki ara sıra 67 ms'lik kare kalktı).
- Üçüncü tur: liste sayfalarındaki favori düğmeleri kart başına sorgu atıyordu (N+1), tek sorguya indi. Mesajlar yan panelinde ilan bütçesi "/ saat" ekiyle yanlış gösteriliyordu; bütçe ve ücretler artık binlik ayraçlı (`tl()`, `butceGoster()`).
- Hero videosu yalnızca gerçekten yavaş (2g) bağlantıda ve veri tasarrufunda postere düşer.
- Açık kalan gözlem: İstatistikler/SSS bölgesinde 6 ölçümün birinde tek bir ~180 ms'lik GPU karesi (ana iş parçacığı değil; ilk ölçümde de vardı). Şüpheli: büyük metinlerdeki `filter: blur` giriş geçişi. Faz 6-10 kapsamında incelenecek.

## Sayılarla

- ✅ Tamamlanan: 44 faz
- ⏳ Kod tarafında sırada: 34 faz
- 🔒 Senin kararını, erişimini ya da canlı veritabanı onayını bekleyen: 22 faz

## Sıradaki önerilen paket

1. Faz 44: ortak arayüz bileşenleri ve eski görünümde kalan sayfalar (panel, proje detayı, blog, gizlilik, 404, yönetim paneli).
2. ~~Faz 69~~ tamamlandı (17 Ekim): kıdem herkese açık.
3. ~~Faz 93, 95~~ tamamlandı (17 Ekim): `npm test`, CI, paket bütçesi. Faz 94 (Playwright) paket indirmesi gerektirdiği için onay bekliyor.
4. ~~Faz 50~~ tamamlandı (17 Ekim): kendi WebGL küremiz; faz 90 (video lisansı) da kapandı.
