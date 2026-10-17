import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { HapLink } from './uzay/Hareket'

function useSayac(hedef, basla, sureMs = 1400) {
    const [deger, setDeger] = useState(0)
    useEffect(() => {
        if (hedef === null || !basla) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setDeger(hedef)
            return
        }
        let kare
        const baslangic = performance.now()
        function adim(simdi) {
            const ilerleme = Math.min((simdi - baslangic) / sureMs, 1)
            const kolayGecis = 1 - Math.pow(1 - ilerleme, 4)
            setDeger(Math.round(kolayGecis * hedef))
            if (ilerleme < 1) kare = requestAnimationFrame(adim)
        }
        kare = requestAnimationFrame(adim)
        return () => cancelAnimationFrame(kare)
    }, [hedef, basla, sureMs])
    return deger
}

function Sayi({ hedef, basla }) {
    const deger = useSayac(hedef, basla)
    return (
        <span className="rakam font-medium text-mor-soluk">
            {hedef === null ? '—' : deger}
        </span>
    )
}

// Çarşı küçükken tek haneli sayılar cümleyi zayıflatır: eşiğin altında sayılar gösterilmez,
// çarşının kuruluş hâli anlatılır (sayı uydurulmaz). Eşik aşılınca canlı sayılar cümlesi döner.
const ESIK = { yazilimci: 25, proje: 25 }

// Çarşı defteri: canlı sayılar bir cümlenin içinde okunur
function Istatistikler() {
    const [veriler, setVeriler] = useState({ yazilimci: null, isVeren: null, proje: null })
    const [basla, setBasla] = useState(false)
    const kutu = useRef(null)

    useEffect(() => {
        async function sayilariGetir() {
            const [yazilimciSonuc, isVerenSonuc, projeSonuc] = await Promise.all([
                supabase.from('profiller').select('*', { count: 'exact', head: true }).eq('rol', 'yazilimci'),
                supabase.from('profiller').select('*', { count: 'exact', head: true }).eq('rol', 'is-veren'),
                supabase.from('projeler').select('*', { count: 'exact', head: true }),
            ])
            // Veritabanına ulaşılamazsa yanıltıcı bir 0 yerine boş bırakılır
            if (yazilimciSonuc.error || isVerenSonuc.error || projeSonuc.error) return
            setVeriler({
                yazilimci: yazilimciSonuc.count ?? 0,
                isVeren: isVerenSonuc.count ?? 0,
                proje: projeSonuc.count ?? 0,
            })
        }
        sayilariGetir()
    }, [])

    useEffect(() => {
        const el = kutu.current
        if (!el) return
        const g = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                setBasla(true)
                g.disconnect()
            }
        }, { threshold: 0.4 })
        g.observe(el)
        return () => g.disconnect()
    }, [])

    const kurulus = veriler.yazilimci !== null && (veriler.yazilimci < ESIK.yazilimci || veriler.proje < ESIK.proje)

    // Tek bölüm öğesi: görünürlük gözlemcisi ilk karede bağlanır, içerik veri gelince değişir
    return (
        <section ref={kutu} className={`uz-ufuk px-4 py-28 sm:px-8 lg:py-36 ${basla ? 'uz-go' : ''}`}>
            <div className="mx-auto max-w-[1100px] text-center">
                {kurulus ? (
                    <>
                        <p className="uz-sub mx-auto max-w-[20ch] font-pjs text-[clamp(2rem,4.8vw,3.9rem)] font-medium leading-[1.12] tracking-[-0.025em] text-white text-balance">
                            Çarşı yeni kuruluyor; ilk{'\u00a0'}tezgâhlar <span className="text-mor-soluk">şimdi</span> açılıyor.
                        </p>
                        <p className="uz-sub mx-auto mt-5 max-w-[46ch] text-balance text-[17px] font-light leading-[1.6] text-gri" style={{ '--d': '0.2s' }}>
                            İlk ustalar kıdemlerini burada, ilk işleriyle kuruyor. Tezgâhını erken aç, çarşıyla birlikte büyü.
                        </p>
                        <div className="mt-8 flex justify-center">
                            <HapLink to="/ornek" tur="cam" className="uz-otur" gecikme={0.3}>
                                Bir işin akışını örnekle gör
                            </HapLink>
                        </div>
                    </>
                ) : (
                    <p className="uz-sub mx-auto max-w-[24ch] font-pjs text-[clamp(2rem,4.8vw,3.9rem)] font-medium leading-[1.12] tracking-[-0.025em] text-white text-balance">
                        Çarşıda bugün <Sayi hedef={veriler.yazilimci} basla={basla} /> yazılımcı, <Sayi hedef={veriler.isVeren} basla={basla} /> iş veren ve <Sayi hedef={veriler.proje} basla={basla} /> portföy projesi var.
                    </p>
                )}
                <div className="uz-kalk mt-8 inline-flex" style={{ '--d': '0.4s' }}>
                    <span className="uz-etiket">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mor-acik opacity-60 motion-reduce:animate-none" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-mor-acik" />
                        </span>
                        {kurulus ? 'Erken erişim dönemi' : 'Sayılar canlı veritabanından'}
                    </span>
                </div>
            </div>
        </section>
    )
}

export default Istatistikler
