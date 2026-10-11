import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../server.js';
async function serve(t, options) {
  const server = createServer(options);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}
test('키가 없을 때 실제 조회를 가장하지 않고 직접 등록 안내를 제공한다', async t => {
  const url = await serve(t, { apiKey: '' });
  const health = await (await fetch(`${url}/api/health`)).json();
  assert.equal(health.characterLookupConfigured, false);
  const res = await fetch(`${url}/api/character?name=테스트`);
  assert.equal(res.status, 503);
  assert.equal((await res.json()).code, 'KEY_REQUIRED');
  assert.equal((await fetch(`${url}/api/character?name=`)).status, 400);
  const page = await (await fetch(url)).text();
  assert.match(page, /메이플 위클리/);
  assert.equal((await fetch(`${url}/server.js`)).status, 404);
  assert.equal((await fetch(`${url}/.env`)).status, 404);
});
test('서버에서 Nexon ID → basic을 조회하고 필요한 정보만 반환한다', async t => {
  const calls = [];
  const url = await serve(t, { apiKey: 'test-only-key', fetcher: async (url, options) => {
    calls.push({ url, options });
    return Response.json(calls.length === 1 ? { ocid: 'test-ocid' } : { character_name: '테스트', world_name: '스카니아', character_class: '히어로', character_level: 280, character_image: 'https://example.com/character.png', irrelevant: 'hidden' });
  } });
  const res = await fetch(`${url}/api/character?name=${encodeURIComponent('테스트')}`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.name, '테스트');
  assert.equal(data.level, 280);
  assert.equal(data.source, 'nexon');
  assert.equal(data.irrelevant, undefined);
  assert.equal(calls[0].options.headers['x-nxopen-api-key'], 'test-only-key');
  assert.equal(new URL(calls[0].url).searchParams.get('character_name'), '테스트');
  assert.equal(new URL(calls[1].url).searchParams.get('ocid'), 'test-ocid');
  assert.ok(!JSON.stringify(data).includes('test-only-key'));
});
test('Nexon 오류를 사용자 메시지로 변환하고 키를 노출하지 않는다', async t => {
  for (const [upstream, expected] of [[400, 404], [401, 502], [403, 502], [429, 429], [500, 502]]) {
    const url = await serve(t, { apiKey: 'test-only-key', fetcher: async () => new Response('', { status: upstream }) });
    const res = await fetch(`${url}/api/character?name=테스트`);
    assert.equal(res.status, expected);
    assert.ok(!JSON.stringify(await res.json()).includes('test-only-key'));
  }
});
