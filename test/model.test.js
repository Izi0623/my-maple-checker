import test from 'node:test';
import assert from 'node:assert/strict';
import { bosses, createProfile, weekKey, bossSetting, income, totals } from '../public/model.js';

test('한국 시간 목요일 00:00에만 주간 기록이 바뀐다', () => {
  assert.equal(weekKey(new Date('2026-10-14T14:59:59Z')), '2026-10-08');
  assert.equal(weekKey(new Date('2026-10-14T15:00:00Z')), '2026-10-15');
  assert.equal(weekKey(new Date('2026-10-11T00:00:00Z')), '2026-10-08');
  assert.equal(weekKey(new Date('2026-12-31T15:00:00Z')), '2026-12-31');
});
test('완료한 기본 보스만 합산하고 인원별 수익은 소수점 이하를 버린다', () => {
  const p = createProfile({ name: '테스트' });
  p.routine = ['lotus', 'damien'];
  p.settings.lotus = { tier: '하드', party: 3, prices: { 하드: 100000001 } };
  p.weeks['2026-10-08'] = ['lotus', 'zakum'];
  const expected = income(100000001, 3) + 33800000;
  assert.deepEqual(totals(p, '2026-10-08'), { expected, earned: 33333333, count: 1 });
  assert.deepEqual(totals(p, '2026-10-15'), { expected, earned: 0, count: 0 });
});
test('캐릭터, 난이도, 기본값 변경은 서로 독립적이다', () => {
  const a = createProfile({ name: 'A' });
  const b = createProfile({ name: 'B' });
  const lotus = bosses.find(b => b.id === 'lotus');
  a.routine = [];
  a.settings.lotus = { tier: '하드', party: 2, prices: { 하드: 50000000, 노멀: 0 } };
  assert.equal(bossSetting(a, lotus).price, 50000000);
  assert.equal(bossSetting(a, lotus).custom, true);
  a.settings.lotus.tier = '노멀';
  assert.equal(bossSetting(a, lotus).price, 0);
  assert.equal(bossSetting(b, lotus).price, 32512500);
  assert.equal(b.routine.length, 10);
  assert.deepEqual(totals(a, '2026-10-08'), { expected: 0, earned: 0, count: 0 });
});
