// Paylaşım görselini (public/og-image.png, 1200×630) scripts/og-gorsel.html şablonundan üretir.
// Kullanım: npm run og-gorsel   (macOS'te Google Chrome kurulu olmalı; CHROME ile yol verilebilir)
import { execFileSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const kok = join(dirname(fileURLToPath(import.meta.url)), '..')
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const cikti = join(kok, 'public', 'og-image.png')

execFileSync(chrome, [
  '--headless=new',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  '--virtual-time-budget=3000',
  '--allow-file-access-from-files',
  `--screenshot=${cikti}`,
  pathToFileURL(join(kok, 'scripts', 'og-gorsel.html')).href,
], { stdio: 'inherit' })
console.log('Üretildi:', cikti)
