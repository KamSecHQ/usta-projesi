// Paylaşım kartı ve arama sonucu etiketleri: tek kaynak.
// - Uygulama içinde useSayfaBasligi() başlığı ve açıklamayı buradan biçimler.
// - Derlemede scripts/sayfa-etiketleri.mjs, SAYFA_ETIKETLERI için sayfaya özel HTML üretir.
// - Vercel fonksiyonu api/paylasim.js, paylaşım botlarına usta, ilan ve yazı kartını doldurur.
// Saf modül: React ve Supabase'e bağlı değil (testler/paylasimEtiketleri.test.js).
import { butceGoster } from './ustaYardimcilari.js'

export const SITE = 'https://www.kalfahane.com'
export const VARSAYILAN_BASLIK = "Kalfahane — Türkiye'nin Yazılım Çarşısı"
export const VARSAYILAN_ACIKLAMA = 'Doğrulanmış Türk yazılımcılarla işletmeleri bir araya getiren pazaryeri. Portföyünü oluştur, ihtiyacın olan ustayı bul.'
export const VARSAYILAN_GORSEL = '/og-image.png'
export const VARSAYILAN_GORSEL_ALT = 'Kalfahane: İşini emin ellere teslim et.'

export const tamBaslik = (baslik) => (baslik ? `${baslik} — Kalfahane` : VARSAYILAN_BASLIK)

// Açıklamalar arama sonuçlarında ve kartlarda ~155 karakterde kesilir: kelime ortasında değil
export function ozetle(metin, sinir = 155) {
    const duz = String(metin || '').replace(/\s+/g, ' ').trim()
    if (duz.length <= sinir) return duz
    const kesik = duz.slice(0, sinir - 1)
    const bosluk = kesik.lastIndexOf(' ')
    return `${(bosluk > sinir * 0.6 ? kesik.slice(0, bosluk) : kesik).replace(/[\s,.;:–-]+$/, '')}…`
}

// Derlemede sayfaya özel HTML'i üretilen sayfalar (vercel.json bu yolları dosyalarına yönlendirir)
export const SAYFA_ETIKETLERI = {
    ustalar: {
        yol: '/ustalar',
        baslik: 'Ustalar',
        aciklama: 'Doğrulanmış Türk yazılımcıların portföylerini incele: React, mobil, e-ticaret ve daha fazlası. Teknolojiye göre ara, ustanı seç.',
    },
    isIlanlari: {
        yol: '/is-ilanlari',
        baslik: 'İş ilanları',
        aciklama: 'İşletmelerin açtığı güncel yazılım işleri: web sitesi, mobil uygulama, entegrasyon. Bütçeyi gör, teklifini ver.',
    },
    blog: {
        yol: '/blog',
        baslik: 'Blog',
        aciklama: 'Yazılım yaptırırken ve serbest çalışırken işine yarayacak rehberler: bütçe, teklif, sözleşme ve teknoloji seçimi.',
    },
    hesapOlustur: {
        yol: '/hesap-olustur',
        baslik: 'Hesap oluştur',
        aciklama: 'Kalfahane hesabını ücretsiz aç: yazılımcıysan portföyünü oluştur, işletmeysen ilan açıp teklif topla.',
    },
    gizlilik: {
        yol: '/gizlilik',
        baslik: 'Gizlilik politikası',
        aciklama: 'Kalfahane hangi verileri neden işler, kim görür, nerede saklar ve haklarını nasıl kullanırsın: KVKK kapsamında aydınlatma.',
    },
    ornek: {
        yol: '/ornek',
        baslik: 'Örnek vitrin: bir iş baştan sona',
        aciklama: "Kalfahane'de bir iş nasıl ilerler: ilan, teklif, konuşma, teslim ve kıdem. Örnek bir işle adım adım gör; farklı sektörlerden örnek ilanlar ve ustalar.",
        gorsel: '/og-ornek.png',
        gorselAlt: 'Kalfahane örnek vitrin: Bir iş, baştan sona. Örnek ilan ve kabul edilen teklif.',
    },
}

const kacis = (m) => String(m).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const tamAdres = (yolYaDaAdres) => (/^https?:\/\//.test(yolYaDaAdres) ? yolYaDaAdres : SITE + yolYaDaAdres)

// index.html'deki başlık, açıklama, kanonik adres ve og/twitter etiketlerini değiştirir.
// Etiketlerden biri yoksa hata fırlatır: eski etiket sessizce kalmasın.
export function etiketleriDegistir(html, { yol, baslik, aciklama, gorsel = VARSAYILAN_GORSEL, gorselAlt = VARSAYILAN_GORSEL_ALT }) {
    const adres = tamAdres(yol)
    const tam = tamBaslik(baslik)
    const resim = tamAdres(gorsel)
    // [desen, yeni değer]: desen etiketin önünü ve arkasını yakalar, arası değişir
    const degisimler = [
        [/(<title>)[^<]*(<\/title>)/, tam],
        [/(<meta\s+name="description"\s+content=")[^"]*(")/, aciklama],
        [/(<link rel="canonical" href=")[^"]*(")/, adres],
        [/(<meta property="og:url" content=")[^"]*(")/, adres],
        [/(<meta property="og:title" content=")[^"]*(")/, tam],
        [/(<meta property="og:description" content=")[^"]*(")/, aciklama],
        [/(<meta property="og:image" content=")[^"]*(")/, resim],
        [/(<meta property="og:image:alt" content=")[^"]*(")/, gorselAlt],
        [/(<meta name="twitter:title" content=")[^"]*(")/, tam],
        [/(<meta name="twitter:description" content=")[^"]*(")/, aciklama],
        [/(<meta name="twitter:image" content=")[^"]*(")/, resim],
        [/(<meta name="twitter:image:alt" content=")[^"]*(")/, gorselAlt],
    ]
    let sonuc = html
    for (const [desen, deger] of degisimler) {
        if (!desen.test(sonuc)) throw new Error(`Paylaşım etiketi bulunamadı: ${desen}`)
        sonuc = sonuc.replace(desen, (_, on, arka) => on + kacis(deger) + arka)
    }
    return sonuc
}

// Dinamik sayfaların kartı: veritabanından gelen kayıttan başlık ve açıklama.
// Sayfanın kendi useSayfaBasligi çağrısıyla aynı biçim (UstaProfili, IlanDetay, BlogYazisi).
export function dinamikEtiketler(tur, kayit, kimlik) {
    if (!kayit) return null
    if (tur === 'usta') {
        const teknolojiler = (kayit.teknolojiler || []).slice(0, 5).join(', ')
        const yedek = kayit.rol === 'is-veren' ? "Kalfahane'de iş veren." : `${kayit.unvan || 'Yazılımcı'}${teknolojiler ? `: ${teknolojiler}` : ''}. Portföyünü Kalfahane'de incele.`
        return {
            yol: `/ustalar/${kimlik}`,
            baslik: `${kayit.ad_soyad?.trim() || 'Usta'} — ${kayit.unvan?.trim() || 'Portföy'}`,
            aciklama: ozetle(kayit.bio || yedek),
        }
    }
    if (tur === 'ilan') {
        const ozet = String(kayit.aciklama || '').split(/\n{2,}/)[0]
        const butce = butceGoster(kayit.butce_min, kayit.butce_max)
        return {
            yol: `/is-ilanlari/${kimlik}`,
            baslik: kayit.baslik?.trim() || 'İş ilanı',
            aciklama: ozetle(`${butce ? `Bütçe ${butce}. ` : ''}${ozet}`),
        }
    }
    if (tur === 'yazi') {
        const kapak = /^https:\/\//.test(kayit.kapak_gorseli_url || '') ? kayit.kapak_gorseli_url : undefined
        return {
            yol: `/blog/${kimlik}`,
            baslik: kayit.baslik?.trim() || 'Blog',
            aciklama: ozetle(kayit.ozet || ''),
            ...(kapak ? { gorsel: kapak, gorselAlt: kayit.baslik } : {}),
        }
    }
    return null
}
