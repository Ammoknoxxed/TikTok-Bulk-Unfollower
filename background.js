// background service worker: relay messages from popup to content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.to === "content") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (!tabs || tabs.length === 0) {
        sendResponse({ok: false, error: "No active tab"});
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, msg.payload, (resp) => {
        sendResponse(resp || {ok: false, error: "no response from content script"});
      });
    });
    return true; // async response
  }
});