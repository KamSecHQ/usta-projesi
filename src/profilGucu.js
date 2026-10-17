// Profil gücü: herkese açık profilde doldurulmuş alanların oranı. Uydurma bir puan değil; panelde,
// profil düzenlemede ve profil sayfasında aynı maddelerle hesaplanır. "bolum", profil düzenleme
// sayfasında o alanın bulunduğu bölümün kimliğidir (/profilim#bolum).

export function profilGucuMaddeleri(p, { projeSayisi = 0, telefon = '' } = {}) {
    if (!p) return []
    if (p.rol === 'is-veren') {
        return [
            { anahtar: 'ad', etiket: 'Ad soyad', dolu: Boolean(p.ad_soyad?.trim()), bolum: 'temel' },
            { anahtar: 'telefon', etiket: 'Telefon', dolu: Boolean(telefon?.trim()), bolum: 'temel', ipucu: 'Yalnızca sen ve yönetici görür' },
        ]
    }
    return [
        { anahtar: 'unvan', etiket: 'Unvan', dolu: Boolean(p.unvan?.trim()), bolum: 'temel', ipucu: 'Listede adının altında görünür' },
        { anahtar: 'bio', etiket: 'Hakkımda yazısı', dolu: Boolean(p.bio?.trim()), bolum: 'hakkimda', ipucu: 'Neyi iyi yaptığını iki üç cümleyle anlat' },
        { anahtar: 'teknoloji', etiket: 'En az 1 teknoloji', dolu: (p.teknolojiler || []).length > 0, bolum: 'teknolojiler', ipucu: 'İlanlardaki teknoloji uyumu buradan hesaplanır' },
        { anahtar: 'github', etiket: 'GitHub linki', dolu: Boolean(p.github_url?.trim()), bolum: 'temel' },
        { anahtar: 'konum', etiket: 'Konum', dolu: Boolean(p.konum?.trim()), bolum: 'temel' },
        { anahtar: 'telefon', etiket: 'Telefon', dolu: Boolean(telefon?.trim()), bolum: 'temel', ipucu: 'Herkese açık değildir; yalnızca sen ve yönetici görür' },
        { anahtar: 'ucret', etiket: 'Saatlik ücret aralığı', dolu: Boolean(p.saatlik_ucret_min || p.saatlik_ucret_max), bolum: 'ucret' },
        { anahtar: 'proje', etiket: 'En az 1 portföy işi', dolu: projeSayisi > 0, bolum: 'projeler', ipucu: 'Usta kartındaki vitrin buradan gelir' },
    ]
}

export function profilGucuYuzdesi(maddeler) {
    if (!maddeler.length) return 0
    return Math.round((maddeler.filter((m) => m.dolu).length / maddeler.length) * 100)
}
