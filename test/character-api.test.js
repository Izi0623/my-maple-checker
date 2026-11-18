import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchCharacter, readCombatPower } from '../public/character-api.js';
test('사용자 키는 공식 Nexon HTTPS 헤더에만 보내고 캐릭터 사진을 반환한다', async () => {
  const calls = [];
  const character = await fetchCharacter(' 테스트 ', 'unit-test-key', { fetcher: async (url, options) => {
    calls.push({ url, options });
    return Response.json(calls.length === 1 ? { ocid: 'test-id' } : { character_name: '테스트', character_image: 'https://example.com/face.png', character_level: 280, character_class: '히어로', world_name: '스카니아' });
  } });
  assert.equal(character.image, 'https://example.com/face.png');
  assert.equal(character.source, 'nexon');
  for (const { url, options } of calls) {
    assert.equal(new URL(url).origin, 'https://open.api.nexon.com');
    assert.equal(options.headers['x-nxopen-api-key'], 'unit-test-key');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    assert.ok(!url.includes('unit-test-key'));
  }
  assert.ok(!JSON.stringify(character).includes('unit-test-key'));
  assert.equal(new URL(calls[0].url).searchParams.get('character_name'), '테스트');
  assert.equal(new URL(calls[1].url).searchParams.get('ocid'), 'test-id');
});
test('빈 키·만료 키·요청 한도·CORS 오류를 명시적으로 안내한다', async () => {
  await assert.rejects(fetchCharacter('테스트', ''), /먼저 Nexon API/);
  for (const [status, message] of [[401, /유효 기간/], [403, /유효 기간/], [429, /요청 한도/], [404, /캐릭터 이름/]]) {
    await assert.rejects(fetchCharacter('테스트', 'test-key', { fetcher: async () => new Response('', { status }) }), message);
  }
  await assert.rejects(fetchCharacter('테스트', 'test-key', { fetcher: async () => { throw new TypeError('test'); } }), /CORS/);
});
test('character/stat의 final_stat에서 전투력을 정수로 꺼내 함께 돌려준다', async () => {
  const calls = [];
  const character = await fetchCharacter('전투력', 'unit-test-key', { fetcher: async url => {
    calls.push(new URL(url).pathname + new URL(url).search);
    if (calls.length === 1) return Response.json({ ocid: 'ocid-1' });
    if (calls.length === 2) return Response.json({ character_name: '전투력', character_level: 285, character_class: '아델', world_name: '스카니아', character_image: 'https://example.com/a.png' });
    return Response.json({ date: '2026-11-18T00:00:00+09:00', character_class: '아델', final_stat: [
      { stat_name: '최대 마나', stat_value: '100000' },
      { stat_name: '전투력', stat_value: '124000000' },
      { stat_name: '보스 몬스터 데미지', stat_value: '300' },
    ] });
  } });
  assert.equal(character.combatPower, 124000000);
  assert.equal(character.level, 285);
  assert.equal(calls[2], '/maplestory/v1/character/stat?ocid=ocid-1');
});
test('전투력이 없거나 조회에 실패해도 캐릭터 등록은 그대로 성공한다', async () => {
  const basic = { character_name: '무전투력', character_level: 200, character_class: '히어로', world_name: '베라' };
  const noStat = await fetchCharacter('무전투력', 'k', { fetcher: async (url) => {
    if (String(url).includes('/id?')) return Response.json({ ocid: 'o' });
    if (String(url).includes('character/stat')) return Response.json({ final_stat: [{ stat_name: '최대 마나', stat_value: '1000' }] });
    return Response.json(basic);
  } });
  assert.equal(noStat.name, '무전투력');
  assert.equal(noStat.combatPower, undefined);
  const failedStat = await fetchCharacter('무전투력', 'k', { fetcher: async (url) => {
    if (String(url).includes('/id?')) return Response.json({ ocid: 'o' });
    if (String(url).includes('character/stat')) return new Response('', { status: 429 });
    return Response.json(basic);
  } });
  assert.equal(failedStat.level, 200);
  assert.equal(failedStat.combatPower, undefined);
  assert.ok(!JSON.stringify(failedStat).includes('k"'));
});
test('전투력 추출은 쉼표·공백·잘못된 값을 견딘다', () => {
  assert.equal(readCombatPower({ final_stat: [{ stat_name: '전투력', stat_value: ' 8,500,000 ' }] }), 8500000);
  assert.equal(readCombatPower({ final_stat: [{ stat_name: '전투력', stat_value: 0 }] }), null);
  assert.equal(readCombatPower({ final_stat: [{ stat_name: '전투력', stat_value: '-' }] }), null);
  assert.equal(readCombatPower({ final_stat: [] }), null);
  assert.equal(readCombatPower({}), null);
  assert.equal(readCombatPower(null), null);
});
