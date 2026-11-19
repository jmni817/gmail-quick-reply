// =============================================================
// 답변 버튼 관리 화면 (팝업 + 옵션 페이지 공용)
//  - 버튼 이름/본문 추가·수정·삭제·순서 변경
//  - 입력하는 즉시 자동 저장 (팝업이 닫혀도 내용이 사라지지 않도록)
//  - 저장하면 열려 있는 Gmail 탭의 버튼 바에도 바로 반영됨 (storage.onChanged)
// =============================================================
const K = GQR_STORAGE_KEYS;
const $ = (sel) => document.querySelector(sel);

let templates = [];
let settings = { ...GQR_DEFAULT_SETTINGS };
let saveTimer = null;

// ---------------------------------------------------------
// 초기 로드
// ---------------------------------------------------------
async function init() {
  const data = await chrome.storage.local.get([K.templates, K.settings]);
  templates = Array.isArray(data[K.templates])
    ? data[K.templates]
    : structuredClone(GQR_DEFAULT_TEMPLATES); // 혹시 설치 직후 값이 없으면 기본값
  settings = { ...GQR_DEFAULT_SETTINGS, ...(data[K.settings] || {}) };

  $('#mode').value = settings.insertMode;
  render();
}

// ---------------------------------------------------------
// 목록 그리기 (사용자 입력은 textContent/value 로만 넣어 XSS 방지)
// ---------------------------------------------------------
function render() {
  const list = $('#list');
  list.replaceChildren(...templates.map((t, i) => createCard(t, i)));
  list.hidden = templates.length === 0;
  $('#empty').hidden = templates.length > 0;
}

function createCard(t, index) {
  const card = document.createElement('section');
  card.className = 'card';

  // ── 첫 줄: 버튼 이름 + ↑ ↓ 삭제 ──
  const head = document.createElement('div');
  head.className = 'card-head';

  const label = document.createElement('input');
  label.type = 'text';
  label.value = t.label || '';
  label.placeholder = '버튼 이름 (예: 기획안)';
  label.maxLength = 30;
  label.setAttribute('aria-label', '버튼 이름');
  label.addEventListener('input', () => {
    t.label = label.value;
    scheduleSave();
  });

  const up = iconButton('↑', '위로', index === 0, () => move(index, -1));
  const down = iconButton('↓', '아래로', index === templates.length - 1, () => move(index, 1));

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'danger';
  del.textContent = '삭제';
  armedClick(del, '정말 삭제?', () => {
    templates.splice(index, 1);
    render();
    saveNow();
  });

  head.append(label, up, down, del);

  // ── 본문 ──
  const body = document.createElement('textarea');
  body.value = t.body || '';
  body.placeholder = '이 버튼을 누르면 입력될 답변 초안을 적어 주세요.\n줄바꿈도 그대로 들어갑니다.';
  body.rows = Math.min(10, Math.max(4, (t.body || '').split('\n').length + 1));
  body.setAttribute('aria-label', `${t.label || '버튼'} 본문`);
  body.addEventListener('input', () => {
    t.body = body.value;
    scheduleSave();
  });

  card.append(head, body);
  return card;
}

function iconButton(text, title, disabled, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'icon';
  b.textContent = text;
  b.title = title;
  b.setAttribute('aria-label', title);
  b.disabled = disabled;
  b.addEventListener('click', onClick);
  return b;
}

// 실수 방지: 한 번 누르면 "정말?" 상태, 3초 안에 한 번 더 눌러야 실행
function armedClick(button, armedText, action) {
  const original = button.textContent;
  let timer = null;
  button.addEventListener('click', () => {
    if (button.classList.contains('armed')) {
      clearTimeout(timer);
      button.classList.remove('armed');
      button.textContent = original;
      action();
      return;
    }
    button.classList.add('armed');
    button.textContent = armedText;
    timer = setTimeout(() => {
      button.classList.remove('armed');
      button.textContent = original;
    }, 3000);
  });
}

function move(index, delta) {
  const target = index + delta;
  if (target < 0 || target >= templates.length) return;
  [templates[index], templates[target]] = [templates[target], templates[index]];
  render();
  saveNow();
}

// ---------------------------------------------------------
// 저장
// ---------------------------------------------------------
function setStatus(text, ok = false) {
  const el = $('#status');
  el.textContent = text;
  el.classList.toggle('ok', ok);
}

function scheduleSave() {
  setStatus('저장 중…');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 350);
}

async function saveNow() {
  clearTimeout(saveTimer);
  saveTimer = null;
  try {
    await chrome.storage.local.set({ [K.templates]: templates, [K.settings]: settings });
    setStatus('저장됨 ✓', true);
  } catch (e) {
    setStatus('저장 실패: ' + e.message);
  }
}

// 팝업이 닫히기 직전, 아직 저장 대기 중인 내용이 있으면 즉시 저장
window.addEventListener('pagehide', () => {
  if (saveTimer) saveNow();
});

// ---------------------------------------------------------
// 상단/하단 컨트롤
// ---------------------------------------------------------
$('#mode').addEventListener('change', (e) => {
  settings.insertMode = e.target.value;
  saveNow();
});

$('#add').addEventListener('click', () => {
  templates.push({ id: crypto.randomUUID(), label: '새 버튼', body: '' });
  render();
  saveNow();
  // 방금 추가한 카드의 이름 칸에 포커스
  const inputs = document.querySelectorAll('.card input[type="text"]');
  const last = inputs[inputs.length - 1];
  if (last) {
    last.scrollIntoView({ block: 'nearest' });
    last.focus();
    last.select();
  }
});

armedClick($('#reset'), '정말 복원?', () => {
  templates = structuredClone(GQR_DEFAULT_TEMPLATES);
  settings = { ...GQR_DEFAULT_SETTINGS };
  $('#mode').value = settings.insertMode;
  render();
  saveNow();
});

init();
