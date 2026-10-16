# Kalfahane (kalfahane.com)

Türk yazılımcılarla ("usta") işletmeleri buluşturan pazaryeri. Repo adı eski marka "usta-projesi"; marka artık **Kalfahane**.

## Çalıştırma
- `npm run dev` → http://localhost:5173
- `npm run build`, `npm run lint` (oxlint)
- Yayın: Vercel (GitHub `KamSecHQ/usta-projesi`, `main`)

## Stack
Vite + React 19 + React Router 7 + Tailwind CSS 4 (`@theme` tokenları `src/index.css`) + Supabase (Auth + Postgres/RLS, istemci `src/supabaseClient.js`). 3D: three.js + @react-three/fiber + drei.

## Kod kuralları
- Değişken, fonksiyon ve bileşen adları Türkçe (ör. `veriGetir`, `yukleniyor`, `Sahan`). Yeni kod da Türkçe adlandırılır.
- Anasayfa `App.jsx` içinde lazy-load edilir; three.js yalnızca anasayfa parçasında kalmalı.
- Tüm 3D görünümler tek WebGL bağlamını paylaşır: `src/components/atolye/AtolyeTuvali.jsx` içindeki `<View.Port />`; bölümler drei `<View>` kullanır. Yeni 3D bölüm eklerken ikinci `<Canvas>` açma.
- `prefers-reduced-motion` her animasyonda desteklenir.

## Tasarım
- Ürün gerçekleri: `PRODUCT.md`. `DESIGN.md` eski "bakırcı" temasını anlatıyor ve güncel değil.
- Güncel dil "uzay teması": siyah zemin, Plus Jakarta Sans, mor vurgu (#8B5CF6 / #A78BFA), beyaz ve koyu cam hap düğmeler. Kaynağı anasayfanın videolu hero'su (`src/components/VideoHero.jsx`, `videoHero.css`).
- Ortak hareket ve yüzey dili: `src/components/uzay/` (`Sahne`, `SatirBaslik`, `HapLink`, `uz-*` sınıfları). Yeni bölümler bunları kullanır.
- 3D: Anasayfadaki tüm `<View>`'lar tek tuvali paylaşır (`atolye/AtolyeTuvali.jsx`); fizik sahnesi (`atolye/FizikSahnesi.jsx`) kendi tuvalinde çalışır. Kod yazan robot: `atolye/KodYazanRobot.jsx`.
- Bir bölümdeki metin tam ekran 3D'nin üstünde duracaksa o bölüme `z-index: 6` verilir; paylaşılan tuval `z-index: 5`'tedir.
- Tasarım işinde `impeccable` becerisini kullan.

## Mesajlaşma
- Şema ve RPC'ler: `supabase/migrations/20261016_mesajlasma.sql` (konusmalar, mesajlar, konusma_durumu, mesaj_tepkileri). Sistem mesajlarını yalnızca veritabanı yazar; istemci yalnızca `metin` ve `iletisim` türünde mesaj ekleyebilir.
- Teklif kabul/ret edilince `teklif_durumu_degisti` tetikleyicisi konuşmayı açar ve sistem mesajı düşer. Konuşma açmak için istemci `konusma_baslat` / `teklif_konusmasi_ac` RPC'lerini çağırır (`src/mesajlasma.js`, `MesajlasDugmesi`).
- Realtime kanalları `kanalAc()` ile açılır (aynı adlı kanal kapanırken yeniden açılma sorununu çözer); aynı kanal adını iki bileşende kullanma.
- Arayüz: `src/pages/Mesajlar.jsx` + `src/components/mesaj/`. Giriş yapmadan denemek için geliştirmede `/mesajlar?onizleme=yazilimci` (veya `is-veren`).

## Doğruluk kuralları
- Emanet (escrow) ödeme sistemi **yok**: "yakında" olarak sunulur.
- Müşteri yorumu, logo duvarı, sahte sayı uydurulmaz; sayılar Supabase'den canlı gelir, ulaşılamazsa "—" gösterilir.
- Kıdem eşikleri `src/ustaYardimcilari.js` (`KIDEM_ROZETLERI_*`) ile aynı kalmalı: Çırak 0, Kalfa 1, Usta 3, Kıdemli Usta 10 tamamlanan iş.
