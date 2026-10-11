import test from 'node:test';
import assert from 'node:assert/strict';
import { createProfile, monthlyProjection, cashValue } from '../public/model.js';

test('전체 캐릭터 월간 예상액은 주간 파티별 수익 × 주수 + 월간 결정석 1회분이다', () => {
  const a = createProfile({name:'첫째',source:'manual'});
  a.routine = ['zakum', 'black_mage', 'hilla'];
  a.settings.zakum = {tier:'카오스',party:3,prices:{'카오스':100000001}};
  a.settings.black_mage = {tier:'하드',party:3,prices:{'하드':120000000}};
  a.months['2026-10'] = ['black_mage'];
  const b = createProfile({name:'둘째',source:'nexon'});
  b.routine = ['lotus'];
  b.settings.lotus = {tier:'노멀',party:1,prices:{'노멀':200000000}};
  const demo = createProfile({name:'예시',source:'demo'});
  const profiles = {a,b,demo};
  const four = monthlyProjection(profiles);
  assert.equal(four.characters.length,2);
  assert.equal(four.weekly,233333333);
  assert.equal(four.monthlyBosses,40000000);
  assert.equal(four.monthly,973333332);
  assert.equal(monthlyProjection(profiles,5).monthly,1206666665);
  a.weeks['2026-10-08'] = ['zakum'];
  assert.deepEqual(monthlyProjection(profiles),four);
  assert.equal(monthlyProjection({}).monthly,0);
});

test('현금 환산은 1억 메소당 시세를 곱하고 원 미만은 버린다', () => {
  assert.equal(cashValue(250000000,2000),5000);
  assert.equal(cashValue(100000001,2300),2300);
  assert.equal(cashValue(250000000,0),0);
});

test('신규 레벨 캐릭터는 입장 가능한 보스의 최고 난이도 수익 순으로 최대 12개를 선택한다', async () => {
  const { bosses, bossEntryLevels, bossCycle, bossSetting } = await import('../public/model.js');
  for (const level of [1, 89, 90, 180, 254, 255, 260, 280, 294, 295]) {
    const profile = createProfile({name:'레벨 캐릭터',level,source:'nexon'});
    const weekly = profile.routine.filter(id => bossCycle(bosses.find(b=>b.id===id))==='weekly');
    assert.ok(weekly.length <= 12);
    assert.ok(profile.routine.every(id=>bossEntryLevels[id]<=level));
    const expected = bosses.filter(b=>bossCycle(b)==='weekly' && bossEntryLevels[b.id]<=level).sort((a,b)=>Math.max(...b.tiers.map(t=>t[1]))-Math.max(...a.tiers.map(t=>t[1]))).slice(0,12).map(b=>b.id);
    assert.deepEqual(weekly,expected);
    assert.equal(profile.routine.includes('black_mage'),level>=255);
    for (const id of profile.routine) {
      const boss = bosses.find(b=>b.id===id);
      assert.equal(bossSetting(profile,boss).price, Math.max(...boss.tiers.map(t=>t[1])));
    }
  }
  assert.ok(!createProfile({name:'아직 미입장',level:294,source:'manual'}).routine.includes('jupiter'));
  assert.ok(createProfile({name:'입장 가능',level:295,source:'manual'}).routine.includes('jupiter'));
});
