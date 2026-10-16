import { useNavigate } from 'react-router-dom'
import { Sahne, SatirBaslik } from './uzay/Hareket'

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

// İmlecin konumunu hücreye iletir; mor ışık imleci takip eder
function isikTakip(e) {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
}

function HizmetKategorileri() {
    const navigate = useNavigate()

    return (
        <Sahne as="section" className="uz-ufuk px-3 py-28 sm:px-5 lg:py-36">
            <div className="mx-auto max-w-[1100px] text-center">
                <SatirBaslik
                    satirlar={['Ne yaptıracaksın?']}
                    className="font-pjs text-[clamp(2.4rem,5.6vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white"
                />
                <p className="uz-sub mx-auto mt-5 max-w-[40ch] text-[17px] font-light leading-[1.6] text-gri" style={{ '--d': '0.2s' }}>
                    Bir tezgâh seç; o işte uzman ustaları sıralayalım.
                </p>
            </div>

            {/* Tel kafes ızgara: hücreler tek bir panelin içinde ince çizgilerle ayrılır */}
            <ul className="uz-panel uz-otur mx-auto mt-14 grid max-w-[1100px] grid-cols-2 gap-px bg-white/[0.07] md:grid-cols-3" style={{ '--d': '0.3s' }}>
                {kategoriler.map((k) => (
                    <li key={k.ad} className="bg-gece2">
                        <button
                            onClick={() => navigate(`/ustalar?arama=${encodeURIComponent(k.arama)}`)}
                            onPointerMove={isikTakip}
                            className="group relative flex h-full min-h-[150px] w-full flex-col justify-between overflow-hidden p-5 text-left sm:min-h-[190px] sm:p-7"
                        >
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                style={{ background: 'radial-gradient(260px circle at var(--x, 50%) var(--y, 50%), rgba(139,92,246,0.22), transparent 70%)' }}
                            />
                            <span className="relative text-gri transition-colors duration-300 group-hover:text-mor-soluk">{k.icon}</span>
                            <span className="relative flex items-end justify-between gap-3">
                                <span className="text-[clamp(1.05rem,1.8vw,1.35rem)] font-medium leading-tight tracking-[-0.015em] text-white">{k.ad}</span>
                                <svg viewBox="0 0 12 10" fill="none" className="mb-1 h-[11px] w-[13px] shrink-0 -translate-x-1 text-white opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden>
                                    <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </Sahne>
    )
}

export default HizmetKategorileri
