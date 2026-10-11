import { todayKey, monthDates, eventsOnDate, eventColor, saveEvent, parseScheduleInput } from './calendar-model.js?v=20261012-4';
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel = date => `${date.slice(0, 4)}년 ${Number(date.slice(5, 7))}월 ${Number(date.slice(8))}일`;
function colorStyle(event) {
  const color = eventColor(event.color);
  return `--event-bg:${color.background};--event-fg:${color.foreground};--event-border:${color.border}`;
}
export function createCalendar({ getEvents, setEvents, toast }) {
  let selected = todayKey(), month = selected.slice(0, 7), editingId;
  function render() {
    const today = todayKey(), events = getEvents();
    $('#calendar-month').textContent = `${month.slice(0, 4)}년 ${Number(month.slice(5))}월`;
    $('#calendar-grid').innerHTML = monthDates(month).map(date => {
      const entries = eventsOnDate(events, date);
      return `<div class="calendar-day ${date.slice(0, 7) !== month ? 'outside-month' : ''} ${date === selected ? 'selected-day' : ''} ${date === today ? 'today' : ''}"><button class="calendar-date" data-calendar-date="${date}" aria-label="${dateLabel(date)}, 일정 ${entries.length}개" aria-pressed="${date === selected}">${Number(date.slice(8))}${entries.length ? `<small>${entries.length}</small>` : ''}</button><div class="calendar-entries">${entries.map(e => `<button class="calendar-event" style="${colorStyle(e)}" data-calendar-event="${esc(e.id)}" title="${esc((e.time ? `${e.time} ≫ ` : '') + [e.title, e.note].filter(Boolean).join(' / '))}">${e.time ? `<span>${esc(e.time)}</span> ≫ ` : ''}${esc(e.title)}</button>`).join('')}</div></div>`;
    }).join('');
    $('#calendar-day-title').textContent = dateLabel(selected);
    const entries = eventsOnDate(events, selected);
    $('#calendar-day-events').innerHTML = entries.length ? entries.map(e => `<button class="agenda-event" style="${colorStyle(e)}" data-calendar-event="${esc(e.id)}"><span class="agenda-event-title">${e.time ? `${esc(e.time)} ≫ ` : ''}${esc(e.title)}</span>${e.note ? `<span class="agenda-event-note">${esc(e.note)}</span>` : ''}</button>`).join('') : '<p class="muted small calendar-empty">아직 일정이 없어요. 이 날짜에 보스 약속을 추가해 보세요.</p>';
  }
  function openEvent(event) {
    editingId = event?.id;
    $('#calendar-event-title').textContent = event ? '보스 일정 수정' : '보스 일정 추가';
    $('#calendar-event-date').value = event?.date || selected;
    $('#calendar-event-name').value = event ? [event.title, event.time].filter(Boolean).join(' / ') : '';
    $('#calendar-event-delete').hidden = !event;
    $('#calendar-event-dialog').showModal();
  }
  $('#calendar-panel').addEventListener('click', e => {
    const dateButton = e.target.closest('[data-calendar-date]');
    if (dateButton) { selected = dateButton.dataset.calendarDate; month = selected.slice(0, 7); render(); return; }
    const eventButton = e.target.closest('[data-calendar-event]');
    if (eventButton) openEvent(getEvents().find(event => event.id === eventButton.dataset.calendarEvent));
  });
  $('#calendar-add').addEventListener('click', () => openEvent());
  $('#calendar-day-add').addEventListener('click', () => openEvent());
  for (const [id, direction] of [['calendar-prev', -1], ['calendar-next', 1]]) {
    $(`#${id}`).addEventListener('click', () => {
      const date = new Date(`${month}-01T00:00:00Z`);
      date.setUTCMonth(date.getUTCMonth() + direction);
      if (date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) return;
      month = date.toISOString().slice(0, 7); selected = `${month}-01`; render();
    });
  }
  $('#calendar-today').addEventListener('click', () => { selected = todayKey(); month = selected.slice(0, 7); render(); });
  $('#calendar-event-form').addEventListener('submit', e => {
    e.preventDefault();
    try {
      const parsed = parseScheduleInput($('#calendar-event-name').value);
      const previous = getEvents().find(event => event.id === editingId);
      const event = { id: editingId || crypto.randomUUID(), date: $('#calendar-event-date').value, ...parsed, note: previous?.note || '' };
      setEvents(saveEvent(getEvents(), event)); selected = event.date; month = selected.slice(0, 7);
      $('#calendar-event-dialog').close(); render(); toast('보스 일정을 저장했어요.');
    } catch (error) { toast(error.message); }
  });
  $('#calendar-event-delete').addEventListener('click', () => {
    if (!editingId) return;
    setEvents(getEvents().filter(e => e.id !== editingId));
    $('#calendar-event-dialog').close(); render(); toast('보스 일정을 삭제했어요.');
  });
  return { render };
}
