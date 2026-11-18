import test from 'node:test';
import assert from 'node:assert/strict';
import { bosses, createProfile, weekKey, bossSetting, income, totals, MAX_WEEKLY_BOSSES, canClearBoss, bossSoloPower, bossDuoThreshold, bestBossClear, parsePower, mergeCharacterPower, mergeFetchedCharacter, applyManualCharacter } from '../public/model.js';

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

// --- 전투력 기반 1·2인격 자동 선택 ---
const boss = id => bosses.find(b => b.id === id);
test('모든 보스·난이도에 1인 격파 전투력 기준이 있고, 2인 기준은 그 55%다', () => {
  for (const b of bosses) {
    for (const [tier] of b.tiers) {
      const solo = bossSoloPower[b.id]?.[tier];
      assert.ok(Number.isSafeInteger(solo) && solo > 0, `${b.name} ${tier} 기준 없음`);
      assert.equal(bossDuoThreshold(b, tier), Math.round(solo * 0.55));
    }
  }
  // 난이도가 높을수록 요구 전투력도 높다.
  for (const b of bosses.filter(b => b.tiers.length > 1)) {
    const ordered = b.tiers.map(([tier]) => bossSoloPower[b.id][tier]);
    assert.deepEqual(ordered, [...ordered].sort((a, c) => a - c), `${b.name} 난이도 순서`);
  }
});

test('전투력이 솔격 컷이면 1인, 2인격 구간이면 2인 기준 결정석 가격을 고른다', () => {
  // 5,000만: 노말 세렌(8,000만)은 2인(4,400만) 구간, 하드 세렌(1억 8,000만)은 불가
  const p = createProfile({ name: '전투력', level: 280, combatPower: 50000000, source: 'manual' });
  assert.deepEqual({ tier: p.settings.seren.tier, party: p.settings.seren.party }, { tier: '노멀', party: 2 });
  const seren = bossSetting(p, boss('seren'));
  assert.equal(seren.party, 2);
  assert.equal(income(seren.price, seren.party), 83500000);
  // 하드 스우는 1인 유지
  assert.deepEqual({ tier: p.settings.lotus.tier, party: p.settings.lotus.party }, { tier: '하드', party: 1 });
  // 1인 격파가 안 되는 상위 보스는 루틴에서 빠진다.
  assert.ok(!p.routine.includes('kalos'));
  assert.ok(!p.routine.includes('black_mage'));
  assert.ok(p.routine.length <= MAX_WEEKLY_BOSSES + 1);
});

test('같은 보스 안에서는 1·2인 모두 따져 인당 결정석 가격이 가장 높은 난이도를 고른다', () => {
  // 1억: 노말 세렌 1인 1억 6,700만 > 하드 세렌 2인 1억 5,100만
  assert.deepEqual(bestBossClear(boss('seren'), { level: 280, combatPower: 100000000 }),
    { tier: '노멀', party: 1, price: 167000000, perPerson: 167000000 });
  // 2억: 하드 세렌 1인 3억 200만
  assert.equal(bestBossClear(boss('seren'), { level: 280, combatPower: 200000000 }).perPerson, 302000000);
  // 5억: 림보는 노말 2인(3억 8,500만)만 가능해 4억 9,750만
  assert.deepEqual(bestBossClear(boss('limbo'), { level: 285, combatPower: 500000000 }),
    { tier: '노멀', party: 2, price: 995000000, perPerson: 497500000 });
  // 8억: 하드 림보 2인(7억 7,000만) 구간
  assert.deepEqual(bestBossClear(boss('limbo'), { level: 285, combatPower: 800000000 }),
    { tier: '하드', party: 2, price: 2385000000, perPerson: 1192500000 });
  // 3,000만: 하드 파풀 컷 전이므로 아무 난이도도 되지 않는다.
  assert.equal(bestBossClear(boss('papulatus'), { level: 200, combatPower: 3000000 }), null);
});

test('입장 레벨과 전투력 중 하나라도 모자라면 그 보스는 선택하지 않는다', () => {
  assert.equal(bestBossClear(boss('seren'), { level: 259, combatPower: 3000000000 }), null);
  assert.ok(bestBossClear(boss('seren'), { level: 260, combatPower: 80000000 }));
  assert.equal(bestBossClear(boss('zakum'), { level: 90, combatPower: 400000 }), null);
  assert.deepEqual(bestBossClear(boss('zakum'), { level: 90, combatPower: 900000 }), { tier: '카오스', party: 1, price: 4040000, perPerson: 4040000 });
});

test('전투력 기반 주간 루틴은 인당 가격 내림차순 12개와 가능한 월간 보스로 채운다', () => {
  const p = createProfile({ name: '고스펙', level: 290, combatPower: 70000000, source: 'manual' });
  const weekly = p.routine.filter(id => bosses.find(b => b.id === id && (b.cycle || 'weekly') === 'weekly'));
  assert.equal(weekly.length, MAX_WEEKLY_BOSSES);
  const perPerson = id => { const s = bossSetting(p, boss(id)); return income(s.price, s.party); };
  const values = weekly.map(perPerson);
  assert.deepEqual(values, [...values].sort((a, b) => b - a));
  // 7,000만이면 검은 마법사 하드는 2인 구간이라 월간 목록에 들어온다.
  assert.ok(p.routine.includes('black_mage'));
  assert.deepEqual({ tier: p.settings.black_mage.tier, party: p.settings.black_mage.party }, { tier: '하드', party: 2 });
  assert.equal(totals(p, '2026-10', 'monthly').expected, Math.floor(465000000 / 2));
});

test('전투력이 없으면 지금처럼 레벨 기준 최고 난이도를 1인으로 고른다', () => {
  const p = createProfile({ name: '레벨만', level: 280, source: 'manual' });
  assert.equal(p.routine.length, MAX_WEEKLY_BOSSES + 1);
  for (const id of p.routine) assert.equal(p.settings[id].party, 1);
  assert.deepEqual({ tier: p.settings.seren.tier, party: p.settings.seren.party }, { tier: '익스트림', party: 1 });
  assert.equal(bossSetting(p, boss('seren')).price, 1840000000);
  assert.deepEqual(bestBossClear(boss('seren'), { level: 280 }), bestBossClear(boss('seren'), { level: 280, combatPower: null }));
  assert.equal(bestBossClear(boss('seren'), { level: 280 }).perPerson, 1840000000);
});

test('전투력 입력은 억·만 표기와 숫자를 모두 받아들이고 잘못된 값은 버린다', () => {
  assert.equal(parsePower('1억 2400만'), 124000000);
  assert.equal(parsePower('1.24억'), 124000000);
  assert.equal(parsePower('8500만'), 85000000);
  assert.equal(parsePower('2천만'), 20000000);
  assert.equal(parsePower('124,000,000'), 124000000);
  assert.equal(parsePower(' 3억 '), 300000000);
  for (const bad of ['', '   ', 'abc', '억', '-1', '0', null, undefined, '1억abc']) assert.equal(parsePower(bad), null);
  // 잘못된 전투력은 캐릭터에 저장하지 않고 레벨 기준으로 되돌아간다.
  const p = createProfile({ name: '오타', level: 280, combatPower: '많이', source: 'manual' });
  assert.equal(p.character.combatPower, undefined);
  assert.equal(p.settings.seren.party, 1);
  // 문자열로 들어온 정상 값은 정수로 정리해 보관한다.
  assert.equal(createProfile({ name: '문자열', level: 280, combatPower: '1억2400만', source: 'manual' }).character.combatPower, 124000000);
});

test('새로 조회한 전투력이 더 낮우면 저장된 보스 전투력을 그대로 유지한다', () => {
  const saved = { name: '아델', level: 285, class: '아델', combatPower: 124000000, combatPowerDate: '2026-11-14', source: 'manual' };
  // 보스 프리셋 1억 2,400만 → 사냥 프리셋 9,500만 스냅샷이 새로 들어온 경우
  const fetched = { id: 'ocid-1', name: '아델', level: 286, className: '아델', world: '스카니아', image: 'https://example.com/a.png', source: 'nexon', combatPower: 95000000, combatPowerDate: '2026-11-17' };
  const merged = mergeFetchedCharacter(saved, fetched);
  assert.equal(merged.combatPower, 124000000);
  assert.equal(merged.keptExisting, true);
  assert.equal(merged.fetchedCombatPower, 95000000);
  // 캐릭터 정보 자체는 새 값으로 갱신되고, 전투력·기준일만 높은 쪽이 남는다.
  assert.equal(merged.character.level, 286);
  assert.equal(merged.character.source, 'nexon');
  assert.equal(merged.character.image, 'https://example.com/a.png');
  assert.equal(merged.character.combatPower, 124000000);
  assert.equal(merged.character.combatPowerDate, '2026-11-14');
});

test('새로 조회한 전투력이 더 높우면 그 값과 기준일로 버꾼다', () => {
  const saved = { name: '아델', level: 285, combatPower: 124000000, combatPowerDate: '2026-10-01', source: 'manual' };
  const fetched = { id: 'ocid-1', name: '아델', level: 285, source: 'nexon', combatPower: 141000000, combatPowerDate: '2026-11-16' };
  const merged = mergeFetchedCharacter(saved, fetched);
  assert.equal(merged.character.combatPower, 141000000);
  assert.equal(merged.character.combatPowerDate, '2026-11-16');
  assert.equal(merged.keptExisting, false);
});

test('조회에 전투력이 없으면 저장된 값을 유지하고, 저장된 값도 없으면 비워 둔다', () => {
  const kept = mergeFetchedCharacter({ name: 'A', combatPower: 85000000, combatPowerDate: '2026-11-10' }, { name: 'A', level: 200, source: 'nexon' });
  assert.equal(kept.character.combatPower, 85000000);
  assert.equal(kept.character.combatPowerDate, '2026-11-10');
  assert.equal(kept.keptExisting, true);
  assert.equal(kept.fetchedCombatPower, undefined);
  const empty = mergeFetchedCharacter({ name: 'B' }, { name: 'B', level: 200, source: 'nexon' });
  assert.equal(empty.character.combatPower, undefined);
  assert.equal(empty.character.combatPowerDate, undefined);
  assert.equal(empty.keptExisting, false);
  // 잘못된 값은 무시하고 숫자로 정리해 비교한다.
  assert.equal(mergeCharacterPower({ combatPower: '1억 2400만' }, { combatPower: 90000000 }).combatPower, 124000000);
  assert.equal(mergeCharacterPower({ combatPower: 0 }, { combatPower: 90000000 }).combatPower, 90000000);
});

test('직접 입력·수정한 전투력은 낮추더라도 그대로 저장한다', () => {
  const saved = { name: '아델', level: 285, combatPower: 124000000, combatPowerDate: '2026-11-14', source: 'nexon' };
  const lowered = applyManualCharacter(saved, { combatPower: 95000000 });
  assert.equal(lowered.combatPower, 95000000);
  assert.equal(lowered.combatPowerDate, undefined);
  assert.equal(lowered.name, '아델');
  // 값이 그대로인 수정(레벨만 바꾸기)은 조회 기준일을 지우지 않는다.
  const sameElsewhere = applyManualCharacter(saved, { level: 286, combatPower: 124000000 });
  assert.equal(sameElsewhere.combatPowerDate, '2026-11-14');
  assert.equal(sameElsewhere.level, 286);
  // 전투력을 비우면 기존 값을 건드리지 않는다(레벨만 바뀐다).
  const untouched = applyManualCharacter(saved, { level: 287 });
  assert.equal(untouched.combatPower, 124000000);
  assert.equal(applyManualCharacter(saved, { combatPower: '많이' }).combatPower, 124000000);
});

test('저장 데이터의 기준일은 날짜 형식만 남기고 잘못된 값은 버린다', () => {
  assert.equal(createProfile({ name: 'C', combatPower: 124000000, combatPowerDate: '2026-11-14' }).character.combatPowerDate, '2026-11-14');
  assert.equal(createProfile({ name: 'C', combatPower: 124000000, combatPowerDate: '<script>' }).character.combatPowerDate, undefined);
  assert.equal(createProfile({ name: 'C', combatPowerDate: '2026-11-14' }).character.combatPowerDate, undefined);
});
