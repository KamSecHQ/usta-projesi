import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { SABIT_ADRESLER, siteHaritasiXml } from '../src/siteHaritasi.js'

const sayi = (xml) => (xml.match(/<url>/g) || []).length

test('veri yokken yalnızca sabit sayfalar', () => {
    const xml = siteHaritasiXml()
    assert.equal(sayi(xml), SABIT_ADRESLER.length)
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/)
    assert.match(xml, /<\/urlset>\n$/)
})

test('usta, ilan ve yazı adresleri tarihleriyle eklenir', () => {
    const xml = siteHaritasiXml({
        ustalar: [{ id: 'u1', created_at: '2026-07-22T10:00:00Z' }],
        ilanlar: [{ id: 'i1', created_at: '2026-07-27T17:57:40+00:00' }],
        yazilar: [{ slug: 'butce-rehberi', created_at: '2026-09-01T00:00:00Z', guncellenme_tarihi: '2026-10-01T00:00:00Z' }],
    })
    assert.equal(sayi(xml), SABIT_ADRESLER.length + 3)
    assert.match(xml, /<loc>https:\/\/www.kalfahane.com\/ustalar\/u1<\/loc><lastmod>2026-07-22<\/lastmod>/)
    assert.match(xml, /<loc>https:\/\/www.kalfahane.com\/is-ilanlari\/i1<\/loc><lastmod>2026-07-27<\/lastmod>/)
    assert.match(xml, /<loc>https:\/\/www.kalfahane.com\/blog\/butce-rehberi<\/loc><lastmod>2026-10-01<\/lastmod>/)
})

test('geçersiz tarih yazılmaz, özel karakterler kaçırılır', () => {
    const xml = siteHaritasiXml({ yazilar: [{ slug: 'a&b', created_at: 'bozuk' }] })
    assert.match(xml, /<loc>https:\/\/www.kalfahane.com\/blog\/a&amp;b<\/loc><changefreq>/)
    assert.doesNotMatch(xml, /lastmod>bozuk/)
})

test('/sitemap.xml fonksiyona yönlenir; aynı adda sabit dosya yok (olursa yönlendirme çalışmaz)', () => {
    const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'))
    const i = vercel.rewrites.findIndex((r) => r.source === '/sitemap.xml' && r.destination === '/api/site-haritasi')
    assert.ok(i >= 0 && i < vercel.rewrites.findIndex((r) => r.source === '/(.*)'))
    assert.equal(existsSync('public/sitemap.xml'), false)
    assert.match(readFileSync('public/robots.txt', 'utf8'), /Sitemap: https:\/\/www.kalfahane.com\/sitemap.xml/)
})
