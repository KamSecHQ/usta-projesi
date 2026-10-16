import { Canvas } from '@react-three/fiber'
import { View, PerformanceMonitor } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'

function webglVarMi() {
    try {
        const c = document.createElement('canvas')
        return !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
        return false
    }
}

// Sayfadaki tüm 3D görünümleri tek bir WebGL bağlamında çizer.
// Her <View> kendi DOM kutusunun yerine çizilir; tuval tıklamaları engellemez.
// Hiçbir 3D bölüm ekranda (ya da ekrana yakın) değilse çizim tamamen durur.
export default function AtolyeTuvali() {
    const [destek, setDestek] = useState(false)
    const [hazir, setHazir] = useState(false)
    const [aktif, setAktif] = useState(false)
    const gl = useRef(null)
    // Keskinlik kare hızına göre ayarlanır: 1.25x'ten başlar, akıcıysa 1.75x'e çıkar, zorlanırsa 1x'e iner
    const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio || 1, 1.25))
    const ust = Math.min(window.devicePixelRatio || 1, 1.75)

    // Tuval, sayfa ilk kez boyandıktan sonra kurulur; böylece shader derlemesi metni bekletmez
    useEffect(() => {
        if (!webglVarMi()) return
        const bosta = window.requestIdleCallback || ((f) => setTimeout(f, 200))
        const id = bosta(() => setDestek(true), { timeout: 600 })
        return () => (window.cancelIdleCallback || clearTimeout)(id)
    }, [])

    // data-3d işaretli bölümlerden biri ekrana 300px kadar yaklaşınca çizim başlar
    useEffect(() => {
        if (!destek) return
        const gorunen = new Set()
        const g = new IntersectionObserver(
            (girdiler) => {
                girdiler.forEach((e) => (e.isIntersecting ? gorunen.add(e.target) : gorunen.delete(e.target)))
                const yeni = gorunen.size > 0
                // Dururken son kare sabit tuvalde asılı kalmasın
                if (!yeni && gl.current) {
                    gl.current.setScissorTest(false)
                    gl.current.clear()
                }
                setAktif(yeni)
            },
            { rootMargin: '300px 0px' }
        )
        document.querySelectorAll('[data-3d]').forEach((el) => g.observe(el))
        return () => g.disconnect()
    }, [destek])

    if (!destek) return null

    return (
        <Canvas
            eventSource={document.getElementById('root')}
            eventPrefix="client"
            frameloop={aktif ? 'always' : 'never'}
            dpr={dpr}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            onCreated={(state) => {
                gl.current = state.gl
                requestAnimationFrame(() => setHazir(true))
            }}
            style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5, opacity: hazir ? 1 : 0, transition: 'opacity 900ms cubic-bezier(0.16,1,0.3,1)' }}
        >
            <PerformanceMonitor
                bounds={() => [45, 58]}
                flipflops={3}
                onIncline={() => setDpr(ust)}
                onDecline={() => setDpr(1)}
                onFallback={() => setDpr(1)}
            />
            <View.Port />
        </Canvas>
    )
}
