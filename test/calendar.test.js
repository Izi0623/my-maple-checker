import test from 'node:test';
import assert from 'node:assert/strict';
import { todayKey, monthDates, validDate, saveEvent, sanitizeEvents, eventsOnDate, eventColor } from '../public/calendar-model.js';

test('한국 시간 날짜와 윤년/연도 경계를 포함한 달력 날짜를 계산한다', () => {
 assert.equal(todayKey(new Date('2026-10-11T15:00:00Z')),'2026-10-12');
 assert.ok(validDate('2028-02-29')); assert.ok(!validDate('2026-02-29'));
 const dates=monthDates('2028-02'); assert.equal(dates.length,42);
 assert.equal(dates[0],'2028-01-30'); assert.ok(dates.includes('2028-02-29'));
 assert.equal(monthDates('2027-01')[0],'2026-12-27');
});
test('같은 날 여러 일정은 색상이 다르고 수정/날짜 이동 후에도 메모가 유지된다', () => {
 let events=[];
 for(let i=0;i<20;i++) events=saveEvent(events,{id:String(i),date:'2026-10-12',time:i===0?'22:00':'',title:`일정 ${i}`,note:'함께 가는 사람\n약속 메모'});
 assert.equal(new Set(events.map(e=>eventColor(e.color).background)).size,20);
 events=saveEvent(events,{...events[1],time:'21:00',title:'수정된 일정'});
 assert.equal(eventsOnDate(events,'2026-10-12')[0].title,'수정된 일정');
 assert.equal(events.find(e=>e.id==='1').color,1);
 events=saveEvent(events,{...events[0],date:'2026-10-13'});
 events=saveEvent(events,{...events[2],date:'2026-10-13'});
 assert.equal(eventsOnDate(events,'2026-10-13').length,2);
 assert.notEqual(events.find(e=>e.id==='0').color,events.find(e=>e.id==='2').color);
 assert.deepEqual(sanitizeEvents(JSON.parse(JSON.stringify(events))),events);
});
test('손상된 일정만 제외하고 메모/시간/색상을 안전하게 복원한다', () => {
 const events=sanitizeEvents([{id:'bad',date:'2026-02-30',title:'잘못된 날짜'},{id:'a',date:'2026-10-12',title:'약속',note:'x'.repeat(600),time:'25:00',color:0},{id:'b',date:'2026-10-12',title:'약속2',color:0}]);
 assert.equal(events.length,2);assert.equal(events[0].note.length,500);assert.equal(events[0].time,'');assert.notEqual(events[0].color,events[1].color);
 assert.throws(()=>saveEvent(events,{id:'c',date:'2026-10-12',title:' '}));
});
