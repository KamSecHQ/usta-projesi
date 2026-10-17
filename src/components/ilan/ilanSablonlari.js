// İlan sihirbazının şablonları. Her şablon başlık önerisi, önerilen teknolojiler ve iş verenin
// cevaplaması iyi teklif almasını sağlayan yönlendirici sorular taşır. Sayı ya da fiyat önerisi
// yoktur: çarşıda yeterli veri olmadan bütçe tahmini uydurulmaz.

export const SABLONLAR = [
    {
        kod: 'kurumsal',
        ad: 'Kurumsal web sitesi',
        ozet: 'Tanıtım, hizmetler, iletişim',
        baslik: 'Şirketimiz için kurumsal web sitesi',
        teknolojiler: ['Next.js'],
        sorular: ['Sitede hangi sayfalar olacak?', 'Metinler ve görseller hazır mı, yoksa onlar da mı yapılacak?', 'Beğendiğin örnek siteler var mı?'],
    },
    {
        kod: 'eticaret',
        ad: 'E-ticaret sitesi',
        ozet: 'Ürünler, sepet, ödeme, kargo',
        baslik: 'Online satış için e-ticaret sitesi',
        teknolojiler: ['Next.js', 'PostgreSQL'],
        sorular: ['Kaç ürün ve hangi kategoriler olacak?', 'Hangi ödeme ve kargo firmalarıyla çalışmak istiyorsun?', 'Trendyol, Hepsiburada gibi pazaryerleriyle bağlantı gerekiyor mu?'],
    },
    {
        kod: 'mobil',
        ad: 'Mobil uygulama',
        ozet: 'iOS ve Android',
        baslik: 'iOS ve Android için mobil uygulama',
        teknolojiler: ['Flutter'],
        sorular: ['Uygulamanın temel ekranları ve akışı nasıl olacak?', 'Kullanıcı girişi, bildirim ya da ödeme gerekiyor mu?', 'App Store ve Google Play yayını da işin içinde mi?'],
    },
    {
        kod: 'panel',
        ad: 'Yönetim paneli',
        ozet: 'İç kullanım, raporlar, yetkiler',
        baslik: 'Ekibimiz için yönetim paneli',
        teknolojiler: ['React', 'Node.js', 'PostgreSQL'],
        sorular: ['Panelde hangi işler yapılacak, hangi raporlar görülecek?', 'Kaç kişi kullanacak, farklı yetkiler gerekiyor mu?', 'Mevcut bir sistemden veri aktarılacak mı?'],
    },
    {
        kod: 'entegrasyon',
        ad: 'Entegrasyon ve API',
        ozet: 'Sistemleri birbirine bağlama',
        baslik: 'Sistemlerimiz arasında entegrasyon',
        teknolojiler: ['Node.js'],
        sorular: ['Hangi sistemler birbirine bağlanacak?', 'Veri ne sıklıkla ve hangi yönde akmalı?', 'Elinde API belgeleri ya da erişim bilgileri var mı?'],
    },
    {
        kod: 'otomasyon',
        ad: 'Otomasyon ve bot',
        ozet: 'WhatsApp, Telegram, iş akışı',
        baslik: 'İş akışımız için otomasyon',
        teknolojiler: ['Python'],
        sorular: ['Bugün elle yapılan hangi işi otomatikleştirmek istiyorsun?', 'Bot hangi kanalda çalışacak (WhatsApp, Telegram, e-posta)?', 'Hangi araçlara ya da tablolara bağlanması gerekiyor?'],
    },
    {
        kod: 'diger',
        ad: 'Başka bir iş',
        ozet: 'Kendin tarif et',
        baslik: '',
        teknolojiler: [],
        sorular: ['Olması gereken özellikler neler?', 'Elinde hazır olanlar neler (tasarım, içerik, alan adı)?', 'Beğendiğin örnekler var mı?'],
    },
]

export const TESLIM_SECENEKLERI = ['1-2 hafta', '1 ay', '2-3 ay', '3 aydan uzun', 'Esnek']

// Sihirbazın alanlarından ilan açıklaması: önce özet (kartta görünen kısım), sonra cevaplanan
// sorular, en sonda teslim beklentisi. İlan sayfası metni satır sonlarını koruyarak gösterir.
export function aciklamaOlustur({ ozet, sorular, cevaplar, teslim, notlar }) {
    const parcalar = [ozet.trim()]
    sorular.forEach((soru, i) => {
        const cevap = (cevaplar[i] || '').trim()
        if (cevap) parcalar.push(`${soru}\n${cevap}`)
    })
    if (notlar?.trim()) parcalar.push(`Ek notlar\n${notlar.trim()}`)
    if (teslim) parcalar.push(`Teslim beklentisi: ${teslim}`)
    return parcalar.filter(Boolean).join('\n\n')
}

// Sihirbazın yazdığı açıklamayı parçalara ayırır: ilk paragraf giriş, "Soru?\ncevap" blokları
// başlıklı bölüm, "Teslim beklentisi: …" satırı ayrı bilgi. Elle yazılmış ilanlar düz paragraf kalır.
export function aciklamayiAyir(metin) {
    const sonuc = { giris: '', bolumler: [], teslim: null }
    if (!metin) return sonuc
    const bloklar = metin.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
    bloklar.forEach((blok, i) => {
        const teslim = blok.match(/^Teslim beklentisi:\s*(.+)$/)
        if (teslim) {
            sonuc.teslim = teslim[1]
            return
        }
        const [ilk, ...kalan] = blok.split('\n')
        if (kalan.length && (ilk.trim().endsWith('?') || ilk.trim() === 'Ek notlar')) {
            sonuc.bolumler.push({ baslik: ilk.trim(), metin: kalan.join('\n').trim() })
        } else if (i === 0 && !sonuc.giris) {
            sonuc.giris = blok
        } else {
            sonuc.bolumler.push({ baslik: null, metin: blok })
        }
    })
    return sonuc
}
