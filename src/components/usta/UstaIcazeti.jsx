import { Link } from 'react-router-dom'
import { Ok } from '../uzay/Hareket'
import { musaitlikBilgisi, ucretAraligiGoster, cevrimiciMi, kidemRozetiHesapla } from '../../ustaYardimcilari'
import { useProfilRolu } from '../../profilRolu'

// Usta kartı ("icazet") ve boş tezgâh daveti: anasayfa, /ustalar ve Favorilerim aynı kartı kullanır.
// Görünüm .isik-kart, .vitrin-desen ve .bos-tezgah sınıflarındadır (uzay/uzay.css).

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return '?'
    return adSoyad
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((k) => k[0].toLocaleUpperCase('tr-TR'))
        .join('')
}

// Addan sabit bir sayı: kapaksız ustanın vitrin ışığı her ziyarette aynı yerde durur
function adOzeti(metin) {
    let h = 0
    for (const harf of metin || '') h = (h * 31 + harf.charCodeAt(0)) >>> 0
    return h
}

// Vitrin: ustanın öne çıkan portföy işi. Kapak görseli yoksa adından türeyen bir ışık deseni.
function Vitrin({ usta, vitrin }) {
    if (vitrin?.kapak_gorseli_url) {
        return (
            <img
                src={vitrin.kapak_gorseli_url}
                alt={vitrin.baslik ? `${usta.ad_soyad || 'Usta'} portföyünden: ${vitrin.baslik}` : ''}
                loading="lazy"
                decoding="async"
                className="vitrin-gorsel h-full w-full object-cover"
            />
        )
    }
    const h = adOzeti(usta.ad_soyad || usta.id)
    return <span aria-hidden className="vitrin-desen" style={{ '--vx': `${20 + (h % 60)}%`, '--vy': `${30 + ((h >> 6) % 40)}%` }} />
}

// Usta kartı ("icazet"): vitrin, kimlik, uzmanlık ve gerçek portföy sayısı. İmleçle eğilir,
// kenarı imlecin olduğu yerde yanar.
export default function UstaIcazeti({ usta, projeler = [], sira = 0, favori }) {
    const mus = musaitlikBilgisi(usta.musaitlik)
    const ucret = ucretAraligiGoster(usta.saatlik_ucret_min, usta.saatlik_ucret_max)
    const teknolojiler = usta.teknolojiler || []
    const etiketler = teknolojiler.slice(0, 4)
    const fazla = teknolojiler.length - etiketler.length
    const cevrimici = cevrimiciMi(usta.son_gorulme)
    const vitrin = projeler.find((p) => p.one_cikan && p.kapak_gorseli_url) || projeler.find((p) => p.kapak_gorseli_url) || projeler[0]
    // Kıdem yalnızca en az bir tamamlanmış iş varsa gösterilir; "Çırak" her yeni ustanın varsayılanıdır, kartta gürültü olur
    const kidem = usta.tamamlanan > 0 ? kidemRozetiHesapla('yazilimci', usta.tamamlanan) : null

    return (
        <Link to={`/ustalar/${usta.id}`} className="uz-otur group block h-full rounded-[20px]" style={{ '--d': `${0.3 + sira * 0.1}s` }}>
            <article className="isik-kart flex h-full flex-col">
                <div className="vitrin relative aspect-[16/8] overflow-hidden rounded-t-[19px]">
                    <Vitrin usta={usta} vitrin={vitrin} />
                    <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/30 to-transparent" />
                    {favori && <span className="absolute left-4 top-4">{favori}</span>}
                    {(usta.onayli || kidem) && (
                        <span className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
                            {usta.onayli && (
                                <span className="uz-etiket bg-black/60">
                                    <svg viewBox="0 0 12 12" className="h-3 w-3 text-mor-acik" fill="none" aria-hidden>
                                        <path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Onaylı usta
                                </span>
                            )}
                            {kidem && (
                                <span className="uz-etiket bg-black/60" title={`${usta.tamamlanan} tamamlanmış iş birliği`}>
                                    <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: kidem.renk, boxShadow: `0 0 8px ${kidem.renk}` }} />
                                    {kidem.etiket}
                                    <span className="rakam text-gri">· {usta.tamamlanan} iş</span>
                                </span>
                            )}
                        </span>
                    )}
                    {vitrin?.baslik && (
                        <span className="absolute bottom-3 right-5 max-w-[60%] truncate text-right text-[12px] font-medium text-white/70">
                            Öne çıkan iş · {vitrin.baslik}
                        </span>
                    )}
                </div>

                <div className="relative flex flex-1 flex-col px-6 pb-6 sm:px-7 sm:pb-7">
                    <div className="relative -mt-9 h-[60px] w-[60px] shrink-0">
                        {usta.avatar_url ? (
                            <img src={usta.avatar_url} alt="" loading="lazy" decoding="async" className="h-full w-full rounded-full object-cover ring-4 ring-[#0A0A0F]" />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-[17px] font-semibold text-black ring-4 ring-[#0A0A0F]">
                                {baslangicHarfleri(usta.ad_soyad)}
                            </span>
                        )}
                        {cevrimici && (
                            <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-[#4ADE80] ring-[3px] ring-[#0A0A0F]" title="Şu an çevrimiçi">
                                <span className="sr-only">Şu an çevrimiçi</span>
                            </span>
                        )}
                    </div>

                    <h3 className="mt-4 text-[22px] font-medium leading-tight tracking-[-0.015em] text-white">{usta.ad_soyad || 'İsimsiz Usta'}</h3>
                    <p className="mt-1 text-[15px] font-light text-gri">{usta.unvan}</p>
                    {usta.bio && <p className="mt-3 line-clamp-2 text-[14.5px] font-light leading-relaxed text-gri-koyu">{usta.bio}</p>}

                    {etiketler.length > 0 && (
                        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Teknolojiler">
                            {etiketler.map((t) => (
                                <li key={t} className="uz-etiket font-kod text-[11px]">
                                    {t}
                                </li>
                            ))}
                            {fazla > 0 && <li className="uz-etiket text-[11px] text-gri">+{fazla}</li>}
                        </ul>
                    )}

                    <span aria-hidden className="min-h-6 flex-1" />
                    <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4 text-[13.5px]">
                        <span className="flex items-center gap-2 text-gri">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: mus.renk }} />
                            {mus.etiket}
                        </span>
                        <span className="rakam text-gri">{projeler.length > 0 ? `${projeler.length} portföy işi` : 'Portföy hazırlanıyor'}</span>
                        {ucret && <span className="rakam hidden font-medium text-white sm:inline">{ucret}</span>}
                    </div>

                    <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium text-mor-soluk">
                        Profili incele
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                            <Ok />
                        </span>
                    </span>
                </div>
            </article>
        </Link>
    )
}

// Boş tezgâh: çarşıda yer olduğunu dürüstçe söyleyen davet. Uydurma profil yerine durur.
// Biri yazılımcıya, biri iş verene seslenir.
const DAVETLER = {
    usta: {
        to: '/hesap-olustur?rol=yazilimci',
        baslik: 'Bu tezgâh boş',
        metin: 'Portföyünü aç; onaylanan ustalar burada, iş verenlerin gözü önünde durur.',
        eylem: 'Usta olarak katıl',
    },
    isVeren: {
        to: '/hesap-olustur?rol=is-veren',
        baslik: 'Aradığın usta burada yok mu?',
        metin: 'İşini tarif et, ilanını aç; uygun ustalar sana teklif getirsin. İlan açmak ücretsiz.',
        eylem: 'İlan aç',
    },
    ilan: {
        to: '/ilan-ver',
        baslik: 'Bir işin mi var?',
        metin: 'İlanını aç; doğrulanmış ustalar teklif getirsin. İlan açmak ücretsiz.',
        eylem: 'İlan ver',
    },
}

// Üyeye kayıt daveti gösterilmez: aynı boşluk rolüne uygun bir sıradaki adıma dönüşür
const UYE_DAVETLERI = {
    portfoy: {
        to: '/profilim#projeler',
        baslik: 'Vitrinin büyüdükçe öne çıkar',
        metin: 'Portföyüne yeni bir iş ekle; dolu bir vitrin, iş verenin ilk baktığı yerdir.',
        eylem: 'Portföyüme proje ekle',
    },
    ilanlar: {
        to: '/is-ilanlari',
        baslik: 'Açık ilanlar seni bekliyor',
        metin: 'Teknolojilerine uyan işlere teklif ver; tamamlanan her iş kıdemine işlenir.',
        eylem: 'Açık ilanlara göz at',
    },
    teklifler: {
        to: '/tekliflerim',
        baslik: 'Tekliflerini takip et',
        metin: 'Verdiğin teklifler, durumları ve sıradaki adım tek yerde.',
        eylem: 'Tekliflerim',
    },
    ilanVer: {
        to: '/ilan-ver',
        baslik: 'Aradığın usta burada yok mu?',
        metin: 'İşini tarif et, ilanını aç; uygun ustalar sana teklif getirsin. İlan açmak ücretsiz.',
        eylem: 'İlan ver',
    },
    ilanlarim: {
        to: '/ilanlarim',
        baslik: 'Gelen teklifleri karşılaştır',
        metin: 'Açtığın ilanlara gelen teklifler İlanlarım’da yan yana: fiyat, kıdem ve portföy.',
        eylem: 'İlanlarım',
    },
    panel: {
        to: '/panel',
        baslik: 'Çarşıdaki yerin',
        metin: 'İlanların, tekliflerin ve mesajların panelinde.',
        eylem: 'Panelime git',
    },
}

function davetSec(tur, girisli, rol) {
    if (!girisli) return DAVETLER[tur]
    if (rol === 'yazilimci') return tur === 'usta' ? UYE_DAVETLERI.portfoy : tur === 'isVeren' ? UYE_DAVETLERI.ilanlar : UYE_DAVETLERI.teklifler
    if (rol === 'is-veren') return tur === 'usta' ? UYE_DAVETLERI.ilanlarim : tur === 'isVeren' ? UYE_DAVETLERI.ilanVer : DAVETLER.ilan
    return UYE_DAVETLERI.panel
}

export function BosTezgah({ sira, tur = 'usta', genis = false }) {
    const { girisli, rol, hazir } = useProfilRolu()
    const d = davetSec(tur, girisli, rol)
    // Rol gelene kadar kart yerini tutar ama görünmez: yanlış davet bir an bile görünmez
    return (
        <Link
            to={d.to}
            className={`uz-otur group block h-full rounded-[20px] ${genis ? 'mx-auto max-w-[560px]' : ''}`}
            style={{ '--d': `${0.3 + sira * 0.1}s`, visibility: hazir ? undefined : 'hidden' }}
            aria-hidden={hazir ? undefined : true}
            tabIndex={hazir ? undefined : -1}
        >
            <article className="isik-kart bos-tezgah flex h-full min-h-[280px] flex-col items-center justify-center px-8 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-mor-acik/50 text-mor-acik transition-colors duration-300 group-hover:border-mor-acik group-hover:bg-mor/15">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                </span>
                <h3 className="mt-6 text-[21px] font-medium tracking-[-0.015em] text-white">{d.baslik}</h3>
                <p className="mt-2 max-w-[30ch] text-[14.5px] font-light leading-relaxed text-gri">{d.metin}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-mor-soluk">
                    {d.eylem}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                        <Ok />
                    </span>
                </span>
            </article>
        </Link>
    )
}

export function IskeletIcazet() {
    return <div className="h-[460px] animate-pulse rounded-[20px] border border-white/[0.06] bg-cam motion-reduce:animate-none" />
}
