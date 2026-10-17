// Işıklı cam düğmeler için imleç takibi: tek bir genel dinleyici, imlecin altındaki
// .isik / .isik-kutu / .isik-hap / .isik-kart / .nav-ray öğesine yerel --x / --y (piksel) ve
// eğilme için --nx / --ny (-1..1) değerlerini yazar.
const SECICI = '.isik, .isik-kutu, .isik-hap, .isik-kart, .nav-ray'

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
                const hedef = son.target instanceof Element ? son.target.closest(SECICI) : null
                if (!hedef) return
                const r = hedef.getBoundingClientRect()
                const x = son.clientX - r.left
                const y = son.clientY - r.top
                hedef.style.setProperty('--x', `${x}px`)
                hedef.style.setProperty('--y', `${y}px`)
                hedef.style.setProperty('--nx', ((x / r.width) * 2 - 1).toFixed(3))
                hedef.style.setProperty('--ny', ((y / r.height) * 2 - 1).toFixed(3))
            })
        },
        { passive: true }
    )
}
