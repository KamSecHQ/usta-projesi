import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'

function AdminPanel() {
    const { user, yukleniyor: authYukleniyor } = useAuth()
    const [basvurular, setBasvurular] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)
    const [filtre, setFiltre] = useState('tumu')

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

    useEffect(() => {
        if (!authYukleniyor && !user) {
            window.location.href = '/giris'
        }
    }, [user, authYukleniyor])

    if (authYukleniyor) {
        return <div className="min-h-screen bg-[#0D2626] flex items-center justify-center text-[#9FC2BC]">Yükleniyor...</div>
    }

    if (!user) {
        return null
    }

    const gosterilecekler = filtre === 'tumu'
        ? basvurular
        : basvurular.filter((b) => b.tip === filtre)

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1]">
                    ← Anasayfaya dön
                </Link>
                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-6 mb-8">
                    Başvurular ({basvurular.length})
                </h1>

                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setFiltre('tumu')}
                        className={`text-sm px-4 py-2 rounded font-mono ${filtre === 'tumu' ? 'bg-[#C97D3C] text-[#0D2626]' : 'border border-[#21504E] text-[#9FC2BC]'
                            }`}
                    >
                        Tümü ({basvurular.length})
                    </button>
                    <button
                        onClick={() => setFiltre('yazilimci')}
                        className={`text-sm px-4 py-2 rounded font-mono ${filtre === 'yazilimci' ? 'bg-[#5FA8D3] text-[#0D2626]' : 'border border-[#21504E] text-[#9FC2BC]'
                            }`}
                    >
                        Yazılımcılar ({basvurular.filter((b) => b.tip === 'yazilimci').length})
                    </button>
                    <button
                        onClick={() => setFiltre('is-veren')}
                        className={`text-sm px-4 py-2 rounded font-mono ${filtre === 'is-veren' ? 'bg-[#C97D3C] text-[#0D2626]' : 'border border-[#21504E] text-[#9FC2BC]'
                            }`}
                    >
                        İş Verenler ({basvurular.filter((b) => b.tip === 'is-veren').length})
                    </button>
                </div>

                {yukleniyor ? (
                    <p className="text-[#9FC2BC]">Yükleniyor...</p>
                ) : gosterilecekler.length === 0 ? (
                    <p className="text-[#9FC2BC]">Bu kategoride başvuru yok.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {gosterilecekler.map((b) => (
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
