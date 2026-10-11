// 사용자 키는 호출하는 동안만 사용한다. 저장소·로그·URL에 기록하지 않는다.
export async function fetchCharacter(name, apiKey, { fetcher = fetch, signal } = {}) {
  if (!apiKey?.trim()) throw new Error('먼저 Nexon API 키를 연결해 주세요.');
  const timeout = AbortSignal.timeout(15000);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  async function request(endpoint, params) {
    let response;
    try {
      response = await fetcher(`https://open.api.nexon.com/maplestory/v1/${endpoint}?${new URLSearchParams(params)}`, {
        headers: { 'x-nxopen-api-key': apiKey }, signal: requestSignal,
        credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer',
      });
    } catch {
      if (requestSignal.aborted) throw new Error('조회가 취소되었거나 시간이 초과되었어요. 다시 시도해 주세요.');
      throw new Error('Nexon API에 연결하지 못했어요. 네트워크 또는 브라우저 접근 제한(CORS)을 확인해 주세요. 직접 등록은 계속 사용할 수 있어요.');
    }
    if (!response.ok) {
      if ([401, 403].includes(response.status)) throw new Error('API 키의 유효 기간과 메이플스토리 조회 권한을 확인해 주세요.');
      if ([400, 404].includes(response.status)) throw new Error('캐릭터 이름이나 API 키를 확인해 주세요. 최근 생성한 캐릭터는 바로 조회되지 않을 수 있어요.');
      if (response.status === 429) throw new Error('API 요청 한도에 도달했어요. 잠시 후 다시 조회해 주세요.');
      throw new Error('Nexon API에서 조회하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
    try { return await response.json(); }
    catch { throw new Error('Nexon API 응답을 읽지 못했어요. 다시 조회해 주세요.'); }
  }
  const id = await request('id', { character_name: name.trim() });
  if (!id.ocid) throw new Error('캐릭터 식별자를 찾지 못했어요.');
  const basic = await request('character/basic', { ocid: id.ocid });
  if (!basic.character_name) throw new Error('캐릭터 정보를 찾지 못했어요.');
  return { id: id.ocid, name: basic.character_name, level: basic.character_level, world: basic.world_name, className: basic.character_class, image: basic.character_image, source: 'nexon' };
}
