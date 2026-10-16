import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import HataSiniri from './hareket/HataSiniri'
import { Sahne, SatirBaslik } from './uzay/Hareket'

const FizikSahnesi = lazy(() => import('./atolye/FizikSahnesi'))

// Fizik oyun alanı: tam ekran; başlık sahnenin üstünde süzülür
function FizikPaneli() {
    const panel = useRef(null)
    // Panel ekranda değilken fizik ve çizim tamamen durur
    const [aktif, setAktif] = useState(false)
    useEffect(() => {
        const el = panel.current
        if (!el) return
        const g = new IntersectionObserver(([e]) => setAktif(e.isIntersecting), { threshold: 0.05 })
        g.observe(el)
        return () => g.disconnect()
    }, [])

    return (
        <Sahne as="section" className="relative">
            <div ref={panel} className="relative h-svh min-h-[560px] w-full touch-pan-y overflow-hidden bg-[#06060A]">
                <HataSiniri>
                    <Suspense fallback={null}>
                        <FizikSahnesi olayKaynagi={panel} aktif={aktif} />
                    </Suspense>
                </HataSiniri>

                {/* Kenarlarda siyaha erime: sahne sayfanın içine akar */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-56 bg-gradient-to-b from-black via-black/70 to-transparent" />
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-black to-transparent" />

                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-5 pt-24 text-center sm:pt-28">
                    <SatirBaslik
                        satirlar={['Atölyenin parçaları,', 'kodun sembolleri.']}
                        className="font-pjs text-[clamp(2.4rem,5.6vw,4.8rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white"
                    />
                    <p className="uz-sub mx-auto mt-5 max-w-[46ch] text-[17px] font-light leading-[1.6] text-gri" style={{ '--d': '0.25s' }}>
                        Kalfahane'de iki dünya buluşuyor: esnafın tezgâhı ve yazılımcının editörü. Dokun, it, dağıt.
                    </p>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 p-5 text-[13px] text-white/60 sm:p-8">
                    <span>İmleçle it, tıklayıp dağıt.</span>
                    <span className="hidden items-center gap-2 sm:flex">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mor-acik motion-reduce:animate-none" />
                        Fizik motoru canlı
                    </span>
                </div>
            </div>
        </Sahne>
    )
}

export default FizikPaneli
