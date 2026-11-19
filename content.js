// =============================================================
// Gmail 빠른 답변 버튼 — 콘텐츠 스크립트
//
// 동작 개요
//  1) MutationObserver 로 Gmail 화면 변화를 감시
//  2) 답장/전달/새 메일 작성 창의 "본문 입력 영역"을 찾으면 바로 위에 버튼 바 삽입
//  3) 버튼 클릭 → 저장된 템플릿 본문을 커서 위치 / 본문 끝 / 덮어쓰기 중 설정대로 입력
//
// Gmail 은 난독화된 클래스명(예: .Am, .aO9)을 자주 바꾸므로 사용하지 않고,
// role="textbox", g_editable, aria-label 같은 의미 있는 속성으로만 찾습니다.
// =============================================================
(() => {
  'use strict';

  // 같은 페이지에 두 번 주입되는 경우 방지
  if (window.__gqrLoaded) return;
  window.__gqrLoaded = true;

  const K = GQR_STORAGE_KEYS;

  // ---------------------------------------------------------
  // 선택자 정의
  // ---------------------------------------------------------

  // 본문 입력 영역 후보 (하나라도 맞으면 대상)
  //  - g_editable="true" : Gmail 에디터가 붙이는 고유 속성 (언어와 무관)
  //  - aria-label        : 한국어 "메시지 본문" / "메일 본문", 영어 "Message Body" 등
  //    → 언어·문구 변화에 덜 민감하도록 "본문" / "body" 포함 여부로 판단 (i: 대소문자 무시)
  //  ※ 제목 입력란은 <input>, 받는 사람은 role="combobox" 라서 여기에 걸리지 않습니다.
  const EDITOR_SELECTOR = [
    'div[contenteditable="true"][g_editable="true"]',
    'div[role="textbox"][g_editable="true"]',
    'div[role="textbox"][contenteditable="true"][aria-label*="본문"]',
    'div[role="textbox"][contenteditable="true"][aria-label*="body" i]',
  ].join(',');

  const LOG = (...args) => console.info('[Gmail 빠른 답변]', ...args);

  // 본문 안에서 "사용자가 쓰는 영역"이 끝나는 지점(서명·인용문).
  // 이 클래스들은 난독화된 UI 클래스가 아니라, 메일 HTML 자체에 들어가는
  // Gmail 표준 마크업이라 오랫동안 바뀌지 않았습니다.
  const BOUNDARY_SELECTOR = [
    '.gmail_signature_prefix', // 서명 앞의 "-- " 줄
    '.gmail_signature',
    '[data-smartmail="gmail_signature"]',
    '.gmail_quote',            // 인용된 이전 메일
    '.gmail_extra',
  ].join(',');

  const MODE_LABEL = { cursor: '커서 위치', end: '본문 끝', replace: '덮어쓰기' };

  // ---------------------------------------------------------
  // 상태
  // ---------------------------------------------------------
  const state = {
    templates: GQR_DEFAULT_TEMPLATES,
    settings: { ...GQR_DEFAULT_SETTINGS },
  };

  const barByEditor = new WeakMap(); // 에디터 → 버튼 바
  const editorByBar = new WeakMap(); // 버튼 바 → 에디터
  const savedRanges = new WeakMap(); // 에디터 → 마지막 커서/선택 영역
  let observer = null;
  let scanTimer = null;

  // ---------------------------------------------------------
  // 확장 프로그램이 업데이트/새로고침되면 이 스크립트는 "고아"가 되어
  // chrome.* 호출이 에러를 냅니다. 그럴 땐 조용히 정리하고 멈춥니다.
  // ---------------------------------------------------------
  function isContextAlive() {
    try {
      return Boolean(chrome.runtime && chrome.runtime.id);
    } catch (e) {
      return false;
    }
  }

  function teardown() {
    if (observer) observer.disconnect();
    observer = null;
    document.querySelectorAll('.gqr-bar').forEach((bar) => bar.remove());
  }

  // ---------------------------------------------------------
  // 저장소 읽기 / 변경 감지
  // ---------------------------------------------------------
  async function loadData() {
    try {
      const data = await chrome.storage.local.get([K.templates, K.settings]);
      if (Array.isArray(data[K.templates])) state.templates = data[K.templates];
      state.settings = { ...GQR_DEFAULT_SETTINGS, ...(data[K.settings] || {}) };
    } catch (e) {
      // 저장소 접근 실패 시 기본값으로 계속 동작
    }
  }

  function listenStorage() {
    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;
        if (changes[K.templates]) {
          state.templates = Array.isArray(changes[K.templates].newValue)
            ? changes[K.templates].newValue
            : [];
        }
        if (changes[K.settings]) {
          state.settings = { ...GQR_DEFAULT_SETTINGS, ...(changes[K.settings].newValue || {}) };
        }
        // 이미 떠 있는 모든 버튼 바를 새 템플릿으로 다시 그림
        document.querySelectorAll('.gqr-bar').forEach((bar) => {
          const editor = editorByBar.get(bar);
          if (editor) renderBar(bar, editor);
        });
      });
    } catch (e) {
      /* 무시 */
    }
  }

  // ---------------------------------------------------------
  // 버튼 바 생성 / 렌더링
  // ---------------------------------------------------------
  function createBar(editor) {
    const bar = document.createElement('div');
    bar.className = 'gqr-bar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', '빠른 답변 버튼');
    bar.contentEditable = 'false'; // 혹시 에디터 영역 안으로 취급되지 않도록

    // Gmail 전역 단축키(예: r, f, Enter)가 버튼 위에서 실행되지 않도록 차단
    bar.addEventListener('keydown', (e) => e.stopPropagation());

    // ※ 마우스 클릭 처리는 아래 "클릭 처리" 구역에서 window 캡처 단계로 한꺼번에 합니다.

    renderBar(bar, editor);
    barByEditor.set(editor, bar);
    editorByBar.set(bar, editor);
    return bar;
  }

  function renderBar(bar, editor) {
    bar.replaceChildren();

    const list = state.templates.filter((t) => t && String(t.label || '').trim());

    if (list.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'gqr-empty';
      empty.textContent = '등록된 답변 버튼이 없습니다';
      bar.append(empty);
    }

    for (const t of list) {
      const btn = document.createElement('button');
      btn.type = 'button'; // ★ submit 방지
      btn.className = 'gqr-btn';
      btn.dataset.id = t.id;
      btn.textContent = String(t.label).trim();
      // 마우스를 올리면 본문 미리보기
      const preview = String(t.body || '').slice(0, 300);
      btn.title = preview + (String(t.body || '').length > 300 ? '…' : '');
      bar.append(btn);
    }

    // 오른쪽 끝: 현재 삽입 방식 + 설정 버튼
    const spacer = document.createElement('span');
    spacer.className = 'gqr-spacer';
    bar.append(spacer);

    const mode = document.createElement('span');
    mode.className = 'gqr-mode';
    mode.textContent = MODE_LABEL[state.settings.insertMode] || MODE_LABEL.cursor;
    mode.title = '삽입 방식 (⚙ 설정에서 변경)';
    bar.append(mode);

    const gear = document.createElement('button');
    gear.type = 'button';
    gear.className = 'gqr-btn gqr-gear';
    gear.dataset.action = 'settings';
    gear.title = '답변 버튼 관리';
    gear.setAttribute('aria-label', '답변 버튼 관리');
    gear.textContent = '⚙';
    bar.append(gear);
  }

  // ---------------------------------------------------------
  // 클릭 처리
  //
  // Gmail 은 작성 창 안의 마우스 이벤트를 자체적으로 가로채는(전파 중단) 경우가 있어서,
  // 버튼에 직접 단 리스너까지 이벤트가 오지 않을 수 있습니다.
  // 그래서 가장 먼저 실행되는 window "캡처 단계"에서 우리 버튼 클릭을 먼저 잡아 처리합니다.
  //  - pointerdown/mousedown 기본 동작 차단 → 버튼을 눌러도 에디터 커서가 유지됨
  //  - 투명한 레이어가 버튼 위를 덮고 있어도 좌표로 버튼을 찾아냄 (elementsFromPoint)
  // ---------------------------------------------------------
  function barButtonFromEvent(e) {
    const t = e.target;
    let btn = t && t.nodeType === Node.ELEMENT_NODE ? t.closest('.gqr-bar button') : null;
    if (!btn && e.isTrusted && (e.clientX || e.clientY)) {
      btn = document
        .elementsFromPoint(e.clientX, e.clientY)
        .find((el) => el.matches && el.matches('.gqr-bar button')) || null;
    }
    return btn;
  }

  function handleBarClick(btn) {
    const bar = btn.closest('.gqr-bar');
    const editor = bar && editorByBar.get(bar);

    if (btn.dataset.action === 'settings') {
      openSettings();
      return;
    }
    if (!editor || !editor.isConnected) {
      LOG('연결된 본문 입력칸을 찾지 못했습니다. 답장 창을 다시 열어 주세요.');
      return;
    }

    const tpl = state.templates.find((t) => t && t.id === btn.dataset.id);
    if (!tpl) {
      LOG('템플릿을 찾지 못했습니다:', btn.dataset.id);
      return;
    }

    flash(btn); // 눌렸다는 표시는 먼저 (입력 중 오류가 나도 클릭 자체는 확인 가능)
    try {
      insertTemplate(editor, tpl.body || '');
      LOG(`"${tpl.label}" 초안을 입력했습니다.`);
    } catch (err) {
      console.error('[Gmail 빠른 답변] 입력 중 오류:', err);
    }
  }

  ['pointerdown', 'mousedown', 'pointerup', 'mouseup'].forEach((type) => {
    window.addEventListener(
      type,
      (e) => {
        if (!barButtonFromEvent(e)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
      },
      true
    );
  });

  window.addEventListener(
    'click',
    (e) => {
      const btn = barButtonFromEvent(e);
      if (!btn) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      handleBarClick(btn);
    },
    true
  );

  function flash(btn) {
    btn.classList.add('gqr-btn--done');
    setTimeout(() => btn.classList.remove('gqr-btn--done'), 600);
  }

  function openSettings() {
    if (!isContextAlive()) return;
    try {
      chrome.runtime.sendMessage({ type: 'gqr:openOptions' });
    } catch (e) {
      /* 무시 */
    }
  }

  // ---------------------------------------------------------
  // 에디터에 바 붙이기 (중복 삽입 방지 포함)
  // ---------------------------------------------------------
  function attach(editor) {
    if (!editor.parentNode || editor.closest('.gqr-bar')) return;

    const mine = barByEditor.get(editor);
    // 이미 올바른 위치(에디터 바로 앞)에 붙어 있으면 아무것도 안 함
    if (mine && mine.isConnected && mine.nextElementSibling === editor) return;
    if (mine) mine.remove();

    // 바로 앞에 남아 있는 다른 바(이전 버전 스크립트가 만든 것 등)는 제거 후 새로 생성
    const prev = editor.previousElementSibling;
    if (prev && prev.classList.contains('gqr-bar')) prev.remove();

    editor.parentNode.insertBefore(createBar(editor), editor);
    LOG('답장/작성 창에 버튼 바를 붙였습니다.', editor.getAttribute('aria-label') || '');
  }

  // 화면 전체를 훑어 새 에디터에는 바를 붙이고, 사라진 에디터의 바는 제거
  function scan() {
    scanTimer = null;
    if (!isContextAlive()) {
      teardown();
      return;
    }
    document.querySelectorAll(EDITOR_SELECTOR).forEach(attach);
    document.querySelectorAll('.gqr-bar').forEach((bar) => {
      const editor = editorByBar.get(bar);
      if (!editor || !editor.isConnected) bar.remove();
    });
  }

  // Gmail 은 DOM 변경이 매우 잦으므로 짧게 모아서(디바운스) 한 번만 스캔
  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(scan, 150);
  }

  function startObserver() {
    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length || m.removedNodes.length) {
          scheduleScan();
          return;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    scan();
  }

  // ---------------------------------------------------------
  // 커서 위치 기억
  //  사용자가 제목란 등 다른 곳을 클릭한 뒤 버튼을 눌러도,
  //  마지막으로 본문에 있던 커서 위치에 넣을 수 있도록 저장해 둡니다.
  // ---------------------------------------------------------
  function editorOf(node) {
    const el = node && (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement);
    return el ? el.closest(EDITOR_SELECTOR) : null;
  }

  document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const editor = editorOf(sel.anchorNode);
    if (editor) savedRanges.set(editor, sel.getRangeAt(0).cloneRange());
  });

  // ---------------------------------------------------------
  // 본문 구조 헬퍼
  // ---------------------------------------------------------

  // 서명/인용문이 시작되는 "에디터의 직계 자식" 노드를 찾음 (없으면 null)
  function findBoundary(editor) {
    let node = editor.querySelector(BOUNDARY_SELECTOR);
    if (!node) return null;
    while (node.parentNode && node.parentNode !== editor) node = node.parentNode;
    return node.parentNode === editor ? node : null;
  }

  // 텍스트도 이미지도 없는 "빈 줄" 노드인지
  function isBlank(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim() === '';
    if (node.nodeType !== Node.ELEMENT_NODE) return true;
    if (node.tagName === 'BR') return true;
    if (node.matches('img, table, hr, iframe') || node.querySelector('img, table, hr, iframe')) {
      return false;
    }
    return node.textContent.trim() === '';
  }

  // 서명/인용문 앞쪽에서, 내용이 있는 마지막 노드 (없으면 null = 사용자 영역이 비어 있음)
  function lastContentNode(editor, boundary) {
    let node = boundary ? boundary.previousSibling : editor.lastChild;
    while (node && isBlank(node)) node = node.previousSibling;
    return node;
  }

  // 저장해 둔 커서가 아직 유효하고, 서명/인용문 안이 아닌지 확인
  function usableSavedRange(editor) {
    const range = savedRanges.get(editor);
    if (!range) return null;
    const c = range.commonAncestorContainer;
    if (!c.isConnected || !editor.contains(c)) return null;
    const el = c.nodeType === Node.ELEMENT_NODE ? c : c.parentElement;
    if (el && el !== editor && el.closest(BOUNDARY_SELECTOR)) return null;
    return range;
  }

  function selectRange(range) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // ---------------------------------------------------------
  // 텍스트 삽입
  //
  // Gmail 은 Trusted Types 보안 정책을 써서 innerHTML / insertHTML 같은
  // "HTML 문자열" 삽입을 막습니다. 그래서
  //   · 줄 내용   → execCommand('insertText')
  //   · 줄바꿈 \n → execCommand('insertParagraph')  (Gmail 과 같은 <div> 문단 생성)
  // 으로 "실제로 타이핑한 것처럼" 입력합니다. 이 방식은 Gmail 에디터가
  // 그대로 인식하고, Ctrl+Z 되돌리기도 됩니다.
  // execCommand 가 실패하는 환경에서는 <br> 노드를 직접 만들어 넣는 방식으로 대체합니다.
  // ---------------------------------------------------------
  function insertTemplate(editor, body) {
    if (!editor.isConnected) return;

    const lines = String(body).replace(/\r\n?/g, '\n').split('\n');
    const mode = state.settings.insertMode || 'cursor';
    const boundary = findBoundary(editor);
    const lastNode = lastContentNode(editor, boundary);

    // 에디터에 포커스 (스크롤 튐 방지)
    editor.focus({ preventScroll: true });

    if (mode === 'replace' || !lastNode) {
      // ── 덮어쓰기 (또는 본문이 비어 있을 때) ──
      // 서명/인용문은 남기고, 그 앞의 사용자 영역만 지운 뒤 새로 입력
      clearUserArea(editor, boundary);
      typeLines(editor, lines);
    } else if (mode === 'cursor' && usableSavedRange(editor)) {
      // ── 커서 위치 (선택 영역이 있으면 그 부분을 대체) ──
      selectRange(usableSavedRange(editor));
      if (!window.getSelection().isCollapsed) document.execCommand('delete');
      typeLines(editor, lines);
    } else {
      // ── 본문 끝 (서명/인용문 바로 앞) ──
      // 마지막 내용 줄 끝에 커서를 두고, 빈 줄 하나를 띄운 뒤 입력
      const range = document.createRange();
      if (lastNode.nodeType === Node.TEXT_NODE) {
        range.setStart(lastNode, lastNode.length);
      } else if (lastNode.matches('img, hr, br')) {
        range.setStartAfter(lastNode);
      } else {
        range.selectNodeContents(lastNode);
        range.collapse(false);
      }
      range.collapse(true);
      selectRange(range);
      typeLines(editor, ['', '', ...lines]);
    }

    // Gmail 초안 자동 저장이 변경을 감지하도록 이벤트 발생
    editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 서명/인용문 앞까지의 내용을 지우고, 빈 문단 하나에 커서를 둠
  function clearUserArea(editor, boundary) {
    const range = document.createRange();
    range.setStart(editor, 0);
    if (boundary) range.setEndBefore(boundary);
    else range.setEnd(editor, editor.childNodes.length);
    range.deleteContents();

    // 새 내용이 들어갈 빈 줄
    const line = document.createElement('div');
    line.append(document.createElement('br'));

    if (boundary) {
      // 서명과 붙지 않도록 빈 줄 하나를 사이에 둠
      const gap = document.createElement('div');
      gap.append(document.createElement('br'));
      editor.insertBefore(line, boundary);
      editor.insertBefore(gap, boundary);
    } else {
      editor.append(line);
    }

    const caret = document.createRange();
    caret.setStart(line, 0);
    caret.collapse(true);
    selectRange(caret);
  }

  // 줄 배열을 현재 커서 위치에 "타이핑"
  function typeLines(editor, lines) {
    for (let i = 0; i < lines.length; i++) {
      if (i > 0 && !document.execCommand('insertParagraph')) {
        return manualInsert(editor, lines.slice(i), true);
      }
      if (lines[i] && !document.execCommand('insertText', false, lines[i])) {
        return manualInsert(editor, [lines[i], ...lines.slice(i + 1)], false);
      }
    }
  }

  // execCommand 를 쓸 수 없을 때의 대체 방식: 텍스트 노드 + <br> 를 직접 삽입
  function manualInsert(editor, lines, leadingBreak) {
    const sel = window.getSelection();
    let range = sel.rangeCount ? sel.getRangeAt(0) : null;
    if (!range || !editor.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    const frag = document.createDocumentFragment();
    lines.forEach((line, i) => {
      if (i > 0 || leadingBreak) frag.append(document.createElement('br'));
      if (line) frag.append(document.createTextNode(line));
    });
    const last = frag.lastChild;

    range.deleteContents();
    range.insertNode(frag);

    if (last) {
      const caret = document.createRange();
      caret.setStartAfter(last);
      caret.collapse(true);
      selectRange(caret);
    }
  }

  // ---------------------------------------------------------
  // 시작
  // ---------------------------------------------------------
  (async () => {
    LOG('로드됨 — 답장/전달/편지쓰기 창을 열면 본문 위에 버튼 바가 나타납니다.');
    await loadData();
    listenStorage();
    startObserver();
  })();
})();
