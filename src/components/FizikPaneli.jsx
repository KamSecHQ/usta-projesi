import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import HataSiniri from './hareket/HataSiniri'
import { Sahne, SatirBaslik } from './uzay/Hareket'

const FizikSahnesi = lazy(() => import('./atolye/FizikSahnesi'))

// Fizik oyun alanı: tam ekran; başlık sahnenin üstünde süzülür
function FizikPaneli() {
    const panel = useRef(null)
    const metin = useRef(null)
    // Yazının alt kenarı / panel yüksekliği: sahne parçaları bu çizginin altında tutar
    const metinAltOrani = useRef(0.42)
    // Panel ekranda değilken fizik ve çizim tamamen durur
    const [aktif, setAktif] = useState(false)
    useEffect(() => {
        const p = panel.current
        const m = metin.current
        if (!p || !m) return
        const olc = () => {
            if (p.clientHeight) metinAltOrani.current = (m.offsetTop + m.offsetHeight) / p.clientHeight
        }
        olc()
        const g = new ResizeObserver(olc)
        g.observe(p)
        g.observe(m)
        return () => g.disconnect()
    }, [])
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
                        <FizikSahnesi olayKaynagi={panel} aktif={aktif} metinAltOrani={metinAltOrani} />
                    </Suspense>
                </HataSiniri>

                {/* Kenarlarda siyaha erime: sahne sayfanın içine akar */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-56 bg-gradient-to-b from-black via-black/70 to-transparent" />
                {/* Yazının arkasında yumuşak gölge: savrulan bir parça geçse de yazı okunur kalır */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[56%] bg-[radial-gradient(ellipse_52%_62%_at_50%_34%,rgba(0,0,0,0.72),transparent_76%)]" />
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-black to-transparent" />

                <div ref={metin} className="pointer-events-none absolute inset-x-0 top-0 z-20 px-5 pt-24 text-center sm:pt-28">
                    <SatirBaslik
                        satirlar={['Atölyenin parçaları,', 'kodun sembolleri.']}
                        className="font-pjs text-[clamp(2.4rem,5.6vw,4.8rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white"
                    />
                    <p className="uz-sub mx-auto mt-5 max-w-[40ch] text-balance text-[17px] font-light leading-[1.6] text-[#D4D4D8] [text-shadow:0_2px_18px_rgba(0,0,0,0.95)]" style={{ '--d': '0.25s' }}>
                        Kalfahane'de iki dünya buluşuyor: esnafın tezgâhı ve yazılımcının editörü.
                    </p>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 p-5 text-[13px] text-gri sm:p-8">
                    <span className="hidden pointer-fine:inline">İmleçle it, tıklayıp dağıt.</span>
                    <span className="pointer-fine:hidden">Dokun, parçaları dağıt.</span>
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
