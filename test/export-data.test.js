import test from 'node:test';
import assert from 'node:assert/strict';
import { exportState } from '../public/export-data.js';

test('기록 내보내기 JSON에는 Nexon API 키가 들어가지 않는다', () => {
  const state = {
    active: 'demo',
    mesoRate: 1500,
    monthlyWeeks: 4,
    calendarEvents: [],
    characterOrder: ['demo'],
    profiles: { demo: { character: { name: '메이플 모험가', source: 'demo' }, routine: [], weeks: {}, settings: {} } },
    // 어떤 경로로든 state에 섞여 들어와도 내보내기에는 넣지 않는다.
    nexonApiKey: 'secret-key-999',
    apiKey: 'secret-key-999',
  };
  const json = exportState(state);
  assert.ok(!json.includes('secret-key-999'));
  assert.ok(!json.includes('nexonApiKey'));
  assert.ok(!json.includes('apiKey'));
  const parsed = JSON.parse(json);
  assert.equal(parsed.profiles.demo.character.name, '메이플 모험가');
  assert.equal(parsed.mesoRate, 1500);
  // 원본 state는 손대지 않는다.
  assert.equal(state.nexonApiKey, 'secret-key-999');
});

test('내보내기는 중첩된 설정과 일정 안의 키 필드도 걸러 낸다', () => {
  const state = {
    profiles: { hero: { character: { name: '히어로' }, settings: { lucid: { tier: '하드', api_key: 'nested-secret' } } } },
    calendarEvents: [{ date: '2026-11-20', title: '달빛님 / 하드 루시드', apiKey: 'array-secret' }],
  };
  const json = exportState(state);
  assert.ok(!json.includes('nested-secret'));
  assert.ok(!json.includes('array-secret'));
  const parsed = JSON.parse(json);
  assert.equal(parsed.profiles.hero.settings.lucid.tier, '하드');
  assert.equal(parsed.calendarEvents[0].title, '달빛님 / 하드 루시드');
});
