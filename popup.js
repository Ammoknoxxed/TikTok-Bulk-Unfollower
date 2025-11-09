// popup.js - injects content_script.js into the active tab before sending commands

const $ = id => document.getElementById(id);
const statusEl = $('status');
let running = false;

function setStatus(text){
  if (statusEl) statusEl.textContent = text;
}

function getFormData(){
  return {
    delay: Math.max(0, parseInt($('delay').value || 500)),
    batchSize: Math.max(1, parseInt($('batchSize').value || 3)),
    maxTotal: Math.max(0, parseInt($('maxTotal').value || 0)),
    verifyAttempts: Math.max(1, parseInt($('verifyAttempts').value || 3))
  };
}

function ensureContentScriptInjected(tabId){
  return new Promise((resolve, reject) => {
    try {
      chrome.scripting.executeScript(
        { target: { tabId }, files: ['content_script.js'] },
        (results) => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(new Error(err.message));
            return;
          }
          resolve();
        }
      );
    } catch (e){
      reject(e);
    }
  });
}

function sendCommandToTab(tabId, payload){
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, payload, (resp) => {
      const err = chrome.runtime.lastError;
      if (err) {
        resolve({ ok: false, error: err.message });
      } else {
        resolve(resp || { ok: false, error: 'No response' });
      }
    });
  });
}

$('start').addEventListener('click', async () => {
  if (running) return;
  running = true;
  setStatus('Preparing: retrieving active tab...');
  try {
    const tabs = await new Promise((res) => chrome.tabs.query({active: true, currentWindow: true}, res));
    if (!tabs || tabs.length === 0) {
      setStatus('Error: no active tab found');
      running = false;
      return;
    }
    const tab = tabs[0];
    setStatus('Injecting content script into active tab...');
    try {
      await ensureContentScriptInjected(tab.id);
      setStatus('Content script injected. Sending start command...');
    } catch (injErr) {
      setStatus('Injection failed: ' + (injErr.message || injErr));
      running = false;
      return;
    }

    const payload = { action: 'start', params: getFormData() };
    const resp = await sendCommandToTab(tab.id, payload);
    if (resp?.ok) {
      setStatus('Started. ' + (resp.message || 'Working on the page.'));
    } else {
      setStatus('Start error: ' + (resp?.error || 'No response from content script.'));
    }

  } catch (e) {
    setStatus('Unexpected error: ' + (e && e.message ? e.message : e));
  } finally {
    running = false;
  }
});

$('stop').addEventListener('click', async () => {
  setStatus('Sending stop command...');
  try {
    const tabs = await new Promise((res) => chrome.tabs.query({active: true, currentWindow: true}, res));
    if (!tabs || tabs.length === 0) {
      setStatus('Error: no active tab found');
      return;
    }
    const resp = await sendCommandToTab(tabs[0].id, { action: 'stop' });
    setStatus(resp?.ok ? 'Stopped.' : 'Stop sent (no or invalid response).');
  } catch (e) {
    setStatus('Error sending stop: ' + (e && e.message ? e.message : e));
  }
});

// Receive runtime status messages from content script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.from === 'content-status') {
    setStatus(msg.text);
  }
});