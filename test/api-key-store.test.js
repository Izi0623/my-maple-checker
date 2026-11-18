import test from 'node:test';
import assert from 'node:assert/strict';
import { API_KEY_STORAGE, readStoredApiKey, saveApiKey, clearApiKey } from '../public/api-key-store.js';

// localStorage를 흉내 내는 저장소. 같은 items를 쓰는 새 객체는 새로고침한 페이지와 같다.
function createStorage({ blocked = false } = {}) {
  const items = new Map();
  const guard = () => { if (blocked) throw new Error('storage blocked'); };
  return {
    items,
    getItem(key) { guard(); return items.has(key) ? items.get(key) : null; },
    setItem(key, value) { guard(); items.set(key, String(value)); },
    removeItem(key) { guard(); items.delete(key); },
  };
}
const reopen = storage => ({
  getItem: key => (storage.items.has(key) ? storage.items.get(key) : null),
  setItem: (key, value) => storage.items.set(key, String(value)),
  removeItem: key => storage.items.delete(key),
});

test('저장한 키는 localStorage에 남고 새로고침한 페이지에서도 그대로 복원된다', () => {
  const storage = createStorage();
  clearApiKey(storage);
  assert.equal(readStoredApiKey(storage), '');
  assert.equal(saveApiKey('  live-key-1234  ', storage), true);
  assert.equal(storage.items.get(API_KEY_STORAGE), 'live-key-1234');
  // 새로고침: 페이지 메모리가 아니라 저장소에서 읽어 온다.
  assert.equal(readStoredApiKey(reopen(storage)), 'live-key-1234');
  // 기록 저장(maple-weekly-v1)과 섞이지 않는 전용 키를 쓴다.
  assert.notEqual(API_KEY_STORAGE, 'maple-weekly-v1');
  clearApiKey(storage);
});

test('연결 해제하면 localStorage에서도 키가 사라져 다음 방문에 복원되지 않는다', () => {
  const storage = createStorage();
  saveApiKey('key-to-remove', storage);
  assert.equal(storage.items.has(API_KEY_STORAGE), true);
  assert.equal(clearApiKey(storage), true);
  assert.equal(storage.items.has(API_KEY_STORAGE), false);
  assert.equal(readStoredApiKey(storage), '');
  assert.equal(readStoredApiKey(reopen(storage)), '');
});

test('빈 키는 저장하지 않고 기존 저장 값을 지운다', () => {
  const storage = createStorage();
  saveApiKey('key-before-blank', storage);
  assert.equal(saveApiKey('   ', storage), false);
  assert.equal(storage.items.has(API_KEY_STORAGE), false);
  assert.equal(readStoredApiKey(storage), '');
});

test('localStorage를 막아 둔 브라우저에서도 이번 탭에서는 키를 쓰고, 저장 실패를 알린다', () => {
  const blocked = createStorage({ blocked: true });
  clearApiKey(createStorage());
  assert.equal(saveApiKey('tab-only-key', blocked), false);
  assert.equal(readStoredApiKey(blocked), 'tab-only-key');
  assert.equal(clearApiKey(blocked), false);
  assert.equal(readStoredApiKey(blocked), '');
});
