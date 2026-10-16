import { Link } from 'react-router-dom'

const SUTUNLAR = [
    {
        baslik: 'Platform',
        linkler: [
            { ad: 'Tüm Ustalar', to: '/ustalar' },
            { ad: 'İş İlanları', to: '/is-ilanlari' },
            { ad: 'Blog', to: '/blog' },
        ],
    },
    {
        baslik: 'Hesap',
        linkler: [
            { ad: 'Giriş Yap', to: '/giris' },
            { ad: 'Hesap Oluştur', to: '/hesap-olustur' },
            { ad: 'Profilim', to: '/profilim' },
        ],
    },
]

function Footer() {
    return (
        <footer className="relative overflow-hidden border-t border-white/[0.08] bg-black px-4 pt-20 font-pjs sm:px-8">
            <div className="mx-auto max-w-[1440px]">
                <div className="grid gap-12 pb-16 md:grid-cols-12">
                    <p className="max-w-[30ch] text-[17px] font-light leading-relaxed text-gri md:col-span-5">
                        Doğrulanmış Türk yazılımcılarla işletmeleri buluşturan çarşı.
                    </p>
                    {SUTUNLAR.map((s) => (
                        <div key={s.baslik} className="md:col-span-2">
                            <div className="mb-4 text-[13px] font-medium text-white">{s.baslik}</div>
                            <ul className="flex flex-col gap-2.5">
                                {s.linkler.map((l) => (
                                    <li key={l.to}>
                                        <Link to={l.to} className="text-[15px] font-light text-gri transition-colors hover:text-white">{l.ad}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <div className="md:col-span-3">
                        <div className="mb-4 text-[13px] font-medium text-white">İletişim</div>
                        <ul className="flex flex-col gap-2.5 text-[15px]">
                            <li><a href="mailto:merhaba@usta.app" className="font-light text-gri transition-colors hover:text-white">merhaba@usta.app</a></li>
                            <li className="font-light text-gri-koyu">İstanbul, Türkiye</li>
                            <li><Link to="/gizlilik" className="font-light text-gri transition-colors hover:text-white">Gizlilik Politikası</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Tezgâha kazınmış dev logotip */}
                <div aria-hidden className="select-none text-[clamp(4rem,19vw,17rem)] font-extrabold leading-[0.8] tracking-[-0.045em] text-transparent [-webkit-text-stroke:1px_rgba(167,139,250,0.45)]">
                    Kalfahane
                </div>
                <div className="flex flex-wrap justify-between gap-2 border-t border-white/[0.08] py-6 text-xs text-gri-koyu">
                    <span>© 2026 Kalfahane · Türkiye'nin Yazılım Çarşısı</span>
                    <span>Erken erişim</span>
                </div>
            </div>
        </footer>
    )
}

export default Footer
