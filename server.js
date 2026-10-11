import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
const json = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};

export function createServer({ apiKey = process.env.NEXON_API_KEY, fetcher = fetch } = {}) {
  async function nexon(endpoint, params) {
    const response = await fetcher(`https://open.api.nexon.com/maplestory/v1/${endpoint}?${new URLSearchParams(params)}`, {
      headers: { 'x-nxopen-api-key': apiKey }, signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      const err = new Error('Nexon request failed');
      err.status = response.status;
      throw err;
    }
    return response.json();
  }
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method !== 'GET') return json(res, 405, { error: '지원하지 않는 요청입니다.' });
      if (url.pathname === '/api/health') return json(res, 200, { ok: true, characterLookupConfigured: Boolean(apiKey) });
      if (url.pathname === '/api/character') {
        const name = url.searchParams.get('name')?.trim();
        if (!name || name.length > 20) return json(res, 400, { error: '캐릭터 이름을 1~20자로 입력해 주세요.' });
        if (!apiKey) return json(res, 503, { code: 'KEY_REQUIRED', error: '캐릭터 자동 조회를 준비 중이에요. 서버에 Nexon API 키를 연결하면 사용할 수 있습니다. 지금은 직접 등록으로 기록을 시작할 수 있어요.' });
        try {
          const { ocid } = await nexon('id', { character_name: name });
          if (!ocid) throw new Error('Invalid character response');
          const basic = await nexon('character/basic', { ocid });
          if (!basic.character_name) throw new Error('Invalid character response');
          return json(res, 200, { id: ocid, name: basic.character_name, world: basic.world_name, className: basic.character_class, level: basic.character_level, image: basic.character_image, source: 'nexon' });
        } catch (error) {
          if (error.status === 400 || error.status === 404) return json(res, 404, { error: '캐릭터를 찾을 수 없어요. 이름을 확인해 주세요. 최근 생성하거나 삭제한 캐릭터는 조회되지 않을 수 있습니다.' });
          if (error.status === 401 || error.status === 403) return json(res, 502, { error: '캐릭터 조회 권한을 확인할 수 없습니다. 서버의 Nexon API 키와 연결 설정을 확인해 주세요.' });
          if (error.status === 429) return json(res, 429, { error: '조회 요청이 많아요. 잠시 후 다시 검색해 주세요.' });
          return json(res, 502, { error: '캐릭터 조회 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.' });
        }
      }
      if (url.pathname.startsWith('/api/')) return json(res, 404, { error: '요청을 찾을 수 없습니다.' });
      const file = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).slice(1);
      const target = path.resolve(root, file);
      if (!target.startsWith(root + path.sep)) return json(res, 403, { error: '접근할 수 없습니다.' });
      try {
        const body = await readFile(target);
        res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
        res.end(body);
      } catch { json(res, 404, { error: '페이지를 찾을 수 없습니다.' }); }
    } catch { json(res, 500, { error: '요청 처리 중 오류가 발생했습니다.' }); }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, '0.0.0.0', () => console.log(`Maple Weekly server listening on port ${port}`));
}
