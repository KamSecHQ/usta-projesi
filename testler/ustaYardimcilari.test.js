import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    tl, ucretAraligiGoster, butceGoster, aramaIcinKatla, sikEtiketler, teknolojiUyumu, butceyeGore,
    kidemRozetiHesapla, sonrakiKidemHesapla, slugOlustur, videoEmbedUrl, cevrimiciMi, tamamlananIsSayilariGetir,
} from '../src/ustaYardimcilari.js'

describe('para biçimleri', () => {
    test('tl binlik ayraç kullanır, kuruş göstermez', () => {
        assert.equal(tl(12500), '₺12.500')
        assert.equal(tl(999.6), '₺1.000')
    })
    test('saatlik ücret aralığı', () => {
        assert.equal(ucretAraligiGoster(500, 2500), '₺500 – ₺2.500 / saat')
        assert.equal(ucretAraligiGoster(500, null), '₺500+ / saat')
        assert.equal(ucretAraligiGoster(null, 900), 'En çok ₺900 / saat')
        assert.equal(ucretAraligiGoster(null, null), null)
    })
    test('ilan bütçesi saat eki taşımaz', () => {
        assert.equal(butceGoster(40000, 70000), '₺40.000 – ₺70.000')
        assert.equal(butceGoster(5000, 5000), '₺5.000')
        assert.ok(!String(butceGoster(1000, 2000)).includes('saat'))
    })
})

describe('Türkçe arama', () => {
    test('büyük/küçük harf ve Türkçe karakter farkı yok sayılır', () => {
        assert.equal(aramaIcinKatla('İOS'), aramaIcinKatla('ios'))
        assert.equal(aramaIcinKatla('Şişli Çağrı'), aramaIcinKatla('sisli cagri'))
        assert.equal(aramaIcinKatla(null), '')
    })
    test('sık etiketler harf farkını birleştirir ve sayıya göre sıralar', () => {
        const sonuc = sikEtiketler([['React', 'Node.js'], ['react'], ['Vue']], 2)
        assert.equal(sonuc.length, 2)
        assert.equal(aramaIcinKatla(sonuc[0].ad), 'react')
        assert.equal(sonuc[0].sayi, 2)
    })
})

describe('teklif yardımcıları', () => {
    test('teknoloji uyumu tekrarı ve harf farkını saymaz', () => {
        assert.deepEqual(teknolojiUyumu(['React', 'react', 'Python'], ['REACT', 'Go']), { eslesen: 1, toplam: 2 })
        assert.deepEqual(teknolojiUyumu([], ['React']), { eslesen: 0, toplam: 0 })
    })
    test('bütçeye göre konum', () => {
        assert.deepEqual(butceyeGore(38000, 40000, 70000), { metin: '%5 altında', yon: -1 })
        assert.deepEqual(butceyeGore(85000, 40000, 70000), { metin: '%21 üstünde', yon: 1 })
        assert.deepEqual(butceyeGore(50000, 40000, 70000), { metin: 'Aralıkta', yon: 0 })
        assert.equal(butceyeGore(50000, null, null), null)
    })
})

describe('kıdem', () => {
    test('yazılımcı eşikleri CLAUDE.md ile aynı: Çırak 0, Kalfa 1, Usta 3, Kıdemli Usta 10', () => {
        assert.equal(kidemRozetiHesapla('yazilimci', 0).etiket, 'Çırak')
        assert.equal(kidemRozetiHesapla('yazilimci', 1).etiket, 'Kalfa')
        assert.equal(kidemRozetiHesapla('yazilimci', 3).etiket, 'Usta')
        assert.equal(kidemRozetiHesapla('yazilimci', 10).etiket, 'Kıdemli Usta')
    })
    test('iş veren eşikleri', () => {
        assert.equal(kidemRozetiHesapla('is-veren', 0).etiket, 'Yeni İş Veren')
        assert.equal(kidemRozetiHesapla('is-veren', 1).etiket, 'Güvenilir İş Veren')
        assert.equal(kidemRozetiHesapla('is-veren', 5).etiket, 'Kıdemli İş Veren')
    })
    test('sonraki kıdeme kalan iş', () => {
        assert.deepEqual(
            { etiket: sonrakiKidemHesapla('yazilimci', 1).etiket, kalan: sonrakiKidemHesapla('yazilimci', 1).kalan },
            { etiket: 'Usta', kalan: 2 }
        )
        assert.equal(sonrakiKidemHesapla('yazilimci', 12), null)
    })
    test('toplu sayı sorgusu tekrar eden ve boş kimlikleri ayıklar, hata olursa boş döner', async () => {
        let gonderilen
        const sahte = { rpc: async (ad, args) => { gonderilen = { ad, args }; return { data: [{ kullanici_id: 'a', sayi: 2 }], error: null } } }
        const sonuc = await tamamlananIsSayilariGetir(sahte, ['a', 'a', null, 'b'])
        assert.equal(gonderilen.ad, 'tamamlanan_is_sayilari')
        assert.deepEqual(gonderilen.args.p_kullanicilar, ['a', 'b'])
        assert.deepEqual(sonuc, { a: 2 })
        const hatali = { rpc: async () => ({ data: null, error: { message: 'x' } }) }
        assert.deepEqual(await tamamlananIsSayilariGetir(hatali, ['a']), {})
        assert.deepEqual(await tamamlananIsSayilariGetir(sahte, []), {})
    })
})

describe('diğer', () => {
    test('slug Türkçe karakterleri çevirir ve tireleri sadeleştirir', () => {
        assert.equal(slugOlustur('  Yazılım Bütçesi: Nasıl Belirlenir?  '), 'yazilim-butcesi-nasil-belirlenir')
        assert.equal(slugOlustur('Çok -- tire'), 'cok-tire')
    })
    test('video gömme adresi YouTube için çerezsiz alan adını kullanır', () => {
        assert.equal(videoEmbedUrl('https://www.youtube.com/watch?v=abc123'), 'https://www.youtube-nocookie.com/embed/abc123')
        assert.equal(videoEmbedUrl('https://youtu.be/abc123'), 'https://www.youtube-nocookie.com/embed/abc123')
        assert.equal(videoEmbedUrl('https://www.loom.com/share/xyz'), 'https://www.loom.com/embed/xyz')
        assert.equal(videoEmbedUrl('https://vimeo.com/1'), null)
        assert.equal(videoEmbedUrl('bozuk'), null)
    })
    test('çevrimiçi: son 6 dakika', () => {
        assert.equal(cevrimiciMi(new Date(Date.now() - 2 * 60000).toISOString()), true)
        assert.equal(cevrimiciMi(new Date(Date.now() - 10 * 60000).toISOString()), false)
        assert.equal(cevrimiciMi(null), false)
    })
})
