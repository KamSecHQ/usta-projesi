import { useEffect, useRef, useState } from 'react'
import { Sahne, SatirBaslik } from './uzay/Hareket'
import { View, PerspectiveCamera } from '@react-three/drei'
import Sikke from './atolye/Sikke'
import AtolyeIsigi from './atolye/AtolyeIsigi'
import Isitici from './atolye/Isitici'

// Eşikler ustaYardimcilari.js içindeki gerçek kıdem sistemiyle birebir aynı
const RUTBELER = [
    { etiket: 'Çırak', esik: 0, aciklama: 'Profilini aç, ilk işini al. Henüz tamamlanmış iş yok.', renk: '#D9DCD6', maden: 'kalay' },
    { etiket: 'Kalfa', esik: 1, aciklama: 'İlk tamamlanan ve onaylanan işle gelir.', renk: '#E8A25E', maden: 'kizgin' },
    { etiket: 'Usta', esik: 3, aciklama: 'Üç tamamlanan işte dövülür.', renk: '#C97D3C', maden: 'bakir' },
    { etiket: 'Kıdemli Usta', esik: 10, aciklama: 'On ve üzeri tamamlanan iş; çarşının en kıdemlisi.', renk: '#EFE3CC', maden: 'muhur' },
]

function hareketAzaltilsinMi() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Her rütbe, darphaneden düşüp tezgâha oturan 3D bir sikke
function SikkeGorunumu({ r, gorunur, gecikme }) {
    const [azalt] = useState(hareketAzaltilsinMi)
    return (
        <View aria-label={`${r.etiket} kıdem sikkesi`} className="h-28 w-28 shrink-0 sm:h-36 sm:w-36">
            <PerspectiveCamera makeDefault position={[0, 0, 4.4]} fov={30} />
            <AtolyeIsigi />
            <directionalLight position={[1.5, 2, 4]} intensity={2.2} color="#FFE6CC" />
            <Sikke
                rakam={r.esik >= 10 ? '10+' : String(r.esik)}
                maden={r.maden}
                gorunur={gorunur}
                gecikme={gecikme}
                azalt={azalt}
            />
            <Isitici />
        </View>
    )
}

function KidemCetveli() {
    const kutu = useRef(null)
    const [gorunur, setGorunur] = useState(false)

    useEffect(() => {
        const el = kutu.current
        if (!el) return
        const g = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setGorunur(true)
                    g.disconnect()
                }
            },
            { threshold: 0.35 }
        )
        g.observe(el)
        return () => g.disconnect()
    }, [])

    return (
        <Sahne as="section" id="kidem" className="uz-ufuk overflow-hidden px-4 py-28 sm:px-8 lg:py-36">
            <div className="mx-auto max-w-[1100px] text-center">
                <SatirBaslik
                    satirlar={['Kıdem satın alınmaz,', 'dövülür.']}
                    className="font-pjs text-[clamp(2.4rem,5.6vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white"
                />
                <p className="uz-sub mx-auto mt-5 max-w-[50ch] text-[17px] font-light leading-[1.6] text-gri" style={{ '--d': '0.25s' }}>
                    Her profildeki rozet, tamamlanmış ve onaylanmış gerçek işlerden hesaplanır. Reklamla, paketle ya da yorum satın alarak yükselemezsin.
                </p>
            </div>

            <div ref={kutu} className="relative mx-auto mt-20 max-w-[1240px]">
                {/* Işık yayı: rütbeleri birbirine bağlayan, kürenin ışık arklarını hatırlatan çizgi */}
                <div className="relative hidden h-10 md:block" aria-hidden>
                    <div className="absolute inset-x-[12.5%] top-1/2 h-px bg-white/10" />
                    <div
                        className="absolute left-[12.5%] top-1/2 h-px -translate-y-px bg-gradient-to-r from-mor/0 via-mor-acik to-mor-soluk shadow-[0_0_12px_rgba(167,139,250,0.8)] transition-[width] duration-[1800ms] ease-(--ease-cekic)"
                        style={{ width: gorunur ? '75%' : '0%' }}
                    />
                </div>

                <ol data-3d className="grid gap-10 md:mt-2 md:grid-cols-4 md:gap-4">
                    {RUTBELER.map((r, i) => (
                        <li key={r.etiket} className="uz-kalk flex items-center gap-5 md:flex-col md:text-center" style={{ '--d': `${0.3 + i * 0.12}s` }}>
                            <SikkeGorunumu r={r} gorunur={gorunur} gecikme={200 + i * 380} />
                            <div>
                                <div className="text-[22px] font-medium tracking-[-0.015em] text-white">{r.etiket}</div>
                                <p className="mt-1 max-w-[28ch] text-[15px] font-light leading-relaxed text-gri md:mx-auto">
                                    <span className="rakam font-medium text-mor-soluk">{r.esik === 0 ? 'Başlangıç.' : `${r.esik}${r.esik >= 10 ? '+' : ''} iş.`}</span> {r.aciklama}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
                <p className="uz-sub mx-auto mt-16 max-w-[60ch] text-center text-[15px] font-light leading-relaxed text-gri-koyu" style={{ '--d': '0.8s' }}>
                    İş verenler de aynı terazide tartılır: tamamladıkları işlerle Güvenilir ve Kıdemli İş Veren rozeti kazanırlar.
                </p>
            </div>
        </Sahne>
    )
}

export default KidemCetveli
