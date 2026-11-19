// =============================================================
// 공용 기본값 — background.js / content.js / popup.js 가 함께 사용합니다.
// (한 곳에서만 관리하려고 별도 파일로 분리)
// =============================================================

// chrome.storage.local 에 저장할 때 쓰는 키 이름
const GQR_STORAGE_KEYS = {
  templates: 'gqrTemplates', // [{ id, label, body }, ...]
  settings: 'gqrSettings',   // { insertMode: 'cursor' | 'end' | 'replace' }
};

// 최초 설치 시 넣어 두는 샘플 버튼 4개
const GQR_DEFAULT_TEMPLATES = [
  {
    id: 'default-plan',
    label: '예시',
    body:
      '예시 템플릿입니다.\n', +
      '마음대로 변경하고 추가해서 사용해주세요!\n',
  },
];

// 기본 설정: 커서 위치에 삽입 (커서가 없으면 본문 끝)
const GQR_DEFAULT_SETTINGS = {
  insertMode: 'cursor',
};
