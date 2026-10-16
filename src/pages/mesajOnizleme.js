// Yalnızca geliştirmede: /mesajlar?onizleme=yazilimci ya da ?onizleme=is-veren
// Giriş yapmadan mesajlaşma ekranını örnek veriyle görmeyi sağlar. Canlıda çağrılmaz.
const dk = (n) => new Date(Date.now() - n * 60 * 1000).toISOString()
const EPOCH = '1970-01-01T00:00:00.000Z'

export function mesajOnizlemesi(tur) {
    if (tur !== 'yazilimci' && tur !== 'is-veren') return null
    const yazilimci = tur === 'yazilimci'
    const benId = 'onizleme-ben'
    const karsiRol = yazilimci ? 'is-veren' : 'yazilimci'

    const kisi = (id, ad_soyad, unvan, konum, sonGorulmeDk) => ({
        id, ad_soyad, unvan: yazilimci ? null : unvan, rol: karsiRol, avatar_url: null,
        son_gorulme: sonGorulmeDk === null ? null : dk(sonGorulmeDk), konum, musaitlik: 'musait',
    })

    const ahmet = kisi('k-ahmet', yazilimci ? 'Ahmet Yılmaz' : 'Emre Kılıç', 'Full-stack Geliştirici', 'İstanbul', 2)
    const zeynep = kisi('k-zeynep', 'Zeynep Kaya', 'Mobil Geliştirici (Flutter)', 'İzmir', 45)
    const mert = kisi('k-mert', 'Mert Demir', 'Backend Geliştirici', 'Ankara', 60 * 26)
    const elif = kisi('k-elif', 'Elif Şahin', 'UI Tasarımcı', 'Bursa', 60 * 24 * 9)
    const burak = kisi('k-burak', 'Burak Aydın', 'Frontend Geliştirici', 'Antalya', 1)

    const durum = (k, ben = {}, karsi = {}) => ([
        { kullanici_id: benId, son_okuma: EPOCH, sabitlendi: false, arsivlendi: false, sessiz: false, ...ben },
        { kullanici_id: k.id, son_okuma: EPOCH, sabitlendi: false, arsivlendi: false, sessiz: false, ...karsi },
    ])

    const konusma = (id, karsi, alanlar, durumlar) => ({
        id, katilimci_1: benId, katilimci_2: karsi.id, k1: null, k2: karsi,
        ilan_id: alanlar.ilan?.id || null, teklif_id: alanlar.teklif?.id || null,
        ilan: alanlar.ilan || null, teklif: alanlar.teklif || null,
        son_mesaj_at: alanlar.son_mesaj_at, son_mesaj_onizleme: alanlar.onizleme, son_gonderen_id: alanlar.son_gonderen_id,
        created_at: dk(60 * 30), durumlar,
    })

    const m = (id, konusma_id, gonderen_id, dakikaOnce, icerik, ek = null, tur = 'metin', tepkiler = []) => ({
        id, konusma_id, gonderen_id, tur, icerik, ek, silindi: false, created_at: dk(dakikaOnce), mesaj_tepkileri: tepkiler,
    })

    const eticaretIlan = { id: 'i-eticaret', baslik: 'E-ticaret sitesi yaptırmak istiyorum', durum: 'acik', butce_min: 25000, butce_max: 40000 }
    const isVerenId = yazilimci ? ahmet.id : benId
    const yazilimciId = yazilimci ? benId : ahmet.id

    const mesajlar = {
        'kn-1': [
            m('m1', 'kn-1', yazilimciId, 60 * 27, '«E-ticaret sitesi yaptırmak istiyorum» ilanına verilen teklif üzerinden konuşma başladı · ₺32000',
                { olay: 'teklif', tutar: 32000 }, 'sistem'),
            m('m2', 'kn-1', yazilimciId, 60 * 27 - 1, 'Merhaba, ilanınızı inceledim; birkaç sorum olacak. Ödeme altyapısı olarak iyzico mu düşünüyorsunuz, yoksa açığım mı?'),
            m('m3', 'kn-1', isVerenId, 60 * 26, 'Merhaba! iyzico düşünüyoruz evet. Ürün sayısı başta 300 civarı olacak.'),
            m('m4', 'kn-1', isVerenId, 60 * 26 - 1, 'Referans olarak şu siteye bakabilirsiniz: https://ornek-magaza.com.tr'),
            m('m5', 'kn-1', yazilimciId, 60 * 25, 'Harika, net oldu. 6 haftalık bir plan çıkarıp paylaşıyorum.', null, 'metin', [{ kullanici_id: isVerenId, emoji: '👍' }]),
            m('m6', 'kn-1', isVerenId, 90, 'Teklif kabul edildi. Kalfahane\'de ödeme sistemi henüz yok; ödemeyi ve teslim koşullarını kendi aranızda, güvenli bir yolla netleştirin.',
                { olay: 'kabul', tutar: 32000 }, 'sistem'),
            m('m7', 'kn-1', isVerenId, 88, '', { telefon: '0532 555 12 34', eposta: 'ahmet@ornekmagaza.com', not: 'Hafta içi 10.00–18.00 arası ulaşabilirsiniz.' }, 'iletisim'),
            m('m8', 'kn-1', yazilimciId, 80, 'Teşekkürler! Ödemeyi iki aşamada yapalım mı? Tasarım onayında %40, yayında %60.',
                null, 'metin', [{ kullanici_id: isVerenId, emoji: '✅' }, { kullanici_id: yazilimciId, emoji: '🔥' }]),
            m('m9', 'kn-1', isVerenId, 12, 'Olur, mantıklı. Sözleşme taslağını da buradan paylaşırsanız sevinirim.',
                { yanit: { id: 'm8', gonderen_id: yazilimciId, icerik: 'Teşekkürler! Ödemeyi iki aşamada yapalım mı? Tasarım onayında %40, yayında %60.' } }),
            m('m10', 'kn-1', isVerenId, 11, 'Bir de mobil görünüm öncelikli olsun, müşterilerimizin çoğu telefondan geliyor.'),
        ],
        'kn-2': [
            m('z1', 'kn-2', yazilimciId === benId ? benId : zeynep.id, 60 * 5, 'Merhaba, Flutter ile iOS ve Android için tek kod tabanı öneriyorum.'),
            m('z2', 'kn-2', yazilimciId === benId ? zeynep.id : benId, 60 * 4, 'Mantıklı. Tahmini süre nedir?'),
        ],
        'kn-3': [
            m('t1', 'kn-3', mert.id, 60 * 26, 'Selam, API tarafında yardıma ihtiyacın olursa buradayım.'),
            m('t2', 'kn-3', benId, 60 * 25, 'Süper, teşekkürler!'),
        ],
        'kn-4': [
            m('e1', 'kn-4', elif.id, 60 * 24 * 8, 'Tasarım dosyalarını Figma\'da paylaştım.'),
        ],
        'kn-5': [],
    }

    const sonDurum = (liste) => liste[liste.length - 1]
    const ozet = (id) => {
        const s = sonDurum(mesajlar[id])
        if (!s) return { son_mesaj_at: dk(3), onizleme: null, son_gonderen_id: null }
        return { son_mesaj_at: s.created_at, onizleme: s.tur === 'iletisim' ? 'İletişim bilgisi paylaşıldı' : s.icerik.slice(0, 160), son_gonderen_id: s.gonderen_id }
    }

    const konusmalar = [
        konusma('kn-1', ahmet, { ilan: eticaretIlan, teklif: { id: 't-1', teklif_tutari: 32000, durum: 'kabul_edildi', mesaj: '6 haftada, iyzico entegrasyonlu, mobil öncelikli bir mağaza.' }, ...ozet('kn-1') },
            durum(ahmet, { son_okuma: dk(60) }, { son_okuma: dk(70) })),
        konusma('kn-2', zeynep, { ilan: { id: 'i-mobil', baslik: 'Mobil uygulama (iOS + Android)', durum: 'acik', butce_min: 40000, butce_max: 60000 }, teklif: { id: 't-2', teklif_tutari: 48000, durum: 'beklemede', mesaj: 'Flutter ile 8 hafta.' }, ...ozet('kn-2') },
            durum(zeynep, { sabitlendi: true, son_okuma: dk(60 * 4) }, { son_okuma: dk(60 * 4) })),
        konusma('kn-3', mert, { ...ozet('kn-3') }, durum(mert, { sessiz: true, son_okuma: dk(60 * 25) }, { son_okuma: dk(60 * 25) })),
        konusma('kn-4', elif, { ...ozet('kn-4') }, durum(elif, { arsivlendi: true, son_okuma: dk(60 * 24 * 8) })),
        konusma('kn-5', burak, { ilan: { id: 'i-kurumsal', baslik: 'Kurumsal site yenileme', durum: 'acik', butce_min: 15000, butce_max: 20000 }, ...ozet('kn-5') }, durum(burak)),
    ]

    return {
        user: { id: benId, email: 'ornek@kalfahane.com' },
        profil: { id: benId, ad_soyad: yazilimci ? 'Örnek Usta' : 'Örnek İş Veren', rol: tur, telefon: '0555 000 00 00' },
        konusmalar,
        mesajlar,
        okunmamis: { 'kn-1': 2 },
        cevrimici: [ahmet.id, burak.id],
        otomatikYanitlar: [
            'Anladım, teşekkürler. Yarın dönüş yapıyorum.',
            'Süper, bu şekilde ilerleyelim.',
            'Bir sorum daha olacak: teslimde kaynak kodu da paylaşıyor musunuz?',
        ],
    }
}
