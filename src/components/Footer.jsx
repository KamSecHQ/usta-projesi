import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const SUTUNLAR = [
    {
        baslik: 'Çarşı',
        linkler: [
            { ad: 'Ustalar', to: '/ustalar' },
            { ad: 'İş ilanları', to: '/is-ilanlari' },
            { ad: 'İlan ver', to: '/ilan-ver' },
            { ad: 'Blog', to: '/blog' },
        ],
    },
]

// Ziyaretçiye giriş ve kayıt, üyeye kendi sayfaları
const HESAP_ZIYARETCI = { baslik: 'Hesap', linkler: [{ ad: 'Giriş yap', to: '/giris' }, { ad: 'Hesap oluştur', to: '/hesap-olustur' }] }
const HESAP_UYE = {
    baslik: 'Hesabın',
    linkler: [
        { ad: 'Panelim', to: '/panel' },
        { ad: 'Mesajlar', to: '/mesajlar' },
        { ad: 'Profilim', to: '/profilim' },
        { ad: 'Ayarlar', to: '/ayarlar' },
    ],
}

// Altbilgi: anasayfada tam boy, iç sayfalarda (App.jsx) kısa logotiple. Görünüm gezinme.css'te.
function Footer({ kompakt = false }) {
    const { user } = useAuth()
    const sutunlar = [...SUTUNLAR, user ? HESAP_UYE : HESAP_ZIYARETCI]
    return (
        <footer className={`alt-bilgi relative overflow-hidden px-4 pt-20 font-pjs sm:px-8 ${kompakt ? 'kompakt' : ''}`}>
            <div className="relative mx-auto max-w-[1240px]">
                <div className="grid gap-12 pb-14 md:grid-cols-12">
                    <div className="md:col-span-5">
                        <Link to="/" className="text-[1.45rem] font-extrabold tracking-[0.01em] text-white">
                            Kalfahane<span className="text-mor-acik">.</span>
                        </Link>
                        <p className="mt-4 max-w-[36ch] text-[15.5px] font-light leading-relaxed text-gri">
                            Doğrulanmış Türk yazılımcılarla işletmeleri buluşturan çarşı. Kıdem burada satın alınmaz; tamamlanan her işle kazanılır.
                        </p>
                    </div>
                    {sutunlar.map((s) => (
                        <nav key={s.baslik} className="md:col-span-2" aria-label={s.baslik}>
                            <div className="alt-baslik">{s.baslik}</div>
                            <ul className="flex flex-col gap-2.5">
                                {s.linkler.map((l) => (
                                    <li key={l.to}>
                                        <Link to={l.to} className="alt-link">{l.ad}</Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                    <div className="md:col-span-3">
                        <div className="alt-baslik">İletişim</div>
                        <ul className="flex flex-col gap-2.5">
                            <li><a href="mailto:merhaba@kalfahane.com" className="alt-link">merhaba@kalfahane.com</a></li>
                            <li className="text-[14.5px] font-light text-gri-koyu">İstanbul, Türkiye</li>
                            <li><Link to="/gizlilik" className="alt-link">Gizlilik politikası</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Tezgâha kazınmış dev logotip */}
                <div aria-hidden className="alt-logotip">Kalfahane</div>
                <div className="alt-taban flex flex-wrap items-center justify-between gap-3 py-6 text-[12.5px] text-gri-koyu">
                    <span>© 2026 Kalfahane · Türkiye'nin yazılım çarşısı</span>
                    <span className="duyuru-cip">Erken erişim</span>
                </div>
            </div>
        </footer>
    )
}

export default Footer
