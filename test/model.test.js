import test from 'node:test';
import assert from 'node:assert/strict';
import { bosses, createProfile, weekKey, bossSetting, income, totals, MAX_WEEKLY_BOSSES, canClearBoss } from '../public/model.js';

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
  const expected = income(100000001, 3) + 46400000;
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
  assert.equal(bossSetting(b, lotus).price, 48900000);
  assert.equal(b.routine.length, 12);
  assert.deepEqual(totals(a, '2026-10-08'), { expected: 0, earned: 0, count: 0 });
});

test('한 주 최대 12개: 해제는 가능하고 목록을 바꾸어도 13번째는 제한된다', () => {
  const cleared = bosses.slice(0, 12).map(b => b.id);
  assert.equal(MAX_WEEKLY_BOSSES, 12);
  assert.equal(canClearBoss(cleared, cleared[0]), true);
  assert.equal(canClearBoss(cleared, bosses[12].id), false);
  assert.equal(canClearBoss(cleared.slice(1), bosses[12].id), true);
  assert.equal(createProfile({ name: '새 캐릭터' }).routine.length, 12);
});

test('월간 검은 마법사는 주간 합계와 별도로 보관하고 계산한다', () => {
  const p = createProfile({ name: '월간 캐릭터' });
  p.routine = ['zakum', 'black_mage'];
  p.settings.black_mage = { tier: '하드', prices: { 하드: 1000000000 }, party: 3 };
  p.weeks['2026-10-08'] = ['zakum'];
  p.months['2026-10'] = ['black_mage'];
  assert.deepEqual(totals(p, '2026-10', 'monthly'), { expected: 333333333, earned: 333333333, count: 1 });
  assert.equal(totals(p, '2026-10-08').count, 1);
  assert.equal(totals(p, '2026-11', 'monthly').earned, 0);
});
test('미확인 가격 처리와 보스별 파티 인원 제한을 검증한다', () => {
  const p = createProfile({ name: '가격 대기' });
  p.settings.limbo = { tier: '노멀' };
  p.routine = ['limbo']; p.weeks['2026-10-08'] = ['limbo'];
  const b = bosses.find(b => b.id === 'limbo');
  assert.equal(bossSetting(p, b).price, 995000000);
  assert.equal(bossSetting(p, { ...b, tiers: [['노멀', null]] }).price, null);
  assert.equal(income(null, 3), null);
  p.settings.limbo = { tier: '노멀', prices: { 노멀: 900000000 }, party: 6 };
  assert.equal(bossSetting(p, b).party, 3);
  assert.equal(totals(p, '2026-10-08').earned, 300000000);
});

test('처음 선택하는 난이도는 하드/카오스를 우선하고 직접 지정한 난이도는 유지한다', () => {
 const p=createProfile({name:'신규'});
 for(const [id,tier] of [['gloom','카오스'],['lucid','하드'],['will','하드'],['slime','카오스']]) assert.equal(bossSetting(p,bosses.find(b=>b.id===id)).tier,tier);
 p.settings.lucid={tier:'이지'};assert.equal(bossSetting(p,bosses.find(b=>b.id==='lucid')).tier,'이지');
});
test('모두 체크는 전체 루틴에 적용하고 12개 제한 위반 시 기존 기록을 유지한다', async () => {
 const {setRoutineClears}=await import('../public/model.js');
 const p=createProfile({name:'일괄체크'});p.weeks['2026-10-08']=['hilla'];
 assert.ok(setRoutineClears(p,'2026-10-08',true));assert.equal(p.weeks['2026-10-08'].length,13);
 assert.ok(setRoutineClears(p,'2026-10-08',false));assert.deepEqual(p.weeks['2026-10-08'],['hilla']);
 p.weeks['2026-10-08']=['limbo'];
 assert.equal(setRoutineClears(p,'2026-10-08',true),false);assert.deepEqual(p.weeks['2026-10-08'],['limbo']);
});
