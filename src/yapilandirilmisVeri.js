// Arama motorları için yapılandırılmış veri (schema.org, JSON-LD): saf üreticiler.
// Sayfalar useYapilandirilmisVeri() ile <head>'e yazar. Testler: testler/yapilandirilmisVeri.test.js
//
// İlanlar için JobPosting bilerek yok: Kalfahane ilanları maaşlı iş değil, proje işidir;
// Google'ın iş ilanı kurallarına (konum, istihdam türü, son başvuru) uymaz ve yanlış kullanım
// arama sonuçlarında yaptırıma yol açabilir.
import { SITE } from './paylasimEtiketleri.js'

// Boş alanlar yazılmaz: undefined, null, '' ve boş diziler JSON'dan düşer
function temizle(nesne) {
    if (Array.isArray(nesne)) {
        const dizi = nesne.map(temizle).filter((d) => d !== undefined)
        return dizi.length ? dizi : undefined
    }
    if (nesne && typeof nesne === 'object') {
        const sonuc = {}
        for (const [k, d] of Object.entries(nesne)) {
            const t = temizle(d)
            if (t !== undefined) sonuc[k] = t
        }
        return Object.keys(sonuc).length ? sonuc : undefined
    }
    if (nesne === null || nesne === '' || nesne === undefined) return undefined
    return nesne
}

const yalnizcaHttps = (adres) => (typeof adres === 'string' && /^https:\/\//.test(adres) ? adres : undefined)

// Usta ya da iş veren profili: ProfilePage içinde Person
export function profilSayfasiVerisi(profil) {
    if (!profil?.id) return null
    const adres = `${SITE}/ustalar/${profil.id}`
    return temizle({
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        url: adres,
        dateCreated: profil.created_at,
        mainEntity: {
            '@type': 'Person',
            '@id': `${adres}#kisi`,
            name: profil.ad_soyad?.trim(),
            jobTitle: profil.unvan?.trim(),
            description: profil.bio?.trim(),
            image: yalnizcaHttps(profil.avatar_url),
            url: adres,
            knowsAbout: profil.teknolojiler,
            address: profil.konum ? { '@type': 'PostalAddress', addressLocality: profil.konum.trim(), addressCountry: 'TR' } : undefined,
            sameAs: [yalnizcaHttps(profil.github_url)],
        },
    })
}

// Blog yazısı: Article
export function makaleVerisi(yazi) {
    if (!yazi?.slug) return null
    return temizle({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: yazi.baslik,
        description: yazi.ozet,
        image: [yalnizcaHttps(yazi.kapak_gorseli_url) || `${SITE}/og-image.png`],
        datePublished: yazi.created_at,
        dateModified: yazi.guncellenme_tarihi || yazi.created_at,
        articleSection: yazi.kategori,
        inLanguage: 'tr-TR',
        mainEntityOfPage: `${SITE}/blog/${yazi.slug}`,
        author: { '@type': 'Organization', name: 'Kalfahane', url: SITE },
        publisher: { '@id': `${SITE}/#kurum` },
    })
}
