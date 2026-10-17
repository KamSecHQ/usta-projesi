import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './uzay.css'

// Bir öğe ekrana girdiğinde bir kez true döner
function useGorunur(esik = 0.18) {
    const ref = useRef(null)
    const [gorunur, setGorunur] = useState(false)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const g = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setGorunur(true)
                    g.disconnect()
                }
            },
            { threshold: esik }
        )
        g.observe(el)
        return () => g.disconnect()
    }, [esik])
    return [ref, gorunur]
}

// Sahne: içindeki oyuncular (.uz-ln-i, .uz-sub, .uz-otur, .uz-kalk) ekrana girince yerine oturur
export function Sahne({ as: Etiket = 'div', className = '', children, esik, ...kalan }) {
    const [ref, gorunur] = useGorunur(esik)
    return (
        <Etiket ref={ref} className={`${className} ${gorunur ? 'uz-go' : ''}`} {...kalan}>
            {children}
        </Etiket>
    )
}

// Satır satır yükselen başlık; her satır kendi maskesinin altından çıkar
export function SatirBaslik({ satirlar, as: Etiket = 'h2', className = '', gecikme = 0 }) {
    return (
        <Etiket className={className}>
            {satirlar.map((s, i) => (
                <span key={i} className="uz-ln">
                    <span className="uz-ln-i" style={{ '--d': `${gecikme + i * 0.1}s` }}>
                        {s}
                    </span>
                </span>
            ))}
        </Etiket>
    )
}

export function Ok() {
    return (
        <svg className="arw" viewBox="0 0 12 10" fill="none" aria-hidden="true">
            <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

// Hero'daki hap düğmenin aynısı: beyaz (birincil) ya da saydam ışıklı cam
export function HapLink({ to, tur = 'birincil', className = '', gecikme, children, ...kalan }) {
    return (
        <Link
            to={to}
            className={`uz-hap isik-hap ${tur === 'cam' ? '' : 'isik-hap-birincil'} ${className}`}
            style={gecikme !== undefined ? { '--d': `${gecikme}s` } : undefined}
            {...kalan}
        >
            {children} <Ok />
        </Link>
    )
}
