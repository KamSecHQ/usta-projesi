export function IskeletUstaKarti() {
    return (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/[0.08] shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/[0.08] rounded w-2/3" />
                    <div className="h-2.5 bg-white/[0.06] rounded w-1/2" />
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-2.5 bg-white/[0.06] rounded w-full" />
                <div className="h-2.5 bg-white/[0.06] rounded w-4/5" />
            </div>
            <div className="flex gap-2">
                <div className="h-5 w-14 bg-white/[0.06] rounded-full" />
                <div className="h-5 w-14 bg-white/[0.06] rounded-full" />
            </div>
        </div>
    )
}

export function IskeletProjeKarti() {
    return (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 animate-pulse">
            <div className="h-4 bg-white/[0.08] rounded w-1/2 mb-3" />
            <div className="h-2.5 bg-white/[0.06] rounded w-full mb-1.5" />
            <div className="h-2.5 bg-white/[0.06] rounded w-3/4 mb-4" />
            <div className="h-2.5 bg-white/[0.06] rounded w-1/3" />
        </div>
    )
}

export function IskeletProfilBasligi() {
    return (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 animate-pulse">
            <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-full bg-white/[0.08] shrink-0" />
                <div className="flex-1 space-y-3 pt-1">
                    <div className="h-5 bg-white/[0.08] rounded w-1/3" />
                    <div className="h-3.5 bg-white/[0.06] rounded w-1/4" />
                </div>
            </div>
            <div className="space-y-2 mt-6">
                <div className="h-2.5 bg-white/[0.06] rounded w-full" />
                <div className="h-2.5 bg-white/[0.06] rounded w-5/6" />
            </div>
        </div>
    )
}
