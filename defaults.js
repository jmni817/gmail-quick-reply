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
    label: '기획안',
    body:
      '안녕하세요.\n\n' +
      '요청하신 기획안을 첨부드립니다.\n' +
      '검토 후 의견 주시면 반영하겠습니다.\n\n' +
      '감사합니다.',
  },
  {
    id: 'default-draft',
    label: '초안',
    body:
      '안녕하세요.\n\n' +
      '1차 초안 공유드립니다.\n' +
      '아직 확정 전이라 수정될 수 있는 점 참고 부탁드립니다.\n' +
      '편하실 때 피드백 주세요.\n\n' +
      '감사합니다.',
  },
  {
    id: 'default-final',
    label: '최종본',
    body:
      '안녕하세요.\n\n' +
      '말씀하신 내용 반영하여 최종본 전달드립니다.\n' +
      '추가로 확인이 필요한 부분이 있으면 언제든 말씀해 주세요.\n\n' +
      '감사합니다.',
  },
  {
    id: 'default-shipping',
    label: '배송정보',
    body:
      '안녕하세요.\n\n' +
      '주문하신 상품의 배송 정보 안내드립니다.\n\n' +
      '- 택배사: \n' +
      '- 운송장 번호: \n' +
      '- 발송일: \n\n' +
      '배송 조회는 택배사 홈페이지에서 가능합니다.\n' +
      '감사합니다.',
  },
];

// 기본 설정: 커서 위치에 삽입 (커서가 없으면 본문 끝)
const GQR_DEFAULT_SETTINGS = {
  insertMode: 'cursor',
};
