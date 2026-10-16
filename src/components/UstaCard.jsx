import { musaitlikBilgisi, ucretAraligiGoster, cevrimiciMi } from '../ustaYardimcilari'
import FavoriButonu from './FavoriButonu'

function UstaCard({ id, initials, name, role, desc, tags, onayli, musaitlik, sonGorulme, ucretMin, ucretMax }) {
    const etiketler = tags || []
    const musBilgi = musaitlikBilgisi(musaitlik)
    const ucret = ucretAraligiGoster(ucretMin, ucretMax)
    const cevrimici = cevrimiciMi(sonGorulme)

    return (
        <div className="isik-kutu bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 relative hover:border-[#8B5CF6]/40 hover:bg-white/[0.05] transition-all duration-300">
            {onayli && (
                <div className="absolute top-5 right-5 w-12 h-12 rounded-full border border-dashed border-[#8B5CF6]/60 flex items-center justify-center text-[#A78BFA] text-[9px] text-center -rotate-12 font-mono leading-tight">
                    ONAYLI<br />USTA
                </div>
            )}
            <div className={`flex items-start justify-between gap-2 mb-4 ${onayli ? "pr-14" : ""}`}>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] flex items-center justify-center text-[#050505] font-bold">
                            {initials}
                        </div>
                        <span
                            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#000000]"
                            style={{ backgroundColor: musBilgi.renk }}
                            title={musBilgi.etiket}
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="text-[#FFFFFF] font-semibold truncate">{name}</div>
                        <div className="text-[#A1A1AA] text-sm truncate">{role}</div>
                    </div>
                </div>
                {id && <FavoriButonu ustaId={id} boyut="kucuk" />}
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-3">
                <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ color: musBilgi.renk, backgroundColor: `${musBilgi.renk}1A` }}
                >
                    {musBilgi.etiket}
                </span>
                {cevrimici && (
                    <span className="flex items-center gap-1 text-[#4ADE80] text-[10px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                        Aktif
                    </span>
                )}
            </div>

            <p className="text-[#A1A1AA] text-sm mb-3 line-clamp-2">{desc}</p>

            {ucret && (
                <p className="text-[#C4B5FD] text-xs font-medium mb-3">{ucret}</p>
            )}

            <div className="flex gap-2 flex-wrap">
                {etiketler.map((tag) => (
                    <span key={tag} className="text-[#A1A1AA] text-xs border border-white/[0.1] px-2 py-1 rounded-full font-mono">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default UstaCard
