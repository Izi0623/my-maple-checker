import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/integrations/kakao-reminders.gs',import.meta.url),'utf8');
function setup() {
 let now=new Date('2026-10-12T08:59:00Z').getTime(), calls=[], messages=[], failures=0;
 const props={KAKAO_REST_API_KEY:'test-rest-key',KAKAO_ACCESS_TOKEN:'test-access',KAKAO_TOKEN_EXPIRES_AT:String(now+3600000),KAKAO_REFRESH_TOKEN:'test-refresh',SYNC_KEY:'test-sync-key'};
 const store={getProperty:k=>props[k]??null,setProperty:(k,v)=>{props[k]=String(v);return store;},deleteProperty:k=>{delete props[k];return store;},getProperties:()=>({...props})};
 let triggers=[{getHandlerFunction:()=> 'sendDueReminders'}];
 const context=vm.createContext({
  Date:class extends Date {constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}},
  console:{log:()=>{}},isFinite,PropertiesService:{getScriptProperties:()=>store},
  Utilities:{getUuid:()=>crypto.randomUUID(),formatDate:(date,zone,format)=>new Date(date.getTime()+9*3600000).toISOString().slice(0,10)},
  LockService:{getScriptLock:()=>({tryLock:()=>true,hasLock:()=>true,releaseLock:()=>{}})},
  ScriptApp:{getProjectTriggers:()=>triggers,deleteTrigger:t=>{triggers=triggers.filter(x=>x!==t);},newTrigger:name=>({timeBased:()=>({everyMinutes:n=>({create:()=>{assert.equal(n,1);triggers.push({getHandlerFunction:()=>name});}})})})},
  HtmlService:{XFrameOptionsMode:{ALLOWALL:'ALLOWALL'},createHtmlOutput:html=>({html,setXFrameOptionsMode(){return this;}})},
  UrlFetchApp:{fetch:(url,options)=>{
   calls.push({url,options});
   if(url.includes('oauth/token')) return {getResponseCode:()=>200,getContentText:()=>JSON.stringify({access_token:'refreshed-access',refresh_token:'rotated-refresh',expires_in:3600})};
   assert.equal(url,'https://kapi.kakao.com/v2/api/talk/memo/default/send');
   if(failures-->0) return {getResponseCode:()=>500,getContentText:()=>JSON.stringify({code:-1})};
   messages.push(JSON.parse(options.payload.template_object));return {getResponseCode:()=>200,getContentText:()=>JSON.stringify({result_code:0})};
  }},
 });vm.runInContext(source,context);
 return {context,props,calls,messages,setNow:time=>{now=new Date(time).getTime();},failNext:n=>{failures=n;}};
}
const event={id:'test-id',date:'2026-10-12',time:'19:00',title:'달빛님 / 하드 루시드'};
test('서버 예약은 한국 시간 1시간 전에만 발송하고 성공 후 중복 발송하지 않는다',()=>{
 const h=setup();assert.equal(h.context.syncEvents_([event,{...event,id:'no-time',time:''}]),1);
 h.context.sendDueReminders();assert.equal(h.messages.length,0);
 h.setNow('2026-10-12T09:00:00Z');h.context.sendDueReminders();assert.equal(h.messages.length,1);
 assert.match(h.messages[0].text,/19:00 ≫ 달빛님 \/ 하드 루시드/);
 h.context.sendDueReminders();h.context.syncEvents_([{...event,title:'닉네임 수정'}]);h.context.sendDueReminders();assert.equal(h.messages.length,1);
 h.context.syncEvents_([]);h.context.sendDueReminders();assert.equal(Object.keys(h.props).filter(k=>k.startsWith('REMINDER_')).length,0);
 assert.equal(h.props.KAKAO_REFRESH_TOKEN,'test-refresh');
});
test('시간 변경/삭제를 반영하며 실패는 최대 3회 재시도하고 만료 access 토큰을 갱신한다',()=>{
 const h=setup();h.props.KAKAO_TOKEN_EXPIRES_AT='0';h.context.syncEvents_([event]);h.setNow('2026-10-12T09:00:00Z');h.failNext(3);
 for(let i=0;i<5;i++)h.context.sendDueReminders();
 assert.equal(h.calls.filter(c=>c.url.includes('memo/default/send')).length,3);assert.ok(h.props.LAST_SEND_ERROR);
 const tokenCall=h.calls.find(c=>c.url.includes('oauth/token'));assert.equal(tokenCall.options.payload.grant_type,'refresh_token');assert.equal(h.props.KAKAO_REFRESH_TOKEN,'rotated-refresh');
 h.context.syncEvents_([{...event,time:'19:01'}]);h.setNow('2026-10-12T09:01:00Z');h.context.sendDueReminders();assert.equal(h.messages.length,1);
 assert.equal(h.props.LAST_SEND_ERROR,undefined);
 h.setNow('2026-10-12T10:01:00Z');h.context.sendDueReminders();assert.equal(h.props['REMINDER_test-id'],undefined);
});
test('연결 키가 없는 요청은 거절하고 인증 상태를 확인한 뒤 일회용 코드를 삭제한다',()=>{
 const h=setup();const denied=h.context.doPost({parameter:{payload:JSON.stringify({nonce:'n1',key:'wrong',action:'sync',events:[event]})}});
 assert.match(denied.html,/"ok":false/);assert.ok(!denied.html.includes('test-refresh'));assert.equal(h.props['REMINDER_test-id'],undefined);
 const allowed=h.context.doPost({parameter:{payload:JSON.stringify({nonce:'n2',key:'test-sync-key',action:'sync',events:[event]})}});assert.match(allowed.html,/"ok":true/);
 h.props.OAUTH_STATE='expected-state';h.props.AUTHORIZATION_RESPONSE=JSON.stringify({code:'one-time-code',state:'wrong-state'});assert.throws(()=>h.context.connectKakao());
 h.props.AUTHORIZATION_RESPONSE=JSON.stringify({code:'one-time-code',state:'expected-state'});h.context.connectKakao();assert.equal(h.props.AUTHORIZATION_RESPONSE,undefined);assert.equal(h.props.OAUTH_STATE,undefined);
 h.context.installReminderTrigger();h.context.installReminderTrigger(); // 재설치는 트리거를 중복 등록하지 않는다.
});
