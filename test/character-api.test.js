import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchCharacter } from '../public/character-api.js';
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
