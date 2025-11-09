# TikTok Bulk Unfollower (v1.3337)

**Author:** AMMOKNOXX  
**Description:** A futuristic-styled browser extension to selectively unfollow TikTok accounts you follow. All actions are visible, confirmed, and controlled — no hidden mass automation.

---

## 🚀 Features

- Load your "Following" list directly from the TikTok page.
- Select amount of accounts you want to unfollow.
- Configure batch size and delay for safer execution.
- Start the unfollow process with an explicit confirmation code ("UNFOLLOW").
- Progress indicators and live log inside the popup.
- Local storage for settings; whitelist/blacklist planned.

---

## 🛠 Installation (Chrome / Edge)

1. Download or create the project folder `tiktok-bulk-unfollower`.
2. Open your browser and go to `chrome://extensions` or `edge://extensions`.
3. Enable Developer mode (top right).
4. Click "Load unpacked" and select the project folder.
5. Open TikTok and navigate to your "Following" list (profile → Following).
6. Open the extension popup.
7. Select amount of accounts, configure batch size & delay, then click **Start Unfollow**.

---

## ⚙ File Structure
tiktok-bulk-unfollower/ ├── manifest.json ├── popup.html ├── popup.css ├── popup.js ├── content.js ├── background.js ├── README.md └── icons/ ├── icon16.png ├── icon48.png └── icon128.png


---

## 🧠 Notes & Safety

- All unfollow actions are visible and require user confirmation.
- The extension intentionally avoids invisible mass-scripting to reduce risk of violating platform rules.
- TikTok can change DOM class names and structure; if "Load Followed" finds no entries, update selectors in `content.js`.
- No telemetry or external data transfer; everything is stored locally.
- Whitelist/blacklist support is planned for future versions.

---

## 🧪 Development & Where to Edit

- Popup UI: `popup.html`, `popup.css`, `popup.js`
- Page scanning and action logic: `content.js`
- Background tasks and future scheduling: `background.js`
- Permissions and manifest: `manifest.json`

---

## 🛠 Troubleshooting

- If the popup shows no accounts, ensure you are on the TikTok "Following" page.
- Reload the extension in Developer mode.
- Open DevTools on the TikTok tab to inspect DOM and check for buttons or iframes.

---

## 💬 Support

If you encounter issues (no entries found, button not located, or DOM changed), paste one item's outer HTML from the Elements panel.
