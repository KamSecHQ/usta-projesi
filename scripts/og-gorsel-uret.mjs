// Paylaşım görselini (1200×630) bir HTML şablonundan üretir. Varsayılan: scripts/og-gorsel.html →
// public/og-image.png. Sayfaya özel görsel için şablon ve çıktı verilir (npm run og-vitrin).
// Kullanım: npm run og-gorsel   (macOS'te Google Chrome kurulu olmalı; CHROME ile yol verilebilir)
import { execFileSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const kok = join(dirname(fileURLToPath(import.meta.url)), '..')
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const [sablonArg, ciktiArg] = process.argv.slice(2)
const sablon = join(kok, sablonArg || 'scripts/og-gorsel.html')
const cikti = join(kok, ciktiArg || 'public/og-image.png')

execFileSync(chrome, [
  '--headless=new',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  '--virtual-time-budget=3000',
  '--allow-file-access-from-files',
  `--screenshot=${cikti}`,
  pathToFileURL(sablon).href,
], { stdio: 'inherit' })
console.log('Üretildi:', cikti)
