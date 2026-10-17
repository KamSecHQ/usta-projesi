// Dinamik site haritası: /sitemap.xml (vercel.json) buraya yönlenir. Onaylı usta profilleri, açık
// ilanlar ve yayınlanmış blog yazıları herkese açık okunur (RLS); sorgulardan biri başarısız olursa
// o bölüm atlanır, sabit sayfalar her zaman yazılır.
import { siteHaritasiXml } from '../src/siteHaritasi.js'
import { SUPABASE_ADRESI, SUPABASE_ANAHTARI } from '../src/supabaseAyarlari.js'

const SORGULAR = {
    ustalar: 'profiller?rol=eq.yazilimci&onayli=eq.true&unvan=not.is.null&select=id,created_at&order=created_at.desc&limit=5000',
    ilanlar: 'ilanlar?durum=eq.acik&select=id,created_at&order=created_at.desc&limit=5000',
    yazilar: 'blog_yazilari?yayinlandi=eq.true&select=slug,created_at,guncellenme_tarihi&order=created_at.desc&limit=5000',
}

async function oku(sorgu) {
    try {
        const yanit = await fetch(`${SUPABASE_ADRESI}/rest/v1/${sorgu}`, {
            headers: { apikey: SUPABASE_ANAHTARI, Accept: 'application/json' },
            signal: AbortSignal.timeout(3000),
        })
        return yanit.ok ? await yanit.json() : []
    } catch {
        return []
    }
}

export default async function handler(req, res) {
    const [ustalar, ilanlar, yazilar] = await Promise.all([oku(SORGULAR.ustalar), oku(SORGULAR.ilanlar), oku(SORGULAR.yazilar)])
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    // Arama motorları sık okumaz; yeni profil ve ilanlar en geç bir saatte haritaya girer
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    res.statusCode = 200
    res.end(siteHaritasiXml({ ustalar, ilanlar, yazilar }))
}
