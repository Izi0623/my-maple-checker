import test from 'node:test';
import assert from 'node:assert/strict';
import { createProfile, monthlyProjection, cashValue } from '../public/model.js';

test('전체 캐릭터 월간 예상액은 주간 선택 보스의 파티별 수익 × 계산 주수다', () => {
  const a = createProfile({name:'첫째',source:'manual'});
  a.routine = ['zakum', 'black_mage', 'hilla'];
  a.settings.zakum = {tier:'카오스',party:3,prices:{'카오스':100000001}};
  a.months['2026-10'] = ['black_mage'];
  const b = createProfile({name:'둘째',source:'nexon'});
  b.routine = ['lotus'];
  b.settings.lotus = {tier:'노멀',party:1,prices:{'노멀':200000000}};
  const demo = createProfile({name:'예시',source:'demo'});
  const profiles = {a,b,demo};
  const four = monthlyProjection(profiles);
  assert.equal(four.characters.length,2);
  assert.equal(four.weekly,233333333);
  assert.equal(four.monthly,933333332);
  assert.equal(monthlyProjection(profiles,5).monthly,1166666665);
  a.weeks['2026-10-08'] = ['zakum'];
  assert.deepEqual(monthlyProjection(profiles),four);
  assert.equal(monthlyProjection({}).monthly,0);
});

test('현금 환산은 1억 메소당 시세를 곱하고 원 미만은 버린다', () => {
  assert.equal(cashValue(250000000,2000),5000);
  assert.equal(cashValue(100000001,2300),2300);
  assert.equal(cashValue(250000000,0),0);
});
