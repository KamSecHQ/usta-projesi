import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TEKNOLOJILER } from './teknolojiler'
// Doku yazıları yalnızca anasayfa parçasında kullanılır; yazı tipi tanımları da burada iner
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/onest'

// Konveyör bandı: teknoloji plakaları soldan akar, ortadaki pres her birine
// "ONAYLI" damgası basar. Plakaya tıklayınca o teknolojinin ustaları açılır.

const ARALIK = 2.1
const DONGU = ARALIK * TEKNOLOJILER.length
const HIZ = 1.05
const PLAKA = [1.6, 0.09, 1.05]
const PRES_Y = 1.25

const yumusak = (t) => t * t * (3 - 2 * t)

function plakaDokusu(ad, onayli, maden) {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 336
    const x = c.getContext('2d')
    x.fillStyle = maden === 'mor' ? '#5B3FD0' : '#A7AFAC'
    x.fillRect(0, 0, 512, 336)
    // Fırçalanmış metal çizgileri
    for (let i = 0; i < 336; i += 2) {
        x.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`
        x.fillRect(0, i, 512, 1)
    }
    x.strokeStyle = maden === 'mor' ? 'rgba(255,255,255,0.35)' : 'rgba(20,16,12,0.45)'
    x.lineWidth = 6
    x.strokeRect(14, 14, 484, 308)
    // Köşe perçinleri
    x.fillStyle = 'rgba(30,24,18,0.55)'
    for (const [px, py] of [[36, 36], [476, 36], [36, 300], [476, 300]]) {
        x.beginPath()
        x.arc(px, py, 9, 0, Math.PI * 2)
        x.fill()
    }
    x.fillStyle = maden === 'mor' ? '#F4F1FF' : '#1C1712'
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    const boyut = ad.length > 8 ? 70 : 92
    x.font = `800 ${boyut}px "Bricolage Grotesque Variable", sans-serif`
    x.fillText(ad, 256, onayli ? 150 : 168)
    if (onayli) {
        // Pres damgası: mürekkepli halka ve yazı
        x.save()
        x.translate(400, 250)
        x.rotate(-0.22)
        x.strokeStyle = 'rgba(76,29,149,0.95)'
        x.fillStyle = 'rgba(76,29,149,0.95)'
        x.lineWidth = 7
        x.beginPath()
        x.arc(0, 0, 62, 0, Math.PI * 2)
        x.stroke()
        x.lineWidth = 2.5
        x.beginPath()
        x.arc(0, 0, 52, 0, Math.PI * 2)
        x.stroke()
        x.font = '800 22px "Onest Variable", sans-serif'
        x.fillText('ONAYLI', 0, 0)
        x.restore()
    }
    const doku = new THREE.CanvasTexture(c)
    doku.colorSpace = THREE.SRGBColorSpace
    doku.anisotropy = 8
    return doku
}

function Plaka({ tek, indeks, zaman, secili, sec, git, presDarbesi }) {
    const mesh = useRef()
    const maden = indeks % 3 === 1 ? 'mor' : 'kalay'
    const [hazir, setHazir] = useState(0)
    const dokular = useMemo(
        () => ({ ham: plakaDokusu(tek.ad, false, maden), onayli: plakaDokusu(tek.ad, true, maden) }),
        // hazir: yazı tipi yüklenince dokular yeniden çizilir
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [tek.ad, maden, hazir]
    )
    useEffect(() => {
        let iptal = false
        document.fonts.load('800 80px "Bricolage Grotesque Variable"').then(() => !iptal && setHazir(1))
        return () => {
            iptal = true
        }
    }, [])
    // Yazı tipi gelince yeniden çizilen dokular eskilerinin yerini alır; eskiler GPU'da kalmasın
    useEffect(
        () => () => {
            dokular.ham.dispose()
            dokular.onayli.dispose()
        },
        [dokular]
    )

    const ust = useRef()
    const durum = useRef({ damgali: false, kalkma: 0 })

    useFrame((_, dt) => {
        const x = ((indeks * ARALIK + zaman.current * HIZ) % DONGU) - DONGU / 2
        const m = mesh.current
        m.position.x = x
        // Bandın uçlarından taşan plakalar görünmez
        m.visible = Math.abs(x) < 8.1
        const d = durum.current
        // Pres ortadan geçerken damgalanır; bandın başına dönünce damga silinir
        const yeniDamga = x > 0.05
        if (yeniDamga !== d.damgali) {
            d.damgali = yeniDamga
            ust.current.map = yeniDamga ? dokular.onayli : dokular.ham
            if (yeniDamga) presDarbesi()
        }
        const hedef = secili === indeks ? 0.28 : 0
        d.kalkma += (hedef - d.kalkma) * Math.min(1, dt * 10)
        m.position.y = 0.11 + d.kalkma
        m.rotation.x = -d.kalkma * 0.5
    })

    const metal = maden === 'mor'
        ? { color: '#7C5CF0', metalness: 0.9, roughness: 0.3 }
        : { color: '#C9CFCB', metalness: 1, roughness: 0.3 }

    return (
        <mesh
            ref={mesh}
            userData={{ isitilacakDokular: [dokular.ham, dokular.onayli] }}
            onPointerOver={(e) => {
                e.stopPropagation()
                sec(indeks)
                document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
                sec(null)
                document.body.style.cursor = ''
            }}
            onClick={(e) => {
                e.stopPropagation()
                document.body.style.cursor = ''
                git(tek.arama)
            }}
        >
            <boxGeometry args={PLAKA} />
            <meshStandardMaterial attach="material-0" {...metal} />
            <meshStandardMaterial attach="material-1" {...metal} />
            <meshStandardMaterial ref={ust} attach="material-2" map={dokular.ham} metalness={0.55} roughness={0.4} envMapIntensity={1.4} />
            <meshStandardMaterial attach="material-3" {...metal} />
            <meshStandardMaterial attach="material-4" {...metal} />
            <meshStandardMaterial attach="material-5" {...metal} />
        </mesh>
    )
}

function bantDokusu() {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 64
    const x = c.getContext('2d')
    x.fillStyle = '#121818'
    x.fillRect(0, 0, 256, 64)
    for (let i = 0; i < 256; i += 32) {
        x.fillStyle = '#1C2525'
        x.fillRect(i, 0, 3, 64)
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(10, 1)
    return t
}

export default function TeknolojiBandi({ git, azalt }) {
    const zaman = useRef(3)
    const [secili, setSecili] = useState(null)
    const piston = useRef()
    const isik = useRef()
    const darbe = useRef(0)
    const bant = useMemo(bantDokusu, [])
    const makaralar = useRef([])

    const presDarbesi = () => {
        darbe.current = 1
    }

    useFrame((_, dt) => {
        const adim = Math.min(dt, 1 / 20)
        // Üzerine gelinen plaka varken bant yavaşlar
        if (!azalt) zaman.current += adim * (secili === null ? 1 : 0.15)
        bant.offset.x = -(zaman.current * HIZ) / (16 / 10)
        makaralar.current.forEach((m) => m && (m.rotation.z = -zaman.current * HIZ * 3))

        // Pres: plaka ortaya yaklaşırken iner, damgada çarpar, sonra kalkar
        let enYakin = 99
        for (let i = 0; i < TEKNOLOJILER.length; i++) {
            const x = ((i * ARALIK + zaman.current * HIZ) % DONGU) - DONGU / 2
            if (Math.abs(x) < Math.abs(enYakin)) enYakin = x
        }
        const yaklas = enYakin < 0 ? yumusak(Math.max(0, 1 - Math.abs(enYakin) / 0.45)) : Math.max(0, 1 - enYakin / 0.25)
        piston.current.position.y = PRES_Y - 0.97 * yaklas
        darbe.current = Math.max(0, darbe.current - adim * 4)
        isik.current.intensity = darbe.current * darbe.current * 14
    })

    return (
        <group rotation={[0, -0.36, 0]}>
            {/* Bant ve yan raylar */}
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[16, 1.3]} />
                <meshStandardMaterial map={bant} roughness={0.85} metalness={0.1} />
            </mesh>
            {[-0.72, 0.72].map((z) => (
                <mesh key={z} position={[0, 0.02, z]}>
                    <boxGeometry args={[16.4, 0.16, 0.12]} />
                    <meshStandardMaterial color="#8E9694" metalness={0.9} roughness={0.32} />
                </mesh>
            ))}
            {[-8, 8].map((x, i) => (
                <mesh key={x} ref={(m) => (makaralar.current[i] = m)} position={[x, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.16, 0.16, 1.5, 24]} />
                    <meshStandardMaterial color="#5C6463" metalness={0.9} roughness={0.35} />
                </mesh>
            ))}

            {TEKNOLOJILER.map((t, i) => (
                <Plaka key={t.ad} tek={t} indeks={i} zaman={zaman} secili={secili} sec={setSecili} git={git} presDarbesi={presDarbesi} />
            ))}

            {/* Pres: krem boyalı çerçeve, çelik piston, bakır damga yüzü */}
            <group position={[0, 0, 0]}>
                {[-0.95, 0.95].map((z) => (
                    <mesh key={z} position={[0, 1.15, z]}>
                        <boxGeometry args={[0.32, 2.3, 0.26]} />
                        <meshStandardMaterial color="#E9E1D2" metalness={0.15} roughness={0.42} />
                    </mesh>
                ))}
                <mesh position={[0, 2.38, 0]}>
                    <boxGeometry args={[0.62, 0.34, 2.3]} />
                    <meshStandardMaterial color="#E9E1D2" metalness={0.15} roughness={0.42} />
                </mesh>
                <mesh position={[0, 2.18, 0]}>
                    <boxGeometry args={[0.66, 0.05, 2.34]} />
                    <meshStandardMaterial color="#8B5CF6" emissive="#6D4AFF" emissiveIntensity={0.6} metalness={0.4} roughness={0.3} />
                </mesh>
                {/* Hidrolik silindir gövdesi */}
                <mesh position={[0, 2.85, 0]}>
                    <cylinderGeometry args={[0.24, 0.24, 0.62, 32]} />
                    <meshStandardMaterial color="#1B2224" metalness={0.7} roughness={0.38} />
                </mesh>
                <mesh position={[0, 3.18, 0]}>
                    <cylinderGeometry args={[0.27, 0.27, 0.06, 32]} />
                    <meshStandardMaterial color="#8B5CF6" emissive="#6D4AFF" emissiveIntensity={0.6} metalness={0.4} roughness={0.3} />
                </mesh>
                {/* Zemin tablası */}
                <mesh position={[0, -0.2, 0]}>
                    <boxGeometry args={[0.9, 0.3, 2.5]} />
                    <meshStandardMaterial color="#1B2224" metalness={0.7} roughness={0.38} />
                </mesh>
                <group ref={piston} position={[0, PRES_Y, 0]}>
                    <mesh position={[0, 0.55, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 1.1, 24]} />
                        <meshStandardMaterial color="#B9C0BE" metalness={1} roughness={0.18} />
                    </mesh>
                    <mesh>
                        <boxGeometry args={[0.6, 0.18, 0.9]} />
                        <meshStandardMaterial color="#1B2224" metalness={0.7} roughness={0.38} />
                    </mesh>
                    <mesh position={[0, -0.1, 0]}>
                        <boxGeometry args={[0.5, 0.03, 0.8]} />
                        <meshStandardMaterial color="#A78BFA" emissive="#8B5CF6" emissiveIntensity={0.8} metalness={0.3} roughness={0.25} />
                    </mesh>
                </group>
                <pointLight ref={isik} position={[0, 0.4, 0.3]} color="#A78BFA" intensity={0} distance={3} decay={2} />
            </group>
        </group>
    )
}
