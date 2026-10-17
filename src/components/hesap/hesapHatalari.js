// Supabase kimlik doğrulama hatalarının Türkçe karşılıkları. Bilinmeyen hata için genel bir metin;
// ham İngilizce mesaj kullanıcıya gösterilmez.
const KARSILIKLAR = [
    [/already registered|already exists/i, 'Bu e-postayla bir hesap zaten var. Giriş yapmayı ya da şifreni sıfırlamayı dene.'],
    [/invalid login credentials/i, 'E-posta ya da şifre hatalı.'],
    [/email not confirmed/i, 'E-postanı henüz onaylamadın. Gelen kutundaki onay bağlantısına tıkla (gereksiz klasörüne de bak).'],
    [/password should be at least|password.*(short|weak)/i, 'Şifre en az 6 karakter olmalı; daha uzun bir şifre daha güvenli.'],
    [/same password|different from the old/i, 'Yeni şifre eskisinden farklı olmalı.'],
    [/rate limit|too many|security purposes/i, 'Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.'],
    [/invalid email|unable to validate email/i, 'Geçerli bir e-posta adresi yaz.'],
    [/network|fetch/i, 'Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.'],
]

export function hesapHatasi(hata) {
    const mesaj = hata?.message || ''
    for (const [desen, metin] of KARSILIKLAR) if (desen.test(mesaj)) return metin
    return 'Bir sorun çıktı. Biraz sonra tekrar dene.'
}
