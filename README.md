\# TikTok Bulk Unfollower



Short: A small Chrome/Edge extension that automates unfollowing from the TikTok Follow modal. Features include batch unfollowing, configurable delay, random jitter, and verification attempts.



Important: Automation can trigger rate limits or temporary blocks. Start with small batches and long delays when testing. This repository contains source code for a Manifest V3 extension.



\## Repository contents

\- `manifest.json` — extension manifest (MV3)

\- `popup.html`, `popup.css`, `popup.js` — UI

\- `content\_script.js` — unfollow logic

\- `background.js` — messaging bridge

\- `icons/` — icon files (16, 48, 128)

\- `LICENSE` — MIT license

\- `README.md` — this file



\## Quick install (for technical users)

1\. Download the repository ZIP or clone it:

&nbsp;  - ZIP: \*\*Code → Download ZIP\*\*

&nbsp;  - Git: `git clone https://github.com/<your-user>/<repo>.git`

2\. Open Chrome and go to `chrome://extensions`

3\. Enable \*\*Developer mode\*\* (top right)

4\. Click \*\*Load unpacked\*\* and select the folder that contains `manifest.json`

5\. Open TikTok, open the Follow modal, open the extension popup and test  

&nbsp;  Recommended test settings: Batch = 1, Delay = 1000–3000 ms, Randomize ON.



\## Packaging a release

1\. Update the `version` field in `manifest.json`.

2\. Create a ZIP of the project folder (exclude `.git` and dev artifacts).

3\. Create a GitHub Release and upload the ZIP as an asset.



\## Troubleshooting

\- Popup shows nothing / controls blocked: open the popup → right click → Inspect → Console and check for errors.

\- Frequent 403 CSRF errors: increase `delay`, enable `randomize`, keep the TikTok tab focused.

\- Unfollows not happening: ensure the Follow modal is open and buttons are visible.



\## Privacy \& security

\- This extension requires `scripting`, `activeTab`, `storage` and host permissions for `\*.tiktok.com`.

\- By default, no user data is sent to external servers. If you modify the extension to collect or transmit data, document it clearly and provide a privacy policy.

\- Use responsibly. Automating interactions with third-party services may violate their terms of service.



\## License

MIT — see `LICENSE` file.



\## Support

Support / contact: ammoknoxx@protonmail.com

