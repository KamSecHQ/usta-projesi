// Yalnızca geliştirmede: /admin?onizleme=1
// Yönetici girişi olmadan yönetim panelini örnek veriyle görmeyi sağlar. Canlıda çağrılmaz.
const gunOnce = (g) => new Date(Date.now() - g * 86400000).toISOString()

export function adminOnizlemesi(acik) {
    if (acik !== '1') return null
    const profiller = [
        { id: 'a1', rol: 'yazilimci', ad_soyad: 'Deniz Arslan', unvan: 'Mobil Geliştirici (Flutter)', bio: 'Altı yıldır iOS ve Android için Flutter ile uygulama geliştiriyorum. Son iki yılda üç e-ticaret uygulamasını yayına aldım.', teknolojiler: ['Flutter', 'Dart', 'Firebase'], github_url: 'https://github.com/ornek', konum: 'İzmir', saatlik_ucret_min: 600, saatlik_ucret_max: 900, onayli: false, telefon_dogrulandi: false, telefon: '0532 000 00 00', avatar_url: null, created_at: gunOnce(1) },
        { id: 'a2', rol: 'yazilimci', ad_soyad: 'Mert Kaya', unvan: 'Backend Geliştirici', bio: null, teknolojiler: ['Go'], github_url: null, konum: null, saatlik_ucret_min: null, saatlik_ucret_max: null, onayli: false, telefon_dogrulandi: false, telefon: null, avatar_url: null, created_at: gunOnce(3) },
        { id: 'a3', rol: 'yazilimci', ad_soyad: 'Örnek Usta', unvan: 'Frontend Geliştirici', bio: 'React ve Next.js ile kurumsal siteler.', teknolojiler: ['React', 'Next.js', 'Node.js'], github_url: 'https://github.com/ornek', konum: 'İstanbul', saatlik_ucret_min: 500, saatlik_ucret_max: 2500, onayli: true, telefon_dogrulandi: true, telefon: '0555 000 00 00', avatar_url: null, created_at: gunOnce(60) },
    ]
    return {
        profiller,
        portfoyler: { a1: [{ id: 'p1' }, { id: 'p2' }], a2: [], a3: [{ id: 'p3' }] },
        basvurular: [
            { id: 1, ad: 'Eski Başvuru', email: 'ornek@alanadi.com', uzmanlik: 'React', tip: 'yazilimci', created_at: gunOnce(90) },
            { id: 2, ad: 'Eski İş Veren', email: 'isveren@alanadi.com', uzmanlik: 'E-ticaret', tip: 'is-veren', created_at: gunOnce(95) },
        ],
    }
}
