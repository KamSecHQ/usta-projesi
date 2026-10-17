// Örnek vitrin (/ornek) verisi. Buradaki kişiler, işletmeler, ilanlar, teklifler, mesajlar ve
// değerlendirme ÖRNEKTİR; gerçek değildir. Sayfada her biri "Örnek" etiketiyle gösterilir,
// veritabanına girmez, sayaçlara ve aramaya karışmaz. Amaç: Kalfahane'de bir işin nasıl
// ilerlediğini göstermek. Kimlikler "ornek-" ile başlar (testler/ornekVitrin.test.js denetler).

const GUN = 864e5
export const gunOnce = (gun, simdi = Date.now()) => new Date(simdi - gun * GUN).toISOString()

export const ORNEK_USTALAR = [
    {
        id: 'ornek-usta-1',
        ad_soyad: 'Mert Kaya',
        unvan: 'Full Stack Geliştirici',
        konum: 'İstanbul',
        bio: 'Küçük işletmeler için sipariş, rezervasyon ve yönetim ekranları kuruyorum. Teslimden sonra bir ay ücretsiz düzeltme yaparım.',
        teknolojiler: ['Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
        musaitlik: 'musait',
        saatlik_ucret_min: 650,
        saatlik_ucret_max: 950,
        tamamlanan: 3,
        projeler: [
            { baslik: 'Fırın zinciri için online sipariş', aciklama: 'Beş şubenin siparişleri tek panelde; şube bazında hazırlık ekranı.', one_cikan: true },
            { baslik: 'Kuaför randevu paneli', aciklama: 'Çalışan bazında takvim, SMS hatırlatma ve günlük ciro özeti.' },
        ],
    },
    {
        id: 'ornek-usta-2',
        ad_soyad: 'Elif Demirtaş',
        unvan: 'Mobil Geliştirici',
        konum: 'İzmir',
        bio: 'iOS ve Android uygulamalarını tek kod tabanıyla yazıyorum; mağaza yayınını da üstleniyorum.',
        teknolojiler: ['Flutter', 'Dart', 'Firebase'],
        musaitlik: 'kismi_musait',
        saatlik_ucret_min: 700,
        saatlik_ucret_max: 1100,
        tamamlanan: 5,
        projeler: [
            { baslik: 'Pilates stüdyosu üyelik uygulaması', aciklama: 'Ders rezervasyonu, paket takibi ve bildirimler.', one_cikan: true },
            { baslik: 'Belediye etkinlik takvimi', aciklama: 'Etkinlik listesi, harita ve hatırlatıcı.' },
        ],
    },
    {
        id: 'ornek-usta-3',
        ad_soyad: 'Selin Yıldız',
        unvan: 'E-ticaret Geliştiricisi',
        konum: 'Bursa',
        bio: 'Mağaza kurulumu, ödeme ve kargo entegrasyonu, ürün aktarımı. Satışa hazır teslim ederim.',
        teknolojiler: ['Shopify', 'WooCommerce', 'Liquid', 'iyzico'],
        musaitlik: 'musait',
        saatlik_ucret_min: 550,
        saatlik_ucret_max: 850,
        tamamlanan: 11,
        projeler: [
            { baslik: 'Ev tekstili markası mağazası', aciklama: '1.200 ürünün aktarımı, kargo ve iade akışı.', one_cikan: true },
            { baslik: 'Organik gıda abonelik sitesi', aciklama: 'Haftalık kutu aboneliği ve otomatik ödeme.' },
        ],
    },
    {
        id: 'ornek-usta-4',
        ad_soyad: 'Burak Şen',
        unvan: 'Backend Geliştirici',
        konum: 'Ankara',
        bio: 'Yoğun trafikli API’ler ve entegrasyonlar. Var olan sistemi durdurmadan yenilerim.',
        teknolojiler: ['Go', 'PostgreSQL', 'Docker', 'React'],
        musaitlik: 'musait',
        saatlik_ucret_min: 800,
        saatlik_ucret_max: 1200,
        tamamlanan: 4,
        projeler: [
            { baslik: 'Kargo firması için takip API’si', aciklama: 'Günde 40 bin gönderinin durum güncellemesi.', one_cikan: true },
            { baslik: 'Muhasebe yazılımı entegrasyonu', aciklama: 'E-fatura ve stok eşitleme.' },
        ],
    },
    {
        id: 'ornek-usta-5',
        ad_soyad: 'Zeynep Aydın',
        unvan: 'UI/UX Tasarımcı',
        konum: 'İstanbul',
        bio: 'Kullanıcı görüşmesiyle başlayan, geliştiriciye hazır teslim edilen arayüzler ve tasarım sistemleri.',
        teknolojiler: ['Figma', 'Prototipleme', 'Tasarım sistemi'],
        musaitlik: 'musait_degil',
        saatlik_ucret_min: 600,
        saatlik_ucret_max: 900,
        tamamlanan: 6,
        projeler: [
            { baslik: 'Sigorta karşılaştırma uygulaması', aciklama: 'Teklif akışı yedi adımdan üçe indi.', one_cikan: true },
            { baslik: 'Kafe zinciri sadakat uygulaması', aciklama: 'Puan, kampanya ve sipariş ekranları.' },
        ],
    },
    {
        id: 'ornek-usta-6',
        ad_soyad: 'Can Öztürk',
        unvan: 'Otomasyon ve Veri Geliştiricisi',
        konum: 'Eskişehir',
        bio: 'Elle yapılan, tekrar eden işleri otomatiğe bağlarım: rapor, fatura, stok ve WhatsApp bildirimleri.',
        teknolojiler: ['Python', 'Pandas', 'n8n', 'Google Sheets'],
        musaitlik: 'musait',
        saatlik_ucret_min: 450,
        saatlik_ucret_max: 700,
        tamamlanan: 1,
        projeler: [{ baslik: 'Toptancı için stok raporu otomasyonu', aciklama: 'Her sabah 08.00’de depo raporu e-postada.', one_cikan: true }],
    },
    {
        id: 'ornek-usta-7',
        ad_soyad: 'Ayşe Koç',
        unvan: 'iOS Geliştirici',
        konum: 'Antalya',
        bio: 'Yerel iOS uygulamaları; erişilebilirlik ve performans önceliğim.',
        teknolojiler: ['Swift', 'SwiftUI', 'Core Data'],
        musaitlik: 'kismi_musait',
        saatlik_ucret_min: 750,
        saatlik_ucret_max: 1050,
        tamamlanan: 4,
        projeler: [
            { baslik: 'Otel misafir uygulaması', aciklama: 'Oda servisi, etkinlikler ve dijital anahtar.', one_cikan: true },
            { baslik: 'Kişisel bütçe takip uygulaması', aciklama: 'Kategori bazında harcama ve hedefler.' },
        ],
    },
    {
        id: 'ornek-usta-8',
        ad_soyad: 'Emre Çelik',
        unvan: 'DevOps Mühendisi',
        konum: 'Kocaeli',
        bio: 'Sunucu kurulumu, yedekleme, izleme ve otomatik yayın hattı. Gece yarısı çöken siteye son.',
        teknolojiler: ['AWS', 'Docker', 'Kubernetes', 'GitHub Actions'],
        musaitlik: 'musait',
        saatlik_ucret_min: 900,
        saatlik_ucret_max: 1400,
        tamamlanan: 7,
        projeler: [{ baslik: 'E-ticaret altyapısının buluta taşınması', aciklama: 'Kampanya günlerinde kesintisiz; maliyet %30 düştü.', one_cikan: true }],
    },
    {
        id: 'ornek-usta-9',
        ad_soyad: 'Deniz Arslan',
        unvan: 'Oyun ve 3D Geliştirici',
        konum: 'İstanbul',
        bio: 'Eğitim ve tanıtım amaçlı küçük oyunlar, 3D ürün gösterimleri ve artırılmış gerçeklik deneyimleri.',
        teknolojiler: ['Unity', 'C#', 'Blender', 'Three.js'],
        musaitlik: 'musait',
        saatlik_ucret_min: 500,
        saatlik_ucret_max: 800,
        tamamlanan: 0,
        projeler: [{ baslik: 'Müze için artırılmış gerçeklik rehberi', aciklama: 'Eserlerin önünde telefonla canlanan anlatım.', one_cikan: true }],
    },
    {
        id: 'ornek-usta-10',
        ad_soyad: 'Hakan Yılmaz',
        unvan: 'WordPress Geliştirici',
        konum: 'Trabzon',
        bio: 'Kurumsal site, blog ve çok dilli yapı; hız ve arama görünürlüğü dahil.',
        teknolojiler: ['WordPress', 'PHP', 'WooCommerce', 'SEO'],
        musaitlik: 'musait',
        saatlik_ucret_min: 400,
        saatlik_ucret_max: 650,
        tamamlanan: 12,
        projeler: [
            { baslik: 'Mimarlık ofisi kurumsal sitesi', aciklama: 'Proje galerisi ve üç dil.', one_cikan: true },
            { baslik: 'Turizm acentesi rezervasyon sitesi', aciklama: 'Tur takvimi ve ön ödeme.' },
        ],
    },
]

export const ORNEK_ISVERENLER = [
    { id: 'ornek-isveren-1', ad_soyad: 'Gamze Akın', isletme: 'Lavanta Kafe', sektor: 'Yeme-içme', konum: 'İstanbul', tamamlanan: 1 },
    { id: 'ornek-isveren-2', ad_soyad: 'Okan Ertürk', isletme: 'Ege Zeytinyağları', sektor: 'Gıda üretimi', konum: 'Balıkesir', tamamlanan: 1 },
    { id: 'ornek-isveren-3', ad_soyad: 'Nilay Kuzey', isletme: 'Kuzey Diş Kliniği', sektor: 'Sağlık', konum: 'Ankara', tamamlanan: 2 },
    { id: 'ornek-isveren-4', ad_soyad: 'Serkan Bilgin', isletme: 'Atlas Lojistik', sektor: 'Lojistik', konum: 'Mersin', tamamlanan: 5 },
    { id: 'ornek-isveren-5', ad_soyad: 'Hülya Tan', isletme: 'Yeşil Bahçe Fidancılık', sektor: 'Tarım', konum: 'Yalova', tamamlanan: 0 },
    { id: 'ornek-isveren-6', ad_soyad: 'Kerem Aksoy', isletme: 'Mavi Yelken Butik Otel', sektor: 'Turizm', konum: 'Muğla', tamamlanan: 1 },
    { id: 'ornek-isveren-7', ad_soyad: 'Ece Sarı', isletme: 'Sarı Hukuk Bürosu', sektor: 'Hukuk', konum: 'İzmir', tamamlanan: 0 },
    { id: 'ornek-isveren-8', ad_soyad: 'Tolga Demir', isletme: 'Fit Akademi', sektor: 'Spor', konum: 'Bursa', tamamlanan: 1 },
    { id: 'ornek-isveren-9', ad_soyad: 'Recep Güler', isletme: 'İnegöl Ahşap Atölyesi', sektor: 'Mobilya', konum: 'Bursa', tamamlanan: 3 },
    { id: 'ornek-isveren-10', ad_soyad: 'Sevgi Karaca', isletme: 'Pusula Eğitim Kurumları', sektor: 'Eğitim', konum: 'Konya', tamamlanan: 2 },
]

// Açıklamalar ilan sihirbazının biçiminde: giriş paragrafı, "Soru?\ncevap" blokları, teslim satırı
// (components/ilan/ilanSablonlari.js, aciklamayiAyir ile bölümlere ayrılır)
export const ORNEK_ILANLAR = [
    {
        id: 'ornek-ilan-1',
        is_veren_id: 'ornek-isveren-1',
        baslik: 'Kafe için QR menü ve masadan sipariş sistemi',
        aciklama:
            'Kadıköy’de 40 kişilik bir kafeyiz. Masadaki QR kodu okutan müşteri menüyü görsün, siparişini versin; sipariş mutfaktaki ekrana düşsün.\n\nKimler kullanacak?\nMüşteriler telefondan, mutfak ekibi tabletten, ben de fiyat ve ürün güncellemek için.\n\nOlmazsa olmaz ne?\nMenüyü kendimiz güncelleyebilmeliyiz: fotoğraf, fiyat ve “tükendi” bilgisi.\n\nÖdeme alınacak mı?\nŞimdilik hayır; ödeme kasada alınıyor.\n\nTeslim beklentisi: 4–6 hafta',
        gerekli_teknolojiler: ['React', 'Node.js', 'PostgreSQL'],
        butce_min: 30000,
        butce_max: 45000,
        gun: 48,
        teklifSayisi: 3,
        durum: 'tamamlandi',
    },
    {
        id: 'ornek-ilan-2',
        is_veren_id: 'ornek-isveren-2',
        baslik: 'Zeytinyağı markamız için e-ticaret sitesi',
        aciklama:
            'Ayvalık’ta üç kuşaktır zeytinyağı üretiyoruz. Şu an Instagram’dan satıyoruz; kendi mağazamızı açmak istiyoruz.\n\nKaç ürün olacak?\nBaşlangıçta 15 ürün: teneke, cam şişe ve hediye kutuları.\n\nOlmazsa olmaz ne?\nKartla ödeme, kargo takibi ve kurumsal toplu sipariş için teklif formu.\n\nTeslim beklentisi: 6–8 hafta',
        gerekli_teknolojiler: ['Shopify', 'iyzico'],
        butce_min: 40000,
        butce_max: 70000,
        gun: 3,
        teklifSayisi: 4,
        durum: 'acik',
    },
    {
        id: 'ornek-ilan-3',
        is_veren_id: 'ornek-isveren-3',
        baslik: 'Diş kliniği için online randevu sistemi',
        aciklama:
            'İki hekimli bir kliniğiz. Telefonla aldığımız randevuları hastaların kendisinin alabileceği bir sisteme taşımak istiyoruz.\n\nKimler kullanacak?\nHastalar web sitesinden, sekreterimiz panelden.\n\nOlmazsa olmaz ne?\nSMS ile hatırlatma ve hekim bazında çalışma saatleri.\n\nTeslim beklentisi: 1–2 ay',
        gerekli_teknolojiler: ['React', 'Node.js', 'SMS API'],
        butce_min: 25000,
        butce_max: 40000,
        gun: 5,
        teklifSayisi: 3,
        durum: 'acik',
    },
    {
        id: 'ornek-ilan-4',
        is_veren_id: 'ornek-isveren-4',
        baslik: 'Araç filosu için canlı takip paneli',
        aciklama:
            '32 araçlık filomuzun konumunu, teslimat durumunu ve gecikmeleri tek ekranda görmek istiyoruz. Araçlarda GPS cihazı var.\n\nMevcut bir sistem var mı?\nGPS firmasının API’si var; verileri şu an Excel’e elle aktarıyoruz.\n\nOlmazsa olmaz ne?\nHarita, gecikme uyarısı ve günlük teslimat raporu.\n\nTeslim beklentisi: 2–3 ay',
        gerekli_teknolojiler: ['Go', 'PostgreSQL', 'React'],
        butce_min: 90000,
        butce_max: 140000,
        gun: 2,
        teklifSayisi: 5,
        durum: 'acik',
    },
    {
        id: 'ornek-ilan-5',
        is_veren_id: 'ornek-isveren-5',
        baslik: 'Fidanlık için ürün kataloğu ve WhatsApp’tan sipariş',
        aciklama:
            '300’e yakın fidan ve bitki çeşidimiz var. Müşteriler fiyat sormak için sürekli arıyor; güncel bir katalog istiyoruz.\n\nÖdeme alınacak mı?\nHayır; sipariş WhatsApp’a düşsün, ödemeyi teslimde alıyoruz.\n\nOlmazsa olmaz ne?\nStokta olmayanı gizlemek ve mevsime göre fiyat güncellemek.\n\nTeslim beklentisi: 3–4 hafta',
        gerekli_teknolojiler: ['WordPress', 'WooCommerce'],
        butce_min: 12000,
        butce_max: 20000,
        gun: 1,
        teklifSayisi: 2,
        durum: 'acik',
    },
    {
        id: 'ornek-ilan-6',
        is_veren_id: 'ornek-isveren-6',
        baslik: 'Butik otel için rezervasyon motoru entegrasyonu',
        aciklama:
            'Bodrum’da 14 odalı butik bir oteliz. Sitemizden doğrudan rezervasyon almak ve kanal yöneticimizle müsaitliği eşlemek istiyoruz.\n\nMevcut bir sistem var mı?\nKanal yöneticisi kullanıyoruz; sitemiz WordPress.\n\nOlmazsa olmaz ne?\nÇift rezervasyon olmaması; İngilizce ve Almanca dil desteği.\n\nTeslim beklentisi: 1 ay',
        gerekli_teknolojiler: ['WordPress', 'PHP', 'REST API'],
        butce_min: 30000,
        butce_max: 50000,
        gun: 4,
        teklifSayisi: 3,
        durum: 'acik',
    },
    {
        id: 'ornek-ilan-7',
        is_veren_id: 'ornek-isveren-7',
        baslik: 'Hukuk bürosu için kurumsal site ve randevu formu',
        aciklama:
            'Ticaret ve iş hukuku alanında çalışan üç avukatlık bir büroyuz. Ciddi, sade ve hızlı açılan bir site istiyoruz.\n\nHangi sayfalar olacak?\nÇalışma alanları, ekip, makaleler ve iletişim.\n\nOlmazsa olmaz ne?\nMakaleleri kendimiz ekleyebilmeliyiz; aydınlatma metinlerimiz hazır.\n\nTeslim beklentisi: 3–4 hafta',
        gerekli_teknolojiler: ['WordPress', 'SEO'],
        butce_min: 15000,
        butce_max: 25000,
        gun: 6,
        teklifSayisi: 4,
        durum: 'acik',
    },
    {
        id: 'ornek-ilan-8',
        is_veren_id: 'ornek-isveren-8',
        baslik: 'Spor salonu için üyelik ve ders rezervasyonu uygulaması',
        aciklama:
            'Üç şubeli bir spor salonuyuz. Üyeler grup derslerine telefondan yer ayırsın, üyelik süresini görsün istiyoruz.\n\nKimler kullanacak?\nÜyeler iOS ve Android’den, eğitmenler ders listesini görmek için.\n\nOlmazsa olmaz ne?\nDers kontenjanı, bekleme listesi ve bildirim.\n\nTeslim beklentisi: 2–3 ay',
        gerekli_teknolojiler: ['Flutter', 'Firebase'],
        butce_min: 70000,
        butce_max: 110000,
        gun: 3,
        teklifSayisi: 3,
        durum: 'acik',
    },
    {
        id: 'ornek-ilan-9',
        is_veren_id: 'ornek-isveren-9',
        baslik: 'Mobilya siparişleri için 3D ürün yapılandırıcı',
        aciklama:
            'Ölçüye özel masa ve kitaplık üretiyoruz. Müşteri ölçüyü, ahşap türünü ve rengi seçip ürünü 3D görsün, fiyatı anında görsün istiyoruz.\n\nMevcut bir sistem var mı?\nShopify mağazamız var; yapılandırıcı ürün sayfasına gömülsün.\n\nOlmazsa olmaz ne?\nFiyatın seçimlerle anında hesaplanması ve telefonda akıcı çalışması.\n\nTeslim beklentisi: 6–8 hafta',
        gerekli_teknolojiler: ['Three.js', 'React', 'Shopify'],
        butce_min: 50000,
        butce_max: 80000,
        gun: 8,
        teklifSayisi: 2,
        durum: 'acik',
    },
    {
        id: 'ornek-ilan-10',
        is_veren_id: 'ornek-isveren-10',
        baslik: 'Okul için veli bilgilendirme ve ödev takip paneli',
        aciklama:
            '450 öğrencili bir ortaokuluz. Velilere duyuru, ödev ve devamsızlık bilgisini tek yerden iletmek istiyoruz.\n\nKimler kullanacak?\nÖğretmenler panelden, veliler telefondan.\n\nOlmazsa olmaz ne?\nGüvenli giriş, sınıf bazında yetki ve bildirim.\n\nTeslim beklentisi: 2 ay',
        gerekli_teknolojiler: ['React', 'Node.js', 'PostgreSQL'],
        butce_min: 60000,
        butce_max: 90000,
        gun: 10,
        teklifSayisi: 4,
        durum: 'acik',
    },
]

// Akışın anlatıldığı iş: Lavanta Kafe'nin QR menü ilanı ve ona gelen üç teklif
export const AKIS_ILAN_ID = 'ornek-ilan-1'

export const AKIS_TEKLIFLERI = [
    {
        id: 'ornek-teklif-1',
        ilan_id: 'ornek-ilan-1',
        usta_id: 'ornek-usta-1',
        tutar: 38000,
        sure: '5 hafta',
        mesaj: 'Benzer bir sipariş sistemini bir fırın zinciri için kurdum. Menüyü telefondan güncelleyebileceğiniz şekilde tasarlarım; mutfak ekranı tablette çalışır. İlk hafta tasarımı onayınıza sunarım.',
        durum: 'kabul_edildi',
    },
    {
        id: 'ornek-teklif-2',
        ilan_id: 'ornek-ilan-1',
        usta_id: 'ornek-usta-2',
        tutar: 52000,
        sure: '7 hafta',
        mesaj: 'Müşteri tarafını web, mutfak tarafını tablet uygulaması olarak Flutter ile tek kod tabanında yazarım. İleride uygulama mağazasına da çıkabilirsiniz.',
        durum: 'reddedildi',
    },
    {
        id: 'ornek-teklif-3',
        ilan_id: 'ornek-ilan-1',
        usta_id: 'ornek-usta-10',
        tutar: 29000,
        sure: '4 hafta',
        mesaj: 'Hazır bir menü altyapısını kafenize göre uyarlarım; daha hızlı ve uygun maliyetli olur. Mutfak ekranı daha sade kalır.',
        durum: 'reddedildi',
    },
]

// Teklif kabul edildikten sonraki konuşma (iş veren: Gamze Akın, usta: Mert Kaya)
export const AKIS_KONUSMASI = [
    { id: 'ornek-mesaj-1', gonderen: 'isveren', metin: 'Merhaba Mert Bey, teklifiniz bütçemize uygun. Menüyü gerçekten kendimiz güncelleyebilecek miyiz?', saat: '10:42' },
    { id: 'ornek-mesaj-2', gonderen: 'usta', metin: 'Merhaba Gamze Hanım, evet. Basit bir yönetim ekranı olacak; ürünü, fiyatı ve fotoğrafı telefondan değiştirebilirsiniz.', saat: '10:47' },
    { id: 'ornek-mesaj-3', gonderen: 'usta', metin: 'İlk hafta tasarımı, üçüncü hafta sipariş akışını gösteririm. Ödemeyi üç aşamaya bölelim mi?', saat: '10:48' },
    { id: 'ornek-mesaj-4', gonderen: 'isveren', metin: 'Olur. Mutfağa düşen siparişler için fiş yazıcısı da bağlanabilir mi?', saat: '10:55' },
    { id: 'ornek-mesaj-5', gonderen: 'usta', metin: 'Mutfak ekranı kapsamda. Fiş yazıcısını ikinci aşamada ekleyebiliriz; ek ücretini ayrıca yazarım.', saat: '11:02' },
]

export const AKIS_DEGERLENDIRMESI = {
    puan: 5,
    yorum: 'Menü ve sipariş ekranı söz verilen tarihte teslim edildi. Mutfak ekibi ilk gün alıştı; fiyatları artık kendimiz güncelliyoruz.',
}

export function ustaBul(id) {
    return ORNEK_USTALAR.find((u) => u.id === id) || null
}

export function isVerenBul(id) {
    return ORNEK_ISVERENLER.find((i) => i.id === id) || null
}
