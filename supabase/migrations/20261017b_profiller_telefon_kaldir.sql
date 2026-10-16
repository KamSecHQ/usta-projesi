-- Yeni arayüz yayında ve profil_iletisim'i kullanıyor: herkese açık sütunu kaldır.
insert into public.profil_iletisim (id, telefon)
select id, btrim(telefon) from public.profiller
 where telefon is not null and btrim(telefon) <> ''
on conflict (id) do nothing;

alter table public.profiller drop column telefon;
