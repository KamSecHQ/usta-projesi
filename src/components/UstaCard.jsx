function UstaCard({ initials, name, role, desc, tags }) {
    return (
        <div className="bg-[#123434] border border-[#21504E] rounded p-6 relative hover:border-[#C97D3C] transition">
            <div className="absolute top-5 right-5 w-12 h-12 rounded-full border border-dashed border-[#C97D3C] flex items-center justify-center text-[#C97D3C] text-[9px] text-center -rotate-12 font-mono leading-tight">
                ONAYLI<br />USTA
            </div>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#17403F] border border-[#21504E] flex items-center justify-center text-[#E3B776] font-bold">
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
                    <span key={tag} className="text-[#9FC2BC] text-xs border border-[#21504E] px-2 py-1 rounded font-mono">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default UstaCard
