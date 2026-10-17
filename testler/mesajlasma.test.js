import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { guvenliUrl, epostaGecerli, tutarGoster, baslangicHarfleri, kisaZaman, gunEtiketi, sonGorulmeMetni, ayniGun } from '../src/mesajBicimi.js'

const dakikaOnce = (dk) => new Date(Date.now() - dk * 60000).toISOString()
const gunOnce = (g) => {
    const d = new Date()
    d.setDate(d.getDate() - g)
    d.setHours(12, 0, 0, 0)
    return d.toISOString()
}

describe('iletişim kartı güvenliği', () => {
    test('yalnızca http(s) bağlantılarına izin verilir', () => {
        assert.equal(guvenliUrl('https://github.com/ornek'), 'https://github.com/ornek')
        assert.equal(guvenliUrl('linkedin.com/in/ornek'), 'https://linkedin.com/in/ornek')
        assert.equal(guvenliUrl('javascript:alert(1)'), '')
        assert.equal(guvenliUrl('data:text/html,x'), '')
        assert.equal(guvenliUrl('   '), '')
        assert.equal(guvenliUrl(42), '')
    })
    test('e-posta doğrulama', () => {
        assert.equal(epostaGecerli('ad@alanadi.com'), true)
        assert.equal(epostaGecerli('ad@alanadi'), false)
        assert.equal(epostaGecerli('ad alanadi.com'), false)
        assert.equal(epostaGecerli(null), false)
    })
})

describe('biçimler', () => {
    test('tutar', () => {
        assert.equal(tutarGoster(32000), '₺32.000')
        assert.equal(tutarGoster(null), '')
        assert.equal(tutarGoster('abc'), '')
    })
    test('baş harfler Türkçe büyük harfe çevrilir', () => {
        assert.equal(baslangicHarfleri('ismail çelik'), 'İÇ')
        assert.equal(baslangicHarfleri('Ahmet Yılmaz Kaya'), 'AY')
        assert.equal(baslangicHarfleri(''), '?')
    })
    test('konuşma listesi zamanı', () => {
        assert.match(kisaZaman(dakikaOnce(0)), /^\d{2}:\d{2}$/)
        assert.equal(kisaZaman(gunOnce(1)), 'Dün')
        assert.equal(kisaZaman(null), '')
    })
    test('gün ayracı', () => {
        assert.equal(gunEtiketi(dakikaOnce(0)), 'Bugün')
        assert.equal(gunEtiketi(gunOnce(1)), 'Dün')
    })
    test('son görülme', () => {
        assert.equal(sonGorulmeMetni(dakikaOnce(2)), 'Çevrimiçi')
        assert.equal(sonGorulmeMetni(dakikaOnce(30)), '30 dk önce görüldü')
        assert.equal(sonGorulmeMetni(null), 'Henüz çevrimiçi olmadı')
    })
    test('aynı gün', () => {
        assert.equal(ayniGun(gunOnce(0), dakikaOnce(0)), true)
        assert.equal(ayniGun(gunOnce(1), gunOnce(0)), false)
    })
})
