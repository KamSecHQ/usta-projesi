# Veritabanı şeması (Supabase, canlı)

Proje: `lalqdppmjirelxngliim` (usta-projesi), Postgres 17. Tüm tablolarda RLS açık.
Bu dosya 17 Ekim 2026'daki canlı şemadan çıkarıldı. Eski tabloların SQL'i repoda yok
(Supabase panelinden kurulmuşlar); `migrations/` klasörü yalnızca 16 Ekim 2026 ve sonrasını içerir.

## Tablolar

### profiller (herkes okur, sahibi yazar)
`id` (auth.users.id) · `rol` ('yazilimci' | 'is-veren') · `ad_soyad` · `unvan` · `bio` · `avatar_url` · `github_url` ·
`teknolojiler text[]` · `konum` · `onayli` · `admin` · `musaitlik` ('musait' | 'kismi_musait' | 'musait_degil') ·
`musaitlik_notu` · `video_url` · `telefon_dogrulandi` · `saatlik_ucret_min/max` · `son_gorulme` · `profil_tipi` ('bireysel' | 'ajans') · `created_at`
- `onayli`, `admin`, `telefon_dogrulandi` yalnızca yönetici tarafından değiştirilebilir (`protect_yetkiler` tetikleyicisi).
- **Telefon burada yok** (bkz. `profil_iletisim`).

### profil_iletisim (yalnızca sahibi ve yönetici okur)
`id` (profiller.id) · `telefon` · `updated_at`

### ilanlar (herkes okur, iş veren yazar)
`id` · `is_veren_id` · `baslik` · `aciklama` · `butce_min/max` · `gerekli_teknolojiler text[]` · `durum` ('acik' | 'kapali' | 'tamamlandi') · `created_at`

### teklifler (yalnızca taraflar okur)
`id` · `ilan_id` · `yazilimci_id` · `mesaj` · `teklif_tutari` · `durum` ('beklemede' | 'kabul_edildi' | 'reddedildi') · `created_at`
- Durumu yalnızca ilan sahibi değiştirir (`protect_teklif_durumu`).
- Durum kabul/ret olunca `teklif_durumu_degisti` konuşmayı açar ve sistem mesajı yazar.

### projeler (portföy; herkes okur, sahibi yazar)
`id` · `kullanici_id` · `baslik` · `aciklama` · `link` · `teknolojiler text[]` · `problem` · `cozum` · `sonuc` · `kapak_gorseli_url` · `rol` · `one_cikan` · `created_at`

### favoriler (sahibi okur/yazar)
`id` · `kullanici_id` · `usta_id` · `created_at`

### degerlendirmeler (herkes okur; yalnızca tamamlanmış işin tarafları yazar)
`id` · `ilan_id` · `degerlendiren_id` · `degerlenen_id` · `puan` · `yorum` · `created_at`

### ajans_davetleri
`id` · `ajans_id` · `davet_edilen_id` · `rol_aciklamasi` · `durum` ('beklemede' | 'kabul_edildi' | 'reddedildi') · `created_at`
- Durumu yalnızca davet edilen değiştirir (`protect_davet_durumu`).

### blog_yazilari (yayınlananı herkes okur, yönetici yazar)
`id` · `baslik` · `slug` · `kategori` · `ozet` · `icerik` · `kapak_gorseli_url` · `yayinlandi` · `created_at` · `guncellenme_tarihi`

### basvurular (form; herkes ekler, yönetici okur)
`id` · `ad` · `email` · `uzmanlik` · `tip` · `created_at`

### Mesajlaşma (ayrıntı: `migrations/20261016_mesajlasma.sql`)
- `konusmalar`: `katilimci_1 < katilimci_2`, `ilan_id`, `teklif_id`, `baslatan_id`, `son_mesaj_at`, `son_mesaj_onizleme`, `son_gonderen_id`
- `mesajlar`: `konusma_id`, `gonderen_id`, `tur` ('metin' | 'iletisim' | 'sistem'), `icerik` (≤4000), `ek jsonb`, `silindi`
- `konusma_durumu`: kişi başına `son_okuma`, `sabitlendi`, `arsivlendi`, `sessiz`
- `mesaj_tepkileri`: `mesaj_id`, `kullanici_id`, `emoji` (👍 ❤️ 🙌 ✅ 😂 🔥)
- Realtime yayınında: konusmalar, mesajlar, konusma_durumu, mesaj_tepkileri.

## RPC'ler (giriş yapmış kullanıcı)
- `konusma_baslat(p_karsi uuid, p_ilan uuid default null) → uuid`
- `teklif_konusmasi_ac(p_teklif uuid) → uuid` (yalnızca teklifin iki tarafı)
- `mesaj_sil(p_mesaj uuid)` (kendi mesajı; önizleme ve alıntılar da temizlenir)
- `okunmamis_sayilari() → (konusma_id, sayi)`
- `konusma_katilimcisi_mi(k uuid) → boolean` (RLS politikalarının yardımcısı)

## Tetikleyiciler
| Tablo | Tetikleyici | Fonksiyon |
|---|---|---|
| auth.users | on_auth_user_created (after insert) | `handle_new_user()` → profiller satırı açar |
| profiller | yetki_koruma (before update) | `protect_yetkiler()` |
| teklifler | teklif_durumu_koruma (before update) | `protect_teklif_durumu()` |
| teklifler | teklif_durumu_degisti_tetik (after update) | `teklif_durumu_degisti()` |
| ajans_davetleri | davet_durumu_koruma (before update) | `protect_davet_durumu()` |
| mesajlar | mesaj_eklendi_tetik (after insert) | `mesaj_eklendi()` |

## Kurallar
- RLS politikalarında `auth.uid()` yerine `(select auth.uid())` yazılır (performans).
- Security definer fonksiyonlar `set search_path` ile tanımlanır; tetikleyici fonksiyonlarının EXECUTE yetkisi anon/authenticated'dan alınır.
- Canlı veritabanında değişiklikten önce kullanıcıdan onay alınır; test için işlem sonunda `raise exception` ile geri alınan `do $$ ... $$` blokları kullanılır.
