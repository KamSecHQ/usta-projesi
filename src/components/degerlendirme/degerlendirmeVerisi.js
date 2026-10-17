// Değerlendirmeler: herkes okur; yalnızca tamamlanmış (ilan "tamamlandi", teklif "kabul_edildi")
// bir işin iki tarafı birbirini değerlendirebilir (veritabanı kuralı: taraflar_degerlendirme_yazabilir).

// Bir kişi hakkındaki değerlendirmeler; değerlendirenin adı ve ilanın başlığıyla
export async function hakkindakiDegerlendirmeler(supabase, kisiId) {
    const { data } = await supabase
        .from('degerlendirmeler')
        .select('id, ilan_id, degerlendiren_id, puan, yorum, created_at')
        .eq('degerlenen_id', kisiId)
        .order('created_at', { ascending: false })
    const liste = data || []
    if (!liste.length) return []
    const kisiIdler = [...new Set(liste.map((d) => d.degerlendiren_id))]
    const ilanIdler = [...new Set(liste.map((d) => d.ilan_id).filter(Boolean))]
    const [kisiler, ilanlar] = await Promise.all([
        supabase.from('profiller').select('id, ad_soyad, avatar_url').in('id', kisiIdler),
        ilanIdler.length ? supabase.from('ilanlar').select('id, baslik').in('id', ilanIdler) : Promise.resolve({ data: [] }),
    ])
    const kisi = Object.fromEntries((kisiler.data || []).map((k) => [k.id, k]))
    const ilan = Object.fromEntries((ilanlar.data || []).map((i) => [i.id, i]))
    return liste.map((d) => ({ ...d, degerlendiren: kisi[d.degerlendiren_id] || null, ilan: ilan[d.ilan_id] || null }))
}

// Kullanıcının verdiği değerlendirmeler, "ilanId:kisiId" anahtarıyla: aynı işe iki kez puan verilmesin
export async function verdigimDegerlendirmeler(supabase, kullaniciId, ilanIdler) {
    if (!kullaniciId || !ilanIdler.length) return {}
    const { data } = await supabase
        .from('degerlendirmeler')
        .select('id, ilan_id, degerlenen_id, puan, yorum, created_at')
        .eq('degerlendiren_id', kullaniciId)
        .in('ilan_id', ilanIdler)
    return Object.fromEntries((data || []).map((d) => [`${d.ilan_id}:${d.degerlenen_id}`, d]))
}

// Ortalama ve 5'ten 1'e dağılım
export function degerlendirmeOzeti(liste) {
    const dagilim = [5, 4, 3, 2, 1].map((p) => ({ puan: p, adet: liste.filter((d) => d.puan === p).length }))
    const ortalama = liste.length ? liste.reduce((t, d) => t + d.puan, 0) / liste.length : 0
    return { adet: liste.length, ortalama, dagilim }
}
