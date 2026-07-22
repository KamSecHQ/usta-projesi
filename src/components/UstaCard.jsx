function UstaCard({ initials, name, role, desc, tags }) {
    return (
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 relative hover:border-[#C97D3C]/40 hover:bg-white/[0.05] transition-all duration-300">
            <div className="absolute top-5 right-5 w-12 h-12 rounded-full border border-dashed border-[#C97D3C]/60 flex items-center justify-center text-[#C97D3C] text-[9px] text-center -rotate-12 font-mono leading-tight">
                ONAYLI<br />USTA
            </div>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C97D3C] to-[#E3B776] flex items-center justify-center text-[#0D2626] font-bold">
                    {initials}
                </div>
                <div>
                    <div className="text-[#F3ECE1] font-semibold">{name}</div>
                    <div className="text-[#9FC2BC] text-sm">{role}</div>
                </div>
            </div>
            <p className="text-[#9FC2BC] text-sm mb-4">{desc}</p>
            <div className="flex gap-2 flex-wrap">
                {tags.map((tag) => (
                    <span key={tag} className="text-[#9FC2BC] text-xs border border-white/[0.1] px-2 py-1 rounded-full font-mono">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default UstaCard
