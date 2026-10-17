# Kalfahane (kalfahane.com)

Türk yazılımcılarla ("usta") işletmeleri buluşturan pazaryeri. Repo adı eski marka "usta-projesi"; marka artık **Kalfahane**.

Yeni bir oturumda önce `DEVAM.md` oku: kurulum, yapılanlar, bekleyen işler ve kullanıcıyla çalışma şekli orada. 100 fazlık plan: `YOL_HARITASI.md`. Veritabanı şeması: `supabase/SEMA.md`.

## Çalıştırma
- `npm run dev` → http://localhost:5173
- `npm run build`, `npm run lint` (oxlint, uyarı sayısı 0 tutulur), `npm test` (Node'un yerleşik test çalıştırıcısı, `testler/*.test.js`), `npm run butce` (derlemeden sonra ilk yük bütçesi: gzip ≤ 200 KB)
- GitHub Actions (`.github/workflows/kontrol.yml`): her push ve PR'da lint (`--deny-warnings`), test, derleme, bütçe. Testler yalnızca saf modülleri içe aktarır; Supabase ya da React'a bağımlı kod teste girmez (bu yüzden mesajlaşmanın saf yardımcıları `src/mesajBicimi.js`'te, ilan açıklamasının iki yönü `components/ilan/ilanSablonlari.js`'te).
- `npm run preview` → http://127.0.0.1:4173 (canlı paketin aynısı), `npm run olc` (akıcılık ölçümü), `npm run og-gorsel` (paylaşım görselini `scripts/og-gorsel.html`'den üretir), `npm run og-vitrin` (örnek vitrinin görseli `public/og-ornek.png`)
- Paylaşım kartları (LinkedIn, WhatsApp, X JavaScript çalıştırmaz; yalnızca HTML etiketlerini okur). Tek kaynak `src/paylasimEtiketleri.js`:
  - Sabit sayfalar (`SAYFA_ETIKETLERI`: /ustalar, /is-ilanlari, /blog, /hesap-olustur, /gizlilik, /ornek): sayfalar `useSayfaBasligi(SAYFA_ETIKETLERI.x.baslik, …aciklama)` ile buradan okur; `npm run build` sonunda `scripts/sayfa-etiketleri.mjs` her biri için `dist/<yol>.html` üretir; `vercel.json` yolu o dosyaya yönlendirir. Yeni sayfa: listeye ekle + `vercel.json` yönlendirmesi (eksikse derleme durur).
  - Dinamik sayfalar (/ustalar/:id, /is-ilanlari/:id, /blog/:slug): `vercel.json` yalnızca paylaşım botlarının (user-agent) isteğini `api/paylasim.js` Vercel fonksiyonuna gönderir; fonksiyon herkese açık kaydı Supabase REST'ten okuyup `dinamikEtiketler()` ile kartı doldurur. Hata olursa varsayılan etiketler döner. Ziyaretçi normal uygulamayı alır.
  - Supabase adresi ve yayınlanabilir anahtar `src/supabaseAyarlari.js` (uygulama ve fonksiyon ortak).
- Yayın: Vercel (GitHub `KamSecHQ/usta-projesi`, `main`)

## Stack
Vite + React 19 + React Router 7 + Tailwind CSS 4 (`@theme` tokenları `src/index.css`) + Supabase (Auth + Postgres/RLS, istemci `src/supabaseClient.js`). 3D: three.js + @react-three/fiber + drei.

## Kod kuralları
- Değişken, fonksiyon ve bileşen adları Türkçe (ör. `veriGetir`, `yukleniyor`, `Sahan`). Yeni kod da Türkçe adlandırılır.
- Anasayfa `App.jsx` içinde lazy-load edilir; three.js yalnızca anasayfa parçasında kalmalı.
- Tüm 3D görünümler tek WebGL bağlamını paylaşır: `src/components/atolye/AtolyeTuvali.jsx` içindeki `<View.Port />`; bölümler drei `<View>` kullanır. Yeni 3D bölüm eklerken ikinci `<Canvas>` açma.
- Her 3D sahneye (View ya da Canvas) `<Isitici />` eklenir (`atolye/Isitici.jsx`); sahne içeriği Suspense içindeyse Isitici de aynı Suspense'in içinde, içerikten sonra durur. Son işlemli (EffectComposer) sahnede `<Isitici sonIslem ilkKare />`. Isitici olmadan sahne ekrana girdiği anda shader derler ve kaydırma donar.
- Hero'nun arka planı canlı WebGL küredir (`atolye/DunyaKuresi.jsx`, paylaşılan tuvalde `data-3d` işaretli `<View>`; dosya adı `VideoHero.jsx` tarihsel, video yok). Kıtalar `atolye/karaMaskesi.js`'ten gelir; maske `scripts/kara-maskesi-uret.mjs` ile Natural Earth 1:110m (kamu malı) verisinden üretilir, ham veri repoda yok. Kadraj eski videonun 1.6 oranlı "cover" kutusunu izler; tuval hazır olana kadar görünen poster `src/assets/kure-poster.webp` aynı sahnenin donuk karesidir: küre değişince geliştirme sunucusu açıkken `npm run kure-poster` ile yeniden üretilir, yoksa poster ile canlı küre arasındaki geçiş görünür olur. Hero metni ve menüsü tuvalin üstünde (z-index 6-8).
- Akıcılık ölçümü: `npm run build && npm run preview`, sonra `npm run olc` (görünür Chrome penceresi açar). Hedef: `uzunKare25: 0`. 3D ya da kaydırma ile ilgili her değişiklikten sonra çalıştırılır.
- Sayfalar `App.jsx` içinde `lazy` yüklenir; yeni sayfa da öyle eklenir. Sayfa başlığı ve açıklaması `useSayfaBasligi(baslik, aciklama)` ile verilir (kanonik adres ve paylaşım etiketleri de güncellenir).
- Form alanı `components/form/Alan.jsx` ile yazılır: `<Alan etiket ipucu hata istege>{(p) => <input {...p} className="alan" />}</Alan>` etiketi, ipucunu ve hatayı alana bağlar (`htmlFor`, `aria-describedby`, `aria-invalid`, hata `role="alert"`). Şifre için `SifreAlani` (`otomatik="current-password"` ya da `"new-password"`). Kişisel alanlara uygun `autoComplete` verilir; yalnızca yer tutucuyla etiketlenmiş alan açılmaz. Doğrulama gönderirken yapılır, hata alanın altında söylenir.
- Hesap sayfaları (`/giris`, `/hesap-olustur`, `/sifre-yenile`) `components/hesap/HesapCercevesi.jsx` içinde. Supabase kimlik hataları kullanıcıya `hesapHatasi()` ile Türkçe gösterilir, ham İngilizce mesaj gösterilmez. Şifre sıfırlama bağlantısı `/sifre-yenile`'ye döner; `AuthContext` `PASSWORD_RECOVERY` olayında oraya yönlendirir. Sıfırlama yanıtı hesabın var olup olmadığını belli etmez.
- Giriş gerektiren, yetki ya da rol uymayan ve bulunamayan sayfalar `components/hesap/GirisKapisi.jsx` ile yazılır (`GirisKapisi` ziyaretçi için, `KapiSayfasi` diğer durumlar için). Giriş bağlantısı `?sonra=` ile bulunulan sayfayı taşır; `GirisYap` yalnızca site içi yola döner. Ziyaretçi hâli yükleme bekleyişinden önce kontrol edilir (veri hiç yüklenmeyeceği için).
- Giriş yapmış kullanıcıya kayıt daveti ("Yazılımcı olarak katıl", "İş vermek istiyorum", "Hesap oluştur") gösterilmez; yerine rolüne uygun sıradaki adım gelir. Rol `useProfilRolu()` ile okunur (`src/profilRolu.js`, kullanıcı başına tek sorgu), ortak üye eylemleri `uyeEylemleri(rol)`. Rol gelene kadar düğmeler yer tutar ama görünmez. Üye `/giris` ve `/hesap-olustur`'a gelirse yönlendirilir.
- Gezinme (üst çubuk, ışık rayı, menüler, mobil menü, duyuru, altbilgi) `components/gezinme.css`; ikonlar `components/gezinmeIkonlari.jsx`. Arayüz metinleri cümle düzeninde yazılır ("Giriş yap", "İş ilanları"); rozet adları (Kıdemli Usta, Güvenilir İş Veren) özel addır.
- Onay için `confirm()` değil `useOnay()`, kısa geri bildirim için `alert()` değil `useBildirim()` (`components/bildirim/bildirimBaglami.js`). Geliştirmede konsoldan `__bildirim` ile denenir.
- Usta kartı tek bileşendir: `components/usta/UstaIcazeti.jsx` (anasayfa, /ustalar, Favorilerim). Usta listesi sorguları `ustaVerisi.js`. Liste sayfalarının arama, çip, anahtar ve sıralama araçları `components/liste/ListeAraclari.jsx`; süzme durumu adres çubuğunda tutulur.
- İlan: kart `components/ilan/IlanKarti.jsx` (liste ve sihirbaz önizlemesi), şablonlar ve açıklama biçimi `components/ilan/ilanSablonlari.js` (`aciklamaOlustur`; ilan sayfası bu biçimi `aciklamayiAyir` ile bölümlere ayırır), teknoloji çip girişi `components/ilan/TeknolojiSecici.jsx`. Teknoloji uyumu `teknolojiUyumu()`, bütçeye göre konum `butceyeGore()`. Form alanları `.alan`, `.alan-etiket`, `.alan-ipucu`, `.alan-hata` (uzay.css).
- Profil gücü tek yerde hesaplanır: `profilGucu.js` (panel ve profil düzenleme). Maddeler profil düzenlemedeki bölüm kimliğini taşır; `/profilim#bolum` o bölüme kaydırıp vurgular (kimlikler: temel, hakkimda, teknolojiler, musaitlik, ucret, video, projeler).
- Değerlendirme: `components/degerlendirme/` (yıldız seçici ve gösterge, form, liste, sorgular). Yalnızca tamamlanan işin tarafları yazabilir (veritabanı kuralı); arayüz aynı işe ikinci kez değerlendirme açmaz.
- Kıdem, herkese açık `tamamlanan_is_sayilari(uuid[])` RPC'sinden gelen tamamlanan iş sayısıyla hesaplanır (`tamamlananIsSayilariGetir` toplu, `tamamlananIsSayisiGetir` tek kişi; `ustaYardimcilari.js`). Tamamlanan iş = kabul edilmiş teklifi olan ve ilanı tamamlanmış iş birliği; teklifsiz ilanı tamamlamak kıdem kazandırmaz. Usta kartlarına sayı `kartVerisiniTamamla()` (`ustaVerisi.js`) ile eklenir; kartta kıdem yalnızca en az bir iş varsa görünür. Kıdemi istemcide tekliflerden hesaplama: ziyaretçi teklifleri okuyamaz.
- İkon olarak emoji ya da ✓ ★ gibi karakter kullanılmaz; `components/mesaj/Ikon.jsx` ya da çizgi SVG. Gri metin yarı saydam yapılmaz (`text-gri`, `text-gri-koyu`); yer tutucular en az `#80808C`.
- Geliştirme önizlemeleri (canlı pakete girmez): `/panel?onizleme=…`, `/mesajlar?onizleme=…`, `/ilan-ver?onizleme=is-veren`, `/ilanlarim?onizleme=is-veren`, `/tekliflerim?onizleme=yazilimci`, `/is-ilanlari/:id?onizleme=yazilimci`, `/ustalar/:id?onizleme=degerlendirme`, `/blog?onizleme=1` (ve `/blog/:slug?onizleme=1`), `/admin?onizleme=1`, `/admin/blog?onizleme=1`; üye hâli için herhangi bir sayfaya `?rol-onizleme=yazilimci` (ya da `is-veren`, `uye`).
- Akıcılık ölçümü prizde yapılır: pil %20'nin altındayken kare hızı 30'a sabitlenir ve ölçüm anlamsızlaşır.
- Para: `tl()`; saatlik ücret `ucretAraligiGoster()`, ilan bütçesi `butceGoster()` (`ustaYardimcilari.js`). Biri diğerinin metni kırpılarak kullanılmaz.
- `prefers-reduced-motion` her animasyonda desteklenir.

## Tasarım
- Ürün gerçekleri: `PRODUCT.md`. Tasarım sistemi: `DESIGN.md` (uzay teması). Eski bakırcı ve stüdyo tokenları silindi; renkler uzay tokenlarından (`gece`, `gece2`, `cam`, `mor*`, `gri*`). Onest ve Bricolage yalnızca 3D dokularda kullanılır ve yalnızca anasayfa parçasında (`Sikke.jsx`, `TeknolojiBandi.jsx`) içe aktarılır.
- Güncel dil "uzay teması": siyah zemin, Plus Jakarta Sans, mor vurgu (#8B5CF6 / #A78BFA), beyaz ve koyu cam hap düğmeler. Kaynağı anasayfanın hero'su: canlı noktalı Dünya küresi (`src/components/VideoHero.jsx`, `atolye/DunyaKuresi.jsx`, `videoHero.css`).
- Ortak hareket ve yüzey dili: `src/components/uzay/` (`Sahne`, `SatirBaslik`, `HapLink`, `uz-*` sınıfları). Yeni bölümler bunları kullanır.
- 3D: Anasayfadaki tüm `<View>`'lar tek tuvali paylaşır (`atolye/AtolyeTuvali.jsx`); fizik sahnesi (`atolye/FizikSahnesi.jsx`) kendi tuvalinde çalışır. Kod yazan robot: `atolye/KodYazanRobot.jsx`.
- Bir bölümdeki metin tam ekran 3D'nin üstünde duracaksa o bölüme `z-index: 6` verilir; paylaşılan tuval `z-index: 5`'tedir.
- Atölye fizik sahnesinde parçalar üstteki yazıya girmez: `FizikPaneli` yazının alt kenarını ölçer (`metinAltOrani`), `FizikSahnesi` bunu yumuşak bir tavana çevirir. Yazı değişirse ölçüm kendiliğinden uyar.
- Tasarım işinde `impeccable` becerisini kullan.

## Mesajlaşma
- Şema ve RPC'ler: `supabase/migrations/20261016_mesajlasma.sql` (konusmalar, mesajlar, konusma_durumu, mesaj_tepkileri). Sistem mesajlarını yalnızca veritabanı yazar; istemci yalnızca `metin` ve `iletisim` türünde mesaj ekleyebilir.
- Teklif kabul/ret edilince `teklif_durumu_degisti` tetikleyicisi konuşmayı açar ve sistem mesajı düşer. Konuşma açmak için istemci `konusma_baslat` / `teklif_konusmasi_ac` RPC'lerini çağırır (`src/mesajlasma.js`, `MesajlasDugmesi`).
- Realtime kanalları `kanalAc()` ile açılır (aynı adlı kanal kapanırken yeniden açılma sorununu çözer); aynı kanal adını iki bileşende kullanma.
- Telefon numarası herkese açık `profiller` tablosunda tutulmaz; `profil_iletisim` tablosundadır (yalnızca sahibi ve yönetici okur). Kişiler numaralarını mesajlaşmadaki iletişim kartıyla kendileri paylaşır.
- Arayüz: `src/pages/Mesajlar.jsx` + `src/components/mesaj/`. Giriş yapmadan denemek için geliştirmede `/mesajlar?onizleme=yazilimci` (veya `is-veren`).

## Doğruluk kuralları
- Emanet (escrow) ödeme sistemi **yok**: "yakında" olarak sunulur.
- Müşteri yorumu, logo duvarı, sahte sayı uydurulmaz; sayılar Supabase'den canlı gelir, ulaşılamazsa "—" gösterilir.
- Sahte hesap ya da sahte ilan açılmaz. İşleyişi göstermek için tek yer örnek vitrindir (`/ornek`, `pages/OrnekVitrin.jsx`, veri `pages/ornekVitrinVerisi.js`): her öğe "Örnek" etiketi taşır, sayfanın başında örnek olduğu yazar; veritabanına, sayaçlara ve aramaya girmez. Eylemleri gerçek çarşıya yönlendirir.
- Kıdem eşikleri `src/ustaYardimcilari.js` (`KIDEM_ROZETLERI_*`) ile aynı kalmalı: Çırak 0, Kalfa 1, Usta 3, Kıdemli Usta 10 tamamlanan iş.

## Supabase istemcisi
- Sorgular tembeldir: `await` ya da `.then()` olmadan istek hiç gönderilmez (son görülme nabzı bu yüzden hiç çalışmamıştı).
- Döngü içinde sıralı sorgu atılmaz; `.in('kolon', idler)` ile tek sorguda çekilip istemcide gruplanır.
- Arama karşılaştırmaları `aramaIcinKatla()` (`ustaYardimcilari.js`) ile yapılır: Türkçe harf ve büyük/küçük farkı yok sayılır.
