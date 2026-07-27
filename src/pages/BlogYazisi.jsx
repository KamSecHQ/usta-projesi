import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import useSayfaBasligi from '../useSayfaBasligi'
import { zamanFarki } from '../ustaYardimcilari'

function BlogYazisi() {
    const { slug } = useParams()
    const [yazi, setYazi] = useState(null)
    const [yukleniyor, setYukleniyor] = useState(true)
    const [bulunamadi, setBulunamadi] = useState(false)
    useSayfaBasligi(yazi ? yazi.baslik : "Blog")

    useEffect(() => {
        async function veriGetir() {
            const { data, error } = await supabase
                .from('blog_yazilari')
                .select('*')
                .eq('slug', slug)
                .eq('yayinlandi', true)
                .single()

            if (error || !data) {
                setBulunamadi(true)
            } else {
                setYazi(data)
            }
            setYukleniyor(false)
        }
        veriGetir()
    }, [slug])

    if (yukleniyor) {
        return <div className="min-h-screen bg-[#0D2626] flex items-center justify-center text-[#9FC2BC]">Yükleniyor...</div>
    }

    if (bulunamadi) {
        return (
            <div className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-[#F3ECE1] text-2xl font-bold mb-3">Yazı bulunamadı</h1>
                <Link to="/blog" className="text-[#C97D3C] hover:underline">← Blog'a dön</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-2xl mx-auto">
                <Link to="/blog" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                    ← Blog'a dön
                </Link>

                {yazi.kapak_gorseli_url && (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/[0.08] mt-6 mb-8">
                        <img
                            src={yazi.kapak_gorseli_url}
                            alt={yazi.baslik}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                    </div>
                )}

                {yazi.kategori && (
                    <span className="text-[#C97D3C] text-xs font-mono uppercase tracking-wider">{yazi.kategori}</span>
                )}
                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-2">{yazi.baslik}</h1>
                <p className="text-[#9FC2BC]/50 text-xs mt-2">{zamanFarki(yazi.created_at)}</p>

                <div className="h-px bg-white/[0.08] my-8" />

                <div className="text-[#9FC2BC] leading-relaxed whitespace-pre-line">
                    {yazi.icerik}
                </div>
            </div>
        </div>
    )
}

export default BlogYazisi
