-- Kalfahane mesajlaşma sistemi
-- İş veren ile yazılımcı site içinden konuşur; ödeme sistemi olmadığı için anlaşma
-- ve ödeme taraflar arasında yapılır. Sistem mesajlarını yalnızca veritabanı yazar.

-- ---------------------------------------------------------------------------
-- Tablolar
-- ---------------------------------------------------------------------------
create table public.konusmalar (
    id uuid primary key default gen_random_uuid(),
    katilimci_1 uuid not null references public.profiller(id) on delete cascade,
    katilimci_2 uuid not null references public.profiller(id) on delete cascade,
    ilan_id uuid references public.ilanlar(id) on delete set null,
    teklif_id uuid references public.teklifler(id) on delete set null,
    baslatan_id uuid not null default auth.uid() references public.profiller(id) on delete cascade,
    son_mesaj_at timestamptz not null default now(),
    son_mesaj_onizleme text,
    son_gonderen_id uuid references public.profiller(id) on delete set null,
    created_at timestamptz not null default now(),
    -- Çift hep sıralı tutulur
    constraint konusma_sirali_cift check (katilimci_1 < katilimci_2)
);
-- Aynı iki kişi aynı ilan için tek konuşma. Benzersizlik yalnızca ilana bağlı konuşmalarda:
-- ilan silinip ilan_id boşalınca ilansız bir konuşmayla çakışıp silmeyi engellemesin.
create unique index konusma_ilan_tekil on public.konusmalar (katilimci_1, katilimci_2, ilan_id) where ilan_id is not null;
create index konusmalar_katilimci_1_idx on public.konusmalar (katilimci_1, son_mesaj_at desc);
create index konusmalar_katilimci_2_idx on public.konusmalar (katilimci_2, son_mesaj_at desc);
create index konusmalar_teklif_idx on public.konusmalar (teklif_id);

create table public.mesajlar (
    id uuid primary key default gen_random_uuid(),
    konusma_id uuid not null references public.konusmalar(id) on delete cascade,
    gonderen_id uuid not null default auth.uid() references public.profiller(id) on delete cascade,
    tur text not null default 'metin' check (tur in ('metin', 'iletisim', 'sistem')),
    icerik text not null default '' check (char_length(icerik) <= 4000),
    ek jsonb,
    silindi boolean not null default false,
    created_at timestamptz not null default now(),
    constraint mesaj_bos_olamaz check (silindi or tur <> 'metin' or char_length(btrim(icerik)) > 0)
);
create index mesajlar_konusma_idx on public.mesajlar (konusma_id, created_at);
create index mesajlar_gonderen_idx on public.mesajlar (gonderen_id);

create table public.konusma_durumu (
    konusma_id uuid not null references public.konusmalar(id) on delete cascade,
    kullanici_id uuid not null references public.profiller(id) on delete cascade,
    son_okuma timestamptz not null default now(),
    sabitlendi boolean not null default false,
    arsivlendi boolean not null default false,
    sessiz boolean not null default false,
    primary key (konusma_id, kullanici_id)
);
create index konusma_durumu_kullanici_idx on public.konusma_durumu (kullanici_id);

create table public.mesaj_tepkileri (
    mesaj_id uuid not null references public.mesajlar(id) on delete cascade,
    kullanici_id uuid not null default auth.uid() references public.profiller(id) on delete cascade,
    emoji text not null check (emoji in ('👍', '❤️', '🙌', '✅', '😂', '🔥')),
    created_at timestamptz not null default now(),
    primary key (mesaj_id, kullanici_id, emoji)
);
create index mesaj_tepkileri_kullanici_idx on public.mesaj_tepkileri (kullanici_id);

alter table public.konusmalar enable row level security;
alter table public.mesajlar enable row level security;
alter table public.konusma_durumu enable row level security;
alter table public.mesaj_tepkileri enable row level security;

-- ---------------------------------------------------------------------------
-- Yardımcı: çağıran kişi bu konuşmanın tarafı mı?
-- ---------------------------------------------------------------------------
create or replace function public.konusma_katilimcisi_mi(k uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.konusmalar c
        where c.id = k and (select auth.uid()) in (c.katilimci_1, c.katilimci_2)
    );
$$;

-- ---------------------------------------------------------------------------
-- Güvenlik kuralları
-- ---------------------------------------------------------------------------
create policy taraflar_konusmayi_gorur on public.konusmalar
    for select to authenticated
    using ((select auth.uid()) in (katilimci_1, katilimci_2));

create policy taraf_konusma_baslatir on public.konusmalar
    for insert to authenticated
    with check (baslatan_id = (select auth.uid()) and (select auth.uid()) in (katilimci_1, katilimci_2));

create policy taraflar_mesajlari_gorur on public.mesajlar
    for select to authenticated
    using (public.konusma_katilimcisi_mi(konusma_id));

-- Kullanıcılar yalnızca kendi adına metin ve iletişim kartı gönderebilir; sistem mesajı yazamaz
create policy taraf_mesaj_gonderir on public.mesajlar
    for insert to authenticated
    with check (
        gonderen_id = (select auth.uid())
        and tur in ('metin', 'iletisim')
        and silindi = false
        and public.konusma_katilimcisi_mi(konusma_id)
    );

create policy taraflar_durumu_gorur on public.konusma_durumu
    for select to authenticated
    using (public.konusma_katilimcisi_mi(konusma_id));

create policy kullanici_kendi_durumunu_ekler on public.konusma_durumu
    for insert to authenticated
    with check (kullanici_id = (select auth.uid()) and public.konusma_katilimcisi_mi(konusma_id));

create policy kullanici_kendi_durumunu_gunceller on public.konusma_durumu
    for update to authenticated
    using (kullanici_id = (select auth.uid()))
    with check (kullanici_id = (select auth.uid()) and public.konusma_katilimcisi_mi(konusma_id));

create policy taraflar_tepkileri_gorur on public.mesaj_tepkileri
    for select to authenticated
    using (exists (select 1 from public.mesajlar m where m.id = mesaj_id and public.konusma_katilimcisi_mi(m.konusma_id)));

create policy kullanici_tepki_ekler on public.mesaj_tepkileri
    for insert to authenticated
    with check (
        kullanici_id = (select auth.uid())
        and exists (select 1 from public.mesajlar m where m.id = mesaj_id and not m.silindi and public.konusma_katilimcisi_mi(m.konusma_id))
    );

create policy kullanici_kendi_tepkisini_siler on public.mesaj_tepkileri
    for delete to authenticated
    using (kullanici_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Tetikleyici: yeni mesaj konuşmanın özetini günceller, gönderen için okundu yazar
-- ---------------------------------------------------------------------------
create or replace function public.mesaj_eklendi()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.konusmalar
       set son_mesaj_at = new.created_at,
           son_gonderen_id = new.gonderen_id,
           son_mesaj_onizleme = case new.tur
               when 'iletisim' then 'İletişim bilgisi paylaşıldı'
               else left(new.icerik, 160)
           end
     where id = new.konusma_id;

    if new.tur <> 'sistem' then
        insert into public.konusma_durumu (konusma_id, kullanici_id, son_okuma)
        values (new.konusma_id, new.gonderen_id, new.created_at)
        on conflict (konusma_id, kullanici_id) do update set son_okuma = excluded.son_okuma;
    end if;
    return new;
end;
$$;

create trigger mesaj_eklendi_tetik
    after insert on public.mesajlar
    for each row execute function public.mesaj_eklendi();

-- ---------------------------------------------------------------------------
-- İç yardımcı: iki kişi arasında (ilana bağlı) konuşmayı getir ya da oluştur
-- ---------------------------------------------------------------------------
create or replace function public._konusma_getir_olustur(p_a uuid, p_b uuid, p_ilan uuid, p_teklif uuid, p_baslatan uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_1 uuid := least(p_a, p_b);
    v_2 uuid := greatest(p_a, p_b);
    v_id uuid;
begin
    if p_ilan is null then
        -- İlansız (genel) konuşma: varsa en eskisi kullanılır
        select id into v_id from public.konusmalar
         where katilimci_1 = v_1 and katilimci_2 = v_2 and ilan_id is null
         order by created_at limit 1;
        if v_id is null then
            insert into public.konusmalar (katilimci_1, katilimci_2, ilan_id, teklif_id, baslatan_id)
            values (v_1, v_2, null, p_teklif, p_baslatan)
            returning id into v_id;
        end if;
    else
        insert into public.konusmalar (katilimci_1, katilimci_2, ilan_id, teklif_id, baslatan_id)
        values (v_1, v_2, p_ilan, p_teklif, p_baslatan)
        on conflict (katilimci_1, katilimci_2, ilan_id) where ilan_id is not null do nothing
        returning id into v_id;
        if v_id is null then
            select id into v_id from public.konusmalar
             where katilimci_1 = v_1 and katilimci_2 = v_2 and ilan_id = p_ilan;
            if p_teklif is not null then
                update public.konusmalar set teklif_id = coalesce(teklif_id, p_teklif) where id = v_id;
            end if;
        end if;
    end if;

    -- Yeni konuşmada hiçbir şey okunmamış başlar; kişi mesaj yazınca veya açınca ilerler
    insert into public.konusma_durumu (konusma_id, kullanici_id, son_okuma)
    values (v_id, v_1, 'epoch'), (v_id, v_2, 'epoch')
    on conflict (konusma_id, kullanici_id) do nothing;

    return v_id;
end;
$$;
revoke all on function public._konusma_getir_olustur(uuid, uuid, uuid, uuid, uuid) from public, anon, authenticated;

-- Profilden ya da ilandan konuşma başlat
create or replace function public.konusma_baslat(p_karsi uuid, p_ilan uuid default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_ben uuid := auth.uid();
begin
    if v_ben is null then
        raise exception 'Giriş yapmalısın';
    end if;
    if p_karsi is null or p_karsi = v_ben then
        raise exception 'Kendinle konuşma başlatamazsın';
    end if;
    if not exists (select 1 from public.profiller where id = p_karsi) then
        raise exception 'Kullanıcı bulunamadı';
    end if;
    return public._konusma_getir_olustur(v_ben, p_karsi, p_ilan, null, v_ben);
end;
$$;

-- Bir teklif üzerinden konuşma aç: yalnızca teklifin iki tarafı
create or replace function public.teklif_konusmasi_ac(p_teklif uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_ben uuid := auth.uid();
    v_teklif public.teklifler%rowtype;
    v_ilan public.ilanlar%rowtype;
    v_karsi uuid;
    v_id uuid;
begin
    select * into v_teklif from public.teklifler where id = p_teklif;
    if not found then
        raise exception 'Teklif bulunamadı';
    end if;
    select * into v_ilan from public.ilanlar where id = v_teklif.ilan_id;
    if v_ben = v_teklif.yazilimci_id then
        v_karsi := v_ilan.is_veren_id;
    elsif v_ben = v_ilan.is_veren_id then
        v_karsi := v_teklif.yazilimci_id;
    else
        raise exception 'Bu teklifin tarafı değilsin';
    end if;

    v_id := public._konusma_getir_olustur(v_ben, v_karsi, v_ilan.id, v_teklif.id, v_ben);

    -- Konuşmanın ilk satırı: hangi teklif üzerinden başladığı
    if not exists (select 1 from public.mesajlar where konusma_id = v_id) then
        insert into public.mesajlar (konusma_id, gonderen_id, tur, icerik, ek)
        values (
            v_id, v_ben, 'sistem',
            '«' || v_ilan.baslik || '» ilanına verilen teklif üzerinden konuşma başladı'
                || coalesce(' · ₺' || v_teklif.teklif_tutari::text, ''),
            jsonb_build_object('olay', 'teklif', 'teklif_id', v_teklif.id, 'ilan_id', v_ilan.id, 'tutar', v_teklif.teklif_tutari)
        );
    end if;
    return v_id;
end;
$$;

-- Kendi mesajını sil (içerik kalıcı olarak boşaltılır)
create or replace function public.mesaj_sil(p_mesaj uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.mesajlar
       set silindi = true, icerik = '', ek = null
     where id = p_mesaj and gonderen_id = auth.uid() and tur in ('metin', 'iletisim');
    delete from public.mesaj_tepkileri where mesaj_id = p_mesaj
       and exists (select 1 from public.mesajlar m where m.id = p_mesaj and m.gonderen_id = auth.uid());
end;
$$;

-- Okunmamış mesaj sayıları (konuşma başına)
create or replace function public.okunmamis_sayilari()
returns table (konusma_id uuid, sayi integer)
language sql
stable
security definer
set search_path = ''
as $$
    select c.id, count(m.id)::integer
      from public.konusmalar c
      join public.mesajlar m on m.konusma_id = c.id
      left join public.konusma_durumu d on d.konusma_id = c.id and d.kullanici_id = auth.uid()
     where auth.uid() in (c.katilimci_1, c.katilimci_2)
       and m.gonderen_id <> auth.uid()
       and not m.silindi
       and m.created_at > coalesce(d.son_okuma, '-infinity'::timestamptz)
     group by c.id;
$$;

revoke all on function public.konusma_baslat(uuid, uuid) from public, anon;
revoke all on function public.teklif_konusmasi_ac(uuid) from public, anon;
revoke all on function public.mesaj_sil(uuid) from public, anon;
revoke all on function public.okunmamis_sayilari() from public, anon;
revoke all on function public.konusma_katilimcisi_mi(uuid) from public, anon;
grant execute on function public.konusma_baslat(uuid, uuid) to authenticated;
grant execute on function public.teklif_konusmasi_ac(uuid) to authenticated;
grant execute on function public.mesaj_sil(uuid) to authenticated;
grant execute on function public.okunmamis_sayilari() to authenticated;
grant execute on function public.konusma_katilimcisi_mi(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Teklif kabul / ret: konuşmayı aç ve sistem mesajı düş
-- ---------------------------------------------------------------------------
create or replace function public.teklif_durumu_degisti()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_ilan public.ilanlar%rowtype;
    v_id uuid;
begin
    if new.durum is not distinct from old.durum then
        return new;
    end if;
    select * into v_ilan from public.ilanlar where id = new.ilan_id;

    if new.durum = 'kabul_edildi' then
        v_id := public._konusma_getir_olustur(v_ilan.is_veren_id, new.yazilimci_id, v_ilan.id, new.id, v_ilan.is_veren_id);
        insert into public.mesajlar (konusma_id, gonderen_id, tur, icerik, ek)
        values (
            v_id, v_ilan.is_veren_id, 'sistem',
            'Teklif kabul edildi. Kalfahane''de ödeme sistemi henüz yok; ödemeyi ve teslim koşullarını kendi aranızda, güvenli bir yolla netleştirin.',
            jsonb_build_object('olay', 'kabul', 'teklif_id', new.id, 'ilan_id', v_ilan.id, 'tutar', new.teklif_tutari)
        );
    elsif new.durum = 'reddedildi' then
        select id into v_id from public.konusmalar
         where katilimci_1 = least(v_ilan.is_veren_id, new.yazilimci_id)
           and katilimci_2 = greatest(v_ilan.is_veren_id, new.yazilimci_id)
           and ilan_id = v_ilan.id;
        if v_id is not null then
            insert into public.mesajlar (konusma_id, gonderen_id, tur, icerik, ek)
            values (v_id, v_ilan.is_veren_id, 'sistem', 'Teklif reddedildi.',
                    jsonb_build_object('olay', 'ret', 'teklif_id', new.id, 'ilan_id', v_ilan.id));
        end if;
    end if;
    return new;
end;
$$;

create trigger teklif_durumu_degisti_tetik
    after update of durum on public.teklifler
    for each row execute function public.teklif_durumu_degisti();

-- ---------------------------------------------------------------------------
-- Gerçek zamanlı yayın: mesajlar anında gelsin
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.konusmalar, public.mesajlar, public.konusma_durumu, public.mesaj_tepkileri;

-- Sertleştirme (advisor): tetikleyici fonksiyonları API'den çağrılamasın, FK indeksleri
revoke all on function public.mesaj_eklendi() from public, anon, authenticated;
revoke all on function public.teklif_durumu_degisti() from public, anon, authenticated;
create index if not exists konusmalar_ilan_idx on public.konusmalar (ilan_id);
create index if not exists konusmalar_baslatan_idx on public.konusmalar (baslatan_id);
create index if not exists konusmalar_son_gonderen_idx on public.konusmalar (son_gonderen_id);

-- Silinen mesajın metni önizlemede ve ona verilen yanıtların alıntısında kalmasın
create or replace function public.mesaj_sil(p_mesaj uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare
    v_konusma uuid;
    v_zaman timestamptz;
begin
    update public.mesajlar
       set silindi = true, icerik = '', ek = null
     where id = p_mesaj and gonderen_id = auth.uid() and tur in ('metin', 'iletisim') and not silindi
    returning konusma_id, created_at into v_konusma, v_zaman;

    if v_konusma is null then
        return;
    end if;

    delete from public.mesaj_tepkileri where mesaj_id = p_mesaj;

    update public.mesajlar
       set ek = jsonb_set(ek, '{yanit,icerik}', '""'::jsonb)
     where konusma_id = v_konusma and ek ? 'yanit' and ek->'yanit'->>'id' = p_mesaj::text;

    update public.konusmalar
       set son_mesaj_onizleme = 'Mesaj silindi'
     where id = v_konusma
       and not exists (select 1 from public.mesajlar m where m.konusma_id = v_konusma and m.created_at > v_zaman);
end;
$$;
revoke all on function public.mesaj_sil(uuid) from public, anon;
grant execute on function public.mesaj_sil(uuid) to authenticated;
