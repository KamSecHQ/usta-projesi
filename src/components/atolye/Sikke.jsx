import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
// Doku yazıları yalnızca anasayfa parçasında kullanılır; yazı tipi tanımları da burada iner
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/onest'

// Kıdem sikkesi: yüzüne halka yazısı ve punch rakam kabartılmış, darphaneden çıkmış gibi
// düşen ve tezgâha oturan 3D madeni para.

const MADENLER = {
    kalay: { metal: '#C9CFCB', zemin: '#8C9592', yazi: '#FFFFFF', yuzMetal: 0.55 },
    kizgin: { metal: '#E8A25E', zemin: '#B8743A', yazi: '#FFE9CC', yuzMetal: 0.55 },
    bakir: { metal: '#C9783F', zemin: '#93502A', yazi: '#FFD2A6', yuzMetal: 0.55 },
    muhur: { metal: '#D8B074', zemin: '#8E2B1C', yazi: '#F6E3B8', yuzMetal: 0.25 },
}

function yuzDokusu(rakam, maden, ciz) {
    const c = document.createElement('canvas')
    c.width = c.height = 512
    ciz(c, rakam, maden)
    const doku = new THREE.CanvasTexture(c)
    doku.colorSpace = THREE.SRGBColorSpace
    doku.anisotropy = 4
    // Silindir kapağının UV'si yazıyı yan çevirir; yüzü dik oturt
    doku.center.set(0.5, 0.5)
    doku.rotation = Math.PI / 2
    return doku
}

function yuzuCiz(c, rakam, maden) {
    const x = c.getContext('2d')
    const m = MADENLER[maden]
    x.clearRect(0, 0, 512, 512)
    // Zemin
    x.fillStyle = m.zemin
    x.beginPath()
    x.arc(256, 256, 256, 0, Math.PI * 2)
    x.fill()
    // Dış çerçeve ve iç halka
    x.strokeStyle = m.yazi
    x.lineWidth = 16
    x.beginPath()
    x.arc(256, 256, 236, 0, Math.PI * 2)
    x.stroke()
    x.lineWidth = 5
    x.beginPath()
    x.arc(256, 256, 150, 0, Math.PI * 2)
    x.stroke()
    // Halka yazısı
    const yazi = 'KALFAHANE · KIDEM · KALFAHANE · KIDEM · '
    x.fillStyle = m.yazi
    x.font = '700 30px "Onest Variable", sans-serif'
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    const adim = (Math.PI * 2) / yazi.length
    for (let i = 0; i < yazi.length; i++) {
        const a = i * adim - Math.PI / 2
        x.save()
        x.translate(256 + Math.cos(a) * 192, 256 + Math.sin(a) * 192)
        x.rotate(a + Math.PI / 2)
        x.fillText(yazi[i], 0, 0)
        x.restore()
    }
    // Punch rakam
    x.font = `800 ${rakam.length > 2 ? 132 : 176}px "Bricolage Grotesque Variable", sans-serif`
    x.fillText(rakam, 256, 268)
}

// Kabartma için aynı çizimin gri tonlu yükseklik hâli
function kabartmaCiz(c, rakam) {
    const x = c.getContext('2d')
    x.fillStyle = '#5a5a5a'
    x.fillRect(0, 0, 512, 512)
    x.strokeStyle = '#ffffff'
    x.fillStyle = '#ffffff'
    x.lineWidth = 16
    x.beginPath()
    x.arc(256, 256, 236, 0, Math.PI * 2)
    x.stroke()
    x.lineWidth = 5
    x.beginPath()
    x.arc(256, 256, 150, 0, Math.PI * 2)
    x.stroke()
    const yazi = 'KALFAHANE · KIDEM · KALFAHANE · KIDEM · '
    x.font = '700 30px "Onest Variable", sans-serif'
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    const adim = (Math.PI * 2) / yazi.length
    for (let i = 0; i < yazi.length; i++) {
        const a = i * adim - Math.PI / 2
        x.save()
        x.translate(256 + Math.cos(a) * 192, 256 + Math.sin(a) * 192)
        x.rotate(a + Math.PI / 2)
        x.fillText(yazi[i], 0, 0)
        x.restore()
    }
    x.font = `800 ${rakam.length > 2 ? 132 : 176}px "Bricolage Grotesque Variable", sans-serif`
    x.fillText(rakam, 256, 268)
}

export default function Sikke({ rakam, maden, gorunur, gecikme = 0, azalt = false }) {
    const grup = useRef()
    const m = MADENLER[maden]
    const dokular = useMemo(() => {
        const renk = yuzDokusu(rakam, maden, yuzuCiz)
        const kabartma = yuzDokusu(rakam, maden, (c) => kabartmaCiz(c, rakam))
        return { renk, kabartma }
    }, [rakam, maden])

    // Yazı tipleri yüklenince yüzü yeniden çiz
    useEffect(() => {
        let iptal = false
        Promise.all([
            document.fonts.load('800 100px "Bricolage Grotesque Variable"'),
            document.fonts.load('700 30px "Onest Variable"'),
        ]).then(() => {
            if (iptal) return
            yuzuCiz(dokular.renk.image, rakam, maden)
            kabartmaCiz(dokular.kabartma.image, rakam)
            dokular.renk.needsUpdate = true
            dokular.kabartma.needsUpdate = true
        })
        return () => {
            iptal = true
        }
    }, [dokular, rakam, maden])

    const durum = useRef({ baslangic: null })

    useFrame((state, dt) => {
        const g = grup.current
        const t = state.clock.elapsedTime
        const d = durum.current

        if (!gorunur) {
            g.visible = false
            return
        }
        g.visible = true
        if (d.baslangic === null) d.baslangic = t + gecikme / 1000

        const gecen = azalt ? 10 : t - d.baslangic
        if (gecen < 0) {
            g.visible = false
            return
        }

        // Düşüş: yukarıdan dönerek iner, tezgâha çarpıp sönümlü sallanır
        const dus = Math.min(gecen / 0.55, 1)
        const yukseklik = (1 - dus * dus) * 3.2
        const sonrasi = Math.max(0, gecen - 0.55)
        const sallanti = Math.exp(-sonrasi * 4.2) * Math.sin(sonrasi * 22) * 0.35
        g.position.y = yukseklik
        g.rotation.x = Math.PI / 2 - 0.25 + (1 - dus) * Math.PI * 3 + sallanti
        // Yerleşince yavaşça nefes alır, imlece hafifçe döner
        const idle = Math.min(sonrasi, 1)
        g.rotation.y += ((state.pointer.x * 0.5 + Math.sin(t * 0.6 + gecikme) * 0.18 * idle) - g.rotation.y) * Math.min(1, dt * 3)
        g.rotation.z = Math.sin(t * 0.8 + gecikme) * 0.05 * idle
    })

    const kenar = useMemo(() => {
        const c = document.createElement('canvas')
        c.width = 512
        c.height = 16
        const x = c.getContext('2d')
        for (let i = 0; i < 512; i += 4) {
            x.fillStyle = i % 8 === 0 ? '#ffffff' : '#7a7a7a'
            x.fillRect(i, 0, 4, 16)
        }
        const t = new THREE.CanvasTexture(c)
        t.wrapS = THREE.RepeatWrapping
        t.repeat.set(6, 1)
        return t
    }, [])

    return (
        <group ref={grup} visible={false}>
            <mesh>
                <cylinderGeometry args={[1, 1, 0.16, 96, 1]} />
                {/* Tırtıllı kenar */}
                <meshStandardMaterial attach="material-0" color={m.metal} metalness={1} roughness={0.28} bumpMap={kenar} bumpScale={1.5} envMapIntensity={1.6} />
                <meshStandardMaterial attach="material-1" map={dokular.renk} bumpMap={dokular.kabartma} bumpScale={2.5} metalness={m.yuzMetal} roughness={0.34} envMapIntensity={1.8} />
                <meshStandardMaterial attach="material-2" map={dokular.renk} bumpMap={dokular.kabartma} bumpScale={2.5} metalness={m.yuzMetal} roughness={0.34} envMapIntensity={1.8} />
            </mesh>
        </group>
    )
}
