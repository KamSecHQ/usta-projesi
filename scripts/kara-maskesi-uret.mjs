// Hero küresinin kıta maskesini üretir.
// Kaynak: Natural Earth 1:110m kara verisi (kamu malı), world-atlas paketinin TopoJSON hâli:
//   https://unpkg.com/world-atlas@2.0.2/land-110m.json
// Kullanım: node scripts/kara-maskesi-uret.mjs <land-110m.json yolu>
// Çıktı: src/components/atolye/karaMaskesi.js — 360×180 (1°) eşdikdörtgen ızgara, hücre başına
// 1 bit (kara = 1), base64. Satır 0 kuzey kutbu (90°K), sütun 0 boylam -180°. Ham veri repoya girmez.
import { readFileSync, writeFileSync } from 'node:fs'

const kaynak = process.argv[2]
if (!kaynak) {
    console.error('Kullanım: node scripts/kara-maskesi-uret.mjs <land-110m.json>')
    process.exit(1)
}
const topo = JSON.parse(readFileSync(kaynak, 'utf8'))
const { scale, translate } = topo.transform

// TopoJSON yayları farkla kodlanmış ve nicelenmiştir: önce aç
const yaylar = topo.arcs.map((yay) => {
    let x = 0
    let y = 0
    return yay.map(([dx, dy]) => {
        x += dx
        y += dy
        return [x * scale[0] + translate[0], y * scale[1] + translate[1]]
    })
})

function halka(yayIndisleri) {
    const noktalar = []
    for (const i of yayIndisleri) {
        const yay = i < 0 ? yaylar[~i].slice().reverse() : yaylar[i]
        // Ardışık yayların ortak uç noktası bir kez yazılır
        noktalar.push(...(noktalar.length ? yay.slice(1) : yay))
    }
    return noktalar
}

const cokgenler = []
for (const geo of topo.objects.land.geometries) {
    if (geo.type === 'Polygon') cokgenler.push(geo.arcs.map(halka))
    else if (geo.type === 'MultiPolygon') for (const p of geo.arcs) cokgenler.push(p.map(halka))
}

// Tek-çift kuralı: dış halka ve delikler birlikte
function icindeMi(lon, lat, halkalar) {
    let ic = false
    for (const h of halkalar) {
        for (let i = 0, j = h.length - 1; i < h.length; j = i++) {
            const [xi, yi] = h[i]
            const [xj, yj] = h[j]
            if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) ic = !ic
        }
    }
    return ic
}

// Hızlı eleme için her çokgenin sınır kutusu
const kutular = cokgenler.map((halkalar) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (const [x, y] of halkalar[0]) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y)
    }
    return [x0, y0, x1, y1]
})

const G = 360
const Y = 180
const bitler = new Uint8Array((G * Y) / 8)
let kara = 0
for (let satir = 0; satir < Y; satir++) {
    const lat = 90 - satir - 0.5
    for (let sutun = 0; sutun < G; sutun++) {
        const lon = -180 + sutun + 0.5
        let ic = false
        for (let k = 0; k < cokgenler.length && !ic; k++) {
            const [x0, y0, x1, y1] = kutular[k]
            if (lon < x0 || lon > x1 || lat < y0 || lat > y1) continue
            ic = icindeMi(lon, lat, cokgenler[k])
        }
        if (ic) {
            const n = satir * G + sutun
            bitler[n >> 3] |= 1 << (n & 7)
            kara++
        }
    }
}

const cikti = `// Üretildi: scripts/kara-maskesi-uret.mjs — elle düzenleme.
// Kaynak: Natural Earth 1:110m kara verisi (kamu malı), world-atlas@2.0.2 land-110m.json.
// ${G}×${Y} eşdikdörtgen ızgara, 1° hücre, hücre başına 1 bit (kara = 1). Satır 0 = 90°K, sütun 0 = 180°B.
export const KARA_GENISLIK = ${G}
export const KARA_YUKSEKLIK = ${Y}
export const KARA_MASKESI = '${Buffer.from(bitler).toString('base64')}'
`
writeFileSync('src/components/atolye/karaMaskesi.js', cikti)
console.log(`kara hücresi: ${kara} / ${G * Y} (%${((kara / (G * Y)) * 100).toFixed(1)}), dosya ${cikti.length} bayt`)

// Göz kontrolü: 4°'lik kaba önizleme
for (let satir = 2; satir < Y; satir += 6) {
    let s = ''
    for (let sutun = 0; sutun < G; sutun += 3) {
        const n = satir * G + sutun
        s += bitler[n >> 3] & (1 << (n & 7)) ? '#' : ' '
    }
    console.log(s)
}
