// Yalnızca geliştirmede: /ilanlarim?onizleme=is-veren
// Giriş yapmadan İlanlarım'ı ve teklif karşılaştırmasını örnek veriyle görmeyi sağlar. Canlıda çağrılmaz.
const saatOnce = (s) => new Date(Date.now() - s * 3600 * 1000).toISOString()

export function ilanlarimOnizlemesi(tur) {
    if (tur !== 'is-veren') return null
    const usta = (id, ad_soyad, unvan, teknolojiler, onayli, musaitlik) => ({ id, ad_soyad, unvan, teknolojiler, onayli, musaitlik, avatar_url: null })
    const a = usta('u1', 'Örnek Usta Bir', 'Full Stack Geliştirici', ['Next.js', 'PostgreSQL', 'Node.js'], true, 'musait')
    const b = usta('u2', 'Örnek Usta İki', 'Frontend Geliştirici', ['React', 'Next.js'], true, 'kismi_musait')
    const c = usta('u3', 'Örnek Usta Üç', 'Backend Geliştirici', ['Python', 'PostgreSQL'], false, 'musait')
    const ilanlar = [
        { id: 'i1', baslik: 'Online satış için e-ticaret sitesi', butce_min: 40000, butce_max: 70000, gerekli_teknolojiler: ['Next.js', 'PostgreSQL', 'Stripe'], durum: 'acik', created_at: saatOnce(50) },
        { id: 'i2', baslik: 'Ekibimiz için yönetim paneli', butce_min: null, butce_max: null, gerekli_teknolojiler: [], durum: 'kapali', created_at: saatOnce(400) },
        { id: 'i3', baslik: 'Kafemiz için menü ve sipariş sayfası', butce_min: 8000, butce_max: 12000, gerekli_teknolojiler: ['React'], durum: 'tamamlandi', created_at: saatOnce(900) },
    ]
    const teklif = (id, ilan_id, p, tutar, durum, saat, mesaj) => ({ id, ilan_id, yazilimci_id: p.id, teklif_tutari: tutar, durum, created_at: saatOnce(saat), mesaj, profiller: p })
    const teklifler = {
        i1: [
            teklif('t1', 'i1', a, 62000, 'beklemede', 20, 'Benzer üç e-ticaret projesini teslim ettim. İlk hafta ürün kataloğu ve ödeme akışını kurar, ikinci hafta kargo entegrasyonuna geçerim. Haftalık demo ile ilerlemeyi birlikte görürüz; içerik girişi için kısa bir eğitim de dahil.'),
            teklif('t2', 'i1', b, 38000, 'beklemede', 9, 'Arayüz tarafında güçlüyüm; ödeme entegrasyonu için bir arkadaşımla çalışırım.'),
            teklif('t3', 'i1', c, 85000, 'reddedildi', 30, 'Altyapıyı ölçeklenebilir kurarım.'),
        ],
        i2: [],
        i3: [teklif('t4', 'i3', b, 10000, 'kabul_edildi', 880, 'Menü ve sipariş akışını iki haftada teslim ederim.')],
    }
    const portfoyler = { u1: [{}, {}, {}], u2: [{}], u3: [] }
    return { user: { id: 'onizleme-kullanici' }, ilanlar, teklifler, portfoyler }
}
