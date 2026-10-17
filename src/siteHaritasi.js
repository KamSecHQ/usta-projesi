// Site haritası (sitemap.xml): sabit sayfalar + onaylı usta profilleri + açık ilanlar + yayınlanmış
// blog yazıları. Vercel fonksiyonu api/site-haritasi.js veriyi Supabase'den okuyup buraya verir.
// Saf modül (testler/siteHaritasi.test.js).
import { SITE } from './paylasimEtiketleri.js'

export const SABIT_ADRESLER = [
    { yol: '/', siklik: 'weekly', oncelik: '1.0' },
    { yol: '/ustalar', siklik: 'daily', oncelik: '0.9' },
    { yol: '/is-ilanlari', siklik: 'daily', oncelik: '0.9' },
    { yol: '/ornek', siklik: 'monthly', oncelik: '0.7' },
    { yol: '/blog', siklik: 'weekly', oncelik: '0.7' },
    { yol: '/hesap-olustur', siklik: 'monthly', oncelik: '0.6' },
    { yol: '/giris', siklik: 'yearly', oncelik: '0.3' },
    { yol: '/gizlilik', siklik: 'yearly', oncelik: '0.3' },
]

const kacis = (m) => String(m).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

// Geçersiz tarih yazılmaz; geçerliyse yalnızca gün (YYYY-AA-GG)
function gun(tarih) {
    const t = new Date(tarih)
    return Number.isNaN(t.getTime()) ? null : t.toISOString().slice(0, 10)
}

function adres({ yol, sonDegisim, siklik, oncelik }) {
    const tarih = sonDegisim && gun(sonDegisim)
    return [
        '  <url>',
        `<loc>${kacis(SITE + yol)}</loc>`,
        tarih ? `<lastmod>${tarih}</lastmod>` : '',
        siklik ? `<changefreq>${siklik}</changefreq>` : '',
        oncelik ? `<priority>${oncelik}</priority>` : '',
        '</url>',
    ].join('')
}

export function siteHaritasiXml({ ustalar = [], ilanlar = [], yazilar = [] } = {}) {
    const adresler = [
        ...SABIT_ADRESLER,
        ...ustalar.map((u) => ({ yol: `/ustalar/${u.id}`, sonDegisim: u.created_at, siklik: 'weekly', oncelik: '0.8' })),
        ...ilanlar.map((i) => ({ yol: `/is-ilanlari/${i.id}`, sonDegisim: i.created_at, siklik: 'daily', oncelik: '0.7' })),
        ...yazilar.map((y) => ({ yol: `/blog/${y.slug}`, sonDegisim: y.guncellenme_tarihi || y.created_at, siklik: 'monthly', oncelik: '0.6' })),
    ]
    return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...adresler.map(adres), '</urlset>', ''].join('\n')
}
