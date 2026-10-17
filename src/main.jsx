import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import './index.css'
import { isikTakibiniKur } from './isikTakip'
import App from './App.jsx'
import BildirimSaglayici from './components/bildirim/BildirimSaglayici'

// Işıklı cam düğmeler için imleç takibi
isikTakibiniKur()

// Yeni bir yayından sonra eski sekmede açık kalan sayfa, artık sunucuda olmayan bir parçayı
// isterse bir kez yenilenir; sonsuz döngüye girmemek için 10 sn içinde ikinci kez yenilemez.
window.addEventListener('vite:preloadError', (e) => {
    try {
        const son = Number(sessionStorage.getItem('parca-yenileme') || 0)
        if (Date.now() - son < 10000) return
        sessionStorage.setItem('parca-yenileme', String(Date.now()))
    } catch {
        return
    }
    e.preventDefault()
    window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BildirimSaglayici>
          <App />
        </BildirimSaglayici>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
