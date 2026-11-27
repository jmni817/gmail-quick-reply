<p align="center"><img src="icons/icon128.png" alt="gmail-quick-reply icon" width="128"></p>

<h1 align="center">💌 gmail-quick-reply</h1>

<p align="center">
  <a href="README.md">한국어</a> · <b>English</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Extension-D36279?logo=googlechrome&logoColor=white" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/Manifest-V3-EC5564" alt="Manifest V3">
  <a href="https://github.com/eight-studio/gmail-quick-reply/commits/main"><img src="https://img.shields.io/github/last-commit/eight-studio/gmail-quick-reply?label=last%20update&color=F08BAA" alt="Last update"></a>
  <a href="https://github.com/eight-studio/gmail-quick-reply/releases/latest"><img src="https://img.shields.io/github/downloads/eight-studio/gmail-quick-reply/total?label=downloads&color=F4A7B9" alt="Downloads"></a>
</p>

<p align="center">
  <b>"The same reply you type every time, now one click away."</b><br>
  One-click reply templates, right above your Gmail compose box.
</p>

<p align="center">
  <a href="https://github.com/eight-studio/gmail-quick-reply/releases/latest/download/gmail-quick-reply.zip"><b>📦 Download the latest version (zip)</b></a>
  &nbsp;·&nbsp;
  <a href="#-getting-started-install"><b>💌 Jump to install guide</b></a>
</p>

---

> [!IMPORTANT]
> **It never sends email.**
> Clicking a button only **types** the template into the body you are writing.
> You review and send the message yourself.

> [!NOTE]
> **Your templates are stored only in Chrome on your own computer.**
> They are never sent to an external server and are never uploaded to this repository.

<br>

## 🎀 Contents

1. [What does it do?](#-what-does-it-do)
2. [Getting started (install)](#-getting-started-install)
3. [Managing buttons](#-managing-buttons)
4. [How it works and limitations](#-how-it-works-and-limitations)
5. [Security and privacy](#-security-and-privacy)
6. [Project structure](#-project-structure)
7. [Works well with](#-works-well-with)

<br>

---

## 🍓 What does it do?

It adds a **bar of reply buttons** right above the body of Gmail's reply, forward, and new-message windows.
One click puts a saved reply template into the body.

### ① A button bar on every compose window

When you open a reply, forward, or compose window, the button bar attaches above the body automatically.
Close and reopen the window, or open several at once, and each window still gets exactly one bar.

### ② Insert with one click

| Insert mode | What happens |
|---|---|
| **At cursor** (default) | Inserts at the last cursor position in the body. If text is selected, it replaces the selection. With no cursor history, it inserts at the end. |
| **At end** | Adds one blank line after what you wrote, then appends the template. |
| **Replace** | Clears what you wrote and puts the template in its place. |

Line breaks are kept, and you can undo with **Ctrl+Z**.

### ③ Signature and quoted thread stay intact

Whatever the mode, the template goes **before your signature and the quoted earlier message, without touching them**.
If the body is empty, the template goes at the top regardless of mode.

<br>

---

## 💌 Getting started (install)

1. **[Download the latest zip](https://github.com/eight-studio/gmail-quick-reply/releases/latest/download/gmail-quick-reply.zip)** and unzip it anywhere you like.
   (Older versions and release notes are on the [Releases](https://github.com/eight-studio/gmail-quick-reply/releases) page. If you want to modify the code, `git clone` works too.)
2. Type `chrome://extensions` in Chrome's address bar
3. Turn on **Developer mode** in the top-right corner
4. Click **Load unpacked** → select the folder that contains `manifest.json`
5. **Refresh (F5)** any Gmail tab that was already open
6. Click reply, forward, or compose, and the button bar appears above the body

> [!WARNING]
> **Do not move or rename the installed folder.**
> Chrome treats an unpacked extension at a new folder path as a different extension, so the templates you saved will no longer show up.

### Handy tips

- **🍒 Applying updates**
  When a new version comes out, download the zip and **overwrite the existing folder**. (The folder path must stay the same to keep your templates.)
  After downloading or editing the code, click this extension's 🔄 button in `chrome://extensions` and refresh your Gmail tab.

- **🧁 Pin it to the toolbar**
  Click the puzzle 🧩 icon to the right of the address bar → 📌 to pin the strawberry paper-plane icon to the toolbar.

### Troubleshooting

- **I don't see the button bar**
  Make sure you **refreshed (F5)** the Gmail tab after installing or clicking 🔄.
  If it still doesn't show, open **F12 → Console** in Gmail and search for `빠른 답변`.
  If you only see `로드됨` (loaded) and not `버튼 바를 붙였습니다` (bar attached), please open an Issue.

- **Clicking a button doesn't insert anything**
  Check the console for `[Gmail 빠른 답변] 입력 중 오류` (insert error). Open an Issue with the error text and it can be fixed quickly.

> [!NOTE]
> The extension's console logs and management screen are in Korean.

<br>

---

## 🌷 Managing buttons

Click the extension's toolbar icon (popup) or the ⚙ at the right end of the button bar (new tab) to open the management screen.

- The list shows **button names only**. Clicking **편집** (Edit) expands the name and body fields for that one button. (One at a time)
- Hover over a name to preview its body.
- Reorder with ↑ ↓, and delete with **이 버튼 삭제** (Delete this button) inside the edit area. (Requires two clicks)
- Changes **save automatically** and show up right away in any open Gmail button bar.
- Choose cursor / end / replace from **삽입 방식** (Insert mode) at the top.
- **기본값 복원** (Restore defaults) resets to the initial state with a single example button.

> [!TIP]
> A fresh install comes with one **예시** (Example) button.
> Turn the replies you send most often (sending a proposal, shipping details, confirming a schedule, and so on) into buttons.

<br>

---

## 📌 How it works and limitations

- **Finding the editor**: Gmail changes its internal class names often, so instead of obfuscated class names the extension looks for
  the `g_editable="true"` attribute, or an element with `role="textbox"` whose `aria-label` contains "본문" or "body".
  (This covers both Korean "메시지 본문" and English "Message Body".)
- **No duplicates, handles reopening**: A `MutationObserver` batches page changes every 150 ms, and
  a `WeakMap` links each body to its bar so an already attached bar is skipped. When a window closes, its bar is removed too.
- **Overlap-proof placement**: It checks by coordinates that the bar sits fully above the body. If they overlap or sit side by side, the bar is moved in front of an outer element.
  This check runs again whenever the body resizes as you type (`ResizeObserver`).
- **How text is inserted**: Gmail's Trusted Types policy blocks HTML string insertion such as `innerHTML` and `insertHTML`.
  So each line is "typed" with `execCommand('insertText')` and each line break with `execCommand('insertParagraph')`.
  If that fails, it builds text nodes and `<br>` elements directly. Afterwards it fires `input` / `change` events so Gmail's draft autosave picks up the change.
- **Click handling and focus**: Gmail sometimes intercepts mouse events inside the compose window, so clicks are handled first, in the `window` capture phase.
  Blocking the default `mousedown` keeps the cursor in the body, and every button is `type="button"`, so no form is submitted.

**Good to know**

- Only **plain text** can be inserted for now. (Formatting such as bold or links is not supported yet.)
- If Gmail's page structure changes significantly, the bar may stop attaching. If that happens, please open an Issue with the console log.

<br>

---

## 🌹 Security and privacy

- **The only permission is `storage`.** It does not read or send your email; it only types text into the body you are writing.
- **It makes no network requests.** Your templates are never sent to an external server.
- **Where templates are stored**: `chrome.storage.local` (inside your Chrome profile on this computer)
  - They do not sync to other computers.
  - **Removing** the extension deletes the templates too. (Reloading with 🔄 or updating does not.)
- The repository only contains the example text in `defaults.js`. Enter real information (addresses, account numbers, phone numbers, and so on) **only in the management screen**, never in `defaults.js`.

> [!CAUTION]
> If you need templates synced across devices, you can switch `chrome.storage.local` to `chrome.storage.sync`.
> However, `sync` has an **8 KB limit per item**, which is tight for several long templates.

<br>

---

## 🍰 Project structure

```text
gmail-quick-reply/
├── manifest.json      # Extension config (MV3)
├── defaults.js        # One example button on first install + storage keys (shared)
├── background.js      # Saves defaults on install, opens the management screen (new tab) from ⚙
├── content.js         # Injects the button bar into Gmail + body insertion logic
├── styles.css         # Button bar styles (light pink theme, colors in --gqr-* variables)
├── popup.html         # Management screen (shared by toolbar popup and options page)
├── popup.js           # Add, edit, delete, reorder buttons; autosave
├── icons/             # Extension icons (16 / 32 / 48 / 128px)
├── assets/labels/     # Callout label images for the Korean README
└── LICENSE            # MIT License
```

### 💞 Contributing

Bug reports and feature ideas are always welcome! Please open an Issue or a Pull Request.
For bug reports, including the `[Gmail 빠른 답변]` logs from the Gmail console helps a lot.

<br>

---

## 💕 Works well with

- **[🍓 sip-and-sort](https://github.com/eight-studio/sip-and-sort)**: A Gmail organizing tool by the same author (jmni817). It uses AI to label piled-up collaboration emails and saves reply drafts to your Gmail Drafts folder. (Windows exe)
- Sort your inbox and generate drafts with sip-and-sort, then add your frequent phrases with this extension's buttons to go **from sorting to a finished reply** without leaving Gmail.

<br>

---

## 🔖 License

[MIT License](LICENSE)
You are free to use, modify, and distribute it, and the software is provided "as is".
You are responsible for reviewing anything inserted with the buttons and for actually sending it.
