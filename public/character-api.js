// 사용자 키는 호출할 때만 헤더로 보낸다. 요청 URL·로그에는 남기지 않는다.
// 브라우저 저장(localStorage)은 api-key-store.js가 맡고, 기록 내보내기 파일에는 넣지 않는다.
// 전투력은 최근 7일 스냅샷 중 가장 높은 값을 쓴다. 사냥용 프리셋처럼 낮은 스냅샷이 보스 전투력을 덮지 않게 하기 위해서다.
export const POWER_LOOKBACK_DAYS = 7;
export async function fetchCharacter(name, apiKey, { fetcher = fetch, signal, now = new Date() } = {}) {
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
  const character = { id: id.ocid, name: basic.character_name, level: basic.character_level, world: basic.world_name, className: basic.character_class, image: basic.character_image, source: 'nexon' };
  // 전투력을 못 받아도 캐릭터 등록은 그대로 진행한다. 날짜별 조회는 캐릭터 생성일 이전·미접속일·준비 중인 날에 실패할 수 있어 개별로 넘긴다.
  const stats = await Promise.allSettled([
    request('character/stat', { ocid: id.ocid }),
    ...recentStatDates(now).map(date => request('character/stat', { ocid: id.ocid, date })),
  ]);
  if (requestSignal.aborted) throw new Error('조회가 취소되었거나 시간이 초과되었어요. 다시 시도해 주세요.');
  const best = pickBestCombatPower(stats.map(result => result.status === 'fulfilled' ? result.value : null));
  if (best) {
    character.combatPower = best.combatPower;
    if (best.date) character.combatPowerDate = best.date;
  }
  return character;
}
// character/stat은 date를 비우면 전일(D-1) 스냅샷을 주고, 당일 데이터는 다음 날 02:00(KST) 이후에 확정된다.
// 그래서 전일은 date 없이 받고, 그 이전 6일은 date를 붙여 조회해 최근 7일치를 모은다.
export function recentStatDates(now = new Date(), days = POWER_LOOKBACK_DAYS) {
  const kst = now.getTime() + 9 * 3600000;
  const count = Math.max(0, Math.trunc(days) - 1);
  return Array.from({ length: count }, (_, index) => new Date(kst - (index + 2) * 86400000).toISOString().slice(0, 10));
}
// 최신 스냅샷부터 차례로 보며 가장 높은 전투력을 고른다. 같은 값이면 최신 날짜를 남긴다.
export function pickBestCombatPower(stats = []) {
  let best = null;
  for (const stat of stats) {
    const combatPower = readCombatPower(stat);
    if (combatPower === null) continue;
    if (!best || combatPower > best.combatPower) best = { combatPower, date: readStatDate(stat) };
  }
  return best;
}
// character/stat의 date는 '2026-11-18T00:00:00+09:00' 같은 KST 시각 문자열이다. 날짜 부분만 남긴다.
export function readStatDate(stat) {
  const date = typeof stat?.date === 'string' ? stat.date.slice(0, 10) : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
}
// character/stat의 final_stat에서 '전투력'만 정수로 뽑는다. 값이 없으면 null.
export function readCombatPower(stat) {
  const entry = Array.isArray(stat?.final_stat) ? stat.final_stat.find(item => item?.stat_name === '전투력') : null;
  const digits = String(entry?.stat_value ?? '').replace(/[^0-9]/g, '');
  if (!digits) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
