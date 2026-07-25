import { Link } from 'react-router-dom'
import { dilRengi, zamanFarki } from '../ustaYardimcilari'

function ProjeKarti({ proje, aksiyon }) {
    const teknolojiler = proje.teknolojiler || []
    const anaTeknoloji = teknolojiler[0]

    return (
        <div className="group bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden hover:border-[#C97D3C]/40 hover:bg-white/[0.05] transition-all duration-300">
            <Link to={`/proje/${proje.id}`} className="block">
                {proje.kapak_gorseli_url ? (
                    <div className="aspect-video w-full overflow-hidden bg-white/[0.03]">
                        <img
                            src={proje.kapak_gorseli_url}
                            alt={proje.baslik}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                    </div>
                ) : null}

                <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                                {proje.one_cikan && (
                                    <svg viewBox="0 0 24 24" fill="#C97D3C" className="w-3.5 h-3.5 shrink-0" title="Öne çıkan proje">
                                        <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6l-6.3 4.4L8 13.8l-6-4.4h7.6z" />
                                    </svg>
                                )}
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#9FC2BC] shrink-0">
                                    <path d="M4 4h6l2 2h8v12a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <h3 className="text-[#F3ECE1] font-semibold truncate group-hover:text-[#C97D3C] transition-colors duration-300">
                                    {proje.baslik}
                                </h3>
                            </div>
                            {proje.aciklama && (
                                <p className="text-[#9FC2BC] text-sm mt-1.5 line-clamp-2">{proje.aciklama}</p>
                            )}
                        </div>
                        {proje.link && (
                            <a
                                href={proje.link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0 text-[#9FC2BC] hover:text-[#C97D3C] transition-colors duration-300"
                                aria-label="Canlı projeyi görüntüle"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                                    <path d="M14 4h6v6M20 4l-9 9M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h14a1 1 0 001-1v-4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                        )}
                    </div>

                    {teknolojiler.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-3">
                            {teknolojiler.map((t) => (
                                <span key={t} className="text-[#9FC2BC] text-xs bg-white/[0.05] px-2 py-0.5 rounded-full font-mono">
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-4 mt-4 text-[#9FC2BC]/70 text-xs">
                        {anaTeknoloji && (
                            <span className="flex items-center gap-1.5">
                                <span
                                    className="w-2.5 h-2.5 rounded-full inline-block"
                                    style={{ backgroundColor: dilRengi(anaTeknoloji) }}
                                />
                                {anaTeknoloji}
                            </span>
                        )}
                        {proje.created_at && <span>Güncellendi: {zamanFarki(proje.created_at)}</span>}
                    </div>
                </div>
            </Link>

            {aksiyon && (
                <div className="px-5 pb-4 pt-3 border-t border-white/[0.06]">
                    {aksiyon}
                </div>
            )}
        </div>
    )
}

export default ProjeKarti
