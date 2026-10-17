// Işık rayında (.nav-ray) imlecin altındaki hapın arkasına kayan cam vurgu.
// Konum doğrudan stile yazılır; her üzerine gelişte React yeniden çizmez.
// Raya ilk girişte vurgu kaymadan yerinde belirir, haplar arasında ise kayar.

function vurguyuKonumla(ray, hap) {
    const vurgu = ray.querySelector(':scope > .nav-ray-vurgu')
    if (!vurgu) return
    const r = ray.getBoundingClientRect()
    const h = hap.getBoundingClientRect()
    const ilk = !ray.classList.contains('vurgulu')
    if (ilk) vurgu.style.transition = 'none'
    vurgu.style.transform = `translateX(${h.left - r.left}px)`
    vurgu.style.width = `${h.width}px`
    if (ilk) {
        vurgu.getBoundingClientRect()
        vurgu.style.transition = ''
        ray.classList.add('vurgulu')
    }
}

export const rayOlaylari = {
    onPointerOver(e) {
        if (e.pointerType !== 'mouse') return
        const hap = e.target instanceof Element ? e.target.closest('.nav-hap') : null
        if (hap && e.currentTarget.contains(hap)) vurguyuKonumla(e.currentTarget, hap)
    },
    onPointerLeave(e) {
        e.currentTarget.classList.remove('vurgulu')
    },
}
