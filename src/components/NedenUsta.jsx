import { Sahne, SatirBaslik } from './uzay/Hareket'
function NedenUsta() {
    const degerler = [
        {
            title: "TL ile fiyat",
            desc: "Ücretler Türk lirasıyla konuşulur; dolar kuru takibi ve komisyon şoku yok.",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9 8h4a2 2 0 0 1 0 4H9m0 0h5m-5 0v4m0-8v-2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            title: "Emanet ödeme",
            yakinda: true,
            desc: "Ödeme, iş onaylanana kadar tarafsız şekilde tutulacak. Üzerinde çalışıyoruz.",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            title: "Doğrulanmış ustalar",
            desc: "Her profil gerçek proje geçmişiyle desteklenir.",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="9" />
                </svg>
            )
        },
        {
            title: "Türkçe destek",
            desc: "Anlaşmazlık olursa muhatabın gerçek, Türkçe konuşan bir ekip.",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        }
    ]

    return (
        <Sahne as="section" id="neden" className="uz-ufuk px-4 py-28 sm:px-8 lg:py-36">
            <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <div className="lg:sticky lg:top-32">
                        <SatirBaslik
                            satirlar={['Neden', 'Kalfahane?']}
                            className="font-pjs text-[clamp(2.4rem,5.6vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white"
                        />
                        <p className="uz-sub mt-5 max-w-[34ch] text-[17px] font-light leading-[1.6] text-gri" style={{ '--d': '0.25s' }}>
                            Global platformların kur, dil ve komisyon derdi olmadan; yerel, açık ve doğrulanabilir.
                        </p>
                    </div>
                </div>
                <dl className="lg:col-span-7">
                    {degerler.map((d, i) => (
                        <div
                            key={d.title}
                            className="uz-kalk grid grid-cols-[auto_1fr] gap-x-6 border-t border-white/[0.08] py-8 first:border-t-0 first:pt-0 lg:first:pt-3"
                            style={{ '--d': `${0.2 + i * 0.08}s` }}
                        >
                            <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.09] bg-cam text-mor-soluk">{d.icon}</div>
                            <div>
                                <dt className="flex flex-wrap items-center gap-3 text-[22px] font-medium tracking-[-0.015em] text-white">
                                    {d.title}
                                    {d.yakinda && <span className="uz-etiket text-mor-soluk">Yakında</span>}
                                </dt>
                                <dd className="mt-2 max-w-[52ch] text-[16px] font-light leading-relaxed text-gri">{d.desc}</dd>
                            </div>
                        </div>
                    ))}
                </dl>
            </div>
        </Sahne>
    )
}

export default NedenUsta
