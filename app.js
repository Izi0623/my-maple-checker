import { bosses, createProfile, weekKey, weekLabel, bossSetting, income, totals, MAX_WEEKLY_BOSSES, canClearBoss, bossCycle, monthKey } from './model.js?v=20261011-3';
import { fetchCharacter } from './character-api.js?v=20261011-3';
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => Math.floor(n).toLocaleString('ko-KR');
const compact = n => n >= 100000000 ? `${(n / 100000000).toFixed(2)}억` : `${money(Math.floor(n / 10000))}만`;
const STORAGE = 'maple-weekly-v1';
const demo = { id: 'demo', name: '메이플 모험가', className: '히어로', world: '스카니아', level: 260, source: 'demo' };
let state = { active: 'demo', profiles: { demo: createProfile(demo) } };
let nexonApiKey = '';
let lookupController;
let storageError = false;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE) || 'null');
  if (saved && typeof saved.profiles === 'object' && saved.profiles && saved.profiles[saved.active]) {
    const profiles = {};
    for (const [id, p] of Object.entries(saved.profiles)) {
      if (!p?.character?.name || !Array.isArray(p.routine) || !p.weeks || !p.settings) throw new Error('Invalid data');
      const safe = createProfile(p.character);
      safe.routine = [...new Set(p.routine)].filter(id => bosses.some(b => b.id === id));
      for (const boss of bosses) {
        const s = p.settings[boss.id];
        if (!s) continue;
        const prices = {};
        for (const [tier] of boss.tiers) {
          const n = s.prices?.[tier];
          if (Number.isSafeInteger(n) && n >= 0 && n <= 1e12) prices[tier] = n;
        }
        safe.settings[boss.id] = { tier: s.tier, party: Number.isInteger(s.party) && s.party >= 1 && s.party <= 6 ? s.party : 1, prices, note: typeof s.note === 'string' ? s.note.slice(0, 500) : '' };
      }
      for (const [key, clears] of Object.entries(p.weeks)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(key) && Array.isArray(clears)) safe.weeks[key] = [...new Set(clears)].filter(id => bosses.some(b => b.id === id));
      }
      for (const [month, entries] of Object.entries(p.months || {})) {
        if (/^\d{4}-\d{2}$/.test(month) && Array.isArray(entries)) safe.months[month] = [...new Set(entries)].filter(id => bosses.some(b => b.id === id && bossCycle(b) === 'monthly'));
      }
      profiles[id] = safe;
    }
    state = { active: saved.active, profiles };
  }
} catch { storageError = true; }
let key = weekKey();
let month = monthKey();
let cycle = 'weekly';
let filter = 'all';
let search = '';
let editingPrice;
let editingNote;
let routineDraft = [];
let toastTimer;
const profile = () => state.profiles[state.active];
const periodKey = () => cycle === 'monthly' ? month : key;
const records = () => cycle === 'monthly' ? profile().months : profile().weeks;
const clears = () => (records()[periodKey()] || []).filter(id => bosses.some(b => b.id === id && bossCycle(b) === cycle));
const routine = () => profile().routine.filter(id => bosses.some(b => b.id === id && bossCycle(b) === cycle));
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3500);
}
function save() {
  try { localStorage.setItem(STORAGE, JSON.stringify(state)); }
  catch { toast('자동 저장할 수 없어요. 기록 내보내기로 데이터를 보관해 주세요.'); }
}
function portrait(character, large = false) {
  const safeImage = typeof character.image === 'string' && /^https:\/\//.test(character.image);
  return `<div class="portrait ${large ? 'large' : ''} ${safeImage ? 'has-image' : ''}">${safeImage ? `<img src="${esc(character.image)}" alt="${esc(character.name)} 캐릭터" referrerpolicy="no-referrer">` : ''}<span class="avatar-hair"></span><span class="avatar-face"><i></i><i></i></span><span class="avatar-body"></span><span class="avatar-sword"></span></div>`;
}
function bossPortrait(boss, small = false) {
  return `<span class="boss-avatar ${small ? 'small-avatar' : ''}" style="--boss-color:${boss.color}"><img src="${boss.image}" alt="${boss.name}" loading="lazy"><span class="boss-image-fallback" aria-hidden="true">${boss.mark}</span></span>`;
}
// 사진 서버나 파일 로딩에 실패해도 목록과 조작은 사용할 수 있다.
document.addEventListener('error', e => {
  if (e.target instanceof HTMLImageElement) e.target.parentElement.classList.add('image-failed');
}, true);
function renderCharacter() {
  const c = profile().character;
  $('#character-tabs').innerHTML = Object.entries(state.profiles).map(([id, p]) => `<button class="character-tab ${id === state.active ? 'selected' : ''}" data-character="${esc(id)}">${esc(p.character.name)}</button>`).join('');
  const source = c.source === 'nexon' ? 'Nexon 조회' : c.source === 'demo' ? '데모 캐릭터' : '직접 등록';
  $('#character-card').innerHTML = `<div class="character-visual"><span class="character-source">${source}</span><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="sparkle s-one">✦</span><span class="sparkle s-two">✧</span>${portrait(c, true)}</div><div class="character-info"><h3>${esc(c.name)}</h3><p>${c.level ? `Lv. ${esc(c.level)} <span>·</span> ` : ''}${esc(c.className || '나의 모험가')}</p><span class="world-badge"><span class="live-dot"></span>${esc(c.world || '직접 등록 캐릭터')}</span>${c.source === 'demo' ? '<p class="demo-notice">체험용 캐릭터예요. ＋ 버튼으로<br>내 캐릭터를 등록해 보세요.</p>' : ''}<button class="text-button refresh-photo" data-refresh-character>사진·정보 새로 불러오기</button></div>`;
  $('#routine-summary').innerHTML = `<span>저장된 기본 보스</span><strong>${profile().routine.filter(id => bosses.some(b => b.id === id && bossCycle(b) !== 'legacy')).length} 마리</strong>`;
}
function renderTotals() {
  const total = totals(profile(), periodKey(), cycle);
  const count = routine().length;
  const percent = total.expected ? Math.round(total.earned / total.expected * 100) : 0;
  $('#earned').textContent = money(total.earned);
  $('#expected').textContent = money(total.expected);
  $('#earnings-percent').textContent = `${percent}% 달성`;
  $('#progress-fill').style.width = `${percent}%`;
  $('#clear-count').textContent = clears().length;
  $('#total-count').textContent = ` / ${cycle === 'monthly' ? 1 : MAX_WEEKLY_BOSSES}`;
  $('#remaining').textContent = count - total.count;
  $('#remaining-income').innerHTML = `${compact(total.expected - total.earned)} <small>메소</small>`;
  $('#boss-count').textContent = count;
  $('#filter-all-count').textContent = count;
  $('#filter-pending-count').textContent = count - total.count;
  $('#filter-done-count').textContent = total.count;
  const unknown = bosses.filter(b => routine().includes(b.id) && bossSetting(profile(), b).price === null).length;
  $('#price-status').textContent = unknown ? `가격 확인이 필요한 보스 ${unknown}개는 수익 합산에서 제외됩니다.` : '기본 가격은 제공하신 엑셀의 변경 가격을 적용했어요. 엑셀에 없는 난이도는 공개 참고값으로 구분합니다.';
}
function renderBosses() {
  const p = profile();
  const visible = bosses.filter(b => p.routine.includes(b.id) && bossCycle(b) === cycle && b.name.includes(search) && (filter === 'all' || (filter === 'done' ? clears().includes(b.id) : !clears().includes(b.id))));
  $('#boss-list').innerHTML = visible.length ? visible.map(b => {
    const s = bossSetting(p, b);
    const done = clears().includes(b.id);
    const note = p.settings[b.id]?.note || '';
    return `<div class="boss-row ${done ? 'done' : ''}" data-boss="${b.id}"><div class="boss-identity"><label class="clear-checkbox"><input type="checkbox" data-clear="${b.id}" ${done ? 'checked' : ''} aria-label="${b.name} 처치 완료"><span>✓</span></label>${bossPortrait(b)}<div class="boss-name"><strong>${b.name}</strong><select data-tier="${b.id}" aria-label="${b.name} 난이도">${b.tiers.map(([tier]) => `<option ${tier === s.tier ? 'selected' : ''}>${tier}</option>`).join('')}</select></div></div><label class="party-select"><select data-party="${b.id}" aria-label="${b.name} 파티 인원">${Array.from({ length: s.maxParty }, (_, i) => i + 1).map(n => `<option value="${n}" ${s.party === n ? 'selected' : ''}>${n === 1 ? '솔로' : `${n}인`}</option>`).join('')}</select></label><button class="boss-income" data-price="${b.id}" aria-label="${b.name} 결정석 가격 수정"><strong>${s.price === null ? '가격 확인 필요' : money(income(s.price, s.party))}</strong><span>${s.custom ? '수정한 가격' : s.price === null ? '판매가 입력' : s.priceSource === 'excel' ? '엑셀 변경 가격' : '공개 참고값'} <span class="edit-pencil">✎</span></span></button><button class="boss-memo ${note ? 'has-note' : ''}" data-note="${b.id}" aria-label="${b.name} 동행 메모 ${note ? '수정' : '추가'}"><span class="memo-icon" aria-hidden="true">✎</span><span class="memo-preview">${note ? esc(note) : '동행 메모 추가'}</span>${note ? '<span class="memo-edit-label">수정</span>' : ''}</button></div>`;
  }).join('') : `<div class="empty-state"><span>✧</span><h3>${routine().length === 0 ? '나만의 보스 루틴을 만들어 보세요' : filter === 'done' ? '아직 클리어한 보스가 없어요' : '표시할 보스가 없어요'}</h3><p>${routine().length === 0 ? '기본 보스 설정에서 매주 잡는 보스를 선택해 주세요.' : '필터나 검색어를 바꾸어 보세요.'}</p></div>`;
}
function render() {
  const monthly = cycle === 'monthly';
  $('#week-label').textContent = monthly ? `${month.slice(0, 4)}년 ${Number(month.slice(5))}월` : weekLabel(key);
  $('#period-range-label').textContent = monthly ? '이번 달 보스 기록' : '이번 주 보스 기록';
  $('.reset-label').textContent = monthly ? '매월 1일 00:00 초기화 · 한국 시간' : '매주 목요일 00:00 초기화 · 한국 시간';
  $('#period-earning-label').textContent = monthly ? '이번 달 획득 수익' : '이번 주 획득 수익';
  $('#period-title').textContent = monthly ? '월간 보스 체크리스트' : '주간 보스 체크리스트';
  $('#period-help').textContent = monthly ? '검은 마법사는 월간 기록이며 주간 12개 제한에 포함되지 않아요.' : '이번 주 처치한 보스를 체크해 주세요. 캐릭터당 최대 12개입니다.';
  renderCharacter(); renderTotals(); renderBosses();
}
$('#period-tabs').addEventListener('click', e => {
  const button = e.target.closest('[data-cycle]'); if (!button) return;
  cycle = button.dataset.cycle;
  document.querySelectorAll('[data-cycle]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  filter = 'all'; search = ''; $('#boss-search').value = '';
  document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
  render();
});
function updateSetting(id, values) {
  const p = profile();
  p.settings[id] = { ...p.settings[id], ...values };
  save(); renderTotals(); renderBosses();
}
$('#boss-list').addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.clear) {
    if (cycle === 'weekly' && el.checked && !canClearBoss(clears(), el.dataset.clear)) {
      el.checked = false; toast('캐릭터당 한 주에 최대 12개까지만 처치 체크할 수 있어요.'); return;
    }
    const next = new Set(records()[periodKey()] || []);
    el.checked ? next.add(el.dataset.clear) : next.delete(el.dataset.clear);
    records()[periodKey()] = [...next]; save(); renderTotals(); renderBosses();
  }
  if (el.dataset.tier) updateSetting(el.dataset.tier, { tier: el.value });
  if (el.dataset.party) updateSetting(el.dataset.party, { party: Number(el.value) });
});
$('#boss-list').addEventListener('click', e => {
  const noteButton = e.target.closest('[data-note]');
  if (noteButton) {
    editingNote = noteButton.dataset.note;
    const boss = bosses.find(b => b.id === editingNote);
    $('#note-title').textContent = `${boss.name} 동행 메모`;
    $('#note-input').value = profile().settings[boss.id]?.note || '';
    renderNoteCount();
    $('#note-dialog').showModal();
    return;
  }
  const button = e.target.closest('[data-price]');
  if (!button) return;
  editingPrice = button.dataset.price;
  const boss = bosses.find(b => b.id === editingPrice);
  const s = bossSetting(profile(), boss);
  $('#price-title').textContent = `${boss.name} · ${s.tier}`;
  $('#price-input').value = s.price ?? '';
  $('#price-source-info').textContent = `${boss.priceSources?.[s.tier] === 'excel' ? '기본값: 보스 결정석 가격.xlsx의 변경 가격' : '기본값: 공개 참고표 (엑셀에 없는 난이도)'}${s.custom ? ' · 현재 직접 수정한 가격이 적용되어 있어요.' : ''}`;
  $('#price-dialog').showModal();
});
function renderNoteCount() {
  $('#note-count').textContent = `${$('#note-input').value.length} / 500`;
}
$('#note-input').addEventListener('input', renderNoteCount);
$('#note-form').addEventListener('submit', e => {
  e.preventDefault();
  updateSetting(editingNote, { note: $('#note-input').value.trim().slice(0, 500) });
  $('#note-dialog').close(); toast('동행 메모를 저장했어요.');
});
$('#delete-note').addEventListener('click', () => {
  updateSetting(editingNote, { note: '' });
  $('#note-dialog').close(); toast('동행 메모를 삭제했어요.');
});
$('#price-form').addEventListener('submit', e => {
  e.preventDefault();
  const value = Number($('#price-input').value);
  if (!Number.isSafeInteger(value) || value < 0 || value > 1e12) return;
  const boss = bosses.find(b => b.id === editingPrice);
  const s = bossSetting(profile(), boss);
  updateSetting(boss.id, { prices: { ...profile().settings[boss.id]?.prices, [s.tier]: value } });
  $('#price-dialog').close(); toast('결정석 가격을 저장했어요.');
});
$('#price-default').addEventListener('click', () => {
  const boss = bosses.find(b => b.id === editingPrice);
  const s = bossSetting(profile(), boss);
  const prices = { ...profile().settings[boss.id]?.prices }; delete prices[s.tier];
  updateSetting(boss.id, { prices }); $('#price-dialog').close(); toast('표의 기본 가격으로 복원했어요.');
});
$('.filters').addEventListener('click', e => {
  const button = e.target.closest('[data-filter]');
  if (!button) return;
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b === button)); renderBosses();
});
$('#boss-search').addEventListener('input', e => { search = e.target.value.trim(); renderBosses(); });
$('#reset-week').addEventListener('click', () => {
  if (!clears().length) return toast('아직 체크한 보스가 없어요.');
  if (!confirm(`현재 캐릭터의 ${cycle === 'monthly' ? '이번 달' : '이번 주'} 처치 체크를 초기화할까요? 기본 보스 설정은 유지됩니다.`)) return;
  records()[periodKey()] = []; save(); renderTotals(); renderBosses(); toast('선택한 기간의 체크를 초기화했어요.');
});
function openRoutine() {
  routineDraft = profile().routine.filter(id => bosses.some(b => b.id === id && bossCycle(b) !== 'legacy'));
  renderRoutine(); $('#routine-dialog').showModal();
}
function renderRoutine() {
  $('#routine-selected').textContent = `${routineDraft.length} / ${MAX_WEEKLY_BOSSES}마리 선택`;
  $('#routine-list').innerHTML = bosses.filter(b => bossCycle(b) !== 'legacy').map(b => `<label class="routine-option"><input type="checkbox" value="${b.id}" ${routineDraft.includes(b.id) ? 'checked' : ''}>${bossPortrait(b, true)}<span>${b.name}</span><small>${bossCycle(b) === 'monthly' ? '월간 · ' : ''}${bossSetting(profile(), b).tier}</small></label>`).join('');
  updateRoutineUi();
}
const weeklyDraft = () => routineDraft.filter(id => bosses.some(b => b.id === id && bossCycle(b) === 'weekly'));
function updateRoutineUi() {
  $('#routine-selected').textContent = `주간 ${weeklyDraft().length} / ${MAX_WEEKLY_BOSSES} · 월간 ${routineDraft.length - weeklyDraft().length}`;
  $('#save-routine').disabled = weeklyDraft().length > MAX_WEEKLY_BOSSES;
  document.querySelectorAll('#routine-list input').forEach(input => {
    const b = bosses.find(b => b.id === input.value);
    input.disabled = !input.checked && bossCycle(b) === 'weekly' && weeklyDraft().length >= MAX_WEEKLY_BOSSES;
  });
}
$('#edit-routine').addEventListener('click', openRoutine); $('#add-boss').addEventListener('click', openRoutine);
$('#routine-list').addEventListener('change', e => {
  if (e.target.checked && bossCycle(bosses.find(b => b.id === e.target.value)) === 'weekly' && weeklyDraft().length >= MAX_WEEKLY_BOSSES) { e.target.checked = false; return; }
  const next = new Set(routineDraft); e.target.checked ? next.add(e.target.value) : next.delete(e.target.value);
  routineDraft = [...next]; updateRoutineUi();
});
$('#routine-select-all').addEventListener('click', () => { routineDraft = [...new Set([...weeklyDraft(), ...bosses.filter(b => bossCycle(b) === 'weekly').map(b => b.id)])].slice(0, MAX_WEEKLY_BOSSES).concat(routineDraft.filter(id => bosses.some(b => b.id === id && bossCycle(b) === 'monthly'))); renderRoutine(); });
$('#routine-select-none').addEventListener('click', () => { routineDraft = []; renderRoutine(); });
$('#save-routine').addEventListener('click', () => {
  if (weeklyDraft().length > MAX_WEEKLY_BOSSES) return;
  profile().routine = [...routineDraft, ...profile().routine.filter(id => bosses.some(b => b.id === id && bossCycle(b) === 'legacy'))]; save(); render(); $('#routine-dialog').close(); toast('기본 보스 설정을 저장했어요. 다음 주에도 이어집니다.');
});
$('#character-tabs').addEventListener('click', e => {
  const button = e.target.closest('[data-character]'); if (!button) return;
  state.active = button.dataset.character; save(); render();
});
function addCharacter(character) {
  // 같은 이름의 직접 등록 기록은 실제 조회로 전환해도 유지한다.
  const existing = Object.entries(state.profiles).find(([, p]) => p.character.name === character.name && p.character.source !== 'demo');
  if (existing) {
    state.active = existing[0];
    if (character.source === 'nexon') state.profiles[state.active].character = character;
  } else {
    state.active = character.id; state.profiles[state.active] = createProfile(character);
  }
  save(); render(); $('#character-dialog').close(); toast(`${character.name}의 기록을 불러왔어요.`);
}
$('#add-character').addEventListener('click', () => { $('#lookup-status').textContent = ''; $('#character-name').value = ''; $('#character-dialog').showModal(); });
$('#character-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#character-name').value.trim();
  if (!name) { $('#character-name').focus(); $('#lookup-status').textContent = '직접 등록할 캐릭터 이름을 입력해 주세요.'; return; }
  addCharacter({ id: `manual:${name}`, name, source: 'manual' });
});
function updateApiUi() {
  $('#api-settings').textContent = nexonApiKey ? 'Nexon API 키 입력됨' : 'Nexon API 연결';
  $('#api-lookup-hint').textContent = nexonApiKey ? '키는 이 탭에서만 사용돼요.' : '먼저 Nexon API를 연결해 주세요.';
}
$('#api-settings').addEventListener('click', () => { $('#api-key').value = ''; $('#api-dialog').showModal(); });
$('#api-dialog').addEventListener('close', () => { $('#api-key').value = ''; });
$('#api-form').addEventListener('submit', e => {
  e.preventDefault();
  const enteredKey = $('#api-key').value.trim();
  if (!enteredKey) return;
  lookupController?.abort(); nexonApiKey = enteredKey;
  $('#api-key').value = '';
  $('#api-dialog').close(); updateApiUi(); toast('이 탭에서 API 키를 사용할 수 있어요. 캐릭터 사진을 불러와 보세요.');
});
$('#disconnect-api').addEventListener('click', () => {
  $('#api-key').value = '';
  lookupController?.abort(); nexonApiKey = ''; $('#api-dialog').close(); updateApiUi(); toast('API 키를 지웠어요.');
});
async function loadApiCharacter(name, inDialog = false) {
  if (!nexonApiKey) { toast('먼저 Nexon API 키를 연결해 주세요.'); return; }
  if (!name.trim()) { $('#character-name').focus(); $('#lookup-status').textContent = '캐릭터 이름을 입력해 주세요.'; return; }
  if (lookupController) return;
  lookupController = new AbortController();
  $('#lookup-button').disabled = true;
  const refresh = $('[data-refresh-character]');
  if (refresh) refresh.disabled = true;
  if (inDialog) $('#lookup-status').textContent = '캐릭터 사진과 정보를 불러오고 있어요…';
  try {
    const character = await fetchCharacter(name, nexonApiKey, { signal: lookupController.signal });
    addCharacter(character);
  } catch (error) {
    if (inDialog) $('#lookup-status').textContent = error.message;
    else toast(error.message);
  } finally {
    lookupController = undefined; $('#lookup-button').disabled = false;
    const currentRefresh = $('[data-refresh-character]'); if (currentRefresh) currentRefresh.disabled = false;
  }
}
$('#lookup-button').addEventListener('click', () => loadApiCharacter($('#character-name').value, true));
$('#character-card').addEventListener('click', e => {
  if (e.target.closest('[data-refresh-character]')) loadApiCharacter(profile().character.name);
});
$('#demo-add').addEventListener('click', () => {
  if (!state.profiles.demo) state.profiles.demo = createProfile(demo);
  state.active = 'demo'; save(); render(); $('#character-dialog').close();
});
document.querySelectorAll('.close-dialog').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
$('#export-data').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = `maple-weekly-${key}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
// 열린 화면에서도 한국 시간 목요일 0시가 지나면 새 주의 기록으로 전환한다.
setInterval(() => {
  const next = weekKey(), nextMonth = monthKey();
  if (next !== key || nextMonth !== month) { key = next; month = nextMonth; render(); toast('새로운 기록 기간이 시작됐어요.'); }
}, 30000);
render();
updateApiUi();
if (storageError) toast('저장된 기록을 읽지 못했어요. 현재 화면은 데모입니다.');
