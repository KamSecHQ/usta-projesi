import { createContext, useContext } from 'react'

// Uygulama geneli kısa bildirim (toast) ve onay diyaloğu. Sağlayıcı: BildirimSaglayici.jsx
//   const bildir = useBildirim();  bildir('Kaydedildi')  ·  bildir('Kaydedilemedi', { tur: 'hata' })
//   const onayla = useOnay();      if (await onayla({ baslik, metin, onay: 'Sil', tehlike: true })) ...
export const BildirimBaglami = createContext(null)

const BOS = { bildir: () => {}, onayla: async () => false }

export function useBildirim() {
    return (useContext(BildirimBaglami) || BOS).bildir
}

export function useOnay() {
    return (useContext(BildirimBaglami) || BOS).onayla
}
