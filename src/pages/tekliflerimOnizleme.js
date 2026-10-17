// Yalnızca geliştirmede: /tekliflerim?onizleme=yazilimci
// Giriş yapmadan Tekliflerim'i örnek veriyle görmeyi sağlar. Canlıda çağrılmaz.
const saatOnce = (s) => new Date(Date.now() - s * 3600 * 1000).toISOString()

export function tekliflerimOnizlemesi(tur) {
    if (tur !== 'yazilimci') return null
    const ilan = (id, baslik, durum, butce_min, butce_max) => ({ id, baslik, durum, is_veren_id: 'iv1', butce_min, butce_max })
    return {
        user: { id: 'onizleme-kullanici' },
        teklifler: [
            { id: 't1', ilan_id: 'i1', teklif_tutari: 62000, durum: 'beklemede', created_at: saatOnce(20), mesaj: 'Benzer üç e-ticaret projesini teslim ettim. Haftalık demo ile ilerlemeyi birlikte görürüz.', ilanlar: ilan('i1', 'Online satış için e-ticaret sitesi', 'acik', 40000, 70000) },
            { id: 't2', ilan_id: 'i3', teklif_tutari: 10000, durum: 'kabul_edildi', created_at: saatOnce(880), mesaj: 'Menü ve sipariş akışını iki haftada teslim ederim.', ilanlar: ilan('i3', 'Kafemiz için menü ve sipariş sayfası', 'tamamlandi', 8000, 12000) },
            { id: 't3', ilan_id: 'i4', teklif_tutari: 95000, durum: 'reddedildi', created_at: saatOnce(1200), mesaj: 'Altyapıyı ölçeklenebilir kurarım.', ilanlar: ilan('i4', 'Lojistik takip paneli', 'kapali', 50000, 80000) },
        ],
        isVerenler: { iv1: { id: 'iv1', ad_soyad: 'Örnek İş Veren' } },
        degerlendirmelerim: {},
    }
}
