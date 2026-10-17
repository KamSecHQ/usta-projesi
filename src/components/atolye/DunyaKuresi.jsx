import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { KARA_GENISLIK, KARA_YUKSEKLIK, KARA_MASKESI } from './karaMaskesi'

// Hero küresi: yıldızlı gökte, kıtaları mor nokta matrisiyle çizilmiş, yavaşça dönen Dünya.
// Kıtalar Natural Earth (kamu malı) verisinden üretilen maskeden gelir (karaMaskesi.js).
// Ağ çizgileri ve üzerlerinde akan ışık darbeleri İstanbul'dan dünyaya uzanır.
// Kadraj, eski hero videosunun kompozisyonunu birebir izler: küre, 1.6 oranlı "cover" kutuya
// göre yerleşir (merkez kutunun %92'si aşağıda, yarıçap genişliğin %46'sı). Böylece poster
// (aynı sahnenin kaydı) ile canlı küre üst üste oturur ve aralarındaki geçiş görünmez.

const D2R = Math.PI / 180
const BASLANGIC_BOYLAM = -5 // önde duran boylam: Türkiye metin bloğunun sağında görünür
const EGIM = 0.2 // kuzey yarıküre hafifçe kameraya döner
const DONUS_HIZI = 0.0175 // rad/sn, yaklaşık 6 dakikada bir tur
const ISTANBUL = [41.0, 29.0]
const FOV = 22
const NOKTA_ADIMI = 1 // derece; maske 1° çözünürlükte

function tohumlu(t) {
    return () => {
        t = (t + 0x6d2b79f5) | 0
        let r = Math.imul(t ^ (t >>> 15), 1 | t)
        r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296
    }
}

function kureNoktasi(lat, lon, r = 1) {
    const a = lat * D2R
    const b = lon * D2R
    return new THREE.Vector3(r * Math.cos(a) * Math.sin(b), r * Math.sin(a), r * Math.cos(a) * Math.cos(b))
}

let maske
function karaMi(lat, lon) {
    if (!maske) {
        const ikili = atob(KARA_MASKESI)
        maske = new Uint8Array(ikili.length)
        for (let i = 0; i < ikili.length; i++) maske[i] = ikili.charCodeAt(i)
    }
    const satir = Math.min(KARA_YUKSEKLIK - 1, Math.max(0, Math.floor(90 - lat)))
    const sutun = (((Math.floor(lon + 180) % KARA_GENISLIK) + KARA_GENISLIK) % KARA_GENISLIK)
    const n = satir * KARA_GENISLIK + sutun
    return (maske[n >> 3] >> (n & 7)) & 1
}

function turkiyeMi(lat, lon) {
    if (lat < 35.8 || lat > 42.2 || lon < 26 || lon > 44.8) return false
    if (lat < 37 && lon > 36.6) return false // Suriye
    if (lat > 41.3 && lon > 41.6) return false // Gürcistan
    return true
}

// ---------- Geometriler (bir kez kurulur) ----------

function karaGeometrisi() {
    const konum = []
    const faz = []
    const vurgu = []
    const rnd = tohumlu(7)
    for (let lat = -56; lat <= 82; lat += NOKTA_ADIMI) {
        const adet = Math.max(1, Math.round((360 / NOKTA_ADIMI) * Math.cos(lat * D2R)))
        for (let i = 0; i < adet; i++) {
            const lon = -180 + ((i + 0.5) * 360) / adet
            if (!karaMi(lat, lon)) continue
            const p = kureNoktasi(lat, lon, 1.002)
            konum.push(p.x, p.y, p.z)
            faz.push(rnd())
            vurgu.push(turkiyeMi(lat, lon) ? 1 : 0)
        }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3))
    g.setAttribute('aFaz', new THREE.Float32BufferAttribute(faz, 1))
    g.setAttribute('aVurgu', new THREE.Float32BufferAttribute(vurgu, 1))
    return g
}

function agGeometrisi() {
    const rnd = tohumlu(42)
    const merkez = kureNoktasi(...ISTANBUL)
    const dugumler = [merkez]
    for (let deneme = 0; deneme < 6000 && dugumler.length < 84; deneme++) {
        const lat = Math.asin(2 * rnd() - 1) / D2R
        const lon = rnd() * 360 - 180
        if (lat < -48 || lat > 74) continue
        if (!karaMi(lat, lon) && rnd() > 0.1) continue
        const p = kureNoktasi(lat, lon)
        if (dugumler.some((d) => d.angleTo(p) < 9 * D2R)) continue
        dugumler.push(p)
    }

    const kenarlar = new Set()
    dugumler.forEach((a, i) => {
        dugumler
            .map((b, j) => [j, a.angleTo(b)])
            .filter(([j, aci]) => j !== i && aci < 38 * D2R)
            .sort((x, y) => x[1] - y[1])
            .slice(0, 3)
            .forEach(([j]) => kenarlar.add(i < j ? `${i}-${j}` : `${j}-${i}`))
    })
    // İstanbul'dan dünyaya: uzak düğümlere uzun yaylar
    dugumler
        .map((d, j) => [j, merkez.angleTo(d)])
        .filter(([, aci]) => aci > 22 * D2R && aci < 115 * D2R)
        .sort(() => rnd() - 0.5)
        .slice(0, 10)
        .forEach(([j]) => kenarlar.add(`0-${j}`))

    const konum = []
    const t = []
    const faz = []
    const nabiz = []
    for (const k of kenarlar) {
        const [i, j] = k.split('-').map(Number)
        const a = dugumler[i]
        const b = dugumler[j]
        const aci = a.angleTo(b)
        const yukseklik = 0.012 + 0.16 * (aci / Math.PI)
        const parca = Math.max(10, Math.round(aci / (2.5 * D2R)))
        const f = rnd()
        const darbe = i === 0 || rnd() < 0.3 ? 1 : 0
        const nokta = (u) => {
            const p = new THREE.Vector3().copy(a).lerp(b, u).normalize()
            // küresel ara değer: lerp + normalize, kısa yaylarda yeterince düzgün
            return p.multiplyScalar(1.004 + yukseklik * Math.sin(Math.PI * u))
        }
        for (let s = 0; s < parca; s++) {
            const u0 = s / parca
            const u1 = (s + 1) / parca
            const p0 = nokta(u0)
            const p1 = nokta(u1)
            konum.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z)
            t.push(u0, u1)
            faz.push(f, f)
            nabiz.push(darbe, darbe)
        }
    }
    const cizgi = new THREE.BufferGeometry()
    cizgi.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3))
    cizgi.setAttribute('aT', new THREE.Float32BufferAttribute(t, 1))
    cizgi.setAttribute('aFaz', new THREE.Float32BufferAttribute(faz, 1))
    cizgi.setAttribute('aNabiz', new THREE.Float32BufferAttribute(nabiz, 1))

    const dKonum = []
    const dMerkez = []
    dugumler.forEach((d, i) => {
        const p = d.clone().multiplyScalar(1.006)
        dKonum.push(p.x, p.y, p.z)
        dMerkez.push(i === 0 ? 1 : 0)
    })
    const dugum = new THREE.BufferGeometry()
    dugum.setAttribute('position', new THREE.Float32BufferAttribute(dKonum, 3))
    dugum.setAttribute('aMerkez', new THREE.Float32BufferAttribute(dMerkez, 1))
    return { cizgi, dugum }
}

function yorungeGeometrisi(yaricap) {
    const konum = []
    const u = []
    const N = 384
    for (let i = 0; i < N; i++) {
        for (const k of [i, i + 1]) {
            const a = (k / N) * Math.PI * 2
            konum.push(Math.cos(a) * yaricap, 0, Math.sin(a) * yaricap)
            u.push(k / N)
        }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3))
    g.setAttribute('aU', new THREE.Float32BufferAttribute(u, 1))
    return g
}

function yildizGeometrisi() {
    const rnd = tohumlu(99)
    const konum = []
    const boyut = []
    const faz = []
    const parilti = []
    const tan = Math.tan((FOV / 2) * D2R)
    for (let i = 0; i < 1500; i++) {
        const z = -18 - rnd() * 40
        const uzaklik = 4 - z
        konum.push((rnd() * 2 - 1) * uzaklik * tan * 2.7, (rnd() * 2 - 1) * uzaklik * tan * 1.15 + 0.6, z)
        const r = rnd()
        boyut.push(0.7 + r * r * r * 2.1)
        faz.push(rnd())
        parilti.push(rnd() < 0.045 ? 1 : 0)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3))
    g.setAttribute('aBoyut', new THREE.Float32BufferAttribute(boyut, 1))
    g.setAttribute('aFaz', new THREE.Float32BufferAttribute(faz, 1))
    g.setAttribute('aParilti', new THREE.Float32BufferAttribute(parilti, 1))
    return g
}

// ---------- Shader parçaları ----------

const ORTAK = /* glsl */ `
uniform float uZaman;
uniform vec4 uMetin;
// Metin bloğunun arkasında kalan ışıklar kısılır: başlık ve düğmeler her zaman okunur kalır
float metinMaskesi(vec2 e) {
    vec2 d = (e - uMetin.xy) / max(uMetin.zw, vec2(0.001));
    return mix(0.5, 1.0, smoothstep(0.72, 1.18, length(d)));
}
// Kameraya bakan yüz: 1 önde, 0 kenarda, eksi arka yüzde
float yuzOrani(vec3 yerel, vec4 mv) {
    vec3 n = normalize(normalMatrix * yerel);
    return dot(n, normalize(-mv.xyz));
}
`

const KARA_VS = /* glsl */ `
${ORTAK}
uniform float uBoyut;
attribute float aFaz;
attribute float aVurgu;
varying float vParlak;
varying float vVurgu;
void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float yuz = yuzOrani(position, mv);
    gl_Position = projectionMatrix * mv;
    float on = step(0.0, yuz);
    float kenar = smoothstep(0.0, 0.55, yuz);
    float pir = 0.74 + 0.26 * sin(uZaman * (0.7 + aFaz * 1.5) + aFaz * 40.0);
    vParlak = on * mix(0.3, 1.0, kenar) * pir * metinMaskesi(gl_Position.xy / gl_Position.w);
    vVurgu = aVurgu;
    gl_PointSize = on * uBoyut * mix(0.45, 1.0, kenar) * (1.0 + aVurgu * 0.3);
}
`

const KARA_FS = /* glsl */ `
varying float vParlak;
varying float vVurgu;
void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d) * vParlak;
    if (a < 0.01) discard;
    vec3 renk = mix(vec3(0.62, 0.52, 1.0), vec3(0.96, 0.93, 1.0), clamp(vVurgu * 0.85 + vParlak * 0.25, 0.0, 1.0));
    gl_FragColor = vec4(renk, a);
}
`

const CIZGI_VS = /* glsl */ `
${ORTAK}
attribute float aT;
attribute float aFaz;
attribute float aNabiz;
varying float vT;
varying float vFaz;
varying float vNabiz;
varying float vKenar;
varying float vMetin;
void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vKenar = smoothstep(-0.02, 0.4, yuzOrani(position, mv));
    gl_Position = projectionMatrix * mv;
    vMetin = metinMaskesi(gl_Position.xy / gl_Position.w);
    vT = aT;
    vFaz = aFaz;
    vNabiz = aNabiz;
}
`

const CIZGI_FS = /* glsl */ `
uniform float uZaman;
varying float vT;
varying float vFaz;
varying float vNabiz;
varying float vKenar;
varying float vMetin;
void main() {
    float bas = fract(uZaman * 0.085 + vFaz * 7.0);
    float iz = vT <= bas ? smoothstep(0.16, 0.0, bas - vT) : 0.0;
    float darbe = vNabiz * iz;
    float a = (0.3 + darbe * 0.95) * vKenar * vMetin;
    gl_FragColor = vec4(mix(vec3(0.62, 0.52, 1.0), vec3(1.0), darbe), a);
}
`

const DUGUM_VS = /* glsl */ `
${ORTAK}
uniform float uBoyut;
attribute float aMerkez;
varying float vParlak;
varying float vMerkez;
void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float yuz = yuzOrani(position, mv);
    gl_Position = projectionMatrix * mv;
    float on = step(0.0, yuz);
    vParlak = on * smoothstep(0.0, 0.4, yuz) * metinMaskesi(gl_Position.xy / gl_Position.w);
    vMerkez = aMerkez;
    gl_PointSize = on * uBoyut * mix(1.0, 9.0, aMerkez);
}
`

const DUGUM_FS = /* glsl */ `
uniform float uZaman;
varying float vParlak;
varying float vMerkez;
void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float cekirdek = smoothstep(1.0, 0.0, d);
    float a = cekirdek * cekirdek;
    if (vMerkez > 0.5) {
        // İstanbul: parlak çekirdek ve dışa yayılan halka
        float c = smoothstep(0.16, 0.0, d);
        float r = fract(uZaman * 0.45);
        float halka = smoothstep(0.05, 0.0, abs(d - r)) * (1.0 - r);
        float hale = smoothstep(0.55, 0.0, d) * 0.35;
        a = c + halka * 0.8 + hale;
    }
    a *= vParlak;
    if (a < 0.01) discard;
    gl_FragColor = vec4(mix(vec3(0.75, 0.68, 1.0), vec3(1.0), 0.6), a);
}
`

const GOVDE_VS = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
}
`

const GOVDE_FS = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main() {
    float f = 1.0 - max(dot(vN, vV), 0.0);
    vec3 taban = vec3(0.010, 0.006, 0.028);
    float isik = smoothstep(0.2, 1.0, dot(vN, normalize(vec3(-0.35, 0.85, 0.45))));
    vec3 kenar = mix(vec3(0.30, 0.18, 0.85), vec3(0.86, 0.80, 1.0), pow(f, 7.0));
    vec3 renk = taban + vec3(0.06, 0.035, 0.16) * isik * 0.3 + kenar * pow(f, 5.0) * 1.1;
    gl_FragColor = vec4(renk, 1.0);
}
`

const ATMOSFER_FS = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main() {
    float d = -dot(vN, vV);
    float g = pow(smoothstep(0.0, 0.42, d), 3.4);
    vec3 renk = mix(vec3(0.42, 0.28, 1.0), vec3(0.78, 0.70, 1.0), pow(smoothstep(0.3, 0.42, d), 2.0));
    gl_FragColor = vec4(renk, g * 0.62);
}
`

const YORUNGE_VS = /* glsl */ `
attribute float aU;
varying float vU;
void main() {
    vU = aU;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const YORUNGE_FS = /* glsl */ `
uniform float uBas;
varying float vU;
void main() {
    float geri = fract(uBas - vU);
    float kuyruk = smoothstep(0.32, 0.0, geri);
    gl_FragColor = vec4(mix(vec3(0.62, 0.52, 1.0), vec3(1.0), kuyruk), 0.14 + kuyruk * 0.7);
}
`

const UYDU_FS = /* glsl */ `
void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = smoothstep(0.22, 0.0, d) + smoothstep(1.0, 0.0, d) * 0.35;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(0.9, 0.86, 1.0), a);
}
`

const UYDU_VS = /* glsl */ `
uniform float uBoyut;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uBoyut;
}
`

const YILDIZ_VS = /* glsl */ `
uniform float uZaman;
uniform float uPiksel;
attribute float aBoyut;
attribute float aFaz;
attribute float aParilti;
varying float vParlak;
varying float vParilti;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vParlak = 0.55 + 0.45 * sin(uZaman * (0.6 + aFaz * 1.8) + aFaz * 50.0);
    vParilti = aParilti;
    gl_PointSize = uPiksel * aBoyut * mix(1.0, 7.0, aParilti);
}
`

const YILDIZ_FS = /* glsl */ `
varying float vParlak;
varying float vParilti;
void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    float a = smoothstep(1.0, 0.0, d);
    if (vParilti > 0.5) {
        // Parlak yıldız: küçük çekirdek ve ince artı ışınlar
        float cekirdek = smoothstep(0.22, 0.0, d);
        float isin = max(smoothstep(0.06, 0.0, abs(c.x)) * smoothstep(0.5, 0.0, abs(c.y)),
                         smoothstep(0.06, 0.0, abs(c.y)) * smoothstep(0.5, 0.0, abs(c.x)));
        a = cekirdek + isin * 0.7;
    }
    a *= vParlak;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(0.95, 0.94, 1.0), a);
}
`

// ---------- Sahne ----------

function malzeme(vs, fs, uniforms, ekstra = {}) {
    return new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, ...ekstra })
}

// Kadraj: hero kutusunun boyutuna göre kamera uzaklığı ve küre konumu
function kadrajHesapla(W, H) {
    const kutuG = Math.max(W, 1.6 * H)
    const kutuY = kutuG / 1.6
    const merkezY = (H - kutuY) / 2 + 0.922 * kutuY
    const yaricapPx = 0.46 * kutuG
    const tan = Math.tan((FOV / 2) * D2R)
    // Kürenin görünen yarıçapı perspektifte biraz büyür: düzeltilmiş uzaklık
    let D = H / (2 * tan * yaricapPx)
    D = D / Math.sqrt(1 - 1 / (D * D))
    const k = (2 * D * tan) / H // birim/piksel (küre merkezi derinliğinde)
    return { D, x: 0, y: (H / 2 - merkezY) * k, yaricapPx }
}

export default function DunyaKuresi({ azalt = false, donuk = false, onIlkKare }) {
    const boyut = useThree((s) => s.size)
    const dpr = useThree((s) => s.viewport.dpr)
    const kamera = useRef(null)
    const kure = useRef(null)
    const donen = useRef(null)
    const yildizlar = useRef(null)
    const uydular = useRef([])
    const isaretci = useRef({ x: 0, y: 0, hx: 0, hy: 0 })
    const ilkKare = useRef(false)
    const zaman = useRef(0)

    const geo = useMemo(() => {
        const ag = agGeometrisi()
        return {
            kara: karaGeometrisi(),
            cizgi: ag.cizgi,
            dugum: ag.dugum,
            yorunge1: yorungeGeometrisi(1.34),
            yorunge2: yorungeGeometrisi(1.58),
            yildiz: yildizGeometrisi(),
            uydu: new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3)),
        }
    }, [])

    const ortak = useMemo(() => ({ uZaman: { value: 0 }, uMetin: { value: new THREE.Vector4(0, 0, 0.5, 0.45) } }), [])
    const mal = useMemo(() => {
        const ust = { ...ortak }
        return {
            kara: malzeme(KARA_VS, KARA_FS, { ...ust, uBoyut: { value: 4 } }),
            cizgi: malzeme(CIZGI_VS, CIZGI_FS, ust),
            dugum: malzeme(DUGUM_VS, DUGUM_FS, { ...ust, uBoyut: { value: 5 } }),
            govde: new THREE.ShaderMaterial({ vertexShader: GOVDE_VS, fragmentShader: GOVDE_FS }),
            atmosfer: malzeme(GOVDE_VS, ATMOSFER_FS, {}, { side: THREE.BackSide }),
            yorunge1: malzeme(YORUNGE_VS, YORUNGE_FS, { uBas: { value: 0.1 } }),
            yorunge2: malzeme(YORUNGE_VS, YORUNGE_FS, { uBas: { value: 0.6 } }),
            uydu: malzeme(UYDU_VS, UYDU_FS, { uBoyut: { value: 14 } }),
            yildiz: malzeme(YILDIZ_VS, YILDIZ_FS, { uZaman: ortak.uZaman, uPiksel: { value: 1 } }),
        }
    }, [ortak])

    useEffect(
        () => () => {
            Object.values(geo).forEach((g) => g.dispose())
            Object.values(mal).forEach((m) => m.dispose())
        },
        [geo, mal]
    )

    const kadraj = useMemo(() => kadrajHesapla(boyut.width, boyut.height), [boyut.width, boyut.height])

    // Nokta boyutları kadraja ve piksel yoğunluğuna göre
    useEffect(() => {
        const aralikPx = kadraj.yaricapPx * NOKTA_ADIMI * D2R
        mal.kara.uniforms.uBoyut.value = Math.min(7.5, aralikPx * 0.46) * dpr
        mal.dugum.uniforms.uBoyut.value = Math.min(7, aralikPx * 0.55) * dpr
        mal.uydu.uniforms.uBoyut.value = 16 * dpr
        mal.yildiz.uniforms.uPiksel.value = dpr
    }, [kadraj, dpr, mal])

    // Metin bloğunun ekrandaki yeri: arkasındaki ışıklar kısılır
    useEffect(() => {
        const olc = () => {
            const metin = document.querySelector('.vhero .hero-inner')
            const kutu = document.querySelector('.vhero .bg-kure')
            if (!metin || !kutu) return
            const m = metin.getBoundingClientRect()
            const v = kutu.getBoundingClientRect()
            if (!v.width || !v.height) return
            const cx = ((m.left + m.width / 2 - v.left) / v.width) * 2 - 1
            const cy = -(((m.top + m.height / 2 - v.top) / v.height) * 2 - 1)
            ortak.uMetin.value.set(cx, cy, (m.width / v.width) * 1.05, (m.height / v.height) * 1.1)
        }
        olc()
        const r = new ResizeObserver(olc)
        const metin = document.querySelector('.vhero .hero-inner')
        if (metin) r.observe(metin)
        window.addEventListener('resize', olc)
        return () => {
            r.disconnect()
            window.removeEventListener('resize', olc)
        }
    }, [ortak, boyut.width, boyut.height])

    // İmleç: küre hafifçe imlece döner, yıldızlar ters yönde kayar
    useEffect(() => {
        if (azalt || donuk) return
        const hareket = (e) => {
            isaretci.current.hx = (e.clientX / window.innerWidth) * 2 - 1
            isaretci.current.hy = (e.clientY / window.innerHeight) * 2 - 1
        }
        window.addEventListener('pointermove', hareket, { passive: true })
        return () => window.removeEventListener('pointermove', hareket)
    }, [azalt, donuk])

    useFrame((_, dt) => {
        if (!azalt && !donuk) zaman.current += Math.min(dt, 1 / 20)
        const t = zaman.current
        ortak.uZaman.value = t

        const i = isaretci.current
        i.x += (i.hx - i.x) * 0.04
        i.y += (i.hy - i.y) * 0.04
        if (kure.current) {
            kure.current.rotation.x = EGIM + i.y * 0.03
            kure.current.rotation.y = i.x * 0.045
        }
        if (donen.current) donen.current.rotation.y = -BASLANGIC_BOYLAM * D2R + t * DONUS_HIZI
        if (yildizlar.current) {
            yildizlar.current.position.x = -i.x * 0.35
            yildizlar.current.position.y = i.y * 0.2
        }

        // Yörünge uyduları: kuyruklu ışık yörüngede akar
        const yorungeler = [
            [mal.yorunge1, 1.34, 0.031, 0.1],
            [mal.yorunge2, 1.58, -0.022, 0.6],
        ]
        yorungeler.forEach(([m, r, hiz, bas], k) => {
            const u = (((bas + t * hiz) % 1) + 1) % 1
            m.uniforms.uBas.value = u
            const uydu = uydular.current[k]
            if (uydu) {
                const a = u * Math.PI * 2
                uydu.position.set(Math.cos(a) * r, 0, Math.sin(a) * r)
            }
        })

        if (!ilkKare.current) {
            ilkKare.current = true
            onIlkKare?.()
        }
    })

    return (
        <>
            <PerspectiveCamera ref={kamera} makeDefault fov={FOV} near={0.1} far={120} position={[0, 0, kadraj.D]} />

            <group ref={yildizlar}>
                <points geometry={geo.yildiz} material={mal.yildiz} frustumCulled={false} />
            </group>

            <group ref={kure} position={[kadraj.x, kadraj.y, 0]} rotation={[EGIM, 0, 0]}>
                {/* Atmosfer: kürenin kenarında dışa taşan mor ışık */}
                <mesh material={mal.atmosfer} renderOrder={1}>
                    <sphereGeometry args={[1.1, 128, 64]} />
                </mesh>
                {/* Gövde: arkadaki noktaları ve çizgileri derinlikle gizler */}
                <mesh material={mal.govde} renderOrder={0}>
                    <sphereGeometry args={[1, 160, 96]} />
                </mesh>

                <group ref={donen}>
                    <points geometry={geo.kara} material={mal.kara} renderOrder={2} frustumCulled={false} />
                    <lineSegments geometry={geo.cizgi} material={mal.cizgi} renderOrder={3} frustumCulled={false} />
                    <points geometry={geo.dugum} material={mal.dugum} renderOrder={4} frustumCulled={false} />
                </group>

                <group rotation={[1.3, 0, 0.36]}>
                    <lineSegments geometry={geo.yorunge1} material={mal.yorunge1} renderOrder={2} frustumCulled={false} />
                    <points ref={(o) => (uydular.current[0] = o)} geometry={geo.uydu} material={mal.uydu} renderOrder={4} frustumCulled={false} />
                </group>
                <group rotation={[1.46, 0, -0.24]}>
                    <lineSegments geometry={geo.yorunge2} material={mal.yorunge2} renderOrder={2} frustumCulled={false} />
                    <points ref={(o) => (uydular.current[1] = o)} geometry={geo.uydu} material={mal.uydu} renderOrder={4} frustumCulled={false} />
                </group>
            </group>
        </>
    )
}
