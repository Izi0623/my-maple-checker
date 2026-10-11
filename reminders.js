const $ = selector => document.querySelector(selector);
const SESSION_KEY = 'maple-kakao-reminder-connection';
export function validReminderUrl(value) {
  return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(value);
}
export function postReminderRequest(config, action, events = [], { timeout = 45000 } = {}) {
  if (!validReminderUrl(config.url) || !config.key) return Promise.reject(new Error('웹 앱 주소와 연결 키를 확인해 주세요.'));
  return new Promise((resolve, reject) => {
    const nonce = crypto.randomUUID(), frame = document.createElement('iframe'), form = document.createElement('form');
    frame.name = `reminder-${nonce}`; frame.hidden = true; frame.title = '알림 서버 동기화';
    form.method = 'post'; form.action = config.url; form.target = frame.name; form.hidden = true;
    const input = document.createElement('input'); input.name = 'payload';
    input.value = JSON.stringify({ nonce, key: config.key, action, events: events.map(({id,date,time,title}) => ({id,date,time,title})) });
    form.append(input);
    let timer;
    const cleanup = () => { clearTimeout(timer); window.removeEventListener('message', receive); frame.remove(); form.remove(); };
    function receive(e) {
      if (!/^https:\/\/([\w-]+\.)*googleusercontent\.com$/.test(e.origin) && e.origin !== 'https://script.google.com') return;
      if (e.data?.nonce !== nonce || typeof e.data.ok !== 'boolean') return;
      cleanup();
      e.data.ok ? resolve(e.data) : reject(new Error(e.data.message || '알림 서버에서 거절했어요.'));
    }
    window.addEventListener('message', receive);
    timer = setTimeout(() => { cleanup(); reject(new Error('알림 서버의 저장 확인을 받지 못했어요. 배포 권한과 주소를 확인한 뒤 다시 전송해 주세요.')); }, timeout);
    document.body.append(frame, form); form.submit();
  });
}
export function createReminders({ getEvents, toast }) {
  let config, queue = Promise.resolve(), revision = 0, stopping = false;
  try { const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY)); if (saved && validReminderUrl(saved.url) && saved.key) config = saved; } catch {}
  function status(text) { $('#reminder-status').textContent = text; }
  function remember() { try { config ? sessionStorage.setItem(SESSION_KEY, JSON.stringify(config)) : sessionStorage.removeItem(SESSION_KEY); } catch {} }
  function sync() {
    if (!config || stopping) return Promise.resolve();
    const current = ++revision, connection = config;
    status('카카오톡 예약 알림 서버에 일정을 전송하고 있어요…');
    queue = queue.catch(() => {}).then(async () => {
      if (current !== revision || connection !== config) return;
      try {
        const result = await postReminderRequest(connection, 'sync', getEvents());
        if (current === revision) status(`예약 알림 ${result.count}개 저장 확인 · 일정 1시간 전, 약 1분 간격으로 실행됩니다.`);
      } catch (error) { status(error.message); throw error; }
    });
    return queue;
  }
  $('#reminder-settings').addEventListener('click', () => {
    $('#reminder-url').value = config?.url || ''; $('#reminder-key').value = '';
    $('#reminder-dialog-status').textContent = '';
    $('#reminder-dialog').showModal();
  });
  $('#reminder-dialog').addEventListener('close', () => { $('#reminder-key').value = ''; });
  $('#reminder-form').addEventListener('submit', async e => {
    e.preventDefault();
    const next = { url: $('#reminder-url').value.trim(), key: $('#reminder-key').value.trim() || config?.key };
    if (!validReminderUrl(next.url) || !next.key) { $('#reminder-dialog-status').textContent = 'Google Apps Script의 /exec 주소와 연결 키를 입력해 주세요.'; return; }
    $('#reminder-connect').disabled = true;
    const previous = config;
    config = next;
    try {
      await sync(); remember(); $('#reminder-key').value = ''; $('#reminder-dialog').close(); toast('예약 알림 서버에 일정을 저장했어요.');
    } catch (error) { config = previous; $('#reminder-dialog-status').textContent = error.message; }
    finally { $('#reminder-connect').disabled = false; }
  });
  $('#reminder-sync').addEventListener('click', () => {
    if (!config) { $('#reminder-settings').click(); return; }
    sync().catch(error => toast(error.message));
  });
  $('#reminder-stop').addEventListener('click', async () => {
    if (!config) { $('#reminder-dialog-status').textContent = '먼저 서버 주소와 연결 키를 입력해 연결하세요.'; return; }
    $('#reminder-stop').disabled = true; stopping = true;
    try {
      ++revision; await queue.catch(() => {}); await postReminderRequest(config, 'clear');
      config = undefined; remember(); $('#reminder-key').value = ''; $('#reminder-dialog').close(); status('카카오톡 예약 알림을 중지했어요.');
    } catch (error) { $('#reminder-dialog-status').textContent = error.message; }
    finally { $('#reminder-stop').disabled = false; stopping = false; }
  });
  if (config) sync().catch(() => {});
  else status('알림 설정을 연결하면 시간이 있는 일정은 1시간 전에 본인의 카카오톡으로 안내됩니다.');
  return { sync: () => sync().catch(() => {}) };
}
