import { Suspense, useEffect, useRef, useState } from 'react'
import { View, PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import KodYazanRobot from './atolye/KodYazanRobot'
import AtolyeIsigi from './atolye/AtolyeIsigi'
import { Sahne, SatirBaslik } from './uzay/Hareket'

const ASAMALAR = [
    {
        damga: 'Tarif',
        baslik: 'İşini tarif et',
        metin: 'Ne yaptırmak istediğini kısaca anlat: bir site, bir uygulama, bir entegrasyon. İlan açmak ücretsiz.',
    },
    {
        damga: 'Teklif',
        baslik: 'Teklif al, ustanı seç',
        metin: 'Doğrulanmış yazılımcılardan teklif gelir. Portföylerine, kıdemlerine ve önceki işlerine bakıp kararını ver.',
    },
    {
        damga: 'Teslim',
        baslik: 'Teslim al, kıdeme işlensin',
        metin: 'İş tamamlanınca onaylarsın; her tamamlanan iş ustanın kıdemine işlenir. Emanet ödeme sistemi yakında.',
    },
]

function hareketAzaltilsinMi() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Aşama numarası: robotun o aşamada yazdığı ekranla aynı anda değişir
function AsamaNumarasi({ aktif, gecti, sira }) {
    return (
        <span
            aria-hidden
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[13px] font-medium transition-colors duration-500 ${aktif ? 'border-white bg-white text-black' : gecti ? 'border-mor/60 text-mor-soluk' : 'border-white/[0.12] text-white/40'}`}
        >
            {sira + 1}
        </span>
    )
}

// Kamera: her karede görünümün oranına göre sahneyi sığdırır.
// Geniş ekranda konu solda (metin sağda), dikey ekranda üstte (metin altta) durur.
// Konunun dünya koordinatlarındaki kutusu: robot, masa, kupa ve ekran.
const KONU = { x: 0.58, y: 0.28, g: 3.1, y2: 1.86 }
const YON = new THREE.Vector3(0.2, 0.24, 1).normalize()

function UyumluKamera() {
    const kamera = useRef()
    const hedef = useRef(new THREE.Vector3())
    const konum = useRef(new THREE.Vector3())
    const ilk = useRef(true)

    useFrame(({ pointer }, dt) => {
        const c = kamera.current
        if (!c) return
        const a = c.aspect || 1
        const t = Math.tan(THREE.MathUtils.degToRad(c.fov / 2))
        let uzaklik
        let hx = KONU.x
        let hy = KONU.y
        if (a >= 1.15) {
            // Konu genişliğin %58'inde, sol tarafta
            const pay = 0.58
            uzaklik = Math.max(KONU.g / pay / 2 / (t * a), KONU.y2 / 0.86 / 2 / t)
            hx = KONU.x + (0.5 - pay / 2) * 2 * uzaklik * t * a
        } else {
            // Konu yüksekliğin %54'ünde, üst tarafta
            const pay = 0.54
            uzaklik = Math.max(KONU.y2 / pay / 2 / t, KONU.g / 0.94 / 2 / (t * a))
            hy = KONU.y - (0.5 - pay / 2) * 2 * uzaklik * t
        }
        hedef.current.set(hx, hy, 0.2)
        konum.current.copy(hedef.current).addScaledVector(YON, uzaklik)
        // Fareye hafif paralaks
        konum.current.x += pointer.x * 0.35
        konum.current.y += pointer.y * 0.18
        if (ilk.current) {
            c.position.copy(konum.current)
            ilk.current = false
        } else {
            c.position.lerp(konum.current, Math.min(1, dt * 3))
        }
        c.lookAt(hedef.current)
    })

    return <PerspectiveCamera ref={kamera} makeDefault fov={28} near={0.1} far={40} />
}

// Süreç: robot, kaydırdıkça her aşamanın kodunu yazar
function Surec() {
    const bolum = useRef(null)
    const asamaRef = useRef(0)
    const gorunurRef = useRef(false)
    const [asama, setAsama] = useState(0)
    const [azalt] = useState(hareketAzaltilsinMi)

    useEffect(() => {
        if (azalt) return
        let kare = 0
        function olc() {
            kare = 0
            const el = bolum.current
            if (!el) return
            const r = el.getBoundingClientRect()
            const k = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)))
            const yeni = k < 0.34 ? 0 : k < 0.67 ? 1 : 2
            asamaRef.current = yeni
            setAsama(yeni)
        }
        function istek() {
            if (!kare) kare = requestAnimationFrame(olc)
        }
        olc()
        window.addEventListener('scroll', istek, { passive: true })
        window.addEventListener('resize', istek)
        return () => {
            window.removeEventListener('scroll', istek)
            window.removeEventListener('resize', istek)
            cancelAnimationFrame(kare)
        }
    }, [azalt])

    // Robot yalnızca bölüm ekrandayken çalışır
    useEffect(() => {
        const el = bolum.current
        if (!el) return
        const g = new IntersectionObserver(([e]) => (gorunurRef.current = e.isIntersecting))
        g.observe(el)
        return () => g.disconnect()
    }, [])

    // Hareket azaltılmışsa aşamalar tıklanarak gezilir
    function sec(i) {
        if (!azalt) return
        asamaRef.current = i
        setAsama(i)
    }

    return (
        <section id="surec" ref={bolum} className={`relative ${azalt ? '' : 'h-[320svh]'}`} style={{ zIndex: 6 }}>
            <div data-3d className={`${azalt ? 'h-svh' : 'sticky top-0 h-svh'} relative overflow-hidden`}>
                {/* Tam ekran 3D sahne */}
                <View aria-label="Klavyede kod yazan beyaz bir robot ve yanında yazdığı kodu gösteren ekran" className="absolute inset-0">
                    <UyumluKamera />
                    <AtolyeIsigi />
                    <Suspense fallback={null}>
                        <KodYazanRobot asamaRef={asamaRef} gorunurRef={gorunurRef} />
                    </Suspense>
                </View>

                {/* Metnin arkasındaki karartma: masaüstünde sağdan, mobilde alttan */}
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.75)_32%,transparent_55%)] lg:bg-[linear-gradient(to_left,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.55)_30%,transparent_52%)]" />
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black to-transparent" />
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent" />

                <span className="uz-etiket pointer-events-none absolute left-5 top-20 sm:left-8 lg:top-24">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mor-acik motion-reduce:animate-none" />
                    Usta yazıyor
                </span>

                <Sahne className="absolute inset-x-0 bottom-0 px-5 pb-8 sm:px-8 lg:inset-x-auto lg:bottom-auto lg:right-[5vw] lg:top-1/2 lg:w-[min(460px,34vw)] lg:-translate-y-1/2 lg:p-0">
                    <SatirBaslik
                        satirlar={['Sen tarif et,', 'usta yazsın.']}
                        className="font-pjs text-[clamp(2rem,4vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.025em] text-white"
                    />
                    <p className="uz-sub mt-4 hidden max-w-[40ch] text-[16px] font-light leading-[1.6] text-gri sm:block" style={{ '--d': '0.2s' }}>
                        Aşağı kaydırdıkça işin üç adımını izle; ekrandaki her satır, sürecin bir parçası.
                    </p>

                    <ol className="mt-5 lg:mt-8">
                        {ASAMALAR.map((a, i) => {
                            const aktif = i === asama
                            const gecti = i < asama
                            return (
                                <li
                                    key={a.damga}
                                    aria-current={aktif ? 'step' : undefined}
                                    className="uz-kalk border-t border-white/[0.08]"
                                    style={{ '--d': `${0.3 + i * 0.08}s` }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => sec(i)}
                                        tabIndex={azalt ? 0 : -1}
                                        className={`grid w-full grid-cols-[auto_1fr] items-start gap-x-4 py-3 text-left lg:gap-x-5 lg:py-4 ${azalt ? 'cursor-pointer' : 'cursor-default'}`}
                                    >
                                        <AsamaNumarasi aktif={aktif} gecti={gecti} sira={i} />
                                        <div className="transition-opacity duration-500" style={{ opacity: aktif ? 1 : gecti ? 0.55 : 0.38 }}>
                                            <h3 className="text-[17px] font-medium tracking-[-0.01em] text-white lg:text-[19px]">{a.baslik}</h3>
                                            <div
                                                className="grid transition-[grid-template-rows,opacity] duration-500 ease-(--ease-cekic)"
                                                style={{ gridTemplateRows: aktif ? '1fr' : '0fr', opacity: aktif ? 1 : 0 }}
                                            >
                                                <p className="overflow-hidden pt-1.5 text-[14.5px] font-light leading-relaxed text-gri lg:text-[15px]">{a.metin}</p>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            )
                        })}
                    </ol>
                </Sahne>
            </div>
        </section>
    )
}

export default Surec
