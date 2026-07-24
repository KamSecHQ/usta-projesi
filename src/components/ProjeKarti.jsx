const DIL_RENKLERI = {
    javascript: '#F1E05A', typescript: '#3178C6', react: '#61DAFB',
    'react.js': '#61DAFB', 'react native': '#61DAFB', node: '#3C873A',
    'node.js': '#3C873A', python: '#3572A5', php: '#4F5D95',
    java: '#B07219', css: '#563D7C', html: '#E34C26',
    vue: '#41B883', 'vue.js': '#41B883', go: '#00ADD8', golang: '#00ADD8',
    ruby: '#701516', 'c#': '#178600', swift: '#FFAC45', kotlin: '#A97BFF',
    rust: '#DEA584', postgresql: '#336791', sql: '#336791', mongodb: '#4DB33D',
    tailwind: '#38BDF8', 'tailwind css': '#38BDF8', 'next.js': '#F3ECE1',
    next: '#F3ECE1', docker: '#2496ED', aws: '#FF9900', flutter: '#02569B',
    supabase: '#3ECF8E', firebase: '#FFCA28',
}

function dilRengi(isim) {
    const anahtar = (isim || '').toLowerCase().trim()
    if (DIL_RENKLERI[anahtar]) return DIL_RENKLERI[anahtar]
    let hash = 0
    for (let i = 0; i < anahtar.length; i++) hash = anahtar.charCodeAt(i) + ((hash << 5) - hash)
    return `hsl(${Math.abs(hash) % 360}, 55%, 55%)`
}

function zamanFarki(tarihStr) {
    if (!tarihStr) return ""
    const farkMs = new Date() - new Date(tarihStr)
    const gun = Math.floor(farkMs / (1000 * 60 * 60 * 24))
    if (gun <= 0) return "bugün"
    if (gun === 1) return "dün"
    if (gun < 30) return `${gun} gün önce`
    const ay = Math.floor(gun / 30)
    if (ay < 12) return `${ay} ay önce`
    return `${Math.floor(ay / 12)} yıl önce`
}

function ProjeKarti({ proje, aksiyon }) {
    const teknolojiler = proje.teknolojiler || []
    const anaTeknoloji = teknolojiler[0]

    return (
        <div className="group bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-5 hover:border-[#C97D3C]/40 hover:bg-white/[0.05] transition-all duration-300">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
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
                        className="shrink-0 text-[#9FC2BC] hover:text-[#C97D3C] transition-colors duration-300"
                        aria-label="Projeyi görüntüle"
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

            {aksiyon && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    {aksiyon}
                </div>
            )}
        </div>
    )
}

export default ProjeKarti
