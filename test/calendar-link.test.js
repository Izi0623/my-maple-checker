import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCalendarLink, hasCalendarLinkTrigger, LINK_TITLE_MAX } from '../public/calendar-link.js';

test('링크에서 일정을 읽어 날짜·시간·이름·메모를 정리한다', () => {
  const result = parseCalendarLink('?addEvent=1&date=2026-11-19&time=19%3A00&title=%20%EB%A9%94%EC%9D%B4%ED%94%8C-%EC%BF%A0%EC%A0%A0%20%EB%B3%B4%EC%8A%A4%20&memo=19%EC%8B%9C%2030%EB%B6%84%20%EC%B6%9C%EB%B0%9C');
  assert.equal(result.duplicate, false);
  assert.equal(result.event.date, '2026-11-19');
  assert.equal(result.event.time, '19:00');
  assert.equal(result.event.title, '메이플-쿠젠 보스');
  assert.equal(result.event.note, '19시 30분 출발');
  assert.equal(typeof result.event.id, 'string');
  assert.equal(result.event.color, 0);
});

test('시간은 생략할 수 있고 note 별칭과 한 자리 시(h)도 받아들인다', () => {
  const noTime = parseCalendarLink('?addEvent=1&date=2026-11-19&title=달빛님 / 하드 루시드');
  assert.equal(noTime.event.time, '');
  const shortHour = parseCalendarLink('?addEvent=1&date=2026-11-19&time=9%3A05&title=아침 보스');
  assert.equal(shortHour.event.time, '09:05');
  const alias = parseCalendarLink('?addEvent=1&date=2026-11-19&title=보스&note=메모');
  assert.equal(alias.event.note, '메모');
  const full = parseCalendarLink('https://izi0623.github.io/my-maple-checker/?addEvent=1&date=2026-11-19&title=보스');
  assert.equal(full.event.title, '보스');
});

test('addEvent 표시가 없거나 날짜·이름이 잘못되면 null을 돌려준다', () => {
  assert.equal(parseCalendarLink(''), null);
  assert.equal(parseCalendarLink('?date=2026-11-19&title=보스'), null);
  assert.equal(hasCalendarLinkTrigger(''), false);
  assert.equal(hasCalendarLinkTrigger('?addEvent=1&date=2026-11-19'), true);
  assert.equal(parseCalendarLink('?addEvent=1&title=보스'), null);
  assert.equal(parseCalendarLink('?addEvent=1&date=2026-11-19'), null);
  assert.equal(parseCalendarLink('?addEvent=1&date=2026-11-19&title=%20%20'), null);
  assert.equal(parseCalendarLink('?addEvent=1&date=2026-02-30&title=보스'), null);
  assert.equal(parseCalendarLink('?addEvent=1&date=2026-11-19&time=25%3A00&title=보스'), null);
  assert.equal(parseCalendarLink('?addEvent=1&date=2026-11-19&time=abc&title=보스'), null);
});

test('이름이 길면 저장 한도에 맞춰 자른다', () => {
  const result = parseCalendarLink(`?addEvent=1&date=2026-11-19&title=${encodeURIComponent('가'.repeat(120))}`);
  assert.equal(result.event.title.length, LINK_TITLE_MAX);
});

test('같은 날짜·시간·이름의 일정은 중복으로 표시한다', () => {
  const events = [{ id: 'a', date: '2026-11-19', time: '19:00', title: '메이플-쿠젠 보스', note: '', color: 0 }];
  const duplicate = parseCalendarLink('?addEvent=1&date=2026-11-19&time=19%3A00&title=%EB%A9%94%EC%9D%B4%ED%94%8C-%EC%BF%A0%EC%A0%A0%20%EB%B3%B4%EC%8A%A4', events);
  assert.equal(duplicate.duplicate, true);
  // 시간이나 이름이 다르면 다른 일정이다.
  assert.equal(parseCalendarLink('?addEvent=1&date=2026-11-19&time=20%3A00&title=%EB%A9%94%EC%9D%B4%ED%94%8C-%EC%BF%A0%EC%A0%A0%20%EB%B3%B4%EC%8A%A4', events).duplicate, false);
  assert.equal(parseCalendarLink('?addEvent=1&date=2026-11-19&time=19%3A00&title=%EB%8B%A4%EB%A5%B8%20%EB%B3%B4%EC%8A%A4', events).duplicate, false);
  assert.equal(parseCalendarLink('?addEvent=1&date=2026-11-20&time=19%3A00&title=%EB%A9%94%EC%9D%B4%ED%94%8C-%EC%BF%A0%EC%A0%A0%20%EB%B3%B4%EC%8A%A4', events).duplicate, false);
  // 띄어쓰기만 다른 이름도 같은 일정으로 본다.
  assert.equal(parseCalendarLink('?addEvent=1&date=2026-11-19&time=19%3A00&title=%EB%A9%94%EC%9D%B4%ED%94%8C-%EC%BF%A0%EC%A0%A0%20%20%EB%B3%B4%EC%8A%A4', events).duplicate, true);
});
