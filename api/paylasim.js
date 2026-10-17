// Paylaşım botları için kart: LinkedIn, WhatsApp, X, Facebook, Telegram, Slack ve Discord bağlantı
// önizlemesi çıkarırken JavaScript çalıştırmaz. vercel.json yalnızca bu botların /ustalar/:id,
// /is-ilanlari/:id ve /blog/:slug isteklerini buraya yönlendirir; ziyaretçiler normal uygulamayı alır.
// Fonksiyon sitenin index.html'ini alır, herkese açık kaydı (profil, ilan, yayınlanmış yazı)
// Supabase'den okur ve başlık, açıklama, görsel etiketlerini doldurur. Hata olursa varsayılan
// etiketlerle aynı sayfa döner: önizleme hiç kırılmaz.
import { dinamikEtiketler, etiketleriDegistir } from '../src/paylasimEtiketleri.js'
import { SUPABASE_ADRESI, SUPABASE_ANAHTARI } from '../src/supabaseAyarlari.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SLUG = /^[a-z0-9-]{1,120}$/

// Yalnızca kartın gerektirdiği sütunlar; hepsi zaten herkese açık okunabilir (RLS)
const SORGULAR = {
    usta: (id) => UUID.test(id) && `profiller?id=eq.${id}&select=ad_soyad,unvan,bio,teknolojiler,rol`,
    ilan: (id) => UUID.test(id) && `ilanlar?id=eq.${id}&select=baslik,aciklama,butce_min,butce_max`,
    yazi: (slug) => SLUG.test(slug) && `blog_yazilari?slug=eq.${slug}&yayinlandi=eq.true&select=baslik,ozet,kapak_gorseli_url`,
}

async function kayitGetir(tur, kimlik) {
    const sorgu = SORGULAR[tur]?.(kimlik)
    if (!sorgu) return null
    const yanit = await fetch(`${SUPABASE_ADRESI}/rest/v1/${sorgu}`, {
        headers: { apikey: SUPABASE_ANAHTARI, Accept: 'application/json' },
        signal: AbortSignal.timeout(2500),
    })
    if (!yanit.ok) return null
    const [kayit] = await yanit.json()
    return kayit || null
}

export default async function handler(req, res) {
    const tur = String(req.query.tur || '')
    const kimlik = String(req.query.id || '')
    const kok = `https://${req.headers['x-forwarded-host'] || req.headers.host || 'www.kalfahane.com'}`

    let html
    try {
        const yanit = await fetch(`${kok}/index.html`, { signal: AbortSignal.timeout(2500) })
        html = await yanit.text()
    } catch {
        res.statusCode = 302
        res.setHeader('Location', '/')
        res.end()
        return
    }

    let sonuc = html
    try {
        const etiketler = dinamikEtiketler(tur, await kayitGetir(tur, kimlik), kimlik)
        if (etiketler) sonuc = etiketleriDegistir(html, etiketler)
    } catch {
        // Kayıt okunamadı ya da etiket bulunamadı: varsayılan etiketlerle devam
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    // Botlar sık gelmez; profil değişikliği en geç 10 dakikada karta yansır
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
    res.statusCode = 200
    res.end(sonuc)
}
