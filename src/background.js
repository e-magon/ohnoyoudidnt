/*
 * Oh no you didn't!
 * Automatically reload crashed ("aw, snap") and disconnected (with the dino game) tabs
 */

const errorMessages = ["The frame was removed.", "The tab was closed."];
const networkErrorMessages = ["net::ERR_INTERNET_DISCONNECTED"];
const tabCheckInterval = 1000; // ms
const disconnectRetryInterval = 1000; // ms

function reloadCrashedTabs(tabs) {
  for (const tab of tabs) {
    if (tab.status !== "unloaded") {
      continue;
    }

    chrome.tabs.executeScript(tab.id, { code: "null;" }, (result) => {
      if (
        result === undefined &&
        typeof chrome.runtime.lastError === "object" &&
        errorMessages.includes(chrome.runtime.lastError.message)
      ) {
        console.info(
          `Reloading crashed tab (ID: ${tab.id}, Title: "${tab.title}")`
        );

        chrome.tabs.reload(tab.id);
      }
    });
  }
}

chrome.webNavigation.onErrorOccurred.addListener(async (details) => {
  if (networkErrorMessages.includes(details.error)) {
    setTimeout(() => {
      chrome.tabs.reload(details.tabId);
    }, disconnectRetryInterval);
  }
})
setInterval(() => {
  // console.log("Checking tabs...");
  chrome.tabs.query({}, reloadCrashedTabs);
}, tabCheckInterval);
