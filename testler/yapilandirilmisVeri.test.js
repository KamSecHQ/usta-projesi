import { test } from 'node:test'
import assert from 'node:assert/strict'
import { makaleVerisi, profilSayfasiVerisi } from '../src/yapilandirilmisVeri.js'

test('profil: ProfilePage içinde Person, boş alanlar yazılmaz', () => {
    const v = profilSayfasiVerisi({
        id: 'u1',
        ad_soyad: ' Mert Kaya ',
        unvan: 'Full Stack Geliştirici',
        bio: '',
        teknolojiler: ['React', 'Node.js'],
        konum: 'İstanbul',
        github_url: 'https://github.com/mert',
        avatar_url: null,
        created_at: '2026-07-22T10:00:00Z',
    })
    assert.equal(v['@type'], 'ProfilePage')
    assert.equal(v.url, 'https://www.kalfahane.com/ustalar/u1')
    assert.equal(v.mainEntity['@type'], 'Person')
    assert.equal(v.mainEntity.name, 'Mert Kaya')
    assert.deepEqual(v.mainEntity.knowsAbout, ['React', 'Node.js'])
    assert.deepEqual(v.mainEntity.sameAs, ['https://github.com/mert'])
    assert.equal(v.mainEntity.address.addressLocality, 'İstanbul')
    assert.equal('description' in v.mainEntity, false)
    assert.equal('image' in v.mainEntity, false)
})

test('profil: https olmayan bağlantılar dışarıda kalır', () => {
    const v = profilSayfasiVerisi({ id: 'u2', ad_soyad: 'A', github_url: 'javascript:alert(1)', avatar_url: 'http://x/y.png' })
    assert.equal('sameAs' in v.mainEntity, false)
    assert.equal('image' in v.mainEntity, false)
})

test('profil yoksa null', () => {
    assert.equal(profilSayfasiVerisi(null), null)
})

test('makale: Article, kapak yoksa varsayılan görsel, yayıncı kurum kimliğine bağlı', () => {
    const v = makaleVerisi({ slug: 'butce', baslik: 'Bütçe', ozet: 'Ö', kategori: 'Rehber', created_at: '2026-10-17T00:00:00Z' })
    assert.equal(v['@type'], 'Article')
    assert.deepEqual(v.image, ['https://www.kalfahane.com/og-image.png'])
    assert.equal(v.dateModified, '2026-10-17T00:00:00Z')
    assert.equal(v.mainEntityOfPage, 'https://www.kalfahane.com/blog/butce')
    assert.deepEqual(v.publisher, { '@id': 'https://www.kalfahane.com/#kurum' })
})
