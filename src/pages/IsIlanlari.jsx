import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import useSayfaBasligi from '../useSayfaBasligi'
import { ucretAraligiGoster, zamanFarki } from '../ustaYardimcilari'

function IlanKarti({ ilan }) {
    const teknolojiler = ilan.gerekli_teknolojiler || []
    const butce = ucretAraligiGoster(ilan.butce_min, ilan.butce_max)

    return (
        <Link
            to={`/is-ilanlari/${ilan.id}`}
            className="block bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 hover:border-[#C97D3C]/40 hover:bg-white/[0.05] transition-all duration-300"
        >
            <div className="flex items-start justify-between gap-3">
                <h3 className="text-[#F3ECE1] font-semibold">{ilan.baslik}</h3>
                {ilan.durum !== 'acik' && (
                    <span className="text-[#9FC2BC] text-xs border border-white/[0.1] px-2 py-0.5 rounded-full shrink-0">
                        {ilan.durum === 'tamamlandi' ? 'Tamamlandı' : 'Kapalı'}
                    </span>
                )}
            </div>
            {ilan.aciklama && (
                <p className="text-[#9FC2BC] text-sm mt-2 line-clamp-2">{ilan.aciklama}</p>
            )}
            {butce && <p className="text-[#E3B776] text-sm font-medium mt-3">{butce.replace(' / saat', '')}</p>}
            {teknolojiler.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                    {teknolojiler.map((t) => (
                        <span key={t} className="text-[#9FC2BC] text-xs bg-white/[0.05] px-2 py-0.5 rounded-full font-mono">{t}</span>
                    ))}
                </div>
            )}
            <p className="text-[#9FC2BC]/50 text-xs mt-4">{zamanFarki(ilan.created_at)}</p>
        </Link>
    )
}

function IsIlanlari() {
    useSayfaBasligi('İş İlanları')
    const [ilanlar, setIlanlar] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)

    useEffect(() => {
        async function ilanlariGetir() {
            const { data, error } = await supabase
                .from('ilanlar')
                .select('*')
                .eq('durum', 'acik')
                .order('created_at', { ascending: false })

            if (!error) setIlanlar(data)
            setYukleniyor(false)
        }
        ilanlariGetir()
    }, [])

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
                    <div>
                        <h1 className="text-[#F3ECE1] text-3xl font-bold">İş İlanları</h1>
                        <p className="text-[#9FC2BC] text-sm mt-1">Açık ilanlara göz at, uygun olanlara teklif ver.</p>
                    </div>
                    <Link
                        to="/ilan-ver"
                        className="bg-[#C97D3C] text-[#0D2626] font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#E3B776] transition-all duration-300"
                    >
                        + İlan Ver
                    </Link>
                </div>

                {yukleniyor ? (
                    <p className="text-[#9FC2BC] text-sm">Yükleniyor...</p>
                ) : ilanlar.length === 0 ? (
                    <p className="text-[#9FC2BC] text-sm">Şu an açık ilan yok. İlk ilanı sen ver!</p>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-5">
                        {ilanlar.map((ilan) => (
                            <IlanKarti key={ilan.id} ilan={ilan} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default IsIlanlari
