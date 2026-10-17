// İlk yük bütçesi: dist/index.html'in doğrudan yüklediği JS ve CSS'in (giriş betiği, önceden
// yüklenen parçalar, stil) gzip toplamı. Anasayfa parçası ve 3D kütüphaneleri bu hesaba girmez;
// onlar sayfa açıldıktan sonra tembel yüklenir. Sınır aşılırsa çıkış kodu 1 (CI durur).
// Kullanım: npm run build && npm run butce
import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const SINIR_KB = 200

const html = readFileSync('dist/index.html', 'utf8')
const dosyalar = [...new Set([...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]))]
if (!dosyalar.length) {
    console.error('dist/index.html içinde dosya bulunamadı; önce npm run build çalıştır.')
    process.exit(1)
}

let toplam = 0
for (const dosya of dosyalar) {
    const kb = gzipSync(readFileSync(`dist/${dosya}`)).length / 1024
    toplam += kb
    console.log(`${kb.toFixed(1).padStart(7)} KB  ${dosya}`)
}
console.log(`${toplam.toFixed(1).padStart(7)} KB  toplam ilk yük (gzip), sınır ${SINIR_KB} KB`)

if (toplam > SINIR_KB) {
    console.error(`İlk yük bütçesi aşıldı: ${toplam.toFixed(1)} KB > ${SINIR_KB} KB. Yeni bağımlılığı tembel yükle ya da parçala.`)
    process.exit(1)
}
