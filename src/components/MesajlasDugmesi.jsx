import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { konusmaBaslat, teklifKonusmasiAc } from '../mesajlasma'
import Ikon from './mesaj/Ikon'

// Bir teklif, ilan ya da profil üzerinden konuşmayı açar (varsa mevcut olanı).
function MesajlasDugmesi({ teklifId, karsiId, ilanId = null, children = 'Mesajlaş', className = '' }) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [bekliyor, setBekliyor] = useState(false)
    const [hata, setHata] = useState('')

    async function ac() {
        if (!user) {
            navigate('/giris')
            return
        }
        setBekliyor(true)
        setHata('')
        try {
            const id = teklifId ? await teklifKonusmasiAc(teklifId) : await konusmaBaslat(karsiId, ilanId)
            navigate(`/mesajlar/${id}`)
        } catch {
            setHata('Konuşma açılamadı. Tekrar dene.')
            setBekliyor(false)
        }
    }

    return (
        <span className="inline-flex flex-col items-start gap-1">
            <button type="button" onClick={ac} disabled={bekliyor} aria-busy={bekliyor} className={`inline-flex items-center justify-center gap-2 ${className}`}>
                <Ikon ad="mesaj" className="w-4 h-4" />
                {bekliyor ? 'Açılıyor…' : children}
            </button>
            {hata && <span className="text-[11.5px] text-[#FCA5A5]" role="alert">{hata}</span>}
        </span>
    )
}

export default MesajlasDugmesi
