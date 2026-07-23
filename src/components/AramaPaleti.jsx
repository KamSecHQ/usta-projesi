import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("")
}

function AramaPaleti({ acik, kapat }) {
    const [sorgu, setSorgu] = useState("")
    const [tumUstalar, setTumUstalar] = useState([])
    const [yukleniyor, setYukleniyor] = useState(false)
    const [seciliIndex, setSeciliIndex] = useState(0)
    const inputRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (!acik) return
        setSorgu("")
        setSeciliIndex(0)
        setTimeout(() => inputRef.current?.focus(), 50)

        async function veriGetir() {
            setYukleniyor(true)
            const { data, error } = await supabase
                .from('profiller')
                .select('*')
                .eq('rol', 'yazilimci')
                .eq('onayli', true)
                .not('unvan', 'is', null)
                .order('created_at', { ascending: false })
                .limit(50)
            if (!error) setTumUstalar(data)
            setYukleniyor(false)
        }
        veriGetir()
    }, [acik])

    useEffect(() => {
        function tusaBasildi(e) {
            if (e.key === "Escape") kapat()
        }
        if (acik) document.addEventListener("keydown", tusaBasildi)
        return () => document.removeEventListener("keydown", tusaBasildi)
    }, [acik, kapat])

    const sonuclar = tumUstalar.filter((u) => {
        const s = sorgu.toLowerCase()
        if (!s) return true
        const teknolojiler = u.teknolojiler || []
        return (
            (u.ad_soyad || "").toLowerCase().includes(s) ||
            (u.unvan || "").toLowerCase().includes(s) ||
            teknolojiler.some((t) => t.toLowerCase().includes(s))
        )
    }).slice(0, 8)

    function secilenSonuc(usta) {
        kapat()
        navigate(`/ustalar/${usta.id}`)
    }

    function klavyeYonet(e) {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSeciliIndex((i) => Math.min(i + 1, sonuclar.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSeciliIndex((i) => Math.max(i - 1, 0))
        } else if (e.key === "Enter" && sonuclar[seciliIndex]) {
            secilenSonuc(sonuclar[seciliIndex])
        }
    }

    if (!acik) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={kapat} />
            <div className="relative w-full max-w-lg bg-[#123434] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                <div className="flex items-center gap-3 px-4 border-b border-white/[0.08]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[#9FC2BC] shrink-0">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={sorgu}
                        onChange={(e) => { setSorgu(e.target.value); setSeciliIndex(0) }}
                        onKeyDown={klavyeYonet}
                        placeholder="Usta ara: isim, unvan ya da teknoloji..."
                        className="flex-1 bg-transparent py-4 text-[#F3ECE1] outline-none placeholder:text-[#9FC2BC]/40"
                    />
                    <kbd className="text-[#9FC2BC]/50 text-xs font-mono border border-white/[0.1] rounded px-1.5 py-0.5">ESC</kbd>
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {yukleniyor ? (
                        <p className="text-[#9FC2BC] text-sm px-4 py-6 text-center">Yükleniyor...</p>
                    ) : sonuclar.length === 0 ? (
                        <p className="text-[#9FC2BC] text-sm px-4 py-6 text-center">Eşleşen usta bulunamadı.</p>
                    ) : (
                        sonuclar.map((usta, i) => (
                            <button
                                key={usta.id}
                                onClick={() => secilenSonuc(usta)}
                                onMouseEnter={() => setSeciliIndex(i)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ${i === seciliIndex ? "bg-white/[0.06]" : ""}`}
                            >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C97D3C] to-[#E3B776] flex items-center justify-center text-[#0D2626] text-xs font-semibold shrink-0">
                                    {baslangicHarfleri(usta.ad_soyad)}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[#F3ECE1] text-sm font-medium truncate">{usta.ad_soyad || "İsimsiz Usta"}</div>
                                    <div className="text-[#9FC2BC] text-xs truncate">{usta.unvan}</div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.08] text-[#9FC2BC]/50 text-xs">
                    <span className="flex items-center gap-1"><kbd className="border border-white/[0.1] rounded px-1">↑↓</kbd> gezin</span>
                    <span className="flex items-center gap-1"><kbd className="border border-white/[0.1] rounded px-1">↵</kbd> seç</span>
                </div>
            </div>
        </div>
    )
}

export default AramaPaleti
