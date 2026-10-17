// Yalnızca geliştirmede: /profilim?onizleme=yazilimci ya da ?onizleme=is-veren
// Giriş yapmadan profil düzenlemeyi örnek veriyle görmeyi sağlar; kaydetme veritabanına gitmez.
const gunOnce = (g) => new Date(Date.now() - g * 86400 * 1000).toISOString()

export function profilOnizlemesi(tur) {
    if (tur !== 'yazilimci' && tur !== 'is-veren') return null
    const yazilimci = tur === 'yazilimci'
    return {
        user: { id: 'onizleme-kullanici' },
        profil: yazilimci
            ? {
                  rol: 'yazilimci',
                  ad_soyad: 'Örnek Usta',
                  unvan: 'Frontend Geliştirici',
                  bio: 'React ve Node.js ile e-ticaret ve yönetim panelleri geliştiriyorum. Teslimden sonra da destek veririm.',
                  github_url: '',
                  konum: 'İstanbul',
                  teknolojiler: ['React', 'Node.js', 'PostgreSQL'],
                  telefon_dogrulandi: false,
                  musaitlik: 'musait',
                  musaitlik_notu: '',
                  saatlik_ucret_min: 500,
                  saatlik_ucret_max: 900,
                  video_url: '',
              }
            : { rol: 'is-veren', ad_soyad: 'Örnek İş Veren', konum: 'Ankara' },
        telefon: '',
        projeler: yazilimci
            ? [
                  {
                      id: 'p1',
                      baslik: 'Kafe için menü ve sipariş sayfası',
                      aciklama: 'QR menü, masadan sipariş ve mutfak ekranı.',
                      teknolojiler: ['React', 'Supabase'],
                      link: '',
                      one_cikan: true,
                      created_at: gunOnce(20),
                  },
                  {
                      id: 'p2',
                      baslik: 'Butik mağaza için e-ticaret sitesi',
                      aciklama: 'Ürün kataloğu, ödeme ve kargo entegrasyonu.',
                      teknolojiler: ['Next.js', 'Node.js'],
                      link: '',
                      one_cikan: false,
                      created_at: gunOnce(60),
                  },
              ]
            : [],
    }
}
