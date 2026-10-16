// Yalnızca geliştirmede: /panel?onizleme=yazilimci ya da ?onizleme=is-veren
// Giriş yapmadan paneli örnek veriyle görmeyi sağlar. Canlıda çağrılmaz.
const saatOnce = (s) => new Date(Date.now() - s * 3600 * 1000).toISOString()

export function onizlemeVerisi(tur) {
    if (tur !== 'yazilimci' && tur !== 'is-veren') return null
    const yazilimci = tur === 'yazilimci'
    return {
        user: { id: 'onizleme-kullanici' },
        profil: yazilimci
            ? {
                  rol: 'yazilimci',
                  ad_soyad: 'Örnek Usta',
                  unvan: 'Frontend Geliştirici',
                  bio: 'Örnek profil',
                  teknolojiler: ['React', 'Node.js'],
                  github_url: null,
                  konum: 'İstanbul',
                  telefon: null,
                  saatlik_ucret_min: 500,
                  onayli: true,
                  musaitlik: 'musait',
              }
            : { rol: 'is-veren', ad_soyad: 'Örnek İş Veren', telefon: null },
        projeSayisi: yazilimci ? 2 : 0,
        favoriSayisi: yazilimci ? 3 : 0,
        tamamlanan: yazilimci ? 2 : 1,
        teklifOzet: { beklemede: 2, kabul_edildi: 1, reddedildi: 1 },
        ilanOzet: { acik: 2, kapali: 1, tamamlandi: 1, bekleyenTeklif: 3 },
        hareketler: yazilimci
            ? [
                  { id: 1, baslik: 'E-ticaret sitesi', alt: '₺12.000 teklif verdin', durum: 'beklemede', tarih: saatOnce(2), to: '/tekliflerim' },
                  { id: 2, baslik: 'Mobil uygulama', alt: '₺30.000 teklif verdin', durum: 'kabul_edildi', tarih: saatOnce(30), to: '/tekliflerim' },
                  { id: 3, baslik: 'Kurumsal site', alt: '₺8.000 teklif verdin', durum: 'reddedildi', tarih: saatOnce(120), to: '/tekliflerim' },
              ]
            : [
                  { id: 1, baslik: 'Örnek Usta teklif verdi', alt: 'E-ticaret sitesi · ₺12.000', durum: 'beklemede', tarih: saatOnce(1), to: '/ilanlarim' },
                  { id: 2, baslik: 'Örnek Kalfa teklif verdi', alt: 'E-ticaret sitesi · ₺9.500', durum: 'beklemede', tarih: saatOnce(5), to: '/ilanlarim' },
              ],
    }
}
