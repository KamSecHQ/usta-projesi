import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function AdminPanel() {
    const [basvurular, setBasvurular] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)

    useEffect(() => {
        async function veriGetir() {
            const { data, error } = await supabase
                .from('basvurular')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Hata:', error)
            } else {
                setBasvurular(data)
            }
            setYukleniyor(false)
        }
        veriGetir()
    }, [])

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1]">
                    ← Anasayfaya dön
                </Link>
                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-6 mb-8">
                    Başvurular ({basvurular.length})
                </h1>

                {yukleniyor ? (
                    <p className="text-[#9FC2BC]">Yükleniyor...</p>
                ) : basvurular.length === 0 ? (
                    <p className="text-[#9FC2BC]">Henüz başvuru yok.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {basvurular.map((b) => (
                            <div
                                key={b.id}
                                className="bg-[#123434] border border-[#21504E] rounded p-5"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[#F3ECE1] font-semibold">{b.ad}</span>
                                    <span
                                        className={`text-xs font-mono px-2 py-1 rounded ${b.tip === 'yazilimci'
                                                ? 'text-[#5FA8D3] border border-[#5FA8D3]'
                                                : 'text-[#C97D3C] border border-[#C97D3C]'
                                            }`}
                                    >
                                        {b.tip === 'yazilimci' ? 'YAZILIMCI' : 'İŞ VEREN'}
                                    </span>
                                </div>
                                <p className="text-[#9FC2BC] text-sm">{b.email}</p>
                                <p className="text-[#9FC2BC] text-sm mt-1">{b.uzmanlik}</p>
                                <p className="text-[#9FC2BC]/50 text-xs mt-2 font-mono">
                                    {new Date(b.created_at).toLocaleString('tr-TR')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminPanel
