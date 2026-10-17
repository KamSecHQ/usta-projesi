import { Link } from 'react-router-dom'
import '../uzay/uzay.css'

// Giriş, kayıt ve şifre sayfalarının ortak çerçevesi: solda form, geniş ekranda sağda çarşının
// kısa tanıtımı. Tanıtımdaki maddeler sitenin başka yerlerinde de söylenen, doğrulanabilir şeyler.
const MADDELER = [
    ['Doğrulanmış profiller', 'Ustalar listesindeki profilleri platform ayrıca inceler.'],
    ['Türk lirası ve Türkçe', 'Ücretler TL ile konuşulur; destek Türkçedir.'],
    ['Kıdem satın alınmaz', 'Rozetler yalnızca tamamlanan işlerden gelir.'],
]

export default function HesapCercevesi({ baslik, altBaslik, children }) {
    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <section className="px-4 pb-24 pt-12 sm:px-8 lg:pt-16">
                <div className="mx-auto grid max-w-[1080px] items-start gap-12 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-20">
                    <div>
                        <h1 className="font-pjs text-[clamp(2.2rem,4vw,3.2rem)] font-medium leading-[1.05] tracking-[-0.03em] text-white">{baslik}</h1>
                        {altBaslik && <p className="mt-3 text-[16px] font-light leading-relaxed text-gri">{altBaslik}</p>}
                        <div className="mt-8 rounded-[24px] border border-white/[0.08] bg-[#08080D] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-7">{children}</div>
                    </div>
                    <aside className="relative hidden overflow-hidden rounded-[28px] border border-white/[0.08] lg:block" aria-label="Kalfahane hakkında">
                        <span aria-hidden className="vitrin-desen" style={{ '--vx': '62%', '--vy': '30%' }} />
                        <div className="relative flex min-h-[520px] flex-col justify-end p-10">
                            <p className="text-[13px] font-semibold tracking-[0.04em] text-mor-soluk">Kalfahane</p>
                            <p className="mt-3 max-w-[18ch] text-[34px] font-medium leading-[1.08] tracking-[-0.025em] text-white">İşini emin ellere teslim et.</p>
                            <ul className="mt-8 flex flex-col gap-4">
                                {MADDELER.map(([b, m]) => (
                                    <li key={b} className="flex gap-3">
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mor-acik shadow-[0_0_10px_rgba(167,139,250,0.9)]" aria-hidden />
                                        <span>
                                            <span className="block text-[15px] font-medium text-white">{b}</span>
                                            <span className="block text-[14px] text-gri">{m}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/ustalar" className="mt-8 inline-flex text-[14px] font-medium text-mor-soluk hover:text-white">
                                Önce ustalara göz at
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>
        </div>
    )
}
