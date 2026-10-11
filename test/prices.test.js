import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { bosses, bossSetting, createProfile } from '../public/model.js';
const sheet = JSON.parse(await readFile(new URL('./fixtures/changed-prices.json', import.meta.url), 'utf8'));
test('엑셀 변경 가격 46건이 난이도별 기본값에 정확히 반영된다', () => {
  assert.equal(sheet.length, 46);
  const p = createProfile({ name: '표 검증' });
  for (const row of sheet) {
    const boss = bosses.find(b => b.id === row.id);
    assert.ok(boss, row.name);
    p.settings[row.id] = { tier: row.tier };
    const result = bossSetting(p, boss);
    assert.equal(result.price, row.price, `${row.name} ${row.tier}`);
    assert.equal(result.priceSource, 'excel');
  }
  assert.equal(sheet.find(r => r.id === 'black_mage' && r.tier === '익스트림').price, 5680000000);
  assert.equal(sheet.find(r => r.id === 'kaling' && r.tier === '노멀').price, 593000000);
  assert.equal(sheet.find(r => r.id === 'radiant_malefic_star' && r.tier === '노멀').price, 576000000);
});
test('사용자 수정값이 표 갱신 후 유지되고 미포함 난이도 8건은 구분된다', () => {
  const p = createProfile({ name: '기존 기록' });
  const zakum = bosses.find(b => b.id === 'zakum');
  p.settings.zakum = { prices: { 카오스: 16000001 }, note: '같은 파티', party: 2 };
  assert.equal(bossSetting(p, zakum).price, 16000001);
  assert.equal(bossSetting(p, zakum).priceSource, 'custom');
  assert.equal(p.settings.zakum.note, '같은 파티');
  delete p.settings.zakum.prices.카오스;
  assert.equal(bossSetting(p, zakum).price, 4040000);
  const refs = bosses.filter(b => b.cycle !== 'legacy').flatMap(b => Object.entries(b.priceSources).filter(([, source]) => source === 'reference'));
  assert.equal(refs.length, 8);
});
