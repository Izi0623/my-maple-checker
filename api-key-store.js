// Nexon API 키는 이 브라우저의 localStorage에만 보관한다.
// 서버·요청 URL·기록 내보내기(JSON)로는 내보내지 않으며, 연결 해제로 언제든 지울 수 있다.
export const API_KEY_STORAGE = 'maple-weekly-nexon-api-key';

// 사생활 보호 모드처럼 localStorage를 막아 둔 브라우저에서도 이번 탭에서는 키를 쓸 수 있게 한다.
const fallback = new Map();
const normalize = value => (typeof value === 'string' ? value.trim() : '');

function defaultStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

// 페이지를 열 때 저장된 키를 되살린다. 저장된 키가 없으면 빈 문자열.
export function readStoredApiKey(storage = defaultStorage()) {
  try {
    const saved = normalize(storage?.getItem(API_KEY_STORAGE));
    if (saved) return saved;
  } catch { /* 저장소를 읽지 못하면 이번 탭에 남아 있는 값으로 넘어간다. */ }
  return normalize(fallback.get(API_KEY_STORAGE));
}

// 저장소에 저장되면 true. 저장소를 쓸 수 없으면 이번 탭에만 두고 false를 돌려준다.
export function saveApiKey(apiKey, storage = defaultStorage()) {
  const value = normalize(apiKey);
  if (!value) { clearApiKey(storage); return false; }
  fallback.set(API_KEY_STORAGE, value);
  try { storage?.setItem(API_KEY_STORAGE, value); return true; } catch { return false; }
}

// 메모리와 저장소에서 함께 지운다. 저장소에서 지우지 못했으면 false.
export function clearApiKey(storage = defaultStorage()) {
  fallback.delete(API_KEY_STORAGE);
  try { storage?.removeItem(API_KEY_STORAGE); return true; } catch { return false; }
}
