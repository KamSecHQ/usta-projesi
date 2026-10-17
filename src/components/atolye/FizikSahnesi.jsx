import { Suspense, useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { Physics, RigidBody, BallCollider, CuboidCollider } from '@react-three/rapier'
import { EffectComposer, N8AO, Bloom, Noise, Vignette, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import Isitici from './Isitici'

// Lusion tarzı fizik sahnesi: atölye parçaları (somun, cıvata) ve kod sembolleri
// ({ } < / >) yerçekimsiz bir alanda merkeze çekilir, birbirine çarpar, imleç onları iter.
// Gerçekçilik karmaşık modelden değil; ışık, malzeme, fizik ve son işlemden gelir.

// ---------- Geometriler ----------

function somunGeometrisi() {
    const sekil = new THREE.Shape()
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6
        const x = Math.cos(a) * 0.62
        const y = Math.sin(a) * 0.62
        if (i === 0) sekil.moveTo(x, y)
        else sekil.lineTo(x, y)
    }
    sekil.closePath()
    const delik = new THREE.Path()
    delik.absarc(0, 0, 0.28, 0, Math.PI * 2, true)
    sekil.holes.push(delik)
    const g = new THREE.ExtrudeGeometry(sekil, { depth: 0.36, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4, curveSegments: 32 })
    g.center()
    return g
}

function cubukGeometrisi(noktalar, kalinlik = 0.13, gerginlik = 0.5) {
    const egri = new THREE.CatmullRomCurve3(noktalar.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'catmullrom', gerginlik)
    const g = new THREE.TubeGeometry(egri, 96, kalinlik, 20, false)
    // Uçları kapat: yarım küre başlıklar
    const bas = new THREE.SphereGeometry(kalinlik, 20, 12)
    const p0 = egri.getPoint(0)
    const p1 = egri.getPoint(1)
    const parcalar = [g, bas.clone().translate(p0.x, p0.y, p0.z), bas.clone().translate(p1.x, p1.y, p1.z)]
    const birlesik = birlestir(parcalar)
    birlesik.center()
    return birlesik
}

// Basit geometri birleştirici (BufferGeometryUtils'e gerek kalmadan)
function birlestir(geometriler) {
    const parcalar = geometriler.map((g) => (g.index ? g.toNonIndexed() : g))
    let toplam = 0
    parcalar.forEach((g) => (toplam += g.attributes.position.count))
    const konum = new Float32Array(toplam * 3)
    const normal = new Float32Array(toplam * 3)
    let o = 0
    parcalar.forEach((g) => {
        konum.set(g.attributes.position.array, o * 3)
        normal.set(g.attributes.normal.array, o * 3)
        o += g.attributes.position.count
    })
    const sonuc = new THREE.BufferGeometry()
    sonuc.setAttribute('position', new THREE.BufferAttribute(konum, 3))
    sonuc.setAttribute('normal', new THREE.BufferAttribute(normal, 3))
    return sonuc
}

function civataGeometrisi() {
    const bas = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 6)
    bas.translate(0, 0.62, 0)
    const govde = new THREE.CylinderGeometry(0.2, 0.2, 1.1, 24)
    govde.translate(0, -0.05, 0)
    const g = birlestir([bas, govde])
    g.center()
    return g
}

function geometrileriUret() {
    return {
        somun: somunGeometrisi(),
        civata: civataGeometrisi(),
        // {  süslü parantez
        acSusluk: cubukGeometrisi([[0.32, 0.95], [0.08, 0.82], [0.1, 0.25], [-0.18, 0], [0.1, -0.25], [0.08, -0.82], [0.32, -0.95]], 0.17, 0.35),
        kapaSusluk: cubukGeometrisi([[-0.32, 0.95], [-0.08, 0.82], [-0.1, 0.25], [0.18, 0], [-0.1, -0.25], [-0.08, -0.82], [-0.32, -0.95]], 0.17, 0.35),
        // <  ve  >
        kucuktur: cubukGeometrisi([[0.42, 0.62], [-0.38, 0], [0.42, -0.62]], 0.18, 0.05),
        buyuktur: cubukGeometrisi([[-0.42, 0.62], [0.38, 0], [-0.42, -0.62]], 0.18, 0.05),
        // /
        egik: cubukGeometrisi([[-0.36, -0.9], [0.36, 0.9]], 0.18, 0.5),
    }
}

// ---------- Malzemeler ----------

const MALZEMELER = {
    mor: { color: '#8B5CF6', roughness: 0.2, metalness: 0 },
    kara: { color: '#16161C', roughness: 0.38, metalness: 0.1 },
    seramik: { color: '#F4F4F6', roughness: 0.28, metalness: 0 },
    krom: { color: '#D8D8E0', roughness: 0.14, metalness: 1 },
}

const TURLER = ['somun', 'acSusluk', 'kapaSusluk', 'kucuktur', 'buyuktur', 'egik', 'civata', 'somun']
const RENKLER = ['mor', 'kara', 'seramik', 'krom', 'kara', 'seramik', 'mor', 'krom', 'seramik']

const rastgele = THREE.MathUtils.randFloatSpread
const MERKEZ_Y = -1.3

// ---------- Parça ----------

function Parca({ geometri, malzeme, dagit, olcek = 1 }) {
    const govde = useRef()
    const kuvvet = useMemo(() => new THREE.Vector3(), [])
    const baslangic = useMemo(() => [rastgele(14), rastgele(10), rastgele(8) - 2], [])
    const son = useRef(0)
    // Çarpışma gövdesi: parçanın sınır kutusundan (otomatik dışbükey kabuk bazı şekillerde üretilemiyor)
    const yariBoyut = useMemo(() => {
        geometri.computeBoundingBox()
        const b = geometri.boundingBox
        return [((b.max.x - b.min.x) / 2) * olcek * 0.92, ((b.max.y - b.min.y) / 2) * olcek * 0.92, ((b.max.z - b.min.z) / 2) * olcek * 0.92]
    }, [geometri, olcek])

    useFrame((_, dt) => {
        const b = govde.current
        if (!b) return
        const adim = Math.min(0.1, dt)
        const p = b.translation()
        // Merkeze çekim: Lusion'daki gibi her kare küçük bir dürtü
        // Merkez başlığın altında: parçalar metnin üstüne çıkmaz
        kuvvet.set(-p.x, MERKEZ_Y - p.y, -p.z).multiplyScalar(adim * 1.6 * olcek)
        b.applyImpulse(kuvvet, true)

        // Tıklanınca dışarı saçılır
        if (dagit.current !== son.current) {
            son.current = dagit.current
            kuvvet.set(p.x || rastgele(1), p.y || rastgele(1), p.z + 0.5).normalize().multiplyScalar(14 + Math.random() * 10)
            b.applyImpulse(kuvvet, true)
            b.applyTorqueImpulse({ x: rastgele(3), y: rastgele(3), z: rastgele(3) }, true)
        }
    })

    return (
        <RigidBody
            ref={govde}
            colliders={false}
            position={baslangic}
            rotation={[rastgele(6), rastgele(6), rastgele(6)]}
            linearDamping={3.2}
            angularDamping={0.9}
            friction={0.15}
            restitution={0.35}
        >
            <CuboidCollider args={yariBoyut} />
            <mesh geometry={geometri} scale={olcek}>
                <meshStandardMaterial {...MALZEMELER[malzeme]} envMapIntensity={1.6} />
            </mesh>
        </RigidBody>
    )
}

// İmleç: görünmez bir küre, parçaları iter
function Imlec() {
    const govde = useRef()
    const { viewport } = useThree()
    const hedef = useMemo(() => new THREE.Vector3(), [])
    useFrame(({ pointer }) => {
        if (!govde.current) return
        hedef.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0)
        govde.current.setNextKinematicTranslation(hedef)
    })
    return (
        <RigidBody ref={govde} type="kinematicPosition" colliders={false} position={[0, 0, 40]}>
            <BallCollider args={[1.25]} />
        </RigidBody>
    )
}

// Kamera imlece göre hafifçe süzülür (sönümlü)
function KameraSuzulmesi() {
    useFrame(({ camera, pointer }, dt) => {
        const k = Math.min(1, dt * 2)
        camera.position.x += (pointer.x * 1.4 - camera.position.x) * k
        camera.position.y += (pointer.y * 0.9 - camera.position.y) * k
        camera.lookAt(0, 0, 0)
    })
    return null
}

// Fizik motoru yüklenip ilk kareler çizilince (shader'lar derlenmiş olur) haber verir
function HazirSinyali({ onHazir }) {
    const kare = useRef(0)
    useFrame(() => {
        kare.current += 1
        if (kare.current === 4) onHazir?.()
    })
    return null
}

function Sahne({ adet, dagit, azalt, hafif, onHazir }) {
    const geo = useMemo(geometrileriUret, [])
    const parcalar = useMemo(
        () =>
            Array.from({ length: adet }, (_, i) => ({
                tur: TURLER[i % TURLER.length],
                renk: RENKLER[(i * 7) % RENKLER.length],
                olcek: 1.25 + ((i * 37) % 10) / 14,
            })),
        [adet]
    )

    return (
        <>
            <color attach="background" args={['#06060A']} />
            <ambientLight intensity={0.9} />
            <directionalLight position={[-6, 8, 6]} intensity={2.2} color="#FFF4EA" />
            <spotLight position={[12, 14, 12]} angle={0.3} penumbra={1} intensity={3.2} />
            <Physics gravity={[0, 0, 0]} paused={azalt}>
                <Imlec />
                {parcalar.map((p, i) => (
                    <Parca key={i} geometri={geo[p.tur]} malzeme={p.renk} dagit={dagit} olcek={p.olcek} />
                ))}
                <Isitici sonIslem ilkKare />
            </Physics>
            {!azalt && <KameraSuzulmesi />}
            <HazirSinyali onHazir={onHazir} />

            {/* Stüdyo ışığı: yumuşak tavan panelleri ve sıcak bir kor ışığı */}
            <Environment resolution={256} frames={1}>
                <group rotation={[-Math.PI / 3, 0, 1]}>
                    <Lightformer form="circle" intensity={8} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={3} />
                    <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
                    <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
                    <Lightformer form="circle" intensity={4} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
                    <Lightformer form="ring" color="#8B5CF6" intensity={7} onUpdate={(self) => self.lookAt(0, 0, 0)} position={[10, 10, 0]} scale={10} />
                </group>
            </Environment>

            <EffectComposer multisampling={0} enableNormalPass={false}>
                {/* Ortam gölgelemesi en pahalı geçiş: zayıf cihazlarda kapalı */}
                {hafif ? null : <N8AO halfRes color="black" aoRadius={2} intensity={1.15} aoSamples={4} denoiseSamples={3} />}
                <Bloom mipmapBlur luminanceThreshold={0.85} intensity={0.55} radius={0.7} />
                <Noise opacity={0.045} premultiply />
                <Vignette eskil={false} offset={0.25} darkness={0.55} />
                <ToneMapping mode={ToneMappingMode.AGX} />
            </EffectComposer>
        </>
    )
}

function hareketAzaltilsinMi() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function FizikSahnesi({ olayKaynagi, onHazir, aktif = true }) {
    const dagit = useRef(0)
    const [azalt] = useState(hareketAzaltilsinMi)
    const [dar] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
    // Dar ekran ya da az çekirdekli cihaz: ağır son işlem geçişleri kapatılır
    const [hafif] = useState(() => dar || (typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 8) <= 4))
    // Keskinlik 1.25x'te sabit; zorlanırsa 1x'e iner. Yukarı çıkmaz: her değişim tuvali ve
    // son işlem hedeflerini yeniden kurar, bu da kaydırırken kare kaçırtır.
    const [dpr, setDpr] = useState(() => Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.25))

    useEffect(() => {
        const el = olayKaynagi?.current
        if (!el) return
        const tikla = () => (dagit.current += 1)
        el.addEventListener('pointerdown', tikla)
        return () => el.removeEventListener('pointerdown', tikla)
    }, [olayKaynagi])

    return (
        <Canvas
            frameloop={aktif ? 'always' : 'never'}
            dpr={dpr}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, dar ? 20 : 17], fov: 32, near: 1, far: 70 }}
            eventSource={olayKaynagi}
            eventPrefix="client"
            onCreated={(state) => {
                state.gl.toneMapping = THREE.NoToneMapping
            }}
        >
            <PerformanceMonitor bounds={() => [40, 120]} onDecline={() => setDpr(1)} />
            <Suspense fallback={null}>
                <Sahne adet={dar ? 12 : 18} dagit={dagit} azalt={azalt || !aktif} hafif={hafif} onHazir={onHazir} />
            </Suspense>
        </Canvas>
    )
}
