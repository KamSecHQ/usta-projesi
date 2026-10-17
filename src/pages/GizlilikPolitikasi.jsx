import { Link } from 'react-router-dom'
import useSayfaBasligi from '../useSayfaBasligi'
import { Ok } from '../components/uzay/Hareket'
import useOkunanBolum from '../components/yazi/useOkunanBolum'
import '../components/uzay/uzay.css'
import { SAYFA_ETIKETLERI } from '../paylasimEtiketleri'

// Metin, sistemin gerçek davranışını anlatır. Veri akışı değişirse (yeni tablo, yeni
// üçüncü taraf hizmet, yeni tarayıcı kaydı) bu sayfa ve SON_GUNCELLEME birlikte güncellenir.
const SON_GUNCELLEME = '17 Ekim 2026'
const EPOSTA = 'merhaba@kalfahane.com'

const BOLUMLER = [
    { kimlik: 'kisaca', baslik: 'Kısaca' },
    { kimlik: 'veriler', baslik: 'Hangi verileri işliyoruz' },
    { kimlik: 'kim-gorur', baslik: 'Kim neyi görür' },
    { kimlik: 'neden', baslik: 'Neden işliyoruz' },
    { kimlik: 'nerede', baslik: 'Nerede saklanır, kimlerle paylaşılır' },
    { kimlik: 'tarayici', baslik: 'Tarayıcında tutulanlar' },
    { kimlik: 'sure', baslik: 'Ne kadar süre saklanır' },
    { kimlik: 'haklar', baslik: 'Hakların' },
    { kimlik: 'iletisim', baslik: 'Başvuru ve iletişim' },
]
const KIMLIKLER = BOLUMLER.map((b) => b.kimlik)

const OZET = [
    'Reklam ya da takip çerezi kullanmıyoruz; verini satmıyor, reklam için paylaşmıyoruz.',
    'Telefon numaranı yalnızca sen ve platform yöneticileri görür. Karşı tarafa vermek istersen mesajlaşmadaki iletişim kartıyla kendin paylaşırsın.',
    'Mesajlarını yalnızca konuşmanın iki tarafı görür. Sildiğin mesajın metni veritabanından da silinir.',
    'Kalfahane ödeme almaz; kart ya da banka bilgisi istemez ve işlemez.',
    'Verilerin Almanya’daki (Frankfurt, AB) sunucularda saklanır. Dilediğinde silinmesini isteyebilirsin.',
]

const VERILER = [
    { ad: 'Hesap', icerik: 'E-posta adresin ve şifren. Şifren geri çevrilemez biçimde (hash) saklanır; biz dahil kimse okuyamaz.' },
    { ad: 'Profil', icerik: 'Ad soyad, unvan, hakkında yazısı, profil fotoğrafı, GitHub bağlantısı, konum, teknolojiler, müsaitlik, saatlik ücret aralığı, tanıtım videosu bağlantısı ve portföy işlerin.' },
    { ad: 'Telefon', icerik: 'Kayıtta ya da profilde verirsen telefon numaran. Yönetici doğrulaması için kullanılır, profilde gösterilmez.' },
    { ad: 'İlan ve teklif', icerik: 'Açtığın ilanlar (başlık, açıklama, bütçe, teknolojiler) ve verdiğin ya da aldığın teklifler (tutar, mesaj, durum).' },
    { ad: 'Mesajlaşma', icerik: 'Konuşmalar, mesaj metinleri, paylaştığın iletişim kartları, tepkiler, okundu bilgisi ve konuşma ayarların (sabitleme, sessize alma, arşiv). "Yazıyor" sinyali ve anlık çevrimiçi durumu saklanmaz.' },
    { ad: 'Değerlendirme', icerik: 'Tamamlanan bir iş için verdiğin ya da aldığın puan ve yorum.' },
    { ad: 'Kullanım', icerik: 'Giriş yapmışken birkaç dakikada bir güncellenen "son görülme" zamanın; mesajlaşmada "çevrimiçi" ya da "X dk önce görüldü" olarak gösterilir. Favorilerin ve ajans davetlerin.' },
]

const GORUNURLUK = [
    {
        baslik: 'Herkese açık',
        maddeler: ['Profil bilgilerin ve portföy işlerin (onaylandıktan sonra Ustalar listesinde ve aramada çıkar)', 'İlanlar ve ilan sahibinin adı', 'Değerlendirme puanları ve yorumları', 'Kabul edilmiş ajans üyelikleri'],
    },
    {
        baslik: 'Yalnızca ilgili taraflar',
        maddeler: ['Teklifler: teklifi veren usta ve ilan sahibi', 'Mesajlar ve paylaşılan iletişim kartları: konuşmanın iki tarafı', 'Bekleyen ajans davetleri: ajans ve davet edilen kişi'],
    },
    {
        baslik: 'Yalnızca sen ve yöneticiler',
        maddeler: ['E-posta adresin', 'Telefon numaran', 'Favorilerin (yalnızca sen)'],
    },
]

const HAKLAR = [
    'Kişisel verinin işlenip işlenmediğini öğrenme ve işlendiyse bilgi isteme',
    'Hangi amaçla işlendiğini ve amaca uygun kullanılıp kullanılmadığını öğrenme',
    'Yurt içinde ya da yurt dışında aktarıldığı üçüncü kişileri öğrenme',
    'Eksik ya da yanlış işlenmişse düzeltilmesini isteme',
    'Silinmesini ya da yok edilmesini isteme',
    'Düzeltme ve silme işlemlerinin, verinin aktarıldığı üçüncü kişilere bildirilmesini isteme',
    'Yalnızca otomatik sistemlerle analiz edilmesi sonucunda aleyhine bir sonuç çıkmasına itiraz etme',
    'Kanuna aykırı işleme yüzünden zarara uğrarsan zararın giderilmesini isteme',
]

function Bolum({ kimlik, baslik, children }) {
    return (
        <section aria-labelledby={kimlik} className="border-t border-white/[0.07] pt-10 first:border-t-0 first:pt-0">
            <h2 id={kimlik} className="scroll-mt-28 text-[clamp(1.3rem,2.2vw,1.55rem)] font-medium leading-tight tracking-[-0.02em] text-white">
                {baslik}
            </h2>
            <div className="mt-5">{children}</div>
        </section>
    )
}

function Tik() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-[3px] h-4 w-4 shrink-0 text-mor-acik">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
    )
}

const metin = 'max-w-[68ch] text-[16.5px] font-light leading-[1.75] text-[#D4D4D8]'
const baglanti = 'text-mor-soluk underline decoration-mor-soluk/40 underline-offset-[3px] hover:text-white hover:decoration-white'

function GizlilikPolitikasi() {
    useSayfaBasligi(SAYFA_ETIKETLERI.gizlilik.baslik, SAYFA_ETIKETLERI.gizlilik.aciklama)
    const aktif = useOkunanBolum(KIMLIKLER)

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <div className="px-4 pb-28 pt-12 sm:px-8 lg:pt-16">
                <div className="mx-auto max-w-[1080px]">
                    <Link to="/" className="inline-flex items-center gap-2 text-[14px] text-gri hover:text-white">
                        <span className="inline-flex rotate-180">
                            <Ok />
                        </span>
                        Anasayfa
                    </Link>

                    <header className="mt-8 max-w-[760px]">
                        <h1 className="font-pjs text-[clamp(2.2rem,4.4vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">Gizlilik politikası</h1>
                        <p className="mt-4 text-[17px] font-light leading-relaxed text-gri">
                            Kalfahane’yi kullanırken hangi bilgilerin işlendiğini, kimin neyi görebildiğini ve haklarını sade bir dille anlatıyoruz.
                        </p>
                        <p className="mt-4 text-[13.5px] text-gri-koyu">
                            Son güncelleme: <time dateTime="2026-10-17">{SON_GUNCELLEME}</time>
                        </p>
                    </header>

                    <div className="mt-14 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
                        <nav aria-label="Bölümler" className="icindekiler hidden lg:block">
                            <div className="sticky top-28">
                                {BOLUMLER.map((b) => (
                                    <a key={b.kimlik} href={`#${b.kimlik}`} aria-current={aktif === b.kimlik ? 'true' : undefined}>
                                        {b.baslik}
                                    </a>
                                ))}
                            </div>
                        </nav>

                        <div className="space-y-10">
                            <Bolum kimlik="kisaca" baslik="Kısaca">
                                <ul className="uz-panel space-y-3.5 px-6 py-6 sm:px-8 sm:py-7">
                                    {OZET.map((o) => (
                                        <li key={o} className="relative flex gap-3 text-[15.5px] font-light leading-relaxed text-[#E4E4E7]">
                                            <Tik />
                                            <span>{o}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Bolum>

                            <Bolum kimlik="veriler" baslik="Hangi verileri işliyoruz">
                                <dl className="divide-y divide-white/[0.07] rounded-[20px] border border-white/[0.08] bg-white/[0.015]">
                                    {VERILER.map((v) => (
                                        <div key={v.ad} className="grid gap-1 px-5 py-4 sm:grid-cols-[140px_1fr] sm:gap-6 sm:px-6">
                                            <dt className="text-[14.5px] font-medium text-white">{v.ad}</dt>
                                            <dd className="text-[15px] font-light leading-relaxed text-[#D4D4D8]">{v.icerik}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </Bolum>

                            <Bolum kimlik="kim-gorur" baslik="Kim neyi görür">
                                <div className="grid gap-4 md:grid-cols-3">
                                    {GORUNURLUK.map((g) => (
                                        <div key={g.baslik} className="rounded-[20px] border border-white/[0.08] bg-white/[0.02] p-5">
                                            <h3 className="text-[15px] font-medium text-white">{g.baslik}</h3>
                                            <ul className="mt-3 space-y-2.5">
                                                {g.maddeler.map((m) => (
                                                    <li key={m} className="flex gap-2.5 text-[14px] font-light leading-snug text-[#D4D4D8]">
                                                        <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-mor-acik" />
                                                        {m}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                <p className={`mt-5 ${metin}`}>
                                    Platformun teknik altyapısını yöneten ekip olarak veritabanına erişimimiz vardır; bu erişimi yalnızca hizmeti çalıştırmak, bir şikâyeti ya da güvenlik sorununu incelemek ve yasal yükümlülükleri yerine getirmek için kullanırız.
                                </p>
                            </Bolum>

                            <Bolum kimlik="neden" baslik="Neden işliyoruz">
                                <ul className="yazi-govdesi">
                                    <li><strong>Hizmeti sunmak:</strong> hesabını açmak, profilini ve portföyünü yayınlamak, ilan, teklif ve mesajlaşmayı çalıştırmak. Hukuki sebep: aramızdaki üyelik sözleşmesinin kurulması ve ifası.</li>
                                    <li><strong>Güveni korumak:</strong> sahte profilleri ve kötüye kullanımı önlemek, ustaları onaylamak, telefon doğrulaması yapmak. Hukuki sebep: platformun ve kullanıcıların meşru menfaati.</li>
                                    <li><strong>Yasal yükümlülükler:</strong> yetkili kurumların usulüne uygun talepleri. Hukuki sebep: kanunlarda öngörülmesi.</li>
                                </ul>
                                <p className={`mt-5 ${metin}`}>Verini reklam, profil çıkarma ya da satış amacıyla kullanmıyoruz.</p>
                            </Bolum>

                            <Bolum kimlik="nerede" baslik="Nerede saklanır, kimlerle paylaşılır">
                                <ul className="yazi-govdesi">
                                    <li><strong>Supabase:</strong> veritabanı, giriş ve anlık mesajlaşma altyapısı. Sunucular Almanya’da (Frankfurt, Avrupa Birliği); verilerin bu nedenle yurt dışında işlenir.</li>
                                    <li><strong>Vercel:</strong> sitenin kendisini sunar; sayfa istekleri için teknik kayıtlar (IP adresi, tarayıcı bilgisi) tutabilir.</li>
                                    <li><strong>YouTube ve Loom:</strong> bir ustanın profilinde tanıtım videosu varsa oradan yüklenir. YouTube videoları çerezsiz modda gömülür; bu hizmetler kendi gizlilik politikalarına tabidir.</li>
                                    <li><strong>WhatsApp, e-posta, telefon:</strong> mesajlaşmadaki iletişim kartında bir düğmeye bastığında ilgili uygulama açılır; bundan sonrası o uygulamanın kurallarına tabidir.</li>
                                </ul>
                                <p className={`mt-5 ${metin}`}>Verini bunların dışında kimseyle paylaşmayız; yetkili kurumların usulüne uygun talepleri saklıdır.</p>
                            </Bolum>

                            <Bolum kimlik="tarayici" baslik="Tarayıcında tutulanlar">
                                <p className={metin}>
                                    Takip ya da reklam çerezi kullanmıyoruz. Aşağıdakiler yalnızca senin tarayıcında, siteyi kullanışlı tutmak için saklanır ve tarayıcı ayarlarından silinebilir:
                                </p>
                                <ul className="yazi-govdesi mt-4">
                                    <li>Oturum bilgisi (giriş yapmış kalman için)</li>
                                    <li>Duyuru çubuğunu kapattığın</li>
                                    <li>Mesaj taslakları ve konuşma başına anlaşma rehberi işaretlerin</li>
                                    <li>Mesajlarda ayrıntılar panelinin açık ya da kapalı tercihi</li>
                                    <li>Yarım bıraktığın ilan taslağı</li>
                                </ul>
                            </Bolum>

                            <Bolum kimlik="sure" baslik="Ne kadar süre saklanır">
                                <p className={metin}>
                                    Verilerini hesabın açık olduğu sürece saklarız. Hesabının silinmesini istediğinde hesabını ve profiline bağlı bilgileri sileriz; yasal olarak saklamamız gereken kayıtlar bu yükümlülük süresince tutulur. Sildiğin bir mesajın metni ve paylaştığın iletişim kartı, sildiğin anda veritabanından kaldırılır.
                                </p>
                            </Bolum>

                            <Bolum kimlik="haklar" baslik="Hakların">
                                <p className={metin}>6698 sayılı Kişisel Verilerin Korunması Kanunu’nun 11. maddesi kapsamında şunları isteyebilirsin:</p>
                                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                                    {HAKLAR.map((h) => (
                                        <li key={h} className="flex gap-2.5 rounded-[14px] border border-white/[0.07] bg-white/[0.015] px-4 py-3 text-[14.5px] font-light leading-snug text-[#D4D4D8]">
                                            <Tik />
                                            {h}
                                        </li>
                                    ))}
                                </ul>
                            </Bolum>

                            <Bolum kimlik="iletisim" baslik="Başvuru ve iletişim">
                                <p className={metin}>
                                    Haklarını kullanmak, hesabının silinmesini istemek ya da verilerinle ilgili her soru için{' '}
                                    <a href={`mailto:${EPOSTA}`} className={baglanti}>{EPOSTA}</a> adresine yaz. Giriş yaptıysan{' '}
                                    <Link to="/ayarlar" className={baglanti}>Ayarlar</Link> sayfasındaki hesap silme düğmesi bu e-postayı senin için hazırlar.
                                    Başvurunu en geç 30 gün içinde yanıtlarız.
                                </p>
                                <p className={`mt-5 ${metin}`}>
                                    Bu metni hizmet değiştikçe güncelleriz; önemli bir değişiklik olursa sitede duyururuz.
                                </p>
                            </Bolum>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GizlilikPolitikasi
