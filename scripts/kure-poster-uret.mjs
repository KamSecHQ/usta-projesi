// Hero küresinin posterini üretir: küre değiştiğinde (renk, kadraj, nokta, ağ) çalıştırılır.
// Poster, tuval hazır olana kadar görünür ve ilk karede canlı küreyle üst üste oturur;
// bu yüzden sahnenin kendisinden, zaman donukken (?kure=poster) alınır.
// Kullanım: geliştirme sunucusu açıkken  npm run kure-poster  [adres]
// Varsayılan adres http://localhost:5173/?kure=poster. Çıktı src/assets/kure-poster.webp (cwebp -q 82).
import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const adres = process.argv[2] || 'http://localhost:5173/?kure=poster'
const GENISLIK = 1920
const YUKSEKLIK = 1200 // 1.6 oran: hero'nun .bg kutusuyla aynı
const chromeYolu = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const profil = mkdtempSync(join(tmpdir(), 'kure-poster-'))
const port = 9400 + Math.floor(Math.random() * 400)
const uyu = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(chromeYolu, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profil}`, '--hide-scrollbars', `--window-size=${GENISLIK},${YUKSEKLIK}`, 'about:blank'], { stdio: 'ignore' })

try {
    let hedef
    for (let i = 0; i < 50 && !hedef; i++) {
        await uyu(200)
        try {
            hedef = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page')
        } catch {
            // Chrome henüz hazır değil
        }
    }
    if (!hedef) throw new Error('Chrome açılamadı')
    const ws = new WebSocket(hedef.webSocketDebuggerUrl)
    await new Promise((r) => ws.addEventListener('open', r, { once: true }))
    let sira = 0
    const bekleyen = new Map()
    ws.addEventListener('message', (e) => {
        const m = JSON.parse(e.data)
        if (m.id && bekleyen.has(m.id)) {
            bekleyen.get(m.id)(m)
            bekleyen.delete(m.id)
        }
    })
    const gonder = (method, params = {}) =>
        new Promise((r) => {
            const id = ++sira
            bekleyen.set(id, r)
            ws.send(JSON.stringify({ id, method, params }))
        })

    await gonder('Emulation.setDeviceMetricsOverride', { width: GENISLIK, height: YUKSEKLIK, deviceScaleFactor: 1, mobile: false })
    await gonder('Page.enable')
    await gonder('Page.navigate', { url: adres })
    // Yükleme perdesi, boşta kurulan tuval ve 900 ms'lik görünme geçişi
    await uyu(9000)
    const ekran = await gonder('Page.captureScreenshot', { format: 'png' })
    ws.close()

    const png = join(profil, 'kure-poster.png')
    writeFileSync(png, Buffer.from(ekran.result.data, 'base64'))
    const cwebp = spawnSync('cwebp', ['-quiet', '-q', '82', '-m', '6', png, '-o', 'src/assets/kure-poster.webp'])
    if (cwebp.status !== 0) {
        writeFileSync('src/assets/kure-poster.png', Buffer.from(ekran.result.data, 'base64'))
        console.log('cwebp bulunamadı: src/assets/kure-poster.png yazıldı; WebP\'ye çevirip VideoHero.jsx içindeki içe aktarmayı güncelle.')
    } else {
        console.log('yazıldı: src/assets/kure-poster.webp')
    }
} finally {
    chrome.kill()
    await uyu(300)
    rmSync(profil, { recursive: true, force: true })
}
