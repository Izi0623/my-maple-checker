// 링크 하나로 보스 캘린더 일정을 추가한다.
// 예: ?addEvent=1&date=2026-11-19&time=19:00&title=달빛님 / 하드 루시드&memo=19시 30분 출발
import { validDate, nextColor } from './calendar-model.js';

export const LINK_TITLE_MAX = 80;
export const LINK_NOTE_MAX = 500;
const TRIGGERS = new Set(['1', 'true', 'yes', 'on']);

const collapse = value => String(value ?? '').replace(/\s+/g, ' ').trim();
// 주소 전체를 받아도 되고 '?...'만 받아도 된다.
function readParams(search) {
  const text = String(search ?? '');
  const start = text.indexOf('?');
  return new URLSearchParams(start >= 0 ? text.slice(start + 1) : text);
}
function readTime(raw) {
  if (raw === null) return '';
  const match = /^(\d{1,2}):(\d{2})$/.exec(collapse(raw));
  if (!match) return null;
  const hour = Number(match[1]), minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `link-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
export function hasCalendarLinkTrigger(search) {
  return TRIGGERS.has(collapse(readParams(search).get('addEvent')).toLowerCase());
}
// 일정을 해석해 { event, duplicate }를 돌려주고, 링크가 잘못됐으면 null을 돌려준다.
export function parseCalendarLink(search, events = []) {
  const params = readParams(search);
  if (!TRIGGERS.has(collapse(params.get('addEvent')).toLowerCase())) return null;
  const date = collapse(params.get('date'));
  const title = collapse(params.get('title')).slice(0, LINK_TITLE_MAX);
  const time = readTime(params.get('time'));
  const note = collapse(params.get('memo') ?? params.get('note')).slice(0, LINK_NOTE_MAX);
  if (time === null || !title || !validDate(date)) return null;
  const list = Array.isArray(events) ? events : [];
  const duplicate = list.some(event => event && event.date === date && collapse(event.time) === time && collapse(event.title) === title);
  return { event: { id: newId(), date, title, time, note, color: nextColor(list, date) }, duplicate };
}
