import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Shader ısıtma. Bir 3D sahne ekrana ilk girdiğinde shader'ları o anda derleniyor ve ana iş
// parçacığı bitmesini bekliyordu: sıcak önbellekte bölüm başına 100-250 ms, ilk ziyarette
// 1 saniyeyi aşan donmalar. Lenis kaydırması da ana iş parçacığında çalıştığı için bu, sayfanın
// takılması olarak hissediliyordu. Isitici, içinde bulunduğu sahneyi ekrana gelmeden önce,
// boşta kalan zamanda KHR_parallel_shader_compile ile arka planda derler ve dokularını
// GPU'ya yükler. Sahneler sırayla ısıtılır; aynı anda hepsi GPU'ya yüklenmez.

let kuyruk = Promise.resolve()

function bosta(f) {
    if (window.requestIdleCallback) window.requestIdleCallback(f, { timeout: 1500 })
    else setTimeout(f, 120)
}

// Sahnedeki malzemelerin dokuları; userData.isitilacakDokular ile henüz takılmamış dokular da eklenir
function dokulariTopla(sahne) {
    const dokular = new Set()
    const ekle = (d) => d?.isTexture && !d.isRenderTargetTexture && d.image && dokular.add(d)
    sahne.traverse((o) => {
        const malzemeler = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
        for (const m of malzemeler) for (const deger of Object.values(m)) ekle(deger)
        o.userData.isitilacakDokular?.forEach(ekle)
    })
    return dokular
}

// Derlenmiş shader'la bile ilk çizimde GPU, çizim hattını (Metal'de pipeline state) kurarken
// bir kare takılabiliyor. Sahne bu yüzden tuvalin tek bir pikseline bir kez çizilip hemen
// silinir. Gizli ya da kadraj dışındaki nesneler de bu çizime girer, sonra eski hâline döner.
function pikseleCiz(gl, sahne, kamera) {
    const eski = []
    sahne.traverse((o) => {
        eski.push([o, o.visible, o.frustumCulled])
        o.visible = true
        o.frustumCulled = false
    })
    const gorunum = gl.getViewport(new THREE.Vector4())
    const makas = gl.getScissor(new THREE.Vector4())
    const makasAcik = gl.getScissorTest()
    const otoTemizle = gl.autoClear
    try {
        gl.autoClear = false
        gl.setScissorTest(true)
        gl.setViewport(0, 0, 1, 1)
        gl.setScissor(0, 0, 1, 1)
        gl.render(sahne, kamera)
        gl.clear(true, true, true)
    } finally {
        for (const [o, gorunur, kirp] of eski) {
            o.visible = gorunur
            o.frustumCulled = kirp
        }
        gl.autoClear = otoTemizle
        gl.setViewport(gorunum)
        gl.setScissor(makas)
        gl.setScissorTest(makasAcik)
    }
}

// Shader'ın çıktı renk uzayı ve ton eşlemesi, çizimin ekrana mı yoksa bir ara hedefe mi
// yapıldığına göre değişir. Son işlemli sahneler ara hedefe çizildiği için derleme de
// geçici bir ara hedef bağlıyken yapılır; aksi hâlde derlenen shader çizimde kullanılmaz.
function sahneyiIsit(gl, sahne, kamera, araHedef) {
    kuyruk = kuyruk.then(
        () =>
            new Promise((bitti) =>
                bosta(async () => {
                    const onceki = gl.getRenderTarget()
                    try {
                        if (araHedef) gl.setRenderTarget(araHedef)
                        const derleme = gl.compileAsync(sahne, kamera)
                        gl.setRenderTarget(onceki)
                        await derleme
                        for (const d of dokulariTopla(sahne)) gl.initTexture(d)
                        if (!araHedef) pikseleCiz(gl, sahne, kamera)
                    } catch {
                        // Isıtma yalnızca bir hızlandırma; başarısız olursa sahne ilk karede derlenir
                        gl.setRenderTarget(onceki)
                    }
                    bitti()
                })
            )
    )
    return kuyruk
}

// sonIslem: sahne EffectComposer ile ara hedefe çiziliyor.
// ilkKare: derleme bitince, sahne hâlâ duruyorsa bir kare çizilir. Son işlem geçişleri ve
// ortam haritası gibi yalnızca çizimde hazırlanan parçalar da böylece önceden kurulur.
export default function Isitici({ sonIslem = false, ilkKare = false, onBitti }) {
    const gl = useThree((s) => s.gl)
    const sahne = useThree((s) => s.scene)
    const kamera = useThree((s) => s.camera)
    const get = useThree((s) => s.get)

    useEffect(() => {
        let iptal = false
        const araHedef = sonIslem ? new THREE.WebGLRenderTarget(1, 1) : null
        sahneyiIsit(gl, sahne, kamera, araHedef).then(() => {
            araHedef?.dispose()
            if (iptal) return
            if (ilkKare && get().frameloop === 'never') get().advance(performance.now())
            onBitti?.()
        })
        return () => {
            iptal = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gl, sahne, kamera])

    return null
}
