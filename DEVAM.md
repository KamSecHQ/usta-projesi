# Kalfahane: devir notu

Bu dosya, projeyi başka bir bilgisayarda ya da yeni bir Claude oturumunda kaldığı yerden sürdürmek için yazıldı.
Önce `CLAUDE.md` (kurallar), sonra bu dosya, gerekirse `PRODUCT.md`, `DESIGN.md` ve `supabase/SEMA.md` okunmalı.

## Proje

- **Ne:** Türk yazılımcıları ("usta") işletmelerle buluşturan pazaryeri. Marka **Kalfahane**; eski adı "usta-projesi".
- **Canlı:** https://www.kalfahane.com (kalfahane.com → www'ye yönlenir)
- **Kod:** GitHub `KamSecHQ/usta-projesi`, dal `main`. `main`'e her push Vercel'de otomatik yayına çıkar.
- **Veritabanı:** Supabase projesi `lalqdppmjirelxngliim` (organizasyon "usta-projesi"). Ücretsiz plan; uzun süre kullanılmazsa duraklatılır ve panelden "Resume" ile açılır.
- **Supabase anahtarı:** `src/supabaseClient.js` içinde; yayınlanabilir (publishable) anahtar, gizli değil. `.env` dosyası yok.

## Yeni bilgisayarda kurulum

1. Node.js 22 veya üstü (bu Mac'te v26 ile çalıştı; Vite 8 en az 20.19 ister).
2. Klasörde: `npm install`, sonra `npm run dev` → http://localhost:5173
3. Kontroller: `npm run build`, `npm run lint` (oxlint).
4. Push için GitHub erişimi: `gh auth login` (ya da git kimlik bilgileri).
5. Veritabanı işleri için Claude'a Supabase bağlayıcısı aynı hesapla bağlanmalı (proje `lalqdppmjirelxngliim`).
6. Tasarım becerisi `impeccable`, bu klasör kopyasında `.claude/skills/impeccable` altında gelir (git'te yok). Claude Code bu klasörde açıldığında proje becerisi olarak görünür.

## Giriş yapmadan ekranları görmek (yalnızca geliştirmede)

- Panel: `/panel?onizleme=yazilimci` ya da `?onizleme=is-veren`
- Mesajlar: `/mesajlar?onizleme=yazilimci` ya da `?onizleme=is-veren` (karşı taraf yazıyor/yanıtlıyor gibi davranır)
- Bu önizlemeler canlı pakete girmez (`import.meta.env.DEV`).
- Masaüstü ekran görüntüsü için Chrome başsız (headless) kullanılabilir:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=1440,900 --virtual-time-budget=6000 --screenshot=cikti.png "http://127.0.0.1:5173/..."`

## Mimari özeti

- **Anasayfa** (`src/pages/Anasayfa.jsx`, lazy): videolu hero (`components/VideoHero.jsx`), tam ekran 3D atölye (`components/atolye/`), fizik paneli, süreç bölümü ve kod yazan robot (`atolye/KodYazanRobot.jsx`), kıdem cetveli, teknoloji bandı. Tüm drei `<View>`'lar tek tuvali paylaşır (`atolye/AtolyeTuvali.jsx`). Lenis yalnızca anasayfada.
- **Uzay teması:** siyah zemin, Plus Jakarta Sans, mor ışık. Hareket ve yüzey dili `components/uzay/`. Ürün içindeki ışıklı cam düğmeler `.isik` / `.isik-kutu` (`src/index.css`, imleç takibi `src/isikTakip.js`).
- **Panelim** (`pages/Dashboard.jsx`): kıdem halkası, müsaitlik, istatistikler, hızlı eylemler (Mesajlar dahil), kıdem yolu, profil gücü, son hareketler.
- **Mesajlaşma** (`pages/Mesajlar.jsx`, `components/mesaj/`, `src/mesajlasma.js`): ayrıntılar `CLAUDE.md` ve `supabase/SEMA.md`.
- **Navbar** okunmamış mesaj rozeti ve sağ altta anlık mesaj bildirimi (`components/MesajBildirimi.jsx`) içerir.
- **Telefon numaraları** `profil_iletisim` tablosunda; herkese açık `profiller`'de değil.

## Yapılanların kronolojisi (Ekim 2026)

1. Bakırcı teması → Lusion tarzı açık tema → videolu hero → site geneli **uzay teması** (bütün sayfalar taşındı).
2. Demir döven robot kaldırıldı; yerine 3D **kod yazan robot**. Sahneler tam ekran ve yüksek çözünürlüklü.
3. Performans: ekran dışı sahneler durur, uyarlanabilir piksel oranı, video ekran dışında duraklar, fizik yalnızca görünürken çalışır.
4. Panelim yeniden tasarlandı; tüm iç sayfalara ışıklı cam düğmeler.
5. **Mesajlaşma sistemi:** teklif kabul edilince konuşma açılır, ödeme sitede yok; iletişim kartı, okundu, yazıyor, tepkiler, arama, sabitleme/arşiv, anlaşma rehberi.
6. **Güvenlik:** telefonlar gizli tabloya taşındı, eski fonksiyonlar sertleştirildi, 25 RLS politikası hızlandırıldı, eksik indeksler eklendi. İletişim adresi `merhaba@kalfahane.com`. Hero videosu yüklenemezse kendi arka planına düşer.

## Bekleyen işler

- **E-posta:** `kalfahane.com` için MX kaydı yok; `merhaba@kalfahane.com` şu an posta almıyor. Alan adının DNS panelinde (ad sunucuları `dnsenable.com`) yönlendirme kurulmalı. Hesap silme (KVKK) talepleri bu adrese gidiyor.
- **Hero videosu:** başka birinin CloudFront hesabından çekiliyor (`VideoHero.jsx` içinde `VIDEO`, `POSTER`), lisansı belirsiz, ~38 MB. Ya hak doğrulanıp sıkıştırılarak kendi barındırmamıza alınmalı ya da kendi yapımımız bir arka planla değiştirilmeli.
- **Sızdırılmış şifre koruması:** Supabase paneli → Authentication → Attack Protection (SQL ile açılamıyor; plan gerektirebilir).
- **Gerçek iki hesapla mesajlaşma testi** henüz yapılmadı (veritabanı senaryoları ve önizleme modu test edildi).
- **Temizlik:** `src/pages/KayitOl.jsx` ve `src/pages/IsVer.jsx` artık rotada değil (yönlendirme var), silinebilir. `src/index.css` içindeki bakırcı ve stüdyo tokenları eski.
- **Paket boyutu:** `FizikSahnesi` parçası ~2.5 MB (rapier). Zaten lazy; gerekirse daha da bölünebilir.
- İstenirse GitHub deposunun adı `kalfahane` yapılabilir (Vercel bağlantısı kontrol edilmeli).

## Kullanıcıyla çalışma şekli

- Türkçe konuşur; kısa ve net Türkçe yanıt bekler.
- Tasarımda "premium", 3D ve animasyonlu, ama akıcı (kasmayan) sonuç ister; beğenmezse açıkça söyler.
- "Commitle ve siteye yükle" dediğinde `main`'e commit + push yapılır, Vercel yayını ve canlı paket doğrulanır. Commit mesajları Türkçe.
- Canlı veritabanında değişiklik yapmadan önce onay istenir.
