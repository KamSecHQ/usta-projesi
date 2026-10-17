// Gezinme ikonları: üst çubuk, açılır paneller ve mobil menü aynı çizgi ailesini kullanır
// (24'lük ızgara, 1.6 çizgi, yuvarlak uçlar).
const YOLLAR = {
    ara: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
        </>
    ),
    arti: <path d="M12 5v14M5 12h14" />,
    mesaj: <path d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1h-9l-5 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z" />,
    zil: (
        <>
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
        </>
    ),
    asagi: <path d="M6 9l6 6 6-6" />,
    sag: <path d="M9 6l6 6-6 6" />,
    ustalar: (
        <>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20a6.5 6.5 0 0113 0" />
            <path d="M16 4.6a3.5 3.5 0 010 6.8M21.5 20a6.5 6.5 0 00-3.8-5.9" />
        </>
    ),
    ilanlar: (
        <>
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18" />
        </>
    ),
    surec: (
        <>
            <circle cx="5" cy="6" r="1.6" />
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="5" cy="18" r="1.6" />
            <path d="M10 6h10M10 12h10M10 18h6" />
        </>
    ),
    kidem: (
        <>
            <circle cx="12" cy="9" r="5" />
            <path d="M8.6 13.4L7 21l5-2.6 5 2.6-1.6-7.6" />
        </>
    ),
    kalkan: (
        <>
            <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
            <path d="M9 12l2 2 4-4" />
        </>
    ),
    soru: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.6 9.4a2.5 2.5 0 014.9.6c0 1.6-2.5 2.1-2.5 3.6M12 17h.01" />
        </>
    ),
    blog: (
        <>
            <path d="M5 4.5A1.5 1.5 0 016.5 3H19v15H6.5A1.5 1.5 0 005 19.5v-15z" />
            <path d="M5 19.5A1.5 1.5 0 006.5 21H19M9 7.5h6M9 11h6" />
        </>
    ),
    panel: (
        <>
            <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
            <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
            <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
            <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
        </>
    ),
    kisi: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21v-1a8 8 0 0116 0v1" />
        </>
    ),
    kalp: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.2a4.3 4.3 0 017.5 2.6C19.5 15.4 12 20 12 20z" />,
    teklif: (
        <>
            <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z" />
            <circle cx="7.5" cy="7.5" r="1.5" />
        </>
    ),
    klasor: <path d="M3 6.5A1.5 1.5 0 014.5 5H9l2 2.5h8.5A1.5 1.5 0 0121 9v9.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18.5v-12z" />,
    klasorArti: (
        <>
            <path d="M3 6.5A1.5 1.5 0 014.5 5H9l2 2.5h8.5A1.5 1.5 0 0121 9v9.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18.5v-12z" />
            <path d="M12 11v6M9 14h6" />
        </>
    ),
    vitrin: (
        <>
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M3 8h18M8 21h8" />
        </>
    ),
    kalem: <path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16v4z" />,
    ayarlar: (
        <>
            <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
            <circle cx="15" cy="7" r="2" />
            <circle cx="9" cy="17" r="2" />
        </>
    ),
    cikis: <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l5-5-5-5M15 12H3" />,
}

export default function Ikon({ ad, className = '' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            {YOLLAR[ad]}
        </svg>
    )
}
