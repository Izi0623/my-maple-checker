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

test('한 칸의 사람/보스/한국어 시간을 24시간 일정으로 변환한다', async () => {
 const {parseScheduleInput}=await import('../public/calendar-model.js');
 for (const [input,time] of [['오후 7시','19:00'],['19시','19:00'],['19:00','19:00'],['오후7시30분','19:30'],['오후 7시 반','19:30'],['오전 12시','00:00'],['오후 12시','12:00'],['0시','00:00'],['오전 9시 5분','09:05']]) {
  assert.deepEqual(parseScheduleInput(`달빛님 / 하드 루시드 / ${input}`),{title:'달빛님 / 하드 루시드',time});
 }
 assert.deepEqual(parseScheduleInput('19시 / 달빛님 / 하드 루시드'),{title:'달빛님 / 하드 루시드',time:'19:00'});
 assert.deepEqual(parseScheduleInput('달빛님 / 하드 루시드'),{title:'달빛님 / 하드 루시드',time:''});
 for(const text of ['달빛님 / 루시드 / 오후 13시','달빛님 / 루시드 / 25시','달빛님 / 루시드 / 19:60','달빛님 / 루시드 / 19시 / 20시','오후 7시']) assert.throws(()=>parseScheduleInput(text));
});
