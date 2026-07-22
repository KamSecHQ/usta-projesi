function NedenUsta() {
    const degerler = [
        {
            title: "Yerel ödeme",
            desc: "TL ile öde, dolar kuru takibi ve komisyon şoku yaşama.",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9 8h4a2 2 0 0 1 0 4H9m0 0h5m-5 0v4m0-8v-2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            title: "Güvenli teslimat",
            desc: "Ödeme, iş onaylanana kadar tarafsız şekilde tutulur.",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            title: "Doğrulanmış ustalar",
            desc: "Her profil gerçek proje geçmişi ve değerlendirmelerle desteklenir.",
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
        <section id="neden" className="relative bg-[#0D2626] py-24 px-6 border-t border-white/[0.08] overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(255,255,255,0.03),transparent)]" />

            <div className="relative max-w-5xl mx-auto">
                <span className="text-[#C97D3C] text-sm tracking-widest uppercase font-mono">
                    Fark
                </span>
                <h2 className="text-[#F3ECE1] text-3xl font-bold mt-3 mb-12">
                    Neden Usta
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                    {degerler.map((d) => (
                        <div
                            key={d.title}
                            className="flex gap-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 hover:border-[#C97D3C]/40 hover:bg-white/[0.05] transition-all duration-300"
                        >
                            <div className="shrink-0 w-10 h-10 rounded-full bg-[#C97D3C]/10 border border-[#C97D3C]/30 flex items-center justify-center text-[#C97D3C]">
                                {d.icon}
                            </div>
                            <div>
                                <h3 className="text-[#F3ECE1] text-base font-semibold mb-1.5">
                                    {d.title}
                                </h3>
                                <p className="text-[#9FC2BC] text-sm leading-relaxed">{d.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default NedenUsta
