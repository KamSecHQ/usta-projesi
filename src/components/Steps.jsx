function Steps() {
    const steps = [
        {
            no: "01",
            title: "İşini tarif et",
            desc: "Ne yaptırmak istediğini kısaca anlat — bir site, bir uygulama, bir entegrasyon."
        },
        {
            no: "02",
            title: "Teklif al, ustanı seç",
            desc: "Doğrulanmış yazılımcılardan teklif al, portföylerini incele, karar ver."
        },
        {
            no: "03",
            title: "Güvenle teslim al",
            desc: "Ödeme iş tamamlanana kadar güvende tutulur, memnun kalmadan para geçmez."
        }
    ]

    return (
        <section id="surec" className="relative bg-[#0D2626] py-24 px-6">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

            <div className="max-w-5xl mx-auto">

                <span className="text-[#C97D3C] text-sm tracking-widest uppercase font-mono">
                    Süreç
                </span>
                <h2 className="text-[#F3ECE1] text-3xl font-bold mt-3 mb-12">
                    Üç adımda çalışır
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step) => (
                        <div key={step.no} className="border-l-2 border-[#C97D3C] pl-5">
                            <div className="text-[#C97D3C] text-4xl font-bold">{step.no}</div>
                            <h3 className="text-[#F3ECE1] text-lg font-semibold mt-2 mb-2">
                                {step.title}
                            </h3>
                            <p className="text-[#9FC2BC] text-sm">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Steps
