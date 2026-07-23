import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

function useSayac(hedef, sureMs = 1200) {
    const [deger, setDeger] = useState(0)
    const baslatildi = useRef(false)

    useEffect(() => {
        if (baslatildi.current || hedef === null) return
        baslatildi.current = true
        const baslangic = performance.now()

        function adim(simdi) {
            const ilerleme = Math.min((simdi - baslangic) / sureMs, 1)
            const kolayGecis = 1 - Math.pow(1 - ilerleme, 3)
            setDeger(Math.round(kolayGecis * hedef))
            if (ilerleme < 1) requestAnimationFrame(adim)
        }
        requestAnimationFrame(adim)
    }, [hedef, sureMs])

    return deger
}

function IstatistikKutu({ hedef, etiket }) {
    const deger = useSayac(hedef)
    return (
        <div className="text-center">
            <div className="text-[#F3ECE1] text-4xl md:text-5xl font-bold tabular-nums">
                {hedef === null ? "—" : deger}
                <span className="text-[#C97D3C]">+</span>
            </div>
            <div className="text-[#9FC2BC] text-sm mt-2">{etiket}</div>
        </div>
    )
}

function Istatistikler() {
    const [veriler, setVeriler] = useState({
        yazilimci: null,
        isVeren: null,
        proje: null,
    })

    useEffect(() => {
        async function sayilariGetir() {
            const [yazilimciSonuc, isVerenSonuc, projeSonuc] = await Promise.all([
                supabase.from('profiller').select('*', { count: 'exact', head: true }).eq('rol', 'yazilimci'),
                supabase.from('profiller').select('*', { count: 'exact', head: true }).eq('rol', 'is-veren'),
                supabase.from('projeler').select('*', { count: 'exact', head: true }),
            ])

            setVeriler({
                yazilimci: yazilimciSonuc.count ?? 0,
                isVeren: isVerenSonuc.count ?? 0,
                proje: projeSonuc.count ?? 0,
            })
        }
        sayilariGetir()
    }, [])

    return (
        <section className="relative bg-[#0D2626] py-16 px-6 border-y border-white/[0.06]">
            <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6">
                <IstatistikKutu hedef={veriler.yazilimci} etiket="Kayıtlı Yazılımcı" />
                <IstatistikKutu hedef={veriler.isVeren} etiket="Kayıtlı İş Veren" />
                <IstatistikKutu hedef={veriler.proje} etiket="Portföy Projesi" />
            </div>
        </section>
    )
}

export default Istatistikler
