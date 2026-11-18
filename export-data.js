// 기록 내보내기는 캐릭터·보스·일정 기록만 담는다.
// 브라우저에만 두는 Nexon API 키는 어떤 필드 이름으로 들어와도 내보내기 파일에 넣지 않는다.
const SECRET_FIELDS = new Set(['apikey', 'api_key', 'nexonapikey', 'nexon_api_key']);

function withoutSecrets(value) {
  if (Array.isArray(value)) return value.map(withoutSecrets);
  if (!value || typeof value !== 'object') return value;
  const copy = {};
  for (const [field, entry] of Object.entries(value)) {
    if (SECRET_FIELDS.has(field.toLowerCase())) continue;
    copy[field] = withoutSecrets(entry);
  }
  return copy;
}

// 내보내기 파일 본문(JSON 문자열). 원래 state는 건드리지 않는다.
export function exportState(state) {
  return JSON.stringify(withoutSecrets(state ?? {}), null, 2);
}
