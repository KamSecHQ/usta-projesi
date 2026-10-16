import { baslangicHarfleri } from '../../mesajlasma'

// Baş harfli mor avatar; çevrimiçiyse sağ altta yeşil nabız.
function Avatar({ profil, boyut = 44, cevrimici = false, className = '' }) {
    const yaziBoyu = boyut >= 64 ? 'text-lg' : boyut >= 40 ? 'text-[13px]' : 'text-[11px]'
    return (
        <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: boyut, height: boyut }}>
            {profil?.avatar_url ? (
                <img src={profil.avatar_url} alt="" className="w-full h-full rounded-full object-cover border border-white/[0.1]" />
            ) : (
                <span className={`msj-avatar w-full h-full rounded-full flex items-center justify-center font-bold text-[#0A0414] ${yaziBoyu}`}>
                    {baslangicHarfleri(profil?.ad_soyad)}
                </span>
            )}
            {cevrimici && (
                <span
                    className="msj-cevrimici absolute bottom-0 right-0 rounded-full bg-[#4ADE80] ring-2 ring-black"
                    style={{ width: Math.max(9, boyut * 0.24), height: Math.max(9, boyut * 0.24) }}
                    aria-label="Çevrimiçi"
                />
            )}
        </span>
    )
}

export default Avatar
