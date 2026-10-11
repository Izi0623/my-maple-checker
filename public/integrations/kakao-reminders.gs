// Google Apps Script에 붙여 넣으세요. 키/토큰은 코드가 아닌 스크립트 속성에 저장합니다.
var SITE_URL = 'https://izi0623.github.io/my-maple-checker/';
var SITE_ORIGIN = 'https://izi0623.github.io';
var CALLBACK_URL = SITE_URL + 'kakao-auth.html';

function requiredProperty_(name) {
  var value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) throw new Error('스크립트 속성 ' + name + '을 설정해 주세요.');
  return value;
}

// 1. REST API 키 등록 후 실행하고 실행 로그의 로그인 주소를 여세요.
function getKakaoLoginUrl() {
  var state = Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty('OAUTH_STATE', state);
  var url = 'https://kauth.kakao.com/oauth/authorize?client_id=' + encodeURIComponent(requiredProperty_('KAKAO_REST_API_KEY')) + '&redirect_uri=' + encodeURIComponent(CALLBACK_URL) + '&response_type=code&scope=talk_message&state=' + encodeURIComponent(state);
  console.log(url); // REST API 키는 공개 앱 식별자입니다. 토큰은 출력하지 않습니다.
  return url;
}

// 2. 로그인 완료 화면의 JSON을 AUTHORIZATION_RESPONSE 속성에 붙여 넣은 후 실행하세요.
function connectKakao() {
  var props = PropertiesService.getScriptProperties();
  var auth = JSON.parse(requiredProperty_('AUTHORIZATION_RESPONSE'));
  if (!auth.code || auth.state !== requiredProperty_('OAUTH_STATE')) throw new Error('인증 상태가 일치하지 않아요. 로그인 주소를 새로 생성해 주세요.');
  var token = requestToken_({ grant_type: 'authorization_code', code: auth.code, redirect_uri: CALLBACK_URL });
  storeToken_(token);
  props.deleteProperty('AUTHORIZATION_RESPONSE');
  props.deleteProperty('OAUTH_STATE');
  if (!props.getProperty('SYNC_KEY')) props.setProperty('SYNC_KEY', Utilities.getUuid() + Utilities.getUuid());
  console.log('카카오 연결 완료. SYNC_KEY는 프로젝트 설정의 스크립트 속성에서 확인하세요.');
}

// 3. 웹 앱 배포 후 실행하세요. 1분 간격 트리거를 하나만 설치합니다.
function installReminderTrigger() {
  requiredProperty_('KAKAO_REFRESH_TOKEN');
  ScriptApp.getProjectTriggers().filter(function(t) { return t.getHandlerFunction() === 'sendDueReminders'; }).forEach(function(t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('sendDueReminders').timeBased().everyMinutes(1).create();
  console.log('예약 알림 실행 준비 완료. 사이트에서 알림을 연결하고 일정을 전송하세요.');
}

// 원할 때만 실행하세요. 실제로 본인의 카카오톡에 테스트 메시지 1개를 보냅니다.
function sendTestMessage() {
  sendKakaoText_('메이플 보스 약속 알림 연결 테스트입니다.');
  console.log('테스트 메시지 전송 완료. 카카오톡 나와의 채팅을 확인하세요.');
}

function requestToken_(values) {
  values.client_id = requiredProperty_('KAKAO_REST_API_KEY');
  var secret = PropertiesService.getScriptProperties().getProperty('KAKAO_CLIENT_SECRET');
  if (secret) values.client_secret = secret;
  var response = UrlFetchApp.fetch('https://kauth.kakao.com/oauth/token', { method: 'post', payload: values, muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) throw new Error('카카오 인증 실패. 키·Client Secret·인증 코드·Redirect URI를 확인하세요.');
  return JSON.parse(response.getContentText());
}
function storeToken_(token) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('KAKAO_ACCESS_TOKEN', token.access_token);
  props.setProperty('KAKAO_TOKEN_EXPIRES_AT', String(Date.now() + Number(token.expires_in) * 1000));
  if (token.refresh_token) props.setProperty('KAKAO_REFRESH_TOKEN', token.refresh_token);
}
function accessToken_() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('KAKAO_ACCESS_TOKEN') || Number(props.getProperty('KAKAO_TOKEN_EXPIRES_AT') || 0) <= Date.now() + 60000) {
    storeToken_(requestToken_({ grant_type: 'refresh_token', refresh_token: requiredProperty_('KAKAO_REFRESH_TOKEN') }));
  }
  return requiredProperty_('KAKAO_ACCESS_TOKEN');
}
function sendKakaoText_(text) {
  var template = { object_type: 'text', text: text.slice(0, 200), link: { web_url: SITE_URL, mobile_web_url: SITE_URL }, button_title: '캘린더 열기' };
  var response = UrlFetchApp.fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', { method: 'post', headers: { Authorization: 'Bearer ' + accessToken_() }, payload: { template_object: JSON.stringify(template) }, muteHttpExceptions: true });
  if (response.getResponseCode() !== 200 || JSON.parse(response.getContentText()).result_code !== 0) throw new Error('카카오톡 전송 실패. talk_message 동의와 토큰 상태를 확인하세요.');
}

function syncEvents_(events) {
  if (!Array.isArray(events) || events.length > 300) throw new Error('동기화는 최대 300개 일정까지 지원합니다. 지난 일정을 정리해 주세요.');
  var props = PropertiesService.getScriptProperties(), previous = props.getProperties(), keep = {}, count = 0;
  events.forEach(function(e) {
    if (!e || typeof e.id !== 'string' || !/^[\w-]{1,100}$/.test(e.id) || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time) || typeof e.title !== 'string') return;
    var startsAt = new Date(e.date + 'T' + e.time + ':00+09:00').getTime();
    if (!isFinite(startsAt) || startsAt <= Date.now() || Utilities.formatDate(new Date(startsAt), 'Asia/Seoul', 'yyyy-MM-dd') !== e.date) return;
    var key = 'REMINDER_' + e.id;
    var old = previous[key] ? JSON.parse(previous[key]) : null;
    var entry = { id: e.id, date: e.date, time: e.time, title: e.title.slice(0,80), startsAt: startsAt, dueAt: startsAt - 3600000, sentAt: old && old.startsAt === startsAt ? old.sentAt : null, attempts: old && old.startsAt === startsAt ? (old.attempts || 0) : 0 };
    props.setProperty(key, JSON.stringify(entry)); keep[key] = true; count++;
  });
  Object.keys(previous).filter(function(key) { return key.indexOf('REMINDER_') === 0 && !keep[key]; }).forEach(function(key) { props.deleteProperty(key); });
  props.setProperty('LAST_SYNC_AT', new Date().toISOString());
  return count;
}

// 폼 POST로 동기화하고 HTML 응답에서 안전한 postMessage 확인 신호를 돌려줍니다.
function doPost(e) {
  var result = { nonce: '', ok: false }, lock = LockService.getScriptLock();
  try {
    var body = JSON.parse(e.parameter.payload || '{}');
    result.nonce = typeof body.nonce === 'string' ? body.nonce.slice(0,100) : '';
    if (body.key !== requiredProperty_('SYNC_KEY')) throw new Error('알림 연결 키가 일치하지 않아요.');
    if (!lock.tryLock(10000)) throw new Error('알림 실행 중이에요. 잠시 후 다시 전송해 주세요.');
    if (body.action === 'sync') {
      requiredProperty_('KAKAO_REFRESH_TOKEN');
      if (!ScriptApp.getProjectTriggers().some(function(t) { return t.getHandlerFunction() === 'sendDueReminders'; })) throw new Error('Apps Script에서 installReminderTrigger를 먼저 실행해 주세요.');
      result.count = syncEvents_(body.events);
    }
    else if (body.action === 'clear') result.count = syncEvents_([]);
    else throw new Error('지원하지 않는 요청입니다.');
    result.ok = true;
    result.message = body.action === 'clear' ? '예약 알림을 중지했어요.' : '예약 알림 서버에 일정을 저장했어요.';
  } catch (error) {
    result.message = String(error.message || '알림 연결에 실패했어요.').slice(0,200);
  } finally { if (lock.hasLock()) lock.releaseLock(); }
  var data = JSON.stringify(result).replace(/</g, '\\u003c');
  var script = '<script>var result=' + data + ';var w=window;while(w!==w.parent){w=w.parent;w.postMessage(result,' + JSON.stringify(SITE_ORIGIN) + ');}</script>';
  return HtmlService.createHtmlOutput(script).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function doGet() { return HtmlService.createHtmlOutput('메이플 보스 약속 알림 서버입니다. 사이트의 카카오톡 알림 설정에서 연결하세요.'); }

function sendDueReminders() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    var props = PropertiesService.getScriptProperties(), values = props.getProperties(), now = Date.now();
    Object.keys(values).filter(function(key) { return key.indexOf('REMINDER_') === 0; }).forEach(function(key) {
      var e = JSON.parse(values[key]);
      if (e.startsAt <= now) { props.deleteProperty(key); return; }
      if (e.sentAt || e.dueAt > now || (e.attempts || 0) >= 3) return;
      e.attempts = (e.attempts || 0) + 1; props.setProperty(key, JSON.stringify(e));
      try {
        sendKakaoText_('보스 약속 알림\n' + e.date + ' ' + e.time + ' ≫ ' + e.title + '\n약 ' + Math.max(1, Math.ceil((e.startsAt - now) / 60000)) + '분 후 시작됩니다.');
        e.sentAt = Date.now(); props.setProperty(key, JSON.stringify(e));
        props.deleteProperty('LAST_SEND_ERROR');
      } catch (error) {
        props.setProperty('LAST_SEND_ERROR', new Date().toISOString() + ' ' + error.message);
        // 다음 트리거에서 최대 3회까지 재시도합니다. 응답 유실 시 중복 알림 가능성은 있습니다.
      }
    });
  } finally { lock.releaseLock(); }
}
