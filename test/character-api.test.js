import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchCharacter, readCombatPower, readStatDate, recentStatDates, pickBestCombatPower } from '../public/character-api.js';
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
  assert.equal(character.combatPowerDate, '2026-11-18');
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
// 최근 7일 조회: 전일은 date 없이, 그 이전 6일은 KST 날짜를 붙여 받는다.
test('조회할 날짜는 KST 기준 전일 이전 6일이고 미래·당일은 넣지 않는다', () => {
  const now = new Date('2026-11-18T09:00:00Z'); // KST 2026-11-18 18:00
  assert.deepEqual(recentStatDates(now), ['2026-11-16', '2026-11-15', '2026-11-14', '2026-11-13', '2026-11-12', '2026-11-11']);
  // KST 자정 직후(UTC 전날 15:00)에도 KST 날짜로 계산한다.
  assert.deepEqual(recentStatDates(new Date('2026-11-18T15:30:00Z')).slice(0, 2), ['2026-11-17', '2026-11-16']);
  assert.deepEqual(recentStatDates(now, 1), []);
  assert.deepEqual(readStatDate({ date: '2026-11-16T00:00:00+09:00' }), '2026-11-16');
  assert.equal(readStatDate({ date: '어제' }), undefined);
  assert.equal(readStatDate(null), undefined);
});
test('최신 스냅샷과 최근 7일 스냅샷 중 가장 높은 전투력을 고르고 실패한 날짜는 건너뛴다', async () => {
  const now = new Date('2026-11-18T09:00:00Z');
  const powersByDate = { latest: '90000000', '2026-11-16': '124000000', '2026-11-15': '120000000', '2026-11-12': '141000000' };
  const statDates = [];
  const character = await fetchCharacter('최고', 'k', { now, fetcher: async url => {
    const target = new URL(url);
    if (target.pathname.endsWith('/id')) return Response.json({ ocid: 'o' });
    if (target.pathname.endsWith('character/basic')) return Response.json({ character_name: '최고', character_level: 285, character_class: '아델', world_name: '스카니아', character_image: 'https://example.com/a.png' });
    const date = target.searchParams.get('date');
    statDates.push(date);
    const power = date === null ? powersByDate.latest : powersByDate[date];
    // 미접속일·캐릭터 생성일 이전 날짜는 Nexon이 400으로 돌려준다.
    if (!power) return new Response('', { status: 400 });
    return Response.json({ date: `${date ?? '2026-11-17'}T00:00:00+09:00`, final_stat: [{ stat_name: '전투력', stat_value: power }] });
  } });
  assert.equal(statDates.length, 7);
  assert.equal(statDates[0], null);
  assert.deepEqual(statDates.slice(1), recentStatDates(now));
  assert.equal(character.name, '최고');
  assert.equal(character.combatPower, 141000000);
  assert.equal(character.combatPowerDate, '2026-11-12');
  assert.equal(character.level, 285);
});
test('날짜별 조회가 전부 실패해도 최신 스냅샷 전투력으로 등록을 마친다', async () => {
  const character = await fetchCharacter('최신만', 'k', { now: new Date('2026-11-18T09:00:00Z'), fetcher: async url => {
    const target = new URL(url);
    if (target.pathname.endsWith('/id')) return Response.json({ ocid: 'o' });
    if (target.pathname.endsWith('character/basic')) return Response.json({ character_name: '최신만', character_level: 200, character_class: '히어로', world_name: '베라' });
    if (target.searchParams.get('date')) return new Response('', { status: 400 });
    return Response.json({ date: '2026-11-17T00:00:00+09:00', final_stat: [{ stat_name: '전투력', stat_value: '85000000' }] });
  } });
  assert.equal(character.combatPower, 85000000);
  assert.equal(character.combatPowerDate, '2026-11-17');
});
test('조회를 취소하면 날짜별 조회가 실패해도 취소로 끝난다', async () => {
  const controller = new AbortController();
  await assert.rejects(fetchCharacter('취소', 'k', { signal: controller.signal, fetcher: async url => {
    const target = new URL(url);
    if (target.pathname.endsWith('/id')) return Response.json({ ocid: 'o' });
    if (target.pathname.endsWith('character/basic')) return Response.json({ character_name: '취소', character_level: 200, character_class: '히어로', world_name: '베라' });
    controller.abort();
    throw new DOMException('aborted', 'AbortError');
  } }), /취소/);
});
test('전투력 목록에서 최댓값을 고르고 같은 값이면 최신 날짜를 남긴다', () => {
  assert.deepEqual(pickBestCombatPower([
    { date: '2026-11-17T00:00:00+09:00', final_stat: [{ stat_name: '전투력', stat_value: '9000' }] },
    null,
    { date: '2026-11-15T00:00:00+09:00', final_stat: [{ stat_name: '전투력', stat_value: '12000' }] },
    { date: '2026-11-14T00:00:00+09:00', final_stat: [{ stat_name: '전투력', stat_value: '12000' }] },
  ]), { combatPower: 12000, date: '2026-11-15' });
  assert.equal(pickBestCombatPower([null, {}, { final_stat: [] }]), null);
  assert.equal(pickBestCombatPower(), null);
});
