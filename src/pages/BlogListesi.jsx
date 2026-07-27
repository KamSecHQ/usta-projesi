import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import useSayfaBasligi from '../useSayfaBasligi'
import { zamanFarki } from '../ustaYardimcilari'

function YaziKarti({ yazi }) {
    return (
        <Link
            to={`/blog/${yazi.slug}`}
            className="block bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden hover:border-[#C97D3C]/40 hover:bg-white/[0.05] transition-all duration-300"
        >
            {yazi.kapak_gorseli_url && (
                <div className="aspect-video w-full overflow-hidden bg-white/[0.03]">
                    <img
                        src={yazi.kapak_gorseli_url}
                        alt={yazi.baslik}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                </div>
            )}
            <div className="p-5">
                {yazi.kategori && (
                    <span className="text-[#C97D3C] text-xs font-mono uppercase tracking-wider">{yazi.kategori}</span>
                )}
                <h3 className="text-[#F3ECE1] font-semibold mt-1.5">{yazi.baslik}</h3>
                {yazi.ozet && <p className="text-[#9FC2BC] text-sm mt-2 line-clamp-2">{yazi.ozet}</p>}
                <p className="text-[#9FC2BC]/50 text-xs mt-4">{zamanFarki(yazi.created_at)}</p>
            </div>
        </Link>
    )
}

function BlogListesi() {
    useSayfaBasligi('Blog')
    const [yazilar, setYazilar] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)

    useEffect(() => {
        async function veriGetir() {
            const { data, error } = await supabase
                .from('blog_yazilari')
                .select('*')
                .eq('yayinlandi', true)
                .order('created_at', { ascending: false })

            if (!error) setYazilar(data)
            setYukleniyor(false)
        }
        veriGetir()
    }, [])

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-[#F3ECE1] text-3xl font-bold">Blog</h1>
                <p className="text-[#9FC2BC] text-sm mt-1 mb-10">Yazılım pazarı, ekip yönetimi ve platformdan haberler.</p>

                {yukleniyor ? (
                    <p className="text-[#9FC2BC] text-sm">Yükleniyor...</p>
                ) : yazilar.length === 0 ? (
                    <p className="text-[#9FC2BC] text-sm">Henüz yazı yayınlanmadı.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-5">
                        {yazilar.map((yazi) => (
                            <YaziKarti key={yazi.id} yazi={yazi} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BlogListesi
