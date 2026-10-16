// Işıklı cam düğmeler için imleç takibi: tek bir genel dinleyici, imlecin
// altındaki .isik / .isik-kutu öğesine yerel --x / --y değerlerini yazar.
let kuruldu = false

export function isikTakibiniKur() {
    if (kuruldu || typeof window === 'undefined') return
    kuruldu = true
    let kare = 0
    let son = null
    window.addEventListener(
        'pointermove',
        (e) => {
            son = e
            if (kare) return
            kare = requestAnimationFrame(() => {
                kare = 0
                const hedef = son.target instanceof Element ? son.target.closest('.isik, .isik-kutu') : null
                if (!hedef) return
                const r = hedef.getBoundingClientRect()
                hedef.style.setProperty('--x', `${son.clientX - r.left}px`)
                hedef.style.setProperty('--y', `${son.clientY - r.top}px`)
            })
        },
        { passive: true }
    )
}
