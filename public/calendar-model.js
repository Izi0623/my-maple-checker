export function todayKey(now = new Date()) {
  return new Date(now.getTime() + 9 * 3600000).toISOString().slice(0, 10);
}
export function parseScheduleInput(value) {
  const text = String(value ?? '').trim();
  const pattern = /(?<![\d가-힣])(오전|오후)?\s*(\d{1,2})\s*(?::\s*(\d{1,2})|시(?:\s*(?:(\d{1,2})\s*분|(반)))?)(?![\d가-힣])/g;
  const matches = [...text.matchAll(pattern)];
  if (matches.length > 1) throw new Error('일정 하나에는 시간을 하나만 적어 주세요.');
  let time = '', title = text;
  if (matches.length) {
    const match = matches[0];
    let hour = Number(match[2]);
    const minute = Number(match[3] ?? match[4] ?? (match[5] ? 30 : 0));
    if (minute > 59 || (match[1] ? hour < 1 || hour > 12 : hour > 23)) {
      throw new Error('시간을 확인해 주세요. 예: 오후 7시, 19시, 19:30');
    }
    if (match[1]) hour = hour % 12 + (match[1] === '오후' ? 12 : 0);
    time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    title = text.slice(0, match.index) + ' ' + text.slice(match.index + match[0].length);
  }
  title = title.split('/').map(part => part.trim().replace(/\s{2,}/g, ' ')).filter(Boolean).join(' / ');
  if (!title) throw new Error('함께 가는 사람과 보스를 입력해 주세요.');
  return { title, time };
}
export function validDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date.startsWith('0000')) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}
export function nextColor(events, date, excludeId) {
  const used = new Set(events.filter(e => e.date === date && e.id !== excludeId).map(e => e.color));
  let color = 0;
  while (used.has(color)) color++;
  return color;
}
export function eventColor(index) {
  const hue = (260 + index * 137.508) % 360;
  return { background: `hsl(${hue.toFixed(3)} 75% 94%)`, foreground: `hsl(${hue.toFixed(3)} 45% 30%)`, border: `hsl(${hue.toFixed(3)} 65% 55%)` };
}
export function sanitizeEvents(value) {
  if (!Array.isArray(value)) return [];
  const result = [], ids = new Set();
  for (const e of value) {
    if (!e || typeof e.id !== 'string' || !e.id || e.id.length > 100 || ids.has(e.id) || !validDate(e.date) || typeof e.title !== 'string' || !e.title.trim()) continue;
    const time = typeof e.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(e.time) ? e.time : '';
    const desired = Number.isSafeInteger(e.color) && e.color >= 0 && e.color <= 1e6 ? e.color : -1;
    const color = desired >= 0 && !result.some(r => r.date === e.date && r.color === desired) ? desired : nextColor(result, e.date);
    result.push({ id: e.id, date: e.date, title: e.title.trim().slice(0, 80), time, note: typeof e.note === 'string' ? e.note.slice(0, 500) : '', color });
    ids.add(e.id);
  }
  return result;
}
export function saveEvent(events, input) {
  if (!validDate(input.date) || !input.title?.trim()) throw new Error('날짜와 일정 이름을 확인해 주세요.');
  const existing = events.find(e => e.id === input.id);
  const color = existing?.date === input.date ? existing.color : nextColor(events, input.date, input.id);
  const event = sanitizeEvents([{ ...input, color }])[0];
  if (!event) throw new Error('일정을 저장하지 못했어요.');
  return [...events.filter(e => e.id !== event.id), event];
}
export function eventsOnDate(events, date) {
  return events.filter(e => e.date === date).sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99') || a.color - b.color);
}
export function monthDates(month) {
  const first = new Date(`${month}-01T00:00:00Z`);
  first.setUTCDate(first.getUTCDate() - first.getUTCDay());
  return Array.from({ length: 42 }, (_, i) => new Date(first.getTime() + i * 86400000).toISOString().slice(0, 10));
}
