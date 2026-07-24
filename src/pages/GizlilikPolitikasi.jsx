import { Link } from 'react-router-dom'
import useSayfaBasligi from '../useSayfaBasligi'

function Bolum({ baslik, children }) {
    return (
        <div className="mb-8">
            <h2 className="text-[#F3ECE1] text-lg font-semibold mb-2">{baslik}</h2>
            <div className="text-[#9FC2BC] text-sm leading-relaxed space-y-2">{children}</div>
        </div>
    )
}

function GizlilikPolitikasi() {
    useSayfaBasligi('Gizlilik Politikası')

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-2xl mx-auto">
                <Link to="/" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                    ← Anasayfaya dön
                </Link>
                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-6 mb-2">Gizlilik Politikası</h1>
                <p className="text-[#9FC2BC]/60 text-xs font-mono mb-10">Son güncelleme: Temmuz 2026</p>

                <Bolum baslik="1. Hangi Verileri Topluyoruz">
                    <p>Hesap oluştururken e-posta adresini ve şifreni (şifrelenmiş olarak) alıyoruz. Profilini doldurursan ad-soyad, unvan, biyografi, GitHub linki, konum ve teknoloji etiketlerin de sistemimizde tutulur. Bu bilgiler, sen paylaşmayı seçtiğin sürece diğer kullanıcılara açık olur.</p>
                </Bolum>

                <Bolum baslik="2. Verilerini Nerede Saklıyoruz">
                    <p>Tüm veriler Supabase altyapısında, endüstri standardı şifreleme ile saklanır. Şifrene biz de dahil kimse doğrudan erişemez.</p>
                </Bolum>

                <Bolum baslik="3. Verilerini Kimler Görebilir">
                    <p>Profilini herkese açık şekilde doldurursan (unvan, bio, teknolojiler, projeler), bu bilgiler onaylandıktan sonra Ustalar listesinde ve arama sonuçlarında herkese görünür olur. E-posta adresin hiçbir zaman herkese açık gösterilmez, yalnızca platform yöneticileri erişebilir.</p>
                </Bolum>

                <Bolum baslik="4. Verilerini Silme Hakkın">
                    <p>Dilediğin zaman hesabını ve profilindeki tüm bilgileri silmemizi talep edebilirsin. Bunun için <a href="mailto:merhaba@usta.app" className="text-[#C97D3C] hover:underline">merhaba@usta.app</a> adresine yazman yeterli.</p>
                </Bolum>

                <Bolum baslik="5. Çerezler">
                    <p>Usta, oturumunu açık tutmak ve tercihlerini (örneğin duyuru çubuğunu kapattığını) hatırlamak dışında herhangi bir takip veya reklam çerezi kullanmaz.</p>
                </Bolum>

                <Bolum baslik="6. İletişim">
                    <p>Verilerinle ilgili herhangi bir soru için <a href="mailto:merhaba@usta.app" className="text-[#C97D3C] hover:underline">merhaba@usta.app</a> üzerinden bize ulaşabilirsin.</p>
                </Bolum>
            </div>
        </div>
    )
}

export default GizlilikPolitikasi
