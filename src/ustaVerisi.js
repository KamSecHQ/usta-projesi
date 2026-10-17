import { tamamlananIsSayilariGetir } from './ustaYardimcilari'

// Usta listeleri için ortak sorgular: kart alanları, portföy işleri ve favoriler.
// Her biri tek sorgudur; döngüde kart başına istek atılmaz.

export const USTA_ALANLARI =
    'id, ad_soyad, unvan, bio, avatar_url, teknolojiler, onayli, musaitlik, son_gorulme, saatlik_ucret_min, saatlik_ucret_max, created_at'

// Ustaların portföy işleri, ustaya göre gruplanmış: { [ustaId]: proje[] } (en yenisi önce)
export async function portfoyleriGetir(supabase, idler) {
    const gruplu = Object.fromEntries(idler.map((id) => [id, []]))
    if (!idler.length) return gruplu
    const { data } = await supabase
        .from('projeler')
        .select('id, kullanici_id, baslik, kapak_gorseli_url, one_cikan')
        .in('kullanici_id', idler)
        .order('created_at', { ascending: false })
    for (const p of data || []) gruplu[p.kullanici_id]?.push(p)
    return gruplu
}

// Ustaların portföyü ve tamamlanan iş sayısı birlikte: kartların ihtiyacı olan her şey.
// Dönüş: { ustalar (tamamlanan alanı eklenmiş), projeler: { [ustaId]: proje[] } }
export async function kartVerisiniTamamla(supabase, ustalar) {
    const idler = ustalar.map((u) => u.id)
    const [projeler, sayilar] = await Promise.all([portfoyleriGetir(supabase, idler), tamamlananIsSayilariGetir(supabase, idler)])
    return { ustalar: ustalar.map((u) => ({ ...u, tamamlanan: sayilar[u.id] || 0 })), projeler }
}

// Giriş yapmış kullanıcının favori ustaları: Set<ustaId>
export async function favorileriGetir(supabase, kullaniciId) {
    if (!kullaniciId) return new Set()
    const { data } = await supabase.from('favoriler').select('usta_id').eq('kullanici_id', kullaniciId)
    return new Set((data || []).map((f) => f.usta_id))
}
