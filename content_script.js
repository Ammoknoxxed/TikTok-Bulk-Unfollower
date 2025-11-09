// content_script.js - targets the Follow modal (data-e2e="follow-info-popup")
// Finds only button[data-e2e="follow-button"] inside the modal and avoids clicking links or avatars.
// Scrolls the modal to load more entries and verifies unfollow success.

let controller = {
  running: false,
  params: null,
  unfollowedCount: 0,
  attempted: 0,
  cachedButtons: new Set()
};

function postStatus(text){
  try { chrome.runtime.sendMessage({from: "content-status", text}); } catch(e){}
}
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

function getModalContainer(){
  return document.querySelector('[data-e2e="follow-info-popup"]');
}

function isInsideLink(el){
  let p = el;
  while (p && p !== document.body){
    if (p.tagName && (p.tagName.toLowerCase() === 'a' || p.getAttribute && p.getAttribute('role') === 'link')) return true;
    p = p.parentElement;
  }
  return false;
}

function findFollowButtons(){
  const modal = getModalContainer();
  if (!modal) return [];
  const buttons = Array.from(modal.querySelectorAll('button[data-e2e="follow-button"]'));
  const markers = ["Gefolgt","Following","Followed","Freund*innen","Abonniert","Follow"];
  return buttons.filter(b => {
    if (!b || !(b instanceof HTMLElement)) return false;
    if (!b.offsetParent) return false;
    if (isInsideLink(b)) return false;
    const txt = (b.innerText || b.textContent || "").trim();
    if (!txt || txt.length < 2) return false;
    const low = txt.toLowerCase();
    return markers.some(m => low.includes(m.toLowerCase()));
  });
}

function findAndConfirmDialog(){
  const allVisibleButtons = Array.from(document.querySelectorAll('button')).filter(b=>b.offsetParent);
  const confirmRegex = /\b(unfollow|entfolg|confirm|bestätig|yes|ja|ok|confirmar)\b/i;
  for (const b of allVisibleButtons){
    const t = (b.innerText||"").trim();
    if (!t) continue;
    if (confirmRegex.test(t)) {
      try { b.click(); return true; } catch(e){}
    }
  }
  return false;
}

async function unfollowButton(button, params){
  controller.attempted++;
  try {
    if (!button || !(button instanceof HTMLElement)) return false;
    if (!document.body.contains(button)) return false;
    if (isInsideLink(button)) {
      postStatus('Skipped: button inside a link');
      return false;
    }

    button.scrollIntoView({behavior:'auto',block:'center'});
    await sleep(120);

    try {
      button.dispatchEvent(new MouseEvent('pointerdown', {bubbles:true}));
      button.dispatchEvent(new MouseEvent('pointerup', {bubbles:true}));
      button.dispatchEvent(new MouseEvent('click', {bubbles:true}));
    } catch(e){
      try { button.click(); } catch(e){}
    }
    await sleep(250);

    findAndConfirmDialog();
    await sleep(300);

    for (let i=0;i<params.verifyAttempts;i++){
      await sleep(params.delay || 500);
      if (!document.body.contains(button)){
        controller.unfollowedCount++;
        postStatus(`Success (unfollowed): ${controller.unfollowedCount} / attempts: ${controller.attempted}`);
        return true;
      }
      const txt = (button.innerText || button.textContent || "").trim().toLowerCase();
      if (/follow\b|folgen|abonnieren|subscribe/i.test(txt) && !/gef|friend|following/i.test(txt)) {
        controller.unfollowedCount++;
        postStatus(`Success (unfollowed): ${controller.unfollowedCount} / attempts: ${controller.attempted}`);
        return true;
      }
      const stillMarked = /gef|following|followed|freund|abonniert/i.test(txt);
      if (!stillMarked) {
        controller.unfollowedCount++;
        postStatus(`Success (likely): ${controller.unfollowedCount} / attempts: ${controller.attempted}`);
        return true;
      }
    }

    postStatus(`Verification failed for an account (total attempts: ${controller.attempted})`);
    return false;

  } catch (err){
    console.error("unfollow error", err);
    postStatus("Error while unfollowing: " + (err && err.message ? err.message : err));
    return false;
  }
}

async function runUnfollow(params){
  controller.running = true;
  controller.params = params;
  controller.unfollowedCount = 0;
  controller.attempted = 0;
  controller.cachedButtons.clear();
  postStatus("Started. Scanning modal for follow buttons...");

  await sleep(300);

  while (controller.running) {
    let buttons = findFollowButtons();
    if (!buttons || buttons.length === 0) {
      postStatus(`No follow-buttons found in the modal. Scroll inside the modal to load more entries.\nUnfollowed: ${controller.unfollowedCount}`);
      break;
    }

    if (params.maxTotal > 0) {
      const remaining = params.maxTotal - controller.unfollowedCount;
      if (remaining <= 0) {
        postStatus(`Reached max total ${params.maxTotal}. Stopping.`);
        break;
      }
      buttons = buttons.slice(0, remaining);
    }

    const batch = [];
    for (const b of buttons) {
      if (batch.length >= params.batchSize) break;
      if (controller.cachedButtons.has(b)) continue;
      batch.push(b);
      controller.cachedButtons.add(b);
    }

    if (batch.length === 0) {
      const modal = getModalContainer();
      if (modal) modal.scrollBy({top: 350, behavior: 'smooth'});
      await sleep(700);
      controller.cachedButtons.clear();
      continue;
    }

    for (const btn of batch) {
      if (!controller.running) break;
      await unfollowButton(btn, params);
      await sleep(params.delay);
    }

    await sleep(Math.max(200, params.delay));
    const modal = getModalContainer();
    if (modal) modal.scrollBy({top: 300, behavior: 'smooth'});
    await sleep(600);
  }

  controller.running = false;
  postStatus(`Stopped. Unfollowed: ${controller.unfollowedCount}, Attempted: ${controller.attempted}`);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const action = msg?.action;
  if (!action) return;
  if (action === 'start') {
    if (controller.running) {
      sendResponse({ok: false, error: "Already running"});
      return;
    }
    const params = msg.params || {delay:500, batchSize:3, maxTotal:0, verifyAttempts:3};
    params.delay = Number(params.delay) || 500;
    params.batchSize = Math.max(1, Number(params.batchSize) || 3);
    params.maxTotal = Math.max(0, Number(params.maxTotal) || 0);
    params.verifyAttempts = Math.max(1, Number(params.verifyAttempts) || 3);

    runUnfollow(params).catch(e=>{
      console.error("runner error", e);
      postStatus("Runner crashed: " + (e && e.message ? e.message : e));
    });

    sendResponse({ok: true, message: "Runner started"});
  } else if (action === 'stop') {
    controller.running = false;
    sendResponse({ok: true});
  } else {
    sendResponse({ok:false, error:"unknown action"});
  }
});