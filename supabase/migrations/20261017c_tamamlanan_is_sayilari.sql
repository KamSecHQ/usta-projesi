-- Faz 69: kıdem rozeti için herkese açık tamamlanan iş sayısı.
-- Teklifleri yalnızca taraflar okuyabildiği için ziyaretçiler kıdemi hesaplayamıyordu
-- ve herkesi "Çırak" görüyordu. Bu fonksiyon yalnızca sayıyı döndürür; teklif içeriği,
-- tutar ya da karşı taraf açığa çıkmaz.
--
-- Tamamlanan iş = kabul edilmiş teklifi olan ve ilanı "tamamlandi" işaretlenmiş iş birliği.
--   yazilimci: kabul edilen teklifi tamamlanan ilanlar
--   is-veren : kabul ettiği bir teklifi olan, tamamlanmış kendi ilanları
--             (teklifsiz ilanı "tamamlandı" işaretleyerek kıdem kazanılamaz)
-- Tek çağrıda en fazla 200 kullanıcı.

create or replace function public.tamamlanan_is_sayilari(p_kullanicilar uuid[])
returns table (kullanici_id uuid, sayi integer)
language sql stable security definer set search_path = ''
as $$
    select p.id,
           case p.rol
               when 'is-veren' then (
                   select count(*)::integer
                     from public.ilanlar i
                    where i.is_veren_id = p.id
                      and i.durum = 'tamamlandi'
                      and exists (select 1 from public.teklifler t where t.ilan_id = i.id and t.durum = 'kabul_edildi')
               )
               else (
                   select count(distinct t.ilan_id)::integer
                     from public.teklifler t
                     join public.ilanlar i on i.id = t.ilan_id
                    where t.yazilimci_id = p.id
                      and t.durum = 'kabul_edildi'
                      and i.durum = 'tamamlandi'
               )
           end
      from public.profiller p
     where p.id = any (p_kullanicilar[1:200]);
$$;

revoke all on function public.tamamlanan_is_sayilari(uuid[]) from public;
grant execute on function public.tamamlanan_is_sayilari(uuid[]) to anon, authenticated;
