<p align="center"><img src="icons/icon128.png" alt="gmail-quick-reply icon" width="128"></p>

<h1 align="center">💌 gmail-quick-reply</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-%ED%99%95%EC%9E%A5%20%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%A8-D36279?logo=googlechrome&logoColor=white" alt="Chrome 확장 프로그램">
  <img src="https://img.shields.io/badge/Manifest-V3-EC5564" alt="Manifest V3">
  <a href="https://github.com/jmni817/gmail-quick-reply/commits/main"><img src="https://img.shields.io/github/last-commit/jmni817/gmail-quick-reply?label=%EB%A7%88%EC%A7%80%EB%A7%89%20%EC%97%85%EB%8D%B0%EC%9D%B4%ED%8A%B8&color=F08BAA" alt="마지막 업데이트"></a>
  <a href="https://github.com/jmni817/gmail-quick-reply/releases/latest"><img src="https://img.shields.io/github/downloads/jmni817/gmail-quick-reply/total?label=%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C&color=F4A7B9" alt="다운로드 수"></a>
</p>

<p align="center">
  <b>"매번 똑같이 쓰던 답장, 이제 버튼 한 번으로 끝!"</b><br>
  One-click reply templates, right above your Gmail compose box.
</p>

<p align="center">
  <a href="https://github.com/jmni817/gmail-quick-reply/releases/latest/download/gmail-quick-reply.zip"><b>📦 최신 버전 다운로드 (zip)</b></a>
  &nbsp;·&nbsp;
  <a href="#-시작하기-설치"><b>💌 설치 방법 바로가기</b></a>
</p>

---

> <img src="assets/labels/important.svg" alt="중요" height="36">
>
> **메일을 자동으로 보내지 않습니다.**
> 버튼을 누르면 작성 중인 본문에 초안 문구를 **입력만** 합니다.
> 내용 확인과 발송은 사용자가 직접 합니다.

> <img src="assets/labels/note.svg" alt="참고" height="36">
>
> **등록한 초안은 내 PC의 Chrome 안에만 저장됩니다.**
> 외부 서버로 보내지 않고, 이 저장소에도 올라가지 않습니다.

<br>

## 🎀 목차

1. [무엇을 해주나요?](#-무엇을-해주나요)
2. [시작하기 (설치)](#-시작하기-설치)
3. [버튼 관리하기](#-버튼-관리하기)
4. [동작 방식과 한계](#-동작-방식과-한계)
5. [보안 · 개인정보](#-보안--개인정보)
6. [프로젝트 구조](#-프로젝트-구조)
7. [함께 쓰면 좋은 프로그램](#-함께-쓰면-좋은-프로그램)

<br>

---

## 🍓 무엇을 해주나요?

Gmail 답장 · 전달 · 새 메일 작성 창의 본문 바로 위에 **답변 버튼 바**를 띄우고,
클릭 한 번으로 미리 저장해 둔 답변 초안을 본문에 넣어 줍니다.

### ① 작성 창마다 버튼 바

답장 · 전달 · 편지쓰기 창을 열면 본문 위에 버튼 바가 자동으로 붙습니다.
창을 닫았다 다시 열어도, 여러 창을 동시에 열어도 창마다 하나씩만 붙습니다.

### ② 클릭 한 번으로 입력

| 삽입 방식 | 동작 |
|---|---|
| **커서 위치** (기본) | 마지막으로 본문에 있던 커서 위치에 넣습니다. 선택한 글자가 있으면 그 부분을 바꿉니다. 커서 기록이 없으면 본문 끝에 넣습니다. |
| **본문 끝** | 작성한 내용 끝에 빈 줄 하나를 띄우고 이어 붙입니다. |
| **덮어쓰기** | 작성한 내용을 지우고 초안으로 바꿉니다. |

줄바꿈도 그대로 들어가고, **Ctrl+Z**로 되돌릴 수 있습니다.

### ③ 서명 · 인용문은 그대로

어떤 방식이든 **서명과 인용된 이전 메일은 건드리지 않고** 그 앞에 넣습니다.
본문이 비어 있으면 방식과 상관없이 맨 위에 넣습니다.

<br>

---

## 💌 시작하기 (설치)

1. **[최신 버전 zip 다운로드](https://github.com/jmni817/gmail-quick-reply/releases/latest/download/gmail-quick-reply.zip)** 후 원하는 곳에 압축을 풉니다.
   (지난 버전과 변경 내역은 [Releases](https://github.com/jmni817/gmail-quick-reply/releases) 페이지에 있습니다. 코드를 직접 고치고 싶다면 `git clone`도 됩니다.)
2. Chrome 주소창에 `chrome://extensions` 입력
3. 오른쪽 위 **개발자 모드** 켜기
4. **압축해제된 확장 프로그램을 로드합니다** 클릭 → `manifest.json`이 들어 있는 폴더 선택
5. 이미 열려 있던 Gmail 탭은 **새로고침(F5)**
6. 답장 · 전달 · 편지쓰기를 누르면 본문 위에 버튼 바가 나타납니다

> <img src="assets/labels/warning.svg" alt="주의" height="36">
>
> **설치한 폴더를 옮기거나 이름을 바꾸지 마세요.**
> 압축해제 방식으로 설치한 확장은 폴더 경로가 바뀌면 새 확장으로 인식되어, 등록해 둔 초안이 보이지 않게 됩니다.

### 알아두면 좋은 기능

- **🍒 업데이트 적용**
  새 버전이 나오면 zip을 받아 **기존 폴더에 덮어쓰기** 하세요. (폴더 경로가 같아야 초안이 유지됩니다.)
  코드를 받거나 고친 뒤에는 `chrome://extensions`에서 이 확장의 🔄 버튼을 누르고, Gmail 탭도 새로고침하세요.

- **🧁 툴바에 고정**
  주소창 오른쪽 퍼즐 🧩 아이콘 → 📌를 누르면 딸기 종이비행기 아이콘이 툴바에 고정됩니다.

### 이럴 땐 이렇게

- **버튼 바가 안 보여요**
  확장을 설치하거나 🔄 한 뒤 Gmail 탭을 **새로고침(F5)** 했는지 확인하세요.
  그래도 안 보이면 Gmail에서 **F12 → Console**을 열고 `빠른 답변`으로 검색해 보세요.
  `로드됨`만 있고 `버튼 바를 붙였습니다`가 없다면 Issue로 알려 주세요.

- **버튼을 눌러도 입력이 안 돼요**
  콘솔에 `[Gmail 빠른 답변] 입력 중 오류`가 있는지 확인해 주세요. 오류 내용과 함께 Issue로 남겨 주시면 빠르게 고칠 수 있습니다.

<br>

---

## 🌷 버튼 관리하기

툴바의 확장 아이콘을 누르면(팝업), 또는 버튼 바 오른쪽 끝 ⚙를 누르면(새 탭) 관리 화면이 열립니다.

- 목록에는 **버튼 이름만** 보이고, **편집**을 누른 버튼만 이름 · 본문 편집 칸이 펼쳐집니다. (한 번에 하나)
- 이름에 마우스를 올리면 본문 미리보기가 보입니다.
- ↑ ↓로 순서를 바꾸고, 편집 칸 안의 **이 버튼 삭제**로 지웁니다. (두 번 눌러야 삭제)
- 고친 내용은 **자동 저장**되고, 열려 있는 Gmail 버튼 바에도 바로 반영됩니다.
- 맨 위 **삽입 방식**에서 커서 위치 / 본문 끝 / 덮어쓰기를 고릅니다.
- **기본값 복원**을 누르면 예시 버튼 1개만 있는 처음 상태로 돌아갑니다.

> <img src="assets/labels/tip.svg" alt="팁" height="36">
>
> 처음 설치하면 **예시** 버튼 1개가 들어 있습니다.
> 자주 쓰는 답장(기획안 전달, 배송 안내, 일정 확인 등)을 버튼으로 만들어 두세요.

<br>

---

## 📌 동작 방식과 한계

- **에디터 탐색**: Gmail은 내부 클래스명을 자주 바꾸기 때문에, 난독화된 클래스명 대신
  `g_editable="true"` 속성 또는 `role="textbox"` + `aria-label`에 "본문" / "body"가 들어간 요소로 본문을 찾습니다.
  (한국어 "메시지 본문", 영어 "Message Body" 모두 해당)
- **중복 방지 · 재오픈 대응**: `MutationObserver`가 화면 변화를 150ms 단위로 모아 확인하고,
  본문 ↔ 버튼 바를 `WeakMap`으로 연결해 이미 붙어 있으면 건너뜁니다. 창이 닫히면 버튼 바도 함께 지웁니다.
- **겹침 방지 배치**: 버튼 바가 본문보다 화면상 완전히 위에 있는지 좌표로 확인하고, 겹치거나 옆에 붙으면 바깥 요소 앞으로 옮깁니다.
  글을 입력해 본문 크기가 바뀔 때마다(`ResizeObserver`) 다시 확인합니다.
- **입력 방식**: Gmail은 Trusted Types 정책 때문에 `innerHTML` · `insertHTML` 같은 HTML 문자열 삽입을 막습니다.
  그래서 줄 내용은 `execCommand('insertText')`, 줄바꿈은 `execCommand('insertParagraph')`로 "타이핑하듯" 넣고,
  실패하면 텍스트 노드와 `<br>`을 직접 만들어 넣습니다. 끝나면 `input` / `change` 이벤트로 Gmail 초안 자동 저장과 맞춥니다.
- **클릭 처리 · 포커스 유지**: Gmail이 작성 창 안의 마우스 이벤트를 가로채는 경우가 있어, 클릭은 `window` 캡처 단계에서 가장 먼저 받아 처리합니다.
  `mousedown` 기본 동작을 막아 클릭해도 커서가 본문에서 빠지지 않고, 버튼은 모두 `type="button"`이라 폼 제출이 일어나지 않습니다.

**알아둘 점**

- 지금은 **일반 텍스트**만 넣을 수 있습니다. (굵게 · 링크 같은 서식은 아직 지원하지 않음)
- Gmail 화면 구조가 크게 바뀌면 버튼 바가 안 붙을 수 있습니다. 그럴 땐 콘솔 로그와 함께 Issue로 알려 주세요.

<br>

---

## 🌹 보안 · 개인정보

- **권한은 `storage` 하나뿐입니다.** 메일을 읽어 가거나 보내지 않고, 작성 중인 본문에 문구를 넣기만 합니다.
- **네트워크 요청이 없습니다.** 등록한 초안은 외부 서버로 전송되지 않습니다.
- **초안이 저장되는 곳**: `chrome.storage.local` (내 PC의 Chrome 프로필 안)
  - 다른 PC와 동기화되지 않습니다.
  - 확장을 **삭제**하면 초안도 함께 지워집니다. (🔄 새로고침이나 업데이트로는 지워지지 않음)
- 저장소에는 `defaults.js`의 예시 문구만 들어 있습니다. 실제 정보(주소, 계좌번호, 연락처 등)는 `defaults.js`가 아니라 **관리 화면에서만** 등록하세요.

> <img src="assets/labels/caution.svg" alt="꼭 확인" height="36">
>
> 기기 간 동기화가 필요하면 `chrome.storage.local`을 `chrome.storage.sync`로 바꿀 수 있습니다.
> 다만 `sync`는 항목 하나당 **8KB 제한**이 있어 긴 템플릿 여러 개를 담기에는 빠듯합니다.

<br>

---

## 🍰 프로젝트 구조

```text
gmail-quick-reply/
├── manifest.json      # 확장 프로그램 설정 (MV3)
├── defaults.js        # 최초 설치 시 넣는 예시 버튼 1개 + 저장 키 (공용)
├── background.js      # 설치 시 기본값 저장, ⚙ 버튼 → 관리 화면(새 탭) 열기
├── content.js         # Gmail 화면에 버튼 바 주입 + 본문 입력 로직
├── styles.css         # 버튼 바 스타일 (연핑크 테마, 색상은 --gqr-* 변수)
├── popup.html         # 버튼 관리 화면 (툴바 팝업 / 옵션 페이지 공용)
├── popup.js           # 버튼 추가 · 수정 · 삭제 · 순서 변경, 자동 저장
├── icons/             # 확장 아이콘 (16 / 32 / 48 / 128px)
├── assets/labels/     # README 안내 라벨 이미지
└── LICENSE            # MIT 라이선스
```

### 💞 기여하기

버그 제보와 기능 제안은 언제나 환영합니다! Issue나 Pull Request로 남겨 주세요.
버그 제보 때는 Gmail 콘솔의 `[Gmail 빠른 답변]` 로그를 함께 적어 주시면 큰 도움이 됩니다.

<br>

---

## 💕 함께 쓰면 좋은 프로그램

- **[🍓 sip-and-sort](https://github.com/jmni817/sip-and-sort)**: 같은 제작자(jmni817)가 만든 Gmail 정리 도구입니다. 쌓인 협업 메일에 AI로 라벨을 붙이고, 답장 초안을 Gmail 임시보관함에 저장해 줍니다. (Windows exe)
- sip-and-sort로 받은편지함을 분류하고 초안을 만든 뒤, 이 확장의 버튼으로 자주 쓰는 문구를 덧붙이면 **분류부터 답장 마무리까지** Gmail 안에서 끝낼 수 있습니다.

<br>

---

## 💌 English summary

**gmail-quick-reply** is a Chrome extension (Manifest V3) that adds a bar of reply-template buttons right above the Gmail compose body (reply, forward, new message). One click inserts your saved text at the cursor, at the end, or replacing your draft, always keeping your signature and quoted thread intact. **It never sends email.**

Templates are managed in the toolbar popup and stored only in your local Chrome profile (`chrome.storage.local`), with no network requests. To install, load this folder via `chrome://extensions` → Developer mode → *Load unpacked*, then refresh Gmail.

<br>

---

## 🔖 라이선스

[MIT License](LICENSE)
자유롭게 사용·수정·배포할 수 있으며, 소프트웨어는 "있는 그대로" 제공됩니다.
버튼으로 입력한 내용의 확인과 실제 발송에 대한 책임은 사용자에게 있습니다.
