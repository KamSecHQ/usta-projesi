-- Güvenlik ve performans düzeltmeleri (Supabase advisor uyarıları)

-- 1) Eski tetikleyici fonksiyonları: sabit search_path, API'den çağrılamaz
alter function public.handle_new_user() set search_path = public, pg_temp;
alter function public.protect_yetkiler() set search_path = public, pg_temp;
alter function public.protect_teklif_durumu() set search_path = public, pg_temp;
alter function public.protect_davet_durumu() set search_path = public, pg_temp;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.protect_yetkiler() from public, anon, authenticated;
revoke all on function public.protect_teklif_durumu() from public, anon, authenticated;
revoke all on function public.protect_davet_durumu() from public, anon, authenticated;

-- 2) RLS: auth.uid() satır başına değil sorgu başına bir kez hesaplansın
alter policy ajans_sahibi_davet_gonderir on public.ajans_davetleri with check (((select auth.uid()) = ajans_id));
alter policy taraflar_daveti_silebilir on public.ajans_davetleri using ((((select auth.uid()) = ajans_id) OR ((select auth.uid()) = davet_edilen_id)));
alter policy taraflar_guncelleyebilir on public.ajans_davetleri using ((((select auth.uid()) = ajans_id) OR ((select auth.uid()) = davet_edilen_id)));
alter policy taraflar_ve_herkes_kabul_edilenleri_okuyabilir on public.ajans_davetleri using (((durum = 'kabul_edildi'::text) OR ((select auth.uid()) = ajans_id) OR ((select auth.uid()) = davet_edilen_id)));
alter policy sadece_adminler_okuma on public.basvurular using ((EXISTS (SELECT 1 FROM public.profiller WHERE ((profiller.id = (select auth.uid())) AND (profiller.admin = true)))));
alter policy admin_yazi_ekler on public.blog_yazilari with check (((select auth.uid()) IN (SELECT profiller.id FROM public.profiller WHERE (profiller.admin = true))));
alter policy admin_yazi_gunceller on public.blog_yazilari using (((select auth.uid()) IN (SELECT profiller.id FROM public.profiller WHERE (profiller.admin = true))));
alter policy admin_yazi_siler on public.blog_yazilari using (((select auth.uid()) IN (SELECT profiller.id FROM public.profiller WHERE (profiller.admin = true))));
alter policy herkes_yayinlanani_okur on public.blog_yazilari using (((yayinlandi = true) OR ((select auth.uid()) IN (SELECT profiller.id FROM public.profiller WHERE (profiller.admin = true)))));
alter policy taraflar_degerlendirme_yazabilir on public.degerlendirmeler with check ((((select auth.uid()) = degerlendiren_id) AND (EXISTS (SELECT 1 FROM (public.ilanlar il JOIN public.teklifler tk ON (((tk.ilan_id = il.id) AND (tk.durum = 'kabul_edildi'::text)))) WHERE ((il.id = tk.ilan_id) AND (il.durum = 'tamamlandi'::text) AND (((il.is_veren_id = (select auth.uid())) AND (tk.yazilimci_id = degerlendirmeler.degerlenen_id)) OR ((tk.yazilimci_id = (select auth.uid())) AND (il.is_veren_id = degerlendirmeler.degerlenen_id))))))));
alter policy kullanici_favori_ekler on public.favoriler with check (((select auth.uid()) = kullanici_id));
alter policy kullanici_favori_siler on public.favoriler using (((select auth.uid()) = kullanici_id));
alter policy kullanici_kendi_favorilerini_okur on public.favoriler using (((select auth.uid()) = kullanici_id));
alter policy is_veren_ilan_olusturur on public.ilanlar with check (((select auth.uid()) = is_veren_id));
alter policy is_veren_kendi_ilanini_gunceller on public.ilanlar using (((select auth.uid()) = is_veren_id));
alter policy is_veren_kendi_ilanini_siler on public.ilanlar using (((select auth.uid()) = is_veren_id));
alter policy kullanici_kendi_profilini_ekler on public.profiller with check (((select auth.uid()) = id));
alter policy kullanici_kendi_profilini_gunceller on public.profiller using (((select auth.uid()) = id));
alter policy kullanici_kendi_projesini_ekler on public.projeler with check (((select auth.uid()) = kullanici_id));
alter policy kullanici_kendi_projesini_gunceller on public.projeler using (((select auth.uid()) = kullanici_id));
alter policy kullanici_kendi_projesini_siler on public.projeler using (((select auth.uid()) = kullanici_id));
alter policy ilan_sahibi_teklif_durumunu_gunceller on public.teklifler using (((select auth.uid()) IN (SELECT ilanlar.is_veren_id FROM public.ilanlar WHERE (ilanlar.id = teklifler.ilan_id))));
alter policy ilgili_taraflar_teklifi_okuyabilir on public.teklifler using ((((select auth.uid()) = yazilimci_id) OR ((select auth.uid()) IN (SELECT ilanlar.is_veren_id FROM public.ilanlar WHERE (ilanlar.id = teklifler.ilan_id)))));
alter policy yazilimci_kendi_teklifini_siler on public.teklifler using (((select auth.uid()) = yazilimci_id));
alter policy yazilimci_teklif_verir on public.teklifler with check (((select auth.uid()) = yazilimci_id));

-- 3) Yabancı anahtar indeksleri
create index if not exists ajans_davetleri_davet_edilen_idx on public.ajans_davetleri (davet_edilen_id);
create index if not exists degerlendirmeler_degerlendiren_idx on public.degerlendirmeler (degerlendiren_id);
create index if not exists degerlendirmeler_degerlenen_idx on public.degerlendirmeler (degerlenen_id);
create index if not exists favoriler_usta_idx on public.favoriler (usta_id);
create index if not exists ilanlar_is_veren_idx on public.ilanlar (is_veren_id);
create index if not exists projeler_kullanici_idx on public.projeler (kullanici_id);
create index if not exists teklifler_yazilimci_idx on public.teklifler (yazilimci_id);

-- 4) Telefon numarası artık herkese açık profiller tablosunda değil:
--    yalnızca sahibi ve yöneticiler okuyabilir. İletişim, mesajlaşmadaki
--    iletişim kartıyla kişinin kendi isteğiyle paylaşılır.
create table if not exists public.profil_iletisim (
    id uuid primary key references public.profiller(id) on delete cascade,
    telefon text check (telefon is null or char_length(telefon) <= 40),
    updated_at timestamptz not null default now()
);
alter table public.profil_iletisim enable row level security;

create policy sahibi_ve_yonetici_gorur on public.profil_iletisim
    for select to authenticated
    using (id = (select auth.uid()) or exists (select 1 from public.profiller p where p.id = (select auth.uid()) and p.admin));

create policy sahibi_ekler on public.profil_iletisim
    for insert to authenticated
    with check (id = (select auth.uid()));

create policy sahibi_gunceller on public.profil_iletisim
    for update to authenticated
    using (id = (select auth.uid()))
    with check (id = (select auth.uid()));

insert into public.profil_iletisim (id, telefon)
select id, btrim(telefon) from public.profiller
 where telefon is not null and btrim(telefon) <> ''
on conflict (id) do nothing;
