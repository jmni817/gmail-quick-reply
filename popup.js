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
let openId = null; // 현재 편집 중(펼쳐진) 버튼의 id, 없으면 null

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

// 목록에는 버튼 이름만 보여 주고, [편집]을 눌렀을 때만 이름·본문 편집 칸을 펼칩니다.
// 한 번에 하나만 펼쳐지도록(아코디언) 해서 스크롤이 길어지지 않게 합니다.
function createCard(t, index) {
  const isOpen = openId === t.id;
  const card = document.createElement('section');
  card.className = 'card' + (isOpen ? ' open' : '');

  // ── 접힌 상태에서도 보이는 한 줄: 버튼 이름 + ↑ ↓ + 편집 토글 ──
  const head = document.createElement('div');
  head.className = 'card-head';

  const name = document.createElement('span');
  name.className = 'chip';
  const setName = () => {
    name.textContent = String(t.label || '').trim() || '(이름 없음)';
    name.classList.toggle('untitled', !String(t.label || '').trim());
    // 마우스를 올리면 본문 앞부분 미리보기
    name.title = String(t.body || '').slice(0, 200) || '본문이 비어 있습니다';
  };
  setName();

  // 순서 변경 손잡이: 포커스한 뒤 ↑ ↓ 방향키로 한 칸씩 이동
  const handle = document.createElement('button');
  handle.type = 'button';
  handle.className = 'handle';
  handle.textContent = '⠿';
  handle.title = '순서 변경 (키보드: ↑ ↓ 방향키)';
  handle.setAttribute('aria-label', `${String(t.label || '').trim() || '버튼'} 순서 변경 손잡이`);
  handle.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const target = index + (e.key === 'ArrowUp' ? -1 : 1);
    if (target < 0 || target >= templates.length) return;
    reorder(index, target).then(() => {
      // 이동한 항목의 손잡이에 포커스를 유지해 연속으로 옮길 수 있게 함
      document.querySelectorAll('#list .handle')[target]?.focus();
    });
  });

  const up = iconButton('↑', '위로', index === 0, () => move(index, -1));
  const down = iconButton('↓', '아래로', index === templates.length - 1, () => move(index, 1));

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'toggle';
  toggle.textContent = isOpen ? '닫기' : '편집';
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.addEventListener('click', () => {
    openId = isOpen ? null : t.id;
    render();
  });

  head.append(handle, name, up, down, toggle);
  card.append(head);
  if (!isOpen) return card;

  // ── 펼친 상태: 이름 / 본문 편집 + 삭제 ──
  const editor = document.createElement('div');
  editor.className = 'card-edit';

  const label = document.createElement('input');
  label.type = 'text';
  label.value = t.label || '';
  label.placeholder = '버튼 이름 (예: 기획안)';
  label.maxLength = 30;
  label.setAttribute('aria-label', '버튼 이름');
  label.addEventListener('input', () => {
    t.label = label.value;
    setName();
    scheduleSave();
  });

  const body = document.createElement('textarea');
  body.value = t.body || '';
  body.placeholder = '이 버튼을 누르면 입력될 답변 초안을 적어 주세요.\n줄바꿈도 그대로 들어갑니다.';
  body.rows = Math.min(10, Math.max(4, (t.body || '').split('\n').length + 1));
  body.setAttribute('aria-label', `${t.label || '버튼'} 본문`);
  body.addEventListener('input', () => {
    t.body = body.value;
    setName();
    scheduleSave();
  });

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'danger';
  del.textContent = '이 버튼 삭제';
  armedClick(del, '정말 삭제?', () => {
    templates.splice(index, 1);
    openId = null;
    render();
    saveNow();
  });
  actions.append(del);

  editor.append(label, body, actions);
  card.append(editor);
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
  reorder(index, target);
}

// from 위치의 항목을 꺼내 to 위치에 끼워 넣고 저장합니다.
// 저장에 실패하면 화면 순서를 원래대로 되돌려, 보이는 순서와 저장된 순서가 어긋나지 않게 합니다.
async function reorder(from, to) {
  if (from === to) return true;
  const before = templates.slice();
  const [item] = templates.splice(from, 1);
  templates.splice(to, 0, item);
  render();
  const ok = await saveNow();
  if (!ok) {
    templates = before;
    render();
    setStatus('순서 저장 실패 — 원래 순서로 되돌렸습니다');
  }
  return ok;
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

// 저장 성공 여부를 true / false 로 돌려줍니다. (순서 변경 실패 시 되돌리기에 사용)
async function saveNow() {
  clearTimeout(saveTimer);
  saveTimer = null;
  try {
    await chrome.storage.local.set({ [K.templates]: templates, [K.settings]: settings });
    setStatus('저장됨 ✓', true);
    return true;
  } catch (e) {
    setStatus('저장 실패: ' + e.message);
    return false;
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
  const t = { id: crypto.randomUUID(), label: '새 버튼', body: '' };
  templates.push(t);
  openId = t.id; // 새 버튼은 바로 편집 상태로 펼침
  render();
  saveNow();
  // 방금 추가한 카드의 이름 칸에 포커스
  const last = document.querySelector('.card.open input[type="text"]');
  if (last) {
    last.scrollIntoView({ block: 'nearest' });
    last.focus();
    last.select();
  }
});

armedClick($('#reset'), '정말 복원?', () => {
  templates = structuredClone(GQR_DEFAULT_TEMPLATES);
  settings = { ...GQR_DEFAULT_SETTINGS };
  openId = null;
  $('#mode').value = settings.insertMode;
  render();
  saveNow();
});

init();
