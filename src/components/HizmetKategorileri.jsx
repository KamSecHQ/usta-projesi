import { useNavigate } from 'react-router-dom'

const kategoriler = [
    {
        ad: "Web Geliştirme",
        arama: "web",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M3 9h18M8 21h8M12 18v3" strokeLinecap="round" />
            </svg>
        )
    },
    {
        ad: "Mobil Uygulama",
        arama: "mobil",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                <rect x="6" y="2" width="12" height="20" rx="2" />
                <path d="M11 18h2" strokeLinecap="round" />
            </svg>
        )
    },
    {
        ad: "E-Ticaret",
        arama: "e-ticaret",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                <circle cx="9" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.8h9.2a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        ad: "UI/UX Tasarım",
        arama: "tasarım",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                <path d="M12 19l7-7 3 3-7 7-3-3z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 2l7.586 7.586" strokeLinecap="round" />
                <circle cx="11" cy="11" r="2" />
            </svg>
        )
    },
    {
        ad: "Backend & API",
        arama: "backend",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                <rect x="3" y="4" width="18" height="6" rx="1.5" />
                <rect x="3" y="14" width="18" height="6" rx="1.5" />
                <circle cx="7" cy="7" r="0.6" fill="currentColor" stroke="none" />
                <circle cx="7" cy="17" r="0.6" fill="currentColor" stroke="none" />
            </svg>
        )
    },
    {
        ad: "Otomasyon & Bot",
        arama: "otomasyon",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                <rect x="5" y="8" width="14" height="10" rx="2" />
                <path d="M12 8V4m-3 0h6M8 13v2m8-2v2" strokeLinecap="round" />
            </svg>
        )
    },
]

function HizmetKategorileri() {
    const navigate = useNavigate()

    return (
        <section className="relative bg-[#0D2626] py-20 px-6">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            <div className="max-w-5xl mx-auto">
                <span className="text-[#C97D3C] text-sm tracking-widest uppercase font-mono">
                    Ne Arıyorsun
                </span>
                <h2 className="text-[#F3ECE1] text-3xl font-bold mt-3 mb-10">
                    Bir kategori seç, ustanı bul
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {kategoriler.map((k) => (
                        <button
                            key={k.ad}
                            onClick={() => navigate(`/ustalar?arama=${encodeURIComponent(k.arama)}`)}
                            className="group flex flex-col items-center gap-3 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-[#9FC2BC] group-hover:text-[#C97D3C] group-hover:border-[#C97D3C]/50 group-hover:bg-[#C97D3C]/[0.08] group-hover:scale-105 transition-all duration-300">
                                {k.icon}
                            </div>
                            <span className="text-[#9FC2BC] text-xs group-hover:text-[#F3ECE1] transition-colors duration-300 leading-tight">
                                {k.ad}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HizmetKategorileri
