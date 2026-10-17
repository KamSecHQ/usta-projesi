import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SAYFA_ETIKETLERI, dinamikEtiketler, etiketleriDegistir, ozetle, tamBaslik } from '../src/paylasimEtiketleri.js'

const INDEX = readFileSync('index.html', 'utf8')
const VERCEL = JSON.parse(readFileSync('vercel.json', 'utf8'))
const al = (html, desen) => (html.match(desen) || [])[1]

describe('ozetle', () => {
    test('kısa metni olduğu gibi bırakır, boşlukları sadeleştirir', () => {
        assert.equal(ozetle('  Merhaba\n\n  dünya  '), 'Merhaba dünya')
    })
    test('uzun metni kelime sınırında keser ve üç nokta ekler', () => {
        const sonuc = ozetle('kelime '.repeat(60), 50)
        assert.ok(sonuc.length <= 50)
        assert.ok(sonuc.endsWith('kelime…'))
    })
})

describe('etiketleriDegistir', () => {
    test('index.html içindeki tüm paylaşım etiketlerini sayfaya göre değiştirir', () => {
        const html = etiketleriDegistir(INDEX, SAYFA_ETIKETLERI.ornek)
        assert.equal(al(html, /<title>([^<]*)</), 'Örnek vitrin: bir iş baştan sona — Kalfahane')
        assert.equal(al(html, /og:url" content="([^"]*)"/), 'https://www.kalfahane.com/ornek')
        assert.equal(al(html, /<link rel="canonical" href="([^"]*)"/), 'https://www.kalfahane.com/ornek')
        assert.equal(al(html, /og:image" content="([^"]*)"/), 'https://www.kalfahane.com/og-ornek.png')
        assert.equal(al(html, /twitter:image" content="([^"]*)"/), 'https://www.kalfahane.com/og-ornek.png')
        assert.equal(al(html, /og:description" content="([^"]*)"/), SAYFA_ETIKETLERI.ornek.aciklama.replace(/'/g, "'"))
    })
    test('tırnak ve açılı ayraçları kaçırır', () => {
        const html = etiketleriDegistir(INDEX, { yol: '/x', baslik: 'A "B" <C>', aciklama: 'D & E' })
        assert.equal(al(html, /og:title" content="([^"]*)"/), 'A &quot;B&quot; &lt;C&gt; — Kalfahane')
        assert.equal(al(html, /og:description" content="([^"]*)"/), 'D &amp; E')
    })
    test('etiket eksikse hata verir', () => {
        assert.throws(() => etiketleriDegistir('<html><title>x</title></html>', SAYFA_ETIKETLERI.blog), /bulunamadı/)
    })
})

describe('dinamikEtiketler', () => {
    test('usta: ad, unvan ve hakkında yazısı', () => {
        const e = dinamikEtiketler('usta', { ad_soyad: ' Mert Kaya ', unvan: 'Full Stack Geliştirici', bio: 'Sipariş sistemleri kurarım.' }, 'abc')
        assert.equal(e.baslik, 'Mert Kaya — Full Stack Geliştirici')
        assert.equal(e.aciklama, 'Sipariş sistemleri kurarım.')
        assert.equal(e.yol, '/ustalar/abc')
    })
    test('usta: hakkında yoksa unvan ve teknolojilerden açıklama', () => {
        const e = dinamikEtiketler('usta', { ad_soyad: 'Elif', unvan: 'Mobil Geliştirici', teknolojiler: ['Flutter', 'Dart'] }, 'x')
        assert.match(e.aciklama, /Mobil Geliştirici: Flutter, Dart/)
    })
    test('ilan: bütçe ve ilk paragraf', () => {
        const e = dinamikEtiketler('ilan', { baslik: 'QR menü ', aciklama: 'Kafe için menü.\n\nKimler?\nMüşteriler.', butce_min: 30000, butce_max: 45000 }, 'i1')
        assert.equal(e.baslik, 'QR menü')
        assert.equal(e.aciklama, 'Bütçe ₺30.000 – ₺45.000. Kafe için menü.')
    })
    test('yazı: yalnızca https kapak görseli kullanılır', () => {
        assert.equal(dinamikEtiketler('yazi', { baslik: 'B', ozet: 'Ö', kapak_gorseli_url: 'https://x/y.png' }, 's').gorsel, 'https://x/y.png')
        assert.equal(dinamikEtiketler('yazi', { baslik: 'B', ozet: 'Ö', kapak_gorseli_url: 'javascript:1' }, 's').gorsel, undefined)
    })
    test('kayıt yoksa ya da tür bilinmiyorsa null', () => {
        assert.equal(dinamikEtiketler('usta', null, 'x'), null)
        assert.equal(dinamikEtiketler('baska', { a: 1 }, 'x'), null)
    })
})

describe('yönlendirmeler (vercel.json)', () => {
    test('her sayfaya özel HTML için bir yönlendirme var ve genel kuraldan önce', () => {
        const genel = VERCEL.rewrites.findIndex((r) => r.source === '/(.*)')
        for (const s of Object.values(SAYFA_ETIKETLERI)) {
            const i = VERCEL.rewrites.findIndex((r) => r.source === s.yol && r.destination === `${s.yol}.html`)
            assert.ok(i >= 0 && i < genel, s.yol)
        }
    })
    test('bot kuralları usta, ilan ve yazıyı fonksiyona gönderir', () => {
        const botlar = VERCEL.rewrites.filter((r) => r.has)
        assert.deepEqual(botlar.map((r) => r.source), ['/ustalar/:id', '/is-ilanlari/:id', '/blog/:slug'])
        for (const r of botlar) {
            assert.match(r.destination, /^\/api\/paylasim\?tur=(usta|ilan|yazi)&id=:/)
            assert.ok(new RegExp(r.has[0].value).test('LinkedInBot/1.0 (compatible; Mozilla/5.0)'))
            assert.ok(!new RegExp(r.has[0].value).test('Mozilla/5.0 (Macintosh) Chrome/130'))
        }
    })
    test('tamBaslik boşsa varsayılan başlık', () => {
        assert.equal(tamBaslik(''), "Kalfahane — Türkiye'nin Yazılım Çarşısı")
    })
})
