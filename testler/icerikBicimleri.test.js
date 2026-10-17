import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { aciklamaOlustur, aciklamayiAyir } from '../src/components/ilan/ilanSablonlari.js'
import { bloklaraAyir, okumaSuresi, basliktanKimlik } from '../src/components/yazi/yaziBicimi.js'
import { profilGucuMaddeleri, profilGucuYuzdesi } from '../src/profilGucu.js'

describe('ilan açıklaması: sihirbazın yazdığı metin ilan sayfasında aynı bölümlere ayrılır', () => {
    test('gidiş-dönüş', () => {
        const metin = aciklamaOlustur({
            ozet: 'Online satış için e-ticaret sitesi istiyoruz.',
            sorular: ['Kaç ürün olacak?', 'Ödeme altyapısı?', 'Cevapsız soru?'],
            cevaplar: ['Yaklaşık 300', 'iyzico', ''],
            teslim: '1 ay',
            notlar: 'Mobil öncelikli olsun.',
        })
        const ayrilmis = aciklamayiAyir(metin)
        assert.equal(ayrilmis.giris, 'Online satış için e-ticaret sitesi istiyoruz.')
        assert.equal(ayrilmis.teslim, '1 ay')
        assert.deepEqual(ayrilmis.bolumler, [
            { baslik: 'Kaç ürün olacak?', metin: 'Yaklaşık 300' },
            { baslik: 'Ödeme altyapısı?', metin: 'iyzico' },
            { baslik: 'Ek notlar', metin: 'Mobil öncelikli olsun.' },
        ])
    })
    test('elle yazılmış ilan düz paragraf kalır', () => {
        const ayrilmis = aciklamayiAyir('Birinci paragraf.\n\nİkinci paragraf.')
        assert.equal(ayrilmis.giris, 'Birinci paragraf.')
        assert.deepEqual(ayrilmis.bolumler, [{ baslik: null, metin: 'İkinci paragraf.' }])
        assert.equal(ayrilmis.teslim, null)
    })
    test('boş açıklama', () => {
        assert.deepEqual(aciklamayiAyir(null), { giris: '', bolumler: [], teslim: null })
    })
})

describe('blog metin biçimi', () => {
    test('başlık, liste, numaralı liste, alıntı ve paragraf', () => {
        const bloklar = bloklaraAyir('Giriş satırı\nikinci satır\n\n## Ara başlık\n- bir\n- iki\n\n1. ilk\n2. ikinci\n\n> alıntı\n> devam\n\n### Küçük')
        assert.deepEqual(bloklar.map((b) => b.tur), ['p', 'h2', 'ul', 'ol', 'alinti', 'h3'])
        assert.deepEqual(bloklar[0].satirlar, ['Giriş satırı', 'ikinci satır'])
        assert.deepEqual(bloklar[2].maddeler, ['bir', 'iki'])
        assert.deepEqual(bloklar[3].maddeler, ['ilk', 'ikinci'])
        assert.deepEqual(bloklar[4].satirlar, ['alıntı', 'devam'])
    })
    test('başlıktan hemen sonra gelen liste ayrı blok olur', () => {
        const bloklar = bloklaraAyir('## Başlık\n- madde')
        assert.deepEqual(bloklar.map((b) => b.tur), ['h2', 'ul'])
    })
    test('Windows satır sonları', () => {
        assert.deepEqual(bloklaraAyir('a\r\n\r\nb').map((b) => b.tur), ['p', 'p'])
    })
    test('okuma süresi en az 1 dakika, 200 kelime/dk', () => {
        assert.equal(okumaSuresi(''), 1)
        assert.equal(okumaSuresi('kelime '.repeat(600)), 3)
    })
    test('başlık kimliği Türkçe karakterleri sadeleştirir', () => {
        assert.equal(basliktanKimlik('Önce kapsamı yaz!'), 'once-kapsami-yaz')
        assert.equal(basliktanKimlik('Ödemeyi aşamalara böl'), 'odemeyi-asamalara-bol')
    })
})

describe('profil gücü', () => {
    test('boş yazılımcı profili %0, dolu profil %100', () => {
        const bos = profilGucuMaddeleri({ rol: 'yazilimci' })
        assert.equal(profilGucuYuzdesi(bos), 0)
        const dolu = profilGucuMaddeleri(
            { rol: 'yazilimci', unvan: 'Geliştirici', bio: 'x', teknolojiler: ['React'], github_url: 'g', konum: 'İzmir', saatlik_ucret_min: 500 },
            { projeSayisi: 1, telefon: '0555' }
        )
        assert.equal(profilGucuYuzdesi(dolu), 100)
    })
    test('her madde profil düzenlemedeki bir bölüme gider', () => {
        const bolumler = new Set(['temel', 'hakkimda', 'teknolojiler', 'musaitlik', 'ucret', 'video', 'projeler'])
        for (const m of profilGucuMaddeleri({ rol: 'yazilimci' })) assert.ok(bolumler.has(m.bolum), m.anahtar)
    })
    test('iş veren için yalnızca ad ve telefon', () => {
        assert.deepEqual(profilGucuMaddeleri({ rol: 'is-veren', ad_soyad: 'A' }).map((m) => m.dolu), [true, false])
    })
})
