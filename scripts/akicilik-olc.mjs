// Akıcılık ölçümü: Chrome'u DevTools protokolüyle sürer, sayfayı yukarıdan aşağı sabit hızla
// kaydırır; her karenin süresini, uzun görevleri ve bölüm bölüm takılmaları raporlar.
//
// Kullanım (önce `npm run build && npm run preview` ya da `npm run dev` açık olmalı):
//   npm run olc                              → http://127.0.0.1:4173/ , görünür pencere, 16 sn
//   npm run olc -- http://127.0.0.1:5173/ 24 → adres ve süre
// Ortam değişkenleri:
//   BASSIZ=1  pencere açmadan ölç (başsız mod video oynarken 30 kareye kilitlenebilir; karşılaştırma için görünür pencere daha doğru)
//   VIDEOSUZ=1 hero videosunu engelle      CPU=4  işlemciyi 4 kat yavaşlat (orta seviye cihaz benzetimi)
//
// İyi sonuç: uzunKare25 = 0 ve enUzun < 25 ms (60 Hz ekranda hiç kare kaçmıyor).
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const adres = process.argv[2] || 'http://127.0.0.1:4173/'
const sure = Number(process.argv[3] || 16)
const port = 9300 + Math.floor(Math.random() * 500)
const profil = mkdtempSync(join(tmpdir(), 'kalfahane-olc-'))
const chromeYolu = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = spawn(chromeYolu, [
    ...(process.env.BASSIZ ? ['--headless=new'] : ['--window-position=40,40']),
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profil}`,
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required',
    // Pencere başka pencerelerin arkasında kalsa da kare çizmeye devam etsin (yoksa rAF durur, ölçüm hiç bitmez)
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-background-timer-throttling',
    'about:blank',
], { stdio: 'ignore' })

const bekle = (ms) => new Promise((r) => setTimeout(r, ms))
// Ölçüm takılırsa sonsuza dek beklemesin
setTimeout(() => {
    console.error('Ölçüm zaman aşımına uğradı: Chrome kare çizmiyor olabilir (pencere küçültülmüş ya da başka bir masaüstünde).')
    chrome.kill()
    process.exit(1)
}, (sure + 60) * 1000)
let ws
for (let i = 0; i < 50 && !ws; i++) {
    try {
        const sayfa = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page')
        if (sayfa) ws = new WebSocket(sayfa.webSocketDebuggerUrl)
    } catch {
        await bekle(200)
    }
}
if (!ws) throw new Error('Chrome başlatılamadı')
await new Promise((r) => ws.addEventListener('open', r, { once: true }))

let sira = 0
const bekleyen = new Map()
ws.addEventListener('message', (m) => {
    const v = JSON.parse(m.data)
    if (v.id && bekleyen.has(v.id)) {
        bekleyen.get(v.id)(v)
        bekleyen.delete(v.id)
    }
})
const gonder = (method, params = {}) =>
    new Promise((r) => {
        const id = ++sira
        bekleyen.set(id, r)
        ws.send(JSON.stringify({ id, method, params }))
    })
const calistir = async (ifade) => {
    const v = await gonder('Runtime.evaluate', { expression: ifade, awaitPromise: true, returnByValue: true })
    if (v.result?.exceptionDetails) throw new Error(JSON.stringify(v.result.exceptionDetails))
    return v.result?.result?.value
}

await gonder('Page.enable')
await gonder('Runtime.enable')
if (process.env.CPU) await gonder('Emulation.setCPUThrottlingRate', { rate: Number(process.env.CPU) })
if (process.env.VIDEOSUZ) {
    await gonder('Network.enable')
    await gonder('Network.setBlockedURLs', { urls: ['*.mp4'] })
}
await gonder('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__uzun = []; try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__uzun.push(Math.round(e.duration)))).observe({ type: 'longtask', buffered: true }) } catch {}`,
})
await gonder('Page.navigate', { url: adres })
// Yükleme perdesi kalksın, 3D sahneler ısınsın
await bekle(9000)

const sonuc = await calistir(`(async () => {
  const yuklemeUzun = window.__uzun.splice(0)
  const max = document.documentElement.scrollHeight - innerHeight
  const kareler = []
  await new Promise((bitti) => {
    let bas = null, son = null
    function adim(t) {
      if (bas === null) { bas = t; son = t }
      const k = Math.min(1, (t - bas) / (${sure} * 1000))
      window.scrollTo(0, k * max)
      if (t > son) {
        const bolum = document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest('section, main, footer')
        kareler.push({ d: t - son, y: Math.round(scrollY), b: bolum ? (bolum.id || String(bolum.className).split(' ').slice(0, 2).join('.')) : '?' })
      }
      son = t
      if (k < 1) requestAnimationFrame(adim); else bitti()
    }
    requestAnimationFrame(adim)
  })
  const ds = kareler.map((k) => k.d).sort((a, b) => a - b)
  const yuzde = (p) => +ds[Math.min(ds.length - 1, Math.floor(ds.length * p))].toFixed(1)
  const kaydirmaUzun = window.__uzun.splice(0)
  return {
    ortFps: Math.round(1000 / (ds.reduce((a, b) => a + b, 0) / ds.length)),
    p50: yuzde(0.5), p95: yuzde(0.95), p99: yuzde(0.99), enUzun: Math.round(ds[ds.length - 1]),
    uzunKare25: kareler.filter((k) => k.d > 25).length,
    uzunGorevYukleme: { adet: yuklemeUzun.length, enUzun: Math.max(0, ...yuklemeUzun) },
    uzunGorevKaydirma: { adet: kaydirmaUzun.length, enUzun: Math.max(0, ...kaydirmaUzun) },
    enKotuKareler: kareler.slice().sort((a, b) => b.d - a.d).slice(0, 6).map((k) => ({ ms: Math.round(k.d), y: k.y, bolum: k.b })),
  }
})()`)

console.log(JSON.stringify({ adres, sure, ...sonuc }, null, 2))
ws.close()
chrome.kill()
await bekle(300)
rmSync(profil, { recursive: true, force: true })
process.exit(0)
