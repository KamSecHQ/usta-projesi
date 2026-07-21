function NedenUsta() {
    const degerler = [
        {
            title: "Yerel ödeme",
            desc: "TL ile öde, dolar kuru takibi ve komisyon şoku yaşama."
        },
        {
            title: "Güvenli teslimat",
            desc: "Ödeme, iş onaylanana kadar tarafsız şekilde tutulur."
        },
        {
            title: "Doğrulanmış ustalar",
            desc: "Her profil gerçek proje geçmişi ve değerlendirmelerle desteklenir."
        },
        {
            title: "Türkçe destek",
            desc: "Anlaşmazlık olursa muhatabın gerçek, Türkçe konuşan bir ekip."
        }
    ]

    return (
        <section id="neden" className="bg-[#0D2626] py-24 px-6 border-t border-[#21504E]">

            <div className="max-w-5xl mx-auto">
                <span className="text-[#C97D3C] text-sm tracking-widest uppercase font-mono">
                    Fark
                </span>
                <h2 className="text-[#F3ECE1] text-3xl font-bold mt-3 mb-12">
                    Neden Usta
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {degerler.map((d) => (
                        <div key={d.title}>
                            <h3 className="text-[#E3B776] text-lg font-semibold mb-2">
                                {d.title}
                            </h3>
                            <p className="text-[#9FC2BC] text-sm">{d.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default NedenUsta
