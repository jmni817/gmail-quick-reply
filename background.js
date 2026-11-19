// =============================================================
// 백그라운드 서비스 워커
//  1) 최초 설치 시 기본 샘플 버튼 4개를 저장
//  2) Gmail 버튼 바의 ⚙ 버튼 → 설정 화면(탭) 열기
// =============================================================
importScripts('defaults.js');

chrome.runtime.onInstalled.addListener(async () => {
  const K = GQR_STORAGE_KEYS;
  const saved = await chrome.storage.local.get([K.templates, K.settings]);
  const patch = {};

  // 이미 저장된 값이 있으면 건드리지 않음 (업데이트 시 사용자 데이터 보존)
  if (!Array.isArray(saved[K.templates])) patch[K.templates] = GQR_DEFAULT_TEMPLATES;
  if (!saved[K.settings]) patch[K.settings] = GQR_DEFAULT_SETTINGS;

  if (Object.keys(patch).length > 0) {
    await chrome.storage.local.set(patch);
  }
});

// content.js 는 옵션 페이지를 직접 열 수 없어서 메시지로 요청합니다.
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === 'gqr:openOptions') {
    chrome.runtime.openOptionsPage();
  }
});
