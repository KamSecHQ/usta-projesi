import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aciklamayiAyir } from '../src/components/ilan/ilanSablonlari.js'
import {
    AKIS_ILAN_ID,
    AKIS_KONUSMASI,
    AKIS_TEKLIFLERI,
    ORNEK_ILANLAR,
    ORNEK_ISVERENLER,
    ORNEK_USTALAR,
    gunOnce,
    isVerenBul,
    ustaBul,
} from '../src/pages/ornekVitrinVerisi.js'

test('örnek vitrinde on usta ve on iş veren var', () => {
    assert.equal(ORNEK_USTALAR.length, 10)
    assert.equal(ORNEK_ISVERENLER.length, 10)
    assert.equal(ORNEK_ILANLAR.length, 10)
})

test('her örnek kimliği "ornek-" ile başlar ve tekildir', () => {
    const kimlikler = [...ORNEK_USTALAR, ...ORNEK_ISVERENLER, ...ORNEK_ILANLAR, ...AKIS_TEKLIFLERI, ...AKIS_KONUSMASI].map((x) => x.id)
    for (const id of kimlikler) assert.match(id, /^ornek-/)
    assert.equal(new Set(kimlikler).size, kimlikler.length)
})

test('iş verenler farklı sektörlerden, her birinin bir ilanı var', () => {
    assert.equal(new Set(ORNEK_ISVERENLER.map((i) => i.sektor)).size, ORNEK_ISVERENLER.length)
    for (const ilan of ORNEK_ILANLAR) assert.ok(isVerenBul(ilan.is_veren_id), ilan.id)
    assert.equal(new Set(ORNEK_ILANLAR.map((i) => i.is_veren_id)).size, ORNEK_ILANLAR.length)
})

test('akış ilanı ve teklifleri var olan kayıtlara bağlı; tek bir teklif kabul edilmiş', () => {
    assert.ok(ORNEK_ILANLAR.find((i) => i.id === AKIS_ILAN_ID))
    for (const t of AKIS_TEKLIFLERI) {
        assert.equal(t.ilan_id, AKIS_ILAN_ID)
        assert.ok(ustaBul(t.usta_id), t.usta_id)
    }
    assert.equal(AKIS_TEKLIFLERI.filter((t) => t.durum === 'kabul_edildi').length, 1)
})

test('ilan açıklamaları sihirbaz biçiminde: giriş, bölümler ve teslim', () => {
    for (const ilan of ORNEK_ILANLAR) {
        const { giris, bolumler, teslim } = aciklamayiAyir(ilan.aciklama)
        assert.ok(giris, ilan.id)
        assert.ok(bolumler.length >= 2, ilan.id)
        assert.ok(teslim, ilan.id)
        assert.ok(ilan.butce_min < ilan.butce_max, ilan.id)
    }
})

test('gunOnce verilen günden geriye ISO tarih üretir', () => {
    const simdi = Date.UTC(2026, 9, 17)
    assert.equal(gunOnce(1, simdi), new Date(Date.UTC(2026, 9, 16)).toISOString())
})
