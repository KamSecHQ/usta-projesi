# Kalfahane: devir notu

Bu dosya, projeyi başka bir bilgisayarda ya da yeni bir Claude oturumunda kaldığı yerden sürdürmek için yazıldı.
Önce `CLAUDE.md` (kurallar), sonra bu dosya, gerekirse `YOL_HARITASI.md`, `PRODUCT.md`, `DESIGN.md` ve `supabase/SEMA.md` okunmalı.

Son güncelleme: 17 Ekim 2026. Proje SSD'de (`/Volumes/WorkSSD/kalfahane`) duruyor; kullanıcı iki Mac arasında gidip geliyor. Eski `Developer/projects/usta-projesi` klasörü eski bir kopyadır, orada çalışılmaz.

---

## ŞU ANKİ DURUM (ilk önce bunu oku)

- **Blog:** ilk üç yazı (bütçe rehberi, teklif rehberi, sözleşme maddeleri) 17 Ekim 2026'da kullanıcının onayıyla yayınlandı (`supabase/veri/20261017_ilk_blog_yazilari.sql`). Düzenleme ve yeni yazılar Blog yönetiminden (`/admin/blog`); yayınlanan yazı site haritasına ve paylaşım kartlarına kendiliğinden girer.
- **Son yayınlar (17 Ekim 2026):** `c971cb5` (örnek vitrin paylaşım kartı), `1a51f85` (örnek vitrin `/ornek`, profil düzenleme role göre), `780c585` (atölye yazısı okunur; üyeye kayıt daveti yerine role göre sıradaki adım), `f071012` (site geneli premium cila: cam ışık rayı menü, giriş kapıları, iç sayfa atmosferi ve altbilgi, metinler cümle düzeninde), `9ba6d74` (faz 50, hero küresi).
- **Önceki not:** 17 Ekim 2026: faz 50 yayını `9ba6d74`; öncesi `165f0fe`. Vercel ve GitHub Actions başarılı, canlı site doğrulandı (CloudFront izi yok, poster sunuluyor ve ilk karede sönüyor, küre çiziliyor, konsol temiz). Çalışılan dal `main`; eski `perf/kasma-ve-yol-haritasi` dalı aynı commit'te kaldı, silinebilir.
- **GitHub Actions** (`Kontrol`) ilk kez çalıştı ve geçti: lint 0 uyarı, 33/33 test, derleme, ilk yük 164 KB.
- **Yayın akışı:** kullanıcı "commitle ve siteye yükle" deyince: `npx oxlint --deny-warnings`, `npm test`, `npm run build`, `npm run butce`; Türkçe mesajla commit; `git push origin main`; Vercel durumu (`gh api repos/KamSecHQ/usta-projesi/commits/<sha>/status`) ve Actions (`gh run list --repo KamSecHQ/usta-projesi`) izlenir; canlı site doğrulanır. Bu Mac'te GitHub kimlik bilgisi var; diğer Mac'te `gh auth login` gerekebilir (kullanıcı adını ve token'ı kullanıcı kendisi girer).
- **Commitlenmeyenler bilerek:** `.claude/launch.json` (yerel sunucu ayarı) ve `.impeccable/` (tasarım becerisinin bağlamı). `.claude/skills/` `.gitignore`'da.
- **Çalışma ağacını silecek komut çalıştırma** (`git checkout .`, `git restore`, `git stash`, `git clean`, `git reset --hard`) kullanıcı istemedikçe.

## Yeni Mac'te ilk adımlar

1. Node.js 20.19 ya da üstü (eski Mac'te v24.21 ile çalıştı).
2. `node_modules` SSD'de hazır ve **Apple Silicon (arm64)** için kurulu (rolldown ve oxlint yerel ikili dosya kullanır). Yeni Mac Intel ise ya da build/lint "binding" hatası verirse: `rm -rf node_modules && npm install`.
3. `npm run dev` → http://localhost:5173 ; canlı paketin aynısı için `npm run build && npm run preview` → http://127.0.0.1:4173
4. Kontroller: `npm run lint` (0 uyarı tutulur), `npm run build`.
5. Veritabanı işleri için Claude'a Supabase bağlayıcısı aynı hesapla bağlanmalı (proje `lalqdppmjirelxngliim`).
6. Tasarım becerisi `impeccable` bu klasörde `.claude/skills/impeccable` altında gelir (git'te yok). Tasarım işinde kullanılır. `.impeccable/` klasörü de o beceriye ait tasarım bağlamı (git'te yok, silinmemeli).
7. Eski Mac'teki Claude sohbet geçmişi ve hafızası bu SSD'de değil; bilinmesi gereken her şey bu dosyada, `CLAUDE.md` ve `YOL_HARITASI.md` içinde.

## Proje

- **Ne:** Türk yazılımcıları ("usta") işletmelerle buluşturan pazaryeri. Marka **Kalfahane**; eski adı "usta-projesi".
- **Canlı:** https://www.kalfahane.com (kalfahane.com → www'ye yönlenir). Canlıdaki sürüm `main` (`9ba6d74`, 17 Ekim 2026); bu dosyada anlatılan işlerin hepsi canlıda.
- **Kod:** GitHub `KamSecHQ/usta-projesi`, dal `main`. `main`'e her push Vercel'de otomatik yayına çıkar.
- **Veritabanı:** Supabase projesi `lalqdppmjirelxngliim` (organizasyon "usta-projesi"). Ücretsiz plan; uzun süre kullanılmazsa duraklatılır ve panelden "Resume" ile açılır.
- **Supabase anahtarı:** `src/supabaseClient.js` içinde; yayınlanabilir (publishable) anahtar, gizli değil. `.env` dosyası yok.

## Giriş yapmadan ekranları görmek (yalnızca geliştirmede, canlı pakete girmez)

- Panel: `/panel?onizleme=yazilimci` ya da `?onizleme=is-veren`
- Mesajlar: `/mesajlar?onizleme=yazilimci` ya da `?onizleme=is-veren`
- İlan sihirbazı: `/ilan-ver?onizleme=is-veren` · İlanlarım: `/ilanlarim?onizleme=is-veren`
- Tekliflerim: `/tekliflerim?onizleme=yazilimci` · İlan detayı teklif formu: `/is-ilanlari/:id?onizleme=yazilimci`
- Usta profilinde değerlendirmeler: `/ustalar/:id?onizleme=degerlendirme`
- Blog: `/blog?onizleme=1` ve `/blog/yazilim-butcesi-nasil-belirlenir?onizleme=1` (örnek yazılar; canlıda henüz yayınlanmış yazı yok)
- Yönetim: `/admin?onizleme=1` (örnek usta başvuruları; onay, onay kaldırma ve telefon doğrulama yerelde denenir) · `/admin/blog?onizleme=1` (editör ve canlı önizleme)
- Bildirim ve onay diyaloğu konsoldan: `__bildirim('Deneme')`
- Örnek vitrin canlıda da açık (önizleme değil): `/ornek` (ayrıntı penceresi `?ilan=ornek-ilan-4`, `?usta=ornek-usta-3`). Örnek veri `src/pages/ornekVitrinVerisi.js`; tutarlılığı `testler/ornekVitrin.test.js` denetler.
- Profil düzenleme: `/profilim?onizleme=yazilimci` ya da `?onizleme=is-veren` (kaydetme veritabanına gitmez)
- Üye hâli (kayıt davetlerinin yerine gelen role göre eylemler): herhangi bir sayfaya `?rol-onizleme=yazilimci`, `is-veren` ya da `uye`
- Ayarlar (girişli hâli) ve ajans yönetimi için önizleme yok; görmek için gerçek hesapla giriş gerekir.

## Mimari özeti

- **Anasayfa** (`src/pages/Anasayfa.jsx`, lazy): canlı WebGL küreli hero (`components/VideoHero.jsx` + `atolye/DunyaKuresi.jsx`; dosya adı tarihsel), tam ekran 3D atölye (`components/atolye/`), fizik paneli (`atolye/FizikSahnesi.jsx`, kendi tuvali), süreç bölümü ve kod yazan robot (`atolye/KodYazanRobot.jsx`), kıdem cetveli ve sikke, teknoloji bandı, Ustalar bölümü. Tüm drei `<View>`'lar tek tuvali paylaşır (`atolye/AtolyeTuvali.jsx`). Lenis yalnızca anasayfada.
- **Uzay teması:** siyah zemin, Plus Jakarta Sans, mor ışık. Hareket ve yüzey dili `components/uzay/` (`Sahne`, `SatirBaslik`, `HapLink`, `Ok`, `uzay.css`). Işıklı düğmeler: `.isik-hap` (anasayfa ve yeni sayfalar), eski `.isik` / `.isik-kutu` (iç sayfalarda hâlâ var). İmleç takibi `src/isikTakip.js`.
- **Ortak bileşenler (bu dönemde eklendi):**
  - `components/form/Alan.jsx`: `Alan` (etiket, ipucu, hata alana bağlı) ve `SifreAlani` (göster/gizle).
  - `components/hesap/`: `HesapCercevesi` (giriş/kayıt/şifre sayfalarının çerçevesi), `hesapHatalari.js` (`hesapHatasi()`: Supabase hataları Türkçe).
  - `components/bildirim/`: `useBildirim()` (toast), `useOnay()` (yerel `<dialog>` ile onay). `alert()` ve `confirm()` kullanılmaz.
  - `components/usta/UstaIcazeti.jsx`: tek usta kartı (anasayfa, /ustalar, Favorilerim) + boş tezgâh davet kartları + iskelet.
  - `components/liste/ListeAraclari.jsx`: arama kutusu, filtre çipi, anahtar, sıralama, `SonucYok` (liste içi boş durumlar).
  - `components/hesap/GirisKapisi.jsx`: tam sayfa durum kartı. `GirisKapisi` (ziyaretçi; `?sonra=` ile geri döner), `KapiSayfasi` (yetki, rol, bulunamadı).
  - `components/gezinme.css` + `gezinmeIkonlari.jsx` + `navVurgu.js`: üst çubuk, ışık rayı menü, açılır paneller, mobil menü, duyuru, altbilgi.
  - `src/profilRolu.js`: `useProfilRolu()` (giriş yapmış kullanıcının rolü, tek sorgu) ve `uyeEylemleri(rol)`.
  - `components/ilan/`: `IlanKarti`, `ilanSablonlari.js` (7 şablon, `aciklamaOlustur`), `TeknolojiSecici`.
  - `components/degerlendirme/`: yıldız seçici/gösterge, form, liste, sorgular.
  - `components/atolye/Isitici.jsx`: 3D sahnelerin shader ısıtması (her sahnede zorunlu, bkz. CLAUDE.md).
  - `BasaDon.jsx`, `UygulamaHatasi.jsx` (hata sınırı), `ProjeKarti.jsx` (portföy kartı).
- **Yardımcılar:** `ustaYardimcilari.js` (`tl`, `ucretAraligiGoster`, `butceGoster`, `aramaIcinKatla`, `teknolojiUyumu`, `butceyeGore`, kıdem eşikleri), `ustaVerisi.js` (usta sorguları, favoriler, portföyler tek sorguda), `profilGucu.js` (panel ve profil düzenleme ortak), `useSayfaBasligi.js` (başlık, açıklama, og etiketleri, kanonik adres).
- **Mesajlaşma** (`pages/Mesajlar.jsx`, `components/mesaj/`, `src/mesajlasma.js`): ayrıntılar `CLAUDE.md` ve `supabase/SEMA.md`.
- **Telefon numaraları** `profil_iletisim` tablosunda; herkese açık `profiller`'de değil.
- **Oturum:** `AuthContext.jsx` son görülme nabzı (4 dk) ve `PASSWORD_RECOVERY` olayında `/sifre-yenile`'ye yönlendirme.

## Yapılanların kronolojisi (Ekim 2026)

1. Bakırcı teması → Lusion tarzı açık tema → videolu hero → site geneli **uzay teması**.
2. Demir döven robot kaldırıldı; yerine 3D **kod yazan robot**.
3. Performans (ilk dönem): ekran dışı sahneler durur, uyarlanabilir piksel oranı, video ekran dışında duraklar.
4. Panelim yeniden tasarlandı; iç sayfalara ışıklı cam düğmeler.
5. **Mesajlaşma sistemi** (teklif kabul edilince konuşma açılır; iletişim kartı, okundu, yazıyor, tepkiler, arama, sabitleme/arşiv).
6. **Güvenlik:** telefonlar gizli tabloya, fonksiyonlar sertleştirildi, RLS politikaları hızlandırıldı, eksik indeksler. İletişim `merhaba@kalfahane.com`.
7. **Bu dönem (17 Ekim'de `165f0fe` ile yayına alındı):** aşağıda tur tur.

### 7.1 Kasma çözüldü
- Shader ısıtma (`atolye/Isitici.jsx`): sahneler ekrana girmeden boşta derlenir, dokular GPU'ya yüklenir, tek piksele bir kez çizilir. Shader beklemesi 342 → 15 ms.
- Hero videosu: tek `<video>` + son kareyi tuvale kopyalayıp söndüren döngü (sonradan faz 50 ile video tamamen kalktı, bkz. 7.9).
- Fizik sahnesi keskinliği 1.25x sabit, zorlanınca 1x; zayıf cihazda N8AO kapalı. Paylaşılan tuvalin keskinlik artışı kaydırma bitince uygulanır.
- Ölçüm aracı `npm run olc` (`scripts/akicilik-olc.mjs`). Prizde, görünür pencerede: en uzun kare 183 → 19 ms, takılan kare 8 → 0, 60 FPS.
- Kod bölme: bütün sayfalar lazy (iç sayfa ilk kodu 681 → 53 KB), react/supabase/three ayrı parçalar (`vite.config.js`), eski sekmede eksik parça olursa tek yenileme (`main.jsx`).

### 7.2 Robot ekranı ve anasayfa
- Robotun kod ekranı net: doku 2x, kod yazısı 24 px, en yüksek yönlü süzme, tarama çizgileri kalktı; satırlar ekrana sığacak biçimde bölündü.
- Anasayfa düğmeleri saydam ışık hapları (`.isik-hap`): kenar imleçte yanar, ana düğmede dönen yörünge ışığı.
- Ustalar bölümü: portföy vitrinli, imlece eğilen ışıklı kartlar (`.isik-kart`), gerçek portföy sayısı, boş yerlerde uydurma profil yerine davet kartları.
- Hizmet kategorilerine açıklamalar. Teknoloji bandında doku sızıntısı giderildi.

### 7.3 Sayfalar (uzay temasına taşınanlar ve yenilikler)
- `/ustalar` (TumUstalar): Türkçe harf duyarsız arama, teknoloji çipleri, müsaitlik anahtarı, sıralama, süzme adres çubuğunda; favoriler tek sorgu.
- `/is-ilanlari`: ışıklı ilan kartları, teknoloji ve bütçe süzgeci, bütçeye göre sıralama.
- `/ilan-ver`: 4 adımlı sihirbaz, 7 şablon, canlı kart önizlemesi, "ilan netliği" göstergesi, tarayıcıda otomatik taslak.
- `/is-ilanlari/:id` (IlanDetay): açıklama bölümlere ayrılır, yapışık bütçe kutusu, ustanın teknoloji uyumu ve bütçeye göre konumunu gösteren teklif formu.
- `/ilanlarim`: teklif karşılaştırma tablosu, kabul/ret/kapatma/tamamlama onay diyaloğuyla, değerlendirme yazma.
- `/tekliflerim`: duruma göre süzme, bütçeye göre konum, sıradaki adım, değerlendirme.
- `/ustalar/:id` (UstaProfili): baştan tasarım (vitrin şeridi, kimlik alanı, yapışık çalışma paneli, portföy kartları, değerlendirme ortalaması ve dağılımı).
- `/favorilerim`, `/panel` (profil gücü ortak hesap, yanlış bir iddia cümlesi kaldırıldı, eksik maddeye tıklayınca `/profilim#bolum`).
- `/profilim` (ProfilDuzenle): uzay teması, yazdıkça güncellenen profil gücü paneli, eksik bölüme kaydırıp vurgulama, erişilebilir alanlar.
- **Hesap sayfaları:** `/giris` ve `/hesap-olustur` baştan yazıldı (rol seçimi kartlarla, alan düzeyinde doğrulama, Türkçe hata). **Şifremi unuttum** akışı yeni: `resetPasswordForEmail` → `/sifre-yenile` (yeni sayfa). Yanıt, hesabın var olup olmadığını belli etmez. Gerçek bir hesapla e-posta üzerinden henüz denenmedi.
- `/ayarlar`: uzay teması, şifre değiştirme, son giriş tarihi, **tüm cihazlarda oturumu kapat** (`signOut({ scope: 'global' })`), hesap silme talebi (e-posta).
- `/ajansim`: uzay teması; oturum kapalıyken sonsuz "Yükleniyor" hatası giderildi; reddedilen davet kaldırılıp yeniden gönderilebilir; yazarken eski arama yanıtları yenisini ezmez.
- `/admin/blog`: alanlar `Alan` ile etiketli; `confirm()` yerine `useOnay()`.

### 7.4 Doğruluk, erişilebilirlik ve hata düzeltmeleri
- Son görülme nabzı hiç gönderilmiyordu (Supabase sorgusu `then` olmadan çalışmaz), düzeltildi.
- N+1 sorgular (İlanlarım teklifleri, liste sayfalarındaki favori düğmeleri) tek sorguya indi.
- Mesajlar yan panelinde bütçe yanlışlıkla "/ saat" ile gösteriliyordu; para biçimi binlik ayraçlı (`tl()`).
- Kıdem rozeti: teklifleri yalnızca taraflar okuyabildiği için ziyaretçiler herkesi "Çırak" görüyordu; faz 69 ile çözüldü (7.6).
- Portföy kartında bağlantı içinde bağlantı vardı, düzeltildi. Ok ikonları boyutsuz olduğu için görünmüyordu, düzeltildi.
- Erişilebilirlik: "İçeriğe geç", sayfa geçişinde başa dönme, odak halkası, kontrast (yarı saydam gri metinler kalktı), emoji/karakter ikonlar çizgi ikonlara, tüm formlarda bağlı etiketler ve duyurulan hatalar, `autoComplete`.
- SEO: `og-image.png`, `robots.txt`, `sitemap.xml`, JSON-LD, sayfa başına açıklama ve kanonik adres, 404 `noindex`.
- `vercel.json`: güvenlik başlıkları ve hash'li dosyalara kalıcı önbellek.
- Temizlik: `KayitOl.jsx`, `IsVer.jsx`, `UstaCard.jsx` silindi; eski bakırcı/stüdyo renk tokenları silindi; Onest ve Bricolage yazı tipleri yalnızca anasayfa parçasında; lint uyarıları 0.

### 7.9 Faz 50: kendi yapımımız hero küresi (video ve lisans sorunu kalktı)
- Lisansı belirsiz 38 MB'lık CloudFront videosu ve posteri kaldırıldı; yerine canlı WebGL küre (`atolye/DunyaKuresi.jsx`): Natural Earth 1:110m (kamu malı) verisinden üretilen 1° kara maskesiyle noktalı kıtalar, İstanbul merkezli ağ çizgileri ve ışık darbeleri, atmosfer kenar ışığı, iki yörünge ve uydu, tohumlu yıldızlar, imlece hafif dönüş. Metin bloğunun arkasındaki ışıklar yarıya kısılır.
- Veri kullanıcı onayıyla bir kez indirildi (unpkg `world-atlas@2.0.2/land-110m.json`, 55 KB); repoda yalnızca üretim betiği (`scripts/kara-maskesi-uret.mjs`) ve 11 KB'lık maske (`atolye/karaMaskesi.js`) var.
- Paylaşılan tuvalde `<View>` (ikinci tuval yok) + `<Isitici />`. Hero menü, metin ve mobil menü z-index 7/6/8 (tuval 5).
- Poster `src/assets/kure-poster.webp` (102 KB) sahnenin donuk karesi (`?kure=poster`, `npm run kure-poster`); tuval hazır olana kadar görünür, ilk karede 0,9 sn'de söner. WebGL yoksa poster kalır; poster de yüklenemezse CSS yedeği (mor ufuk).
- Ölçüm (prizde, görünür pencere, `npm run olc`, preview): 3 koşunun ikisinde 60 FPS, en uzun kare 19 ms, `uzunKare25: 0`, kaydırmada uzun görev 0. İlk koşudaki 130-150 ms'lik kareler soğuk GPU önbelleğiydi, tekrarlanmadı.
- Anasayfa parçası 106 → 130 KB (maske + küre); ilk yük değişmedi (164 KB gzip). Gizlilik metninden "anasayfa videosu dış sunucudan yüklenir" maddesi çıkarıldı. `index.html`'deki CloudFront `dns-prefetch`'leri silindi.
- Not: `.impeccable/surfaces/src-pages-anasayfa-jsx.md` hâlâ eski bakırcı yönünü anlatıyor (tasarım becerisinin bağlamı, git'te yok); güncel yön `DESIGN.md`.

### 7.8 Faz 93 ve 95: testler, CI, paket bütçesi
- `npm test`: Node'un yerleşik test çalıştırıcısı, yeni bağımlılık yok. 33 test: para/bütçe biçimleri, Türkçe arama katlama, teknoloji uyumu, bütçeye göre konum, kıdem eşikleri (CLAUDE.md ile aynı olduğunu da denetler), toplu kıdem sorgusunun ayıklaması, slug, YouTube çerezsiz gömme, iletişim kartı bağlantı/e-posta güvenliği, mesaj zaman biçimleri, ilan açıklamasının gidiş-dönüşü (`aciklamaOlustur` → `aciklamayiAyir`), blog metin biçimi, profil gücü.
- Testlenebilsin diye: mesajlaşmanın saf yardımcıları `src/mesajBicimi.js`'e ayrıldı (`mesajlasma.js` aynen dışa aktarır); `aciklamayiAyir` ilan sayfasından `ilanSablonlari.js`'e taşındı.
- `npm run butce`: ilk yükün gzip toplamı (şu an 164 KB, sınır 200 KB).
- `.github/workflows/kontrol.yml`: push ve PR'da lint (uyarı da hata), test, derleme, bütçe. Henüz push edilmediği için GitHub'da hiç çalışmadı; ilk push'ta kontrol edilmeli.
- Faz 94 (Playwright uçtan uca) yapılmadı: yeni paket ve tarayıcı indirmesi gerektiriyor, kullanıcı onayı istenmeli.

### 7.7 Faz 44'ün kalanı: yönetim sayfaları
- `/admin`: iş ekranı olarak yeniden kuruldu. Sekmeler (onay bekleyen, onaylı, eski başvurular), isim/unvan/teknoloji araması, her profilde profil gücü ve eksik maddeler, portföy sayısı, telefon (yönetici görür) ve "doğrulandı işaretle" (onay diyaloğuyla), "Ustaya yaz". Onaylama bildirim verir, onay kaldırma onay ister, hata sessiz kalmaz. Giriş yoksa zorla yönlendirme yerine giriş daveti.
- `/admin/blog`: editör ile yanında canlı önizleme (sitedeki okuma düzeniyle aynı `YaziGovdesi`), kaydedilmemiş değişiklik uyarısı, yayın anahtarı, Türkçe hata mesajları, listede yayında/taslak durumu, okuma süresi ve "görüntüle". Adres (slug) kaydederken biçimlenir.
- Böylece eski görünümde sayfa kalmadı; panel (`Dashboard.jsx`) uzay temasında ama eski `.isik-kutu` dilinde.

### 7.6 Faz 69: herkese açık kıdem (kullanıcı onayıyla canlı veritabanına uygulandı)
- `tamamlanan_is_sayilari(uuid[])` RPC'si canlıda (`supabase/migrations/20261017c_tamamlanan_is_sayilari.sql`), anonim ziyaretçi dahil çağrılabilir, yalnızca sayı döndürür. Geri alınan testle doğrulandı: ilan tamamlanınca iki tarafın sayısı 1 oldu, teklifsiz "tamamlanmış" ilan saymadı.
- Kıdem profilde artık herkese görünür; çalışma panelinde "Tamamlanan" sayısı. Usta kartlarında en az bir iş varsa kıdem etiketi (`kartVerisiniTamamla`). `/ustalar`'da "Tamamlanan işe göre" sıralama. İlan sayfasında ilan sahibinin kıdemi (en az bir iş varsa).
- Kural değişikliği: iş verenin sayısı artık kabul edilmiş teklifli tamamlanmış ilanlardır (önceden teklifsiz tamamlanmış ilan da sayılıyordu).

### 7.5 Eski görünümde kalan sayfalar (ilk Mac'e dönüş turu)
- `/blog`: öne çıkan ilk yazı, ışıklı kartlar, kategori süzgeci (adres çubuğunda), okuma süresi, dürüst boş durum. Kartlar `components/yazi/YaziKartlari.jsx`.
- `/blog/:slug`: okuma düzeni (68 karakter), yapışık içindekiler ve okunan bölüm vurgusu, makale yapılandırılmış verisi (JSON-LD `Article`, faz 27'nin blog kısmı), ilan çağrısı ve diğer yazılar. İçerik düz metin; `## ara başlık`, `- madde`, `1. madde`, `> alıntı`, `**kalın**` ve bağlantılar biçimlenir (`components/yazi/YaziGovdesi.jsx`, kurallar `yaziBicimi.js`). Blog yönetimindeki içerik alanında bu işaretler ipucu olarak yazılı.
- `/gizlilik`: baştan yazıldı ve sistemin gerçek davranışına göre güncellendi (mesajlaşma, gizli telefon, son görülme, tarayıcı kayıtları, Supabase Frankfurt/AB, Vercel, YouTube/Loom, KVKK m.11 hakları). Yapışık bölüm listesi. Veri akışı değişirse bu sayfa da güncellenmeli (dosyanın başındaki not).
- `/proje/:id`: vaka çalışması düzeni (Problem, Çözüm, Sonuç), yapışık usta kartı ("Ustaya yaz", profil, canlı proje), aynı ustanın diğer işleri; sahibine "Bu işi düzenle".
- 404: büyük çizgi "404", yörünge ışığı, kısayol kartları; "HATA 404" üst etiketi kaldırıldı.
- YouTube tanıtım videoları çerezsiz modda gömülüyor (`youtube-nocookie.com`).
- `MesajlasDugmesi` `w-full` verildiğinde artık gerçekten tam genişlik (usta profili ve proje kenar çubuğunda daralıyordu).

## Ölçüm notu

- `npm run olc` görünür bir Chrome penceresi açar ve sayfayı kaydırır. Pencere görünmüyorsa (kapak kapalı, başka masaüstü, küçültülmüş) tarayıcı kare çizmez; araç artık bu durumda zaman aşımıyla çıkar. Eski Mac'teki son turda bu yüzden videolu ölçüm yapılamadı.
- Son ölçüm (17 Ekim, küreli hero, bu Mac'te prizde, görünür pencere): 60 FPS, en uzun kare 19 ms, `uzunKare25: 0`. Preview `localhost`'a bağlandığı için adres verilir: `npm run olc -- http://localhost:4173/`. `VIDEOSUZ=1` bayrağı artık işlevsiz (video yok).
- Pil %20'nin altındayken kare hızı 30'a sabitlenir; ölçüm prizde yapılır.

## Bekleyen işler

- **Kullanıcı onayı bekleyenler:**
- **Kod tarafında sıradaki (önerilen):**
  1. Faz 44 bitti (7.5, 7.7). İstenirse panel (`Dashboard.jsx`) eski `.isik-kutu` dilinden yeni `.isik-kart`/`.isik-hap` diline hizalanabilir.
  2. Faz 93 ve 95 bitti (7.8). Faz 94 (Playwright uçtan uca) paket indirmesi gerektirdiği için onay bekliyor.
  3. Ayrıntılı liste: `YOL_HARITASI.md` (39 ✅, 36 ⏳, 25 🔒) ve sonundaki "Sıradaki önerilen paket".
- **E-posta:** `kalfahane.com` için MX kaydı yok; `merhaba@kalfahane.com` posta almıyor. Hesap silme (KVKK) talepleri bu adrese gidiyor; Ayarlar "48 saat içinde işleme alırız", gizlilik metni "30 gün içinde yanıtlarız" diyor. Bu söz ancak posta kutusu kurulunca tutulabilir.
- **KVKK:** gizlilik metninde veri sorumlusunun adı/unvanı ve adresi yok (kullanıcıdan gelmeli); metnin bir hukukçuya okutulması önerilir.
- **Sızdırılmış şifre koruması:** Supabase paneli → Authentication → Attack Protection.
- **Gerçek iki hesapla mesajlaşma testi** ve şifre sıfırlama e-postasının gerçek testi yapılmadı.
- **Açık gözlem:** İstatistikler/SSS bölgesinde ölçümlerin birinde tek bir ~180 ms'lik GPU karesi; şüpheli `filter: blur` giriş geçişi.
- **Paket boyutu:** `FizikSahnesi` parçası ~2.5 MB (rapier); kullanıcı hero'dan inmeye başlayınca yüklenmesi faz 16.
- İstenirse GitHub deposunun adı `kalfahane` yapılabilir (Vercel bağlantısı kontrol edilmeli).

## Kullanıcıyla çalışma şekli

- Türkçe konuşur; kısa ve net Türkçe yanıt bekler.
- Genelde "devam et" der: yol haritasından sıradaki paketi seçip kendin ilerlemen beklenir ("her şey sende").
- Tasarımda "premium", 3D ve animasyonlu, ama akıcı (kasmayan) sonuç ister; beğenmezse açıkça söyler.
- "Commitle ve siteye yükle" dediğinde `main`'e commit + push yapılır, Vercel yayını, Actions ve canlı site doğrulanır. Commit mesajları Türkçe. Bunu demeden commit ve push yapılmaz.
- Canlı veritabanında değişiklik yapmadan önce onay istenir.
- Uydurma sayı, yorum, logo kullanılmaz; emanet ödeme "yakında" olarak sunulur (bkz. CLAUDE.md "Doğruluk kuralları").
