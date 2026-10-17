import { useEffect, useState } from 'react'

// Okunan ara başlığı içindekilerde işaretler
export default function useOkunanBolum(kimlikler) {
    const [aktif, setAktif] = useState(null)
    useEffect(() => {
        if (!kimlikler.length) return
        const gozlemci = new IntersectionObserver(
            (girdiler) => {
                const gorunen = girdiler.filter((g) => g.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
                if (gorunen) setAktif(gorunen.target.id)
            },
            { rootMargin: '-90px 0px -65% 0px' }
        )
        for (const k of kimlikler) {
            const el = document.getElementById(k)
            if (el) gozlemci.observe(el)
        }
        return () => gozlemci.disconnect()
    }, [kimlikler])
    return aktif
}
