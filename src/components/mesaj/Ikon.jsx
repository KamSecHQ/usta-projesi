// Mesajlaşma ikon seti: tek çizgi kalınlığı, yuvarlak uçlar, 24'lük ızgara.
const YOLLAR = {
    ara: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></>,
    geri: <path d="M15 5l-7 7 7 7" />,
    kapat: <path d="M6 6l12 12M18 6L6 18" />,
    gonder: <><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></>,
    sabitle: <><path d="M9 4h6l-1 6 3 3H7l3-3-1-6z" /><path d="M12 13v7" /></>,
    sessiz: <><path d="M18 8a6 6 0 00-9.3-5M6 8c0 7-3 9-3 9h13" /><path d="M13.7 21a2 2 0 01-3.4 0" /><path d="M3 3l18 18" /></>,
    zil: <><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 01-3.4 0" /></>,
    arsiv: <><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8" /><path d="M10 12h4" /></>,
    bilgi: <><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M15 4v16" /></>,
    yanitla: <><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 016 6v4" /></>,
    kopyala: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 012-2h9" /></>,
    sil: <><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" /><path d="M9 7V4h6v3" /></>,
    gulumse: <><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5a4.5 4.5 0 007 0" /><path d="M9 9.5h.01M15 9.5h.01" /></>,
    kart: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><circle cx="9" cy="11" r="2.2" /><path d="M5.8 16a3.4 3.4 0 016.4 0" /><path d="M15 10h3M15 13.5h3" /></>,
    telefon: <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 006.5 6.5l1.5-2 4 1.5V19a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />,
    eposta: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M4 7l8 6 8-6" /></>,
    baglanti: <><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></>,
    disBaglanti: <><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" /></>,
    tik: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    ciftTik: <><path d="M2.5 12.5L7 17l9.5-9.5" /><path d="M12 16l1 1 9.5-9.5" /></>,
    saat: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    uyari: <><path d="M12 4l9 16H3l9-16z" /><path d="M12 10v4M12 17h.01" /></>,
    kalkan: <><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></>,
    anlasma: <><path d="M3 11l4-4 4 2 3-2 7 5" /><path d="M7 7l-4 8 3 3" /><path d="M21 12l-3 5-3-1" /><path d="M10 15l2 2M12.5 13l2.5 2.5M15 12l2 2" /></>,
    belge: <><path d="M6 3h8l4 4v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" /><path d="M14 3v4h4" /><path d="M8.5 12h7M8.5 16h5" /></>,
    asagi: <><path d="M12 5v14" /><path d="M6 13l6 6 6-6" /></>,
    yukariOk: <path d="M6 15l6-6 6 6" />,
    asagiOk: <path d="M6 9l6 6 6-6" />,
    simsek: <path d="M13 3L5 13.5h6L10 21l8-10.5h-6L13 3z" />,
    mesaj: <><path d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1h-9l-5 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z" /><path d="M8 10h8M8 13.5h5" /></>,
    kullanici: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0116 0v1" /></>,
    konum: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
    liste: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></>,
    nokta3: <><path d="M5.5 12h.01M12 12h.01M18.5 12h.01" /></>,
    yenile: <><path d="M20 11a8 8 0 10-2.3 5.7" /><path d="M20 5v6h-6" /></>,
    whatsapp: <><path d="M4 20l1.3-4A8.5 8.5 0 1112 20.5a8.4 8.4 0 01-4-1L4 20z" /><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9a5 5 0 01-2.3-2.3l.9-1-1-2L9 8.5z" /></>,
}

function Ikon({ ad, className = 'w-4 h-4', kalinlik = 1.6, ...geri }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={kalinlik}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
            {...geri}
        >
            {YOLLAR[ad]}
        </svg>
    )
}

export default Ikon
