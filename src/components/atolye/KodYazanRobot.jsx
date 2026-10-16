import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, ContactShadows } from '@react-three/drei'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import * as THREE from 'three'

// Kod yazan masaüstü robotu.
// Beyaz seramik gövde, kulaklık, vizörde dijital yüz; parmakları tek tek tuşlara iner.
// Yazdığı her karakter cam ekranın solunda belirir, sağında işin canlı önizlemesi oluşur.
// Sahne: yansıtan siyah zemin, sis, üstten ışık konisi, havada ışık tozu.

// ---------------------------------------------------------------------------
// Ekran içeriği (örnek veri)
// ---------------------------------------------------------------------------
const R = {
    komut: '#F4F4F8',
    dolar: '#A78BFA',
    noktalama: '#6E6E7C',
    anahtar: '#A78BFA',
    dize: '#E9E4FF',
    sayi: '#C4B5FD',
    soluk: '#8A8A98',
    tamam: '#B9A4FF',
}

export const SAHNELER = [
    {
        dosya: 'ilan.json',
        satirlar: [
            [['$ ', R.dolar], ['kalfahane ilan oluştur', R.komut]],
            [['{', R.noktalama]],
            [['  "baslik"', R.anahtar], [': ', R.noktalama], ['"E-ticaret sitesi"', R.dize], [',', R.noktalama]],
            [['  "teknoloji"', R.anahtar], [': [', R.noktalama], ['"Next.js"', R.dize], [', ', R.noktalama], ['"PostgreSQL"', R.dize], ['],', R.noktalama]],
            [['  "teslim"', R.anahtar], [': ', R.noktalama], ['"6 hafta"', R.dize]],
            [['}', R.noktalama]],
            [['✓ ', R.tamam], ['ilan yayında', R.tamam]],
        ],
    },
    {
        dosya: 'teklifler',
        satirlar: [
            [['$ ', R.dolar], ['kalfahane teklifler --ilan e-ticaret', R.komut]],
            [['  Kıdemli Usta  ', R.dize], ['12 iş  ', R.sayi], ['Next.js', R.soluk]],
            [['  Usta          ', R.dize], [' 4 iş  ', R.sayi], ['React', R.soluk]],
            [['  Kalfa         ', R.dize], [' 1 iş  ', R.sayi], ['Vue', R.soluk]],
            [['→ ', R.dolar], ['3 teklif · ustanı seç', R.soluk]],
        ],
    },
    {
        dosya: 'teslim',
        satirlar: [
            [['$ ', R.dolar], ['git push && kalfahane teslim', R.komut]],
            [['build   ', R.soluk], ['██████████', R.anahtar], ['  tamam', R.dize]],
            [['test    ', R.soluk], ['██████████', R.anahtar], ['  48/48', R.sayi]],
            [['deploy  ', R.soluk], ['██████████', R.anahtar], ['  canlı', R.dize]],
            [['✓ ', R.tamam], ['iş onaylandı · kıdem +1', R.tamam]],
        ],
    },
]

const satirUzunlugu = (satir) => satir.reduce((a, [m]) => a + Array.from(m).length, 0) + 1
const toplamKarakter = (s) => s.satirlar.reduce((t, satir) => t + satirUzunlugu(satir), 0)
// Kaç satır tamamen yazıldı
function bitenSatir(sahne, n) {
    let k = n
    let i = 0
    for (; i < sahne.satirlar.length; i++) {
        k -= satirUzunlugu(sahne.satirlar[i])
        if (k < 0) break
    }
    return i
}

// ---------------------------------------------------------------------------
// Ekran dokusu: 2x çözünürlük; solda kod, sağda önizleme
// ---------------------------------------------------------------------------
const EG = 1024
const EY = 600
const OLCEK = 1.5
const BOLUM = 600 // kod | önizleme ayrımı

function yuvarlakDikdortgen(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
}

function hap(ctx, metin, x, y, { zemin = 'rgba(255,255,255,0.08)', renk = '#E9E4FF', boyut = 13 } = {}) {
    ctx.font = `500 ${boyut}px "Plus Jakarta Sans Variable", sans-serif`
    const w = ctx.measureText(metin).width + 22
    ctx.fillStyle = zemin
    yuvarlakDikdortgen(ctx, x, y, w, 26, 13)
    ctx.fill()
    ctx.fillStyle = renk
    ctx.textBaseline = 'middle'
    ctx.fillText(metin, x + 11, y + 13.5)
    return w
}

function onizlemeCiz(ctx, asama, sahne, n, toplam) {
    const x0 = BOLUM + 28
    const w = EG - BOLUM - 56
    const biten = bitenSatir(sahne, n)
    const oran = toplam ? n / toplam : 0

    ctx.font = '600 12px "Plus Jakarta Sans Variable", sans-serif'
    ctx.fillStyle = '#6E6E7C'
    ctx.textBaseline = 'middle'
    ctx.fillText('ÖNİZLEME', x0, 92)

    ctx.save()
    if (asama === 0) {
        // İlan kartı yazıldıkça dolar
        ctx.globalAlpha = Math.min(1, oran * 3)
        ctx.fillStyle = 'rgba(255,255,255,0.05)'
        yuvarlakDikdortgen(ctx, x0, 116, w, 250, 18)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.09)'
        ctx.stroke()
        ctx.fillStyle = '#8A8A98'
        ctx.font = '500 13px "Plus Jakarta Sans Variable", sans-serif'
        ctx.fillText('Yeni ilan', x0 + 22, 146)
        if (biten > 2) {
            ctx.fillStyle = '#FFFFFF'
            ctx.font = '600 24px "Plus Jakarta Sans Variable", sans-serif'
            ctx.fillText('E-ticaret sitesi', x0 + 22, 184)
        }
        if (biten > 3) {
            const a = hap(ctx, 'Next.js', x0 + 22, 214)
            hap(ctx, 'PostgreSQL', x0 + 30 + a, 214)
        }
        if (biten > 4) {
            ctx.fillStyle = '#A1A1AA'
            ctx.font = '400 14px "Plus Jakarta Sans Variable", sans-serif'
            ctx.fillText('Teslim süresi · 6 hafta', x0 + 22, 268)
        }
        if (biten > 6) hap(ctx, '● İlan yayında', x0 + 22, 310, { zemin: 'rgba(139,92,246,0.22)', renk: '#C4B5FD' })
    } else if (asama === 1) {
        // Teklifler satır satır gelir
        const teklifler = [
            ['KU', 'Kıdemli Usta', '12 iş · Next.js'],
            ['U', 'Usta', '4 iş · React'],
            ['K', 'Kalfa', '1 iş · Vue'],
        ]
        teklifler.forEach(([bas, rutbe, alt], i) => {
            if (biten < i + 2) return
            const y = 116 + i * 92
            ctx.fillStyle = i === 0 ? 'rgba(139,92,246,0.16)' : 'rgba(255,255,255,0.05)'
            yuvarlakDikdortgen(ctx, x0, y, w, 78, 16)
            ctx.fill()
            ctx.strokeStyle = i === 0 ? 'rgba(167,139,250,0.45)' : 'rgba(255,255,255,0.08)'
            ctx.stroke()
            ctx.fillStyle = '#FFFFFF'
            ctx.beginPath()
            ctx.arc(x0 + 40, y + 39, 20, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#050505'
            ctx.font = '700 13px "Plus Jakarta Sans Variable", sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(bas, x0 + 40, y + 40)
            ctx.textAlign = 'left'
            ctx.fillStyle = '#FFFFFF'
            ctx.font = '600 17px "Plus Jakarta Sans Variable", sans-serif'
            ctx.fillText(rutbe, x0 + 74, y + 30)
            ctx.fillStyle = '#8A8A98'
            ctx.font = '400 13px "Plus Jakarta Sans Variable", sans-serif'
            ctx.fillText(alt, x0 + 74, y + 54)
        })
        if (biten > 4) hap(ctx, 'Ustanı seç →', x0, 404, { zemin: '#FDFDFD', renk: '#050505' })
    } else {
        // Site önizlemesi: tarayıcı çerçevesi, sayfa iskeleti, sonunda "canlı"
        ctx.fillStyle = 'rgba(255,255,255,0.05)'
        yuvarlakDikdortgen(ctx, x0, 116, w, 290, 16)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.09)'
        ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        yuvarlakDikdortgen(ctx, x0 + 14, 128, w - 28, 22, 11)
        ctx.fill()
        ctx.fillStyle = '#6E6E7C'
        ctx.font = '400 11px "JetBrains Mono Variable", monospace'
        ctx.fillText('e-ticaret.kalfahane.app', x0 + 28, 140)
        const insa = Math.min(1, oran * 1.3)
        ctx.globalAlpha = 0.25 + insa * 0.75
        const g = ctx.createLinearGradient(x0 + 14, 166, x0 + w - 14, 260)
        g.addColorStop(0, 'rgba(139,92,246,0.55)')
        g.addColorStop(1, 'rgba(76,29,149,0.25)')
        ctx.fillStyle = g
        yuvarlakDikdortgen(ctx, x0 + 14, 164, w - 28, 104, 12)
        ctx.fill()
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '700 18px "Plus Jakarta Sans Variable", sans-serif'
        ctx.fillText('Yeni sezon', x0 + 30, 200)
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.fillRect(x0 + 30, 220, 120, 7)
        ctx.fillStyle = '#FDFDFD'
        yuvarlakDikdortgen(ctx, x0 + 30, 238, 74, 20, 10)
        ctx.fill()
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = 'rgba(255,255,255,0.08)'
            yuvarlakDikdortgen(ctx, x0 + 14 + i * ((w - 28) / 3 + 2), 282, (w - 28) / 3 - 6, 100, 10)
            ctx.fill()
        }
        ctx.globalAlpha = 1
        if (biten > 4) {
            hap(ctx, '● Canlı', x0 + w - 98, 420, { zemin: 'rgba(139,92,246,0.25)', renk: '#C4B5FD' })
        }
    }
    ctx.restore()
}

function ekraniCiz(ctx, asama, sahne, n, imlec) {
    const toplam = toplamKarakter(sahne)
    ctx.setTransform(OLCEK, 0, 0, OLCEK, 0, 0)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    ctx.fillStyle = '#07070C'
    ctx.fillRect(0, 0, EG, EY)
    const g = ctx.createRadialGradient(EG * 0.35, -60, 30, EG * 0.35, -60, 620)
    g.addColorStop(0, 'rgba(139,92,246,0.24)')
    g.addColorStop(1, 'rgba(139,92,246,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, EG, EY)

    // Pencere çubuğu
    ctx.fillStyle = 'rgba(255,255,255,0.035)'
    ctx.fillRect(0, 0, EG, 56)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(0, 56, EG, 1)
    const noktalar = ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.16)', '#8B5CF6']
    noktalar.forEach((renk, i) => {
        ctx.fillStyle = renk
        ctx.beginPath()
        ctx.arc(30 + i * 22, 28, 6, 0, Math.PI * 2)
        ctx.fill()
    })
    ctx.font = '500 15px "JetBrains Mono Variable", ui-monospace, monospace'
    ctx.fillStyle = '#8A8A98'
    ctx.fillText(`kalfahane — ${sahne.dosya}`, 110, 29)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#55555F'
    ctx.fillText('örnek veri', EG - 24, 29)
    ctx.textAlign = 'left'

    // Bölme çizgisi
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(BOLUM, 57, 1, EY - 57)

    // Kod
    ctx.font = '500 17px "JetBrains Mono Variable", ui-monospace, monospace'
    const satirY = 98
    const satirAra = 34
    let kalan = n
    let imlecX = 62
    let imlecY = satirY
    for (let i = 0; i < sahne.satirlar.length; i++) {
        const y = satirY + i * satirAra
        if (kalan <= 0 && i > 0) break
        ctx.fillStyle = '#34343E'
        ctx.textAlign = 'right'
        ctx.fillText(String(i + 1), 40, y)
        ctx.textAlign = 'left'
        let x = 62
        for (const [metin, renk] of sahne.satirlar[i]) {
            if (kalan <= 0) break
            const harfler = Array.from(metin)
            const gorunen = harfler.slice(0, kalan).join('')
            kalan -= harfler.length
            ctx.fillStyle = renk
            ctx.fillText(gorunen, x, y)
            x += ctx.measureText(gorunen).width
        }
        imlecX = x
        imlecY = y
        kalan -= 1
    }
    if (imlec) {
        ctx.fillStyle = '#A78BFA'
        ctx.fillRect(imlecX + 2, imlecY - 11, 9, 22)
    }

    onizlemeCiz(ctx, asama, sahne, n, toplam)

    // İnce tarama çizgileri: cam ekran hissi
    ctx.fillStyle = 'rgba(255,255,255,0.016)'
    for (let y = 58; y < EY; y += 3) ctx.fillRect(0, y, EG, 0.6)
}

// ---------------------------------------------------------------------------
// Vizör yüzü: dijital gözler (normal, kırpma, mutlu, odak)
// ---------------------------------------------------------------------------
const YG = 512
const YY = 256

function yuzCiz(ctx, ifade, bakX, bakY, kirp) {
    ctx.clearRect(0, 0, YG, YY)
    ctx.save()
    ctx.shadowColor = 'rgba(167,139,250,0.95)'
    ctx.shadowBlur = 34
    ctx.fillStyle = '#D8CCFF'
    ctx.strokeStyle = '#D8CCFF'
    const merkezler = [170 + bakX, 342 + bakX]
    const cy = 128 + bakY
    for (const cx of merkezler) {
        if (ifade === 'mutlu') {
            // ^ ^ : gülen gözler
            ctx.lineWidth = 20
            ctx.lineCap = 'round'
            ctx.beginPath()
            ctx.arc(cx, cy + 22, 38, Math.PI * 1.15, Math.PI * 1.85)
            ctx.stroke()
        } else {
            const yukseklik = (ifade === 'odak' ? 62 : 88) * (1 - kirp * 0.88)
            yuvarlakDikdortgen(ctx, cx - 30, cy - yukseklik / 2, 60, Math.max(8, yukseklik), Math.min(26, yukseklik / 2))
            ctx.fill()
        }
    }
    ctx.restore()
}

// ---------------------------------------------------------------------------
// Malzemeler
// ---------------------------------------------------------------------------
function useMalzemeler() {
    return useMemo(
        () => ({
            // Seramik: büyük yüzeylerde cila katmanı yerine düşük pürüzlülük; ışık hesabı yarıya iner
            seramik: new THREE.MeshStandardMaterial({ color: '#F2F2F5', roughness: 0.22, metalness: 0, envMapIntensity: 1.25 }),
            grafit: new THREE.MeshStandardMaterial({ color: '#17171D', roughness: 0.4, metalness: 0.5, envMapIntensity: 1 }),
            yastik: new THREE.MeshStandardMaterial({ color: '#0E0E13', roughness: 0.85, metalness: 0 }),
            vizor: new THREE.MeshPhysicalMaterial({ color: '#030308', roughness: 0.05, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.8 }),
            led: new THREE.MeshStandardMaterial({ color: '#000000', emissive: '#9D7BFF', emissiveIntensity: 1.25, toneMapped: false }),
            ledSoluk: new THREE.MeshStandardMaterial({ color: '#000000', emissive: '#7C5CF0', emissiveIntensity: 1.1, toneMapped: false }),
            cam: new THREE.MeshPhysicalMaterial({ color: '#0B0B12', roughness: 0.18, metalness: 0.5, clearcoat: 1, envMapIntensity: 1.3 }),
            aluminyum: new THREE.MeshStandardMaterial({ color: '#B9BAC4', roughness: 0.28, metalness: 1, envMapIntensity: 1.2 }),
        }),
        []
    )
}

// Yumuşak radyal doku (parıltı, buhar, toz)
function yumusakDoku(ic = 'rgba(255,255,255,1)', dis = 'rgba(255,255,255,0)') {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const x = c.getContext('2d')
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, ic)
    g.addColorStop(1, dis)
    x.fillStyle = g
    x.fillRect(0, 0, 128, 128)
    const d = new THREE.CanvasTexture(c)
    d.colorSpace = THREE.SRGBColorSpace
    return d
}

// ---------------------------------------------------------------------------
// Klavye ve masa
// ---------------------------------------------------------------------------
const SATIR = 4
const SUTUN = 13
const TUS_ARA = 0.078
const KLAVYE = new THREE.Vector3(0, 0.425, 0.8)
const TUS_Y = KLAVYE.y + 0.04

function tusKonumu(i, hedef) {
    const r = Math.floor(i / SUTUN)
    const c = i % SUTUN
    return hedef.set(KLAVYE.x + (c - (SUTUN - 1) / 2) * TUS_ARA, TUS_Y, KLAVYE.z + (r - (SATIR - 1) / 2) * TUS_ARA)
}

function Klavye({ basilan, m }) {
    const tuslar = useRef()
    const geometri = useMemo(() => new RoundedBoxGeometry(0.066, 0.03, 0.066, 3, 0.013), [])
    const yardimci = useMemo(() => new THREE.Object3D(), [])
    const p = useMemo(() => new THREE.Vector3(), [])

    useEffect(() => {
        const renk = new THREE.Color()
        for (let i = 0; i < SATIR * SUTUN; i++) {
            const c = i % SUTUN
            const r = Math.floor(i / SUTUN)
            if (c === 0 || c === SUTUN - 1) renk.set('#2A2A33')
            else if (r === 2 && c === SUTUN - 2) renk.set('#8B5CF6')
            else renk.set('#E7E7EC')
            tuslar.current.setColorAt(i, renk)
        }
        tuslar.current.instanceColor.needsUpdate = true
    }, [])

    useFrame((_, dt) => {
        const b = basilan.current
        for (let i = 0; i < SATIR * SUTUN; i++) {
            b[i] = Math.max(0, b[i] - dt * 9)
            tusKonumu(i, p)
            yardimci.position.set(p.x, p.y - b[i] * 0.014, p.z)
            yardimci.updateMatrix()
            tuslar.current.setMatrixAt(i, yardimci.matrix)
        }
        tuslar.current.instanceMatrix.needsUpdate = true
    })

    return (
        <group>
            {/* Yüzen cam masa, alüminyum ayaklar, ön kenarda mor ışık şeridi */}
            <RoundedBox args={[1.9, 0.04, 0.74]} radius={0.018} smoothness={4} position={[0.12, 0.375, 0.8]} material={m.cam} />
            <mesh position={[0.12, 0.372, 1.172]} material={m.ledSoluk}>
                <boxGeometry args={[1.8, 0.005, 0.005]} />
            </mesh>
            {[-0.78, 1.02].map((x) => (
                <mesh key={x} position={[x, 0.18, 0.8]} material={m.aluminyum}>
                    <boxGeometry args={[0.02, 0.36, 0.6]} />
                </mesh>
            ))}
            <RoundedBox args={[1.1, 0.045, 0.42]} radius={0.02} smoothness={4} position={[KLAVYE.x, KLAVYE.y, KLAVYE.z]} material={m.grafit} />
            <instancedMesh ref={tuslar} args={[geometri, undefined, SATIR * SUTUN]}>
                <meshStandardMaterial roughness={0.36} metalness={0.05} envMapIntensity={0.95} />
            </instancedMesh>
        </group>
    )
}

// Kahve kupası ve tüten buhar
function Kupa({ m }) {
    const buhar = useRef([])
    const doku = useMemo(() => yumusakDoku('rgba(233,228,255,0.55)', 'rgba(233,228,255,0)'), [])
    useFrame((state) => {
        const t = state.clock.elapsedTime
        buhar.current.forEach((s, i) => {
            if (!s) return
            const f = (t * 0.35 + i / 3) % 1
            s.position.set(Math.sin(t * 1.2 + i * 2) * 0.02 * f, 0.1 + f * 0.32, 0)
            s.scale.setScalar(0.05 + f * 0.11)
            s.material.opacity = Math.sin(f * Math.PI) * 0.45
        })
    })
    return (
        <group position={[0.72, 0.395, 0.66]}>
            <mesh position={[0, 0.06, 0]} material={m.seramik}>
                <cylinderGeometry args={[0.052, 0.046, 0.12, 40]} />
            </mesh>
            <mesh position={[0, 0.115, 0]}>
                <cylinderGeometry args={[0.046, 0.046, 0.004, 40]} />
                <meshStandardMaterial color="#24140C" roughness={0.2} />
            </mesh>
            <mesh position={[0.058, 0.062, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.seramik}>
                <torusGeometry args={[0.03, 0.009, 12, 32, Math.PI * 1.25]} />
            </mesh>
            <mesh position={[0, 0.04, 0]} material={m.ledSoluk}>
                <cylinderGeometry args={[0.0525, 0.0525, 0.008, 40]} />
            </mesh>
            {[0, 1, 2].map((i) => (
                <sprite key={i} ref={(el) => (buhar.current[i] = el)}>
                    <spriteMaterial map={doku} transparent depthWrite={false} opacity={0} />
                </sprite>
            ))}
        </group>
    )
}

// ---------------------------------------------------------------------------
// Kol: iki parçalı ters kinematik; dört parmak, vuruşta biri iner
// ---------------------------------------------------------------------------
const UST = 0.5
const ALT = 0.46
const PARMAKLAR = [-0.051, -0.017, 0.017, 0.051]

function Kol({ taraf, hedef, el, m }) {
    const yon = useRef()
    const omuz = useRef()
    const dirsek = useRef()
    const bilek = useRef()
    const parmaklar = useRef([])
    const S = useMemo(() => new THREE.Vector3(taraf * 0.47, 0.95, 0.03), [taraf])

    useFrame(() => {
        const t = hedef.current
        const dx = t.x - S.x
        const dy = t.y - S.y
        const dz = t.z - S.z
        yon.current.rotation.y = Math.atan2(-dz, dx)
        const r = Math.hypot(dx, dz)
        const D = Math.min(Math.hypot(r, dy), UST + ALT - 0.001)
        const a1 = Math.atan2(dy, r) - Math.acos((UST * UST + D * D - ALT * ALT) / (2 * UST * D))
        const a2 = Math.PI - Math.acos((UST * UST + ALT * ALT - D * D) / (2 * UST * ALT))
        omuz.current.rotation.z = a1
        dirsek.current.rotation.z = a2
        bilek.current.rotation.z = -(a1 + a2) - 0.12
        const e = el.current
        parmaklar.current.forEach((p, i) => {
            if (!p) return
            const dip = i === e.parmak ? e.vurus : 0
            p.rotation.z = -0.35 - dip * 0.55
        })
    })

    return (
        <group position={S}>
            <mesh material={m.grafit}>
                <sphereGeometry args={[0.095, 32, 24]} />
            </mesh>
            {/* Omuz LED halkası */}
            <mesh rotation={[0, Math.PI / 2, 0]} position={[taraf * 0.06, 0, 0]} material={m.led}>
                <torusGeometry args={[0.078, 0.007, 10, 48]} />
            </mesh>
            <group ref={yon}>
                <group ref={omuz}>
                    <mesh position={[UST / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={m.seramik}>
                        <capsuleGeometry args={[0.068, UST - 0.14, 10, 28]} />
                    </mesh>
                    <group ref={dirsek} position={[UST, 0, 0]}>
                        <mesh material={m.grafit}>
                            <sphereGeometry args={[0.072, 28, 20]} />
                        </mesh>
                        <mesh position={[ALT / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={m.seramik}>
                            <capsuleGeometry args={[0.058, ALT - 0.12, 10, 28]} />
                        </mesh>
                        <group ref={bilek} position={[ALT, 0, 0]}>
                            <mesh material={m.grafit}>
                                <sphereGeometry args={[0.05, 24, 16]} />
                            </mesh>
                            <RoundedBox args={[0.16, 0.05, 0.14]} radius={0.022} smoothness={4} position={[0.08, -0.004, 0]} material={m.seramik} />
                            {PARMAKLAR.map((z, i) => (
                                <group key={z} position={[0.155, -0.008, z]} ref={(g) => (parmaklar.current[i] = g)}>
                                    <mesh position={[0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={m.grafit}>
                                        <capsuleGeometry args={[0.012, 0.042, 4, 12]} />
                                    </mesh>
                                </group>
                            ))}
                        </group>
                    </group>
                </group>
            </group>
        </group>
    )
}

// ---------------------------------------------------------------------------
// Gövde ve kafa
// ---------------------------------------------------------------------------
function govdeGeometrisi() {
    const egri = new THREE.SplineCurve([
        new THREE.Vector2(0.001, 0.12),
        new THREE.Vector2(0.25, 0.14),
        new THREE.Vector2(0.33, 0.3),
        new THREE.Vector2(0.38, 0.55),
        new THREE.Vector2(0.41, 0.78),
        new THREE.Vector2(0.38, 0.93),
        new THREE.Vector2(0.27, 1.02),
        new THREE.Vector2(0.12, 1.06),
        new THREE.Vector2(0.001, 1.07),
    ])
    const g = new THREE.LatheGeometry(egri.getPoints(64), 96)
    g.computeVertexNormals()
    return g
}

function Robot({ durum, m }) {
    const govde = useRef()
    const kafa = useRef()
    const anten = useRef()
    const halka = useRef()
    const cubuklar = useRef([])
    const govdeGeo = useMemo(govdeGeometrisi, [])

    // Yüz ekranı dokusu
    const yuzTuval = useMemo(() => {
        const c = document.createElement('canvas')
        c.width = YG
        c.height = YY
        return c
    }, [])
    const yuzDoku = useMemo(() => {
        const d = new THREE.CanvasTexture(yuzTuval)
        d.colorSpace = THREE.SRGBColorSpace
        return d
    }, [yuzTuval])
    const sonYuz = useRef('')

    useFrame((state, dt) => {
        const t = state.clock.elapsedTime
        const d = durum.current
        const k = Math.min(1, dt * 5)

        govde.current.position.y = Math.sin(t * 1.6) * 0.008

        let yaw = 0.58 + Math.sin(t * 0.7) * 0.03
        let pitch = -0.06
        if (d.bakis === 'klavye') {
            yaw = 0.1
            pitch = -0.32
        } else if (d.bakis === 'kamera') {
            yaw = -0.14
            pitch = 0.06
        }
        kafa.current.rotation.y += (yaw - kafa.current.rotation.y) * k
        kafa.current.rotation.x += (-pitch - kafa.current.rotation.x) * k
        kafa.current.rotation.z = Math.sin(t * 0.9) * 0.02 + (d.kutlama > 0 ? Math.sin(t * 9) * 0.06 : 0)

        // Yüz ifadesi: göz bebekleri bakış yönüne kayar
        const ifade = d.bakis === 'kamera' || d.kutlama > 0 ? 'mutlu' : d.yaziyor ? 'odak' : 'normal'
        const bakX = d.bakis === 'ekran' ? 26 : d.bakis === 'klavye' ? 6 : 0
        const bakY = d.bakis === 'klavye' ? 22 : 0
        const kirp = d.kirpma > 0 ? 1 : 0
        const anahtar = `${ifade}|${bakX}|${bakY}|${kirp}`
        if (anahtar !== sonYuz.current) {
            sonYuz.current = anahtar
            yuzCiz(yuzTuval.getContext('2d'), ifade, bakX, bakY, kirp)
            yuzDoku.needsUpdate = true
        }

        const hiz = d.yaziyor ? 7 : 2.2
        anten.current.emissiveIntensity = 1 + Math.sin(t * hiz) * 0.5
        halka.current.emissiveIntensity = 1.1 + Math.sin(t * 1.8) * 0.3

        cubuklar.current.forEach((c, i) => {
            if (!c) return
            const hedef = d.yaziyor || d.kutlama > 0 ? 0.35 + Math.abs(Math.sin(t * (9 + i * 2.3) + i)) * 0.65 : 0.25
            c.scale.y += (hedef - c.scale.y) * Math.min(1, dt * 12)
        })
    })

    return (
        <group>
            {/* Yüzen taban */}
            <mesh position={[0, 0.035, 0]} material={m.grafit}>
                <cylinderGeometry args={[0.46, 0.52, 0.07, 72]} />
            </mesh>
            <mesh position={[0, 0.072, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.44, 0.011, 12, 120]} />
                <meshStandardMaterial ref={halka} color="#000000" emissive="#8B5CF6" emissiveIntensity={1.1} toneMapped={false} />
            </mesh>

            <group ref={govde}>
                <mesh geometry={govdeGeo} material={m.seramik} />
                {/* Bel halkası */}
                <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.grafit}>
                    <torusGeometry args={[0.275, 0.018, 12, 72]} />
                </mesh>

                {/* Göğüs paneli ve ışık çubukları */}
                <RoundedBox args={[0.32, 0.17, 0.05]} radius={0.03} smoothness={4} position={[0, 0.68, 0.365]} rotation={[-0.08, 0, 0]} material={m.vizor} />
                {[0, 1, 2, 3, 4].map((i) => (
                    <mesh key={i} ref={(el) => (cubuklar.current[i] = el)} position={[-0.1 + i * 0.05, 0.66, 0.395]} rotation={[-0.08, 0, 0]} material={m.led}>
                        <boxGeometry args={[0.022, 0.09, 0.006]} />
                    </mesh>
                ))}

                <mesh position={[0, 1.1, 0]} material={m.grafit}>
                    <cylinderGeometry args={[0.09, 0.11, 0.1, 32]} />
                </mesh>

                {/* Kafa */}
                <group ref={kafa} position={[0, 1.36, 0]}>
                    <RoundedBox args={[0.8, 0.56, 0.6]} radius={0.17} smoothness={8} material={m.seramik} />
                    <RoundedBox args={[0.66, 0.34, 0.08]} radius={0.12} smoothness={8} position={[0, -0.01, 0.27]} material={m.vizor} />
                    {/* Dijital yüz */}
                    <mesh position={[0, -0.01, 0.3115]}>
                        <planeGeometry args={[0.6, 0.3]} />
                        <meshBasicMaterial map={yuzDoku} transparent depthWrite={false} toneMapped={false} />
                    </mesh>

                    {/* Kulaklık: kafa bandı ve yastıklı kulak kapları */}
                    <mesh position={[0, 0.02, -0.02]} material={m.grafit}>
                        <torusGeometry args={[0.455, 0.03, 16, 72, Math.PI]} />
                    </mesh>
                    {[-1, 1].map((s) => (
                        <group key={s} position={[s * 0.43, -0.02, -0.02]} rotation={[0, 0, Math.PI / 2]}>
                            <mesh material={m.grafit}>
                                <cylinderGeometry args={[0.135, 0.135, 0.09, 48]} />
                            </mesh>
                            <mesh position={[0, -s * 0.05, 0]} material={m.yastik}>
                                <cylinderGeometry args={[0.12, 0.12, 0.03, 48]} />
                            </mesh>
                            <mesh position={[0, s * 0.047, 0]} material={m.ledSoluk}>
                                <torusGeometry args={[0.09, 0.008, 10, 48]} />
                            </mesh>
                        </group>
                    ))}

                    {/* Anten */}
                    <mesh position={[0.2, 0.34, -0.08]} material={m.grafit}>
                        <cylinderGeometry args={[0.011, 0.011, 0.14, 12]} />
                    </mesh>
                    <mesh position={[0.2, 0.42, -0.08]}>
                        <sphereGeometry args={[0.03, 24, 16]} />
                        <meshStandardMaterial ref={anten} color="#000000" emissive="#B9A4FF" emissiveIntensity={1} toneMapped={false} />
                    </mesh>
                </group>
            </group>
        </group>
    )
}

// ---------------------------------------------------------------------------
// Cam kod ekranı (alüminyum çerçeve, arkasında mor parıltı)
// ---------------------------------------------------------------------------
function KodEkrani({ doku }) {
    const kutu = useRef()
    const parlalti = useMemo(() => yumusakDoku('rgba(139,92,246,0.55)', 'rgba(139,92,246,0)'), [])
    useFrame((state) => {
        kutu.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 0.9) * 0.02
    })
    return (
        <group ref={kutu} position={[1.55, 1.2, 0.05]} rotation={[0, -0.6, 0]}>
            <mesh position={[0, 0, -0.08]}>
                <planeGeometry args={[3.6, 2.4]} />
                <meshBasicMaterial map={parlalti} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </mesh>
            <RoundedBox args={[2.08, 1.26, 0.035]} radius={0.045} smoothness={4}>
                <meshStandardMaterial color="#9C9DA8" roughness={0.3} metalness={1} envMapIntensity={1.2} />
            </RoundedBox>
            <RoundedBox args={[2.04, 1.22, 0.036]} radius={0.04} smoothness={4} position={[0, 0, 0.002]}>
                <meshPhysicalMaterial color="#050508" roughness={0.12} metalness={0.4} clearcoat={1} envMapIntensity={1.4} />
            </RoundedBox>
            <mesh position={[0, 0, 0.021]}>
                <planeGeometry args={[1.98, 1.16]} />
                <meshBasicMaterial map={doku} toneMapped={false} />
            </mesh>
        </group>
    )
}

// ---------------------------------------------------------------------------
// Atmosfer: üstten ışık konisi, toz, kutlama parçacıkları
// ---------------------------------------------------------------------------
function IsikKonisi() {
    const doku = useMemo(() => {
        const c = document.createElement('canvas')
        c.width = 4
        c.height = 256
        const x = c.getContext('2d')
        const g = x.createLinearGradient(0, 0, 0, 256)
        g.addColorStop(0, 'rgba(237,233,255,0.55)')
        g.addColorStop(0.6, 'rgba(167,139,250,0.12)')
        g.addColorStop(1, 'rgba(167,139,250,0)')
        x.fillStyle = g
        x.fillRect(0, 0, 4, 256)
        const d = new THREE.CanvasTexture(c)
        d.colorSpace = THREE.SRGBColorSpace
        return d
    }, [])
    return (
        <mesh position={[0, 1.9, 0.15]}>
            <cylinderGeometry args={[0.06, 1.25, 3.8, 64, 1, true]} />
            <meshBasicMaterial map={doku} transparent opacity={0.32} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
    )
}

function Toz({ adet = 160 }) {
    const noktalar = useRef()
    const doku = useMemo(() => yumusakDoku(), [])
    const konum = useMemo(() => {
        const k = new Float32Array(adet * 3)
        for (let i = 0; i < adet; i++) {
            k[i * 3] = (Math.random() - 0.4) * 5
            k[i * 3 + 1] = Math.random() * 3
            k[i * 3 + 2] = (Math.random() - 0.5) * 3
        }
        return k
    }, [adet])
    useFrame((state, dt) => {
        const t = state.clock.elapsedTime
        for (let i = 0; i < adet; i++) {
            konum[i * 3 + 1] += dt * (0.03 + (i % 5) * 0.01)
            konum[i * 3] += Math.sin(t * 0.3 + i) * dt * 0.02
            if (konum[i * 3 + 1] > 3) konum[i * 3 + 1] = 0
        }
        noktalar.current.geometry.attributes.position.needsUpdate = true
    })
    return (
        <points ref={noktalar} frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[konum, 3]} />
            </bufferGeometry>
            <pointsMaterial map={doku} color="#C4B5FD" size={0.022} sizeAttenuation transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    )
}

const KONFETI = 140
function Kutlama({ durum }) {
    const noktalar = useRef()
    const doku = useMemo(() => yumusakDoku(), [])
    const v = useMemo(() => ({ konum: new Float32Array(KONFETI * 3).fill(-99), hiz: new Float32Array(KONFETI * 3), son: 0, omur: 0 }), [])
    useFrame((_, dtHam) => {
        const dt = Math.min(dtHam, 1 / 30)
        const d = durum.current
        if (d.kutlamaSayaci !== v.son) {
            v.son = d.kutlamaSayaci
            v.omur = 2.2
            for (let i = 0; i < KONFETI; i++) {
                v.konum[i * 3] = (Math.random() - 0.5) * 0.3
                v.konum[i * 3 + 1] = 1.75
                v.konum[i * 3 + 2] = (Math.random() - 0.5) * 0.3
                const a = Math.random() * Math.PI * 2
                const h = 0.6 + Math.random() * 1.6
                v.hiz[i * 3] = Math.cos(a) * h
                v.hiz[i * 3 + 1] = 1.2 + Math.random() * 2.2
                v.hiz[i * 3 + 2] = Math.sin(a) * h
            }
        }
        if (v.omur <= 0) {
            noktalar.current.visible = false
            return
        }
        noktalar.current.visible = true
        v.omur -= dt
        for (let i = 0; i < KONFETI; i++) {
            v.hiz[i * 3 + 1] -= 3.2 * dt
            v.konum[i * 3] += v.hiz[i * 3] * dt
            v.konum[i * 3 + 1] += v.hiz[i * 3 + 1] * dt
            v.konum[i * 3 + 2] += v.hiz[i * 3 + 2] * dt
        }
        noktalar.current.geometry.attributes.position.needsUpdate = true
        noktalar.current.material.opacity = Math.min(1, v.omur)
    })
    return (
        <points ref={noktalar} frustumCulled={false} visible={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[v.konum, 3]} />
            </bufferGeometry>
            <pointsMaterial map={doku} color="#D8CCFF" size={0.05} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    )
}

// ---------------------------------------------------------------------------
// Sahne: yazma motoru, eller, bakış, kutlama
// ---------------------------------------------------------------------------
const SOL_EV = new THREE.Vector3(-0.24, 0.43, 0.8)
const SAG_EV = new THREE.Vector3(0.24, 0.43, 0.8)
const SOL_KUTLAMA = new THREE.Vector3(-0.62, 1.55, 0.32)
const SAG_KUTLAMA = new THREE.Vector3(0.62, 1.55, 0.32)

function hareketAzaltilsinMi() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function KodYazanRobot({ asamaRef, gorunurRef }) {
    const m = useMalzemeler()
    const azalt = useMemo(hareketAzaltilsinMi, [])

    const tuval = useMemo(() => {
        const c = document.createElement('canvas')
        c.width = EG * OLCEK
        c.height = EY * OLCEK
        return c
    }, [])
    const doku = useMemo(() => {
        const d = new THREE.CanvasTexture(tuval)
        d.colorSpace = THREE.SRGBColorSpace
        d.anisotropy = 8
        return d
    }, [tuval])

    const basilan = useRef(new Float32Array(SATIR * SUTUN))
    const solHedef = useRef(new THREE.Vector3(-0.24, 0.52, 0.66))
    const sagHedef = useRef(new THREE.Vector3(0.24, 0.52, 0.66))
    const solEl = useRef({ tus: 16, vurus: 0, parmak: 1 })
    const sagEl = useRef({ tus: 22, vurus: 0, parmak: 2 })
    const durum = useRef({
        asama: -1,
        yazilan: 0,
        sonCizilen: -1,
        imlec: true,
        imlecZaman: 0,
        el: 0,
        yaziyor: false,
        bakis: 'ekran',
        bakisSure: 3,
        kirpma: 0,
        kirpmaSure: 2.5,
        bitti: false,
        kutlama: 0,
        kutlamaSayaci: 0,
    })
    const gecici = useMemo(() => new THREE.Vector3(), [])
    const isikHavuzu = useMemo(() => yumusakDoku('rgba(139,92,246,0.35)', 'rgba(139,92,246,0)'), [])

    // Yazı tipleri yüklenince ekranı yeniden çiz
    useEffect(() => {
        Promise.all([
            document.fonts?.load('500 17px "JetBrains Mono Variable"'),
            document.fonts?.load('600 17px "Plus Jakarta Sans Variable"'),
        ]).then(() => {
            durum.current.sonCizilen = -1
        })
    }, [])

    const sonCizim = useRef(0)

    useFrame((state, dtHam) => {
        // Bölüm ekranda değilse robot bekler; sen gelince yazmaya başlar
        if (gorunurRef && !gorunurRef.current) return
        const dt = Math.min(dtHam, 1 / 20)
        const d = durum.current
        const asama = asamaRef.current
        const sahne = SAHNELER[asama]
        const toplam = toplamKarakter(sahne)

        if (asama !== d.asama) {
            d.asama = asama
            d.yazilan = azalt ? toplam : 0
            d.bitti = false
            d.bakis = 'ekran'
            d.kutlama = 0
            d.sonCizilen = -1
        }

        // Yazma motoru: saniyede ~26 karakter, insansı düzensizlikle
        const onceki = Math.floor(d.yazilan)
        d.yaziyor = d.yazilan < toplam
        if (d.yaziyor) d.yazilan = Math.min(toplam, d.yazilan + dt * (20 + Math.random() * 14))
        const simdi = Math.floor(d.yazilan)
        for (let i = onceki; i < simdi; i++) {
            const solMu = d.el % 2 === 0
            const el = solMu ? solEl.current : sagEl.current
            const sutun = solMu ? Math.floor(Math.random() * 6) + 1 : Math.floor(Math.random() * 6) + 6
            const satir = Math.floor(Math.random() * SATIR)
            el.tus = satir * SUTUN + sutun
            el.vurus = 1
            el.parmak = Math.floor(Math.random() * 4)
            basilan.current[el.tus] = 1
            d.el++
        }
        if (!d.yaziyor && !d.bitti && d.yazilan >= toplam) {
            d.bitti = true
            if (asama === SAHNELER.length - 1 && !azalt) {
                // Teslim bitti: kollar havaya, parçacıklar
                d.kutlama = 2.2
                d.kutlamaSayaci++
            }
            d.bakis = 'kamera'
            d.bakisSure = 2
        }
        d.kutlama = Math.max(0, d.kutlama - dt)

        // Eller
        const eliKonumla = (hedef, el, ev, kutlamaHedef, taraf) => {
            const e = el.current
            e.vurus = Math.max(0, e.vurus - dt * 10)
            let hx, hy, hz, kat
            if (d.kutlama > 0) {
                hx = kutlamaHedef.x + Math.sin(d.kutlama * 10 + taraf) * 0.06
                hy = kutlamaHedef.y + Math.sin(d.kutlama * 14) * 0.04
                hz = kutlamaHedef.z
                kat = Math.min(1, dt * 7)
            } else if (d.yaziyor) {
                tusKonumu(e.tus, gecici)
                hx = gecici.x
                hy = gecici.y + 0.085 - e.vurus * 0.045
                hz = gecici.z - 0.16
                kat = Math.min(1, dt * 16)
            } else {
                hx = ev.x
                hy = ev.y + 0.1
                hz = ev.z - 0.16
                kat = Math.min(1, dt * 4)
            }
            hedef.x += (hx - hedef.x) * kat
            hedef.y += (hy - hedef.y) * kat
            hedef.z += (hz - hedef.z) * kat
        }
        eliKonumla(solHedef.current, solEl, SOL_EV, SOL_KUTLAMA, 0)
        eliKonumla(sagHedef.current, sagEl, SAG_EV, SAG_KUTLAMA, 1.5)

        // Bakış ve göz kırpma
        d.bakisSure -= dt
        if (d.bakisSure <= 0) {
            if (d.bakis === 'kamera' || d.bakis === 'klavye') {
                d.bakis = 'ekran'
                d.bakisSure = 3 + Math.random() * 3
            } else if (d.yaziyor) {
                d.bakis = 'klavye'
                d.bakisSure = 0.7
            } else {
                d.bakisSure = 2
            }
        }
        d.kirpmaSure -= dt
        if (d.kirpmaSure <= 0) {
            d.kirpma = 0.13
            d.kirpmaSure = 2.4 + Math.random() * 3
        }
        d.kirpma = Math.max(0, d.kirpma - dt)

        // Ekran: yalnızca değişince yeniden çizilir
        d.imlecZaman += dt
        if (d.imlecZaman > 0.5) {
            d.imlecZaman = 0
            d.imlec = !d.imlec
            d.sonCizilen = -1
        }
        // Ekran dokusu en fazla saniyede 15 kez yüklenir; büyük doku her harfte gönderilmez
        const t = state.clock.elapsedTime
        if (simdi !== d.sonCizilen && (t - sonCizim.current > 1 / 15 || simdi === toplam)) {
            sonCizim.current = t
            d.sonCizilen = simdi
            ekraniCiz(tuval.getContext('2d'), asama, sahne, simdi, d.imlec || d.yaziyor)
            doku.needsUpdate = true
        }
    })

    return (
        <group position={[-0.3, -0.62, 0]}>
            <fog attach="fog" args={['#000000', 6.5, 15]} />
            <spotLight position={[0, 3.6, 0.8]} angle={0.42} penumbra={0.9} intensity={18} distance={9} decay={1.4} color="#F1EDFF" />
            <pointLight position={[0.2, 1.4, -1.2]} intensity={5} distance={5} decay={1.5} color="#8B5CF6" />

            {/* Parlak siyah zemin: ortam ışığını yansıtır; ayna çizimi yapmaz */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.6, 0, 0]}>
                <planeGeometry args={[16, 16]} />
                <meshStandardMaterial color="#05050A" roughness={0.32} metalness={0.7} envMapIntensity={0.6} />
            </mesh>
            {/* Robotun altındaki mor ışık havuzu */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.003, 0.35]}>
                <planeGeometry args={[3.4, 2.6]} />
                <meshBasicMaterial map={isikHavuzu} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </mesh>
            {/* Temas gölgesi bir kez hesaplanır */}
            <ContactShadows frames={1} position={[0.3, 0.004, 0.3]} opacity={0.65} scale={5} blur={2.4} far={1.6} resolution={256} color="#000000" />

            <IsikKonisi />
            <Toz />
            <Robot durum={durum} m={m} />
            <Kol taraf={-1} hedef={solHedef} el={solEl} m={m} />
            <Kol taraf={1} hedef={sagHedef} el={sagEl} m={m} />
            <Klavye basilan={basilan} m={m} />
            <Kupa m={m} />
            <KodEkrani doku={doku} />
            <Kutlama durum={durum} />
        </group>
    )
}
