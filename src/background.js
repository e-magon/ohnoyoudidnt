/*
 * Oh no you didn't!
 * Automatically reload crashed ("aw, snap") and disconnected (with the dino game) tabs
 */

const errorMessages = ["The frame was removed.", "The tab was closed."];
const networkErrorMessages = ["net::ERR_INTERNET_DISCONNECTED"];
const tabCheckInterval = 1000; // ms
const disconnectRetryInterval = 5000; // ms

/**
 * Handling of crashed tabs
 * @param tabs
 */
function reloadCrashedTabs(tabs) {
  for (const tab of tabs) {
    if (tab.status !== "unloaded") {
      continue;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (
          typeof chrome.runtime.lastError === "object" &&
          errorMessages.includes(chrome.runtime.lastError.message)
        ) {
          console.info(
            `Reloading crashed tab (ID: ${tab.id}, Title: "${tab.title}")`
          );

          chrome.tabs.reload(tab.id);
        }
      }
    })
  }
}

/**
 * Handling of network disconnection errors
 */
chrome.webNavigation.onErrorOccurred.addListener(async (details) => {
  if (networkErrorMessages.includes(details.error)) {
    setTimeout(() => {
      console.info(
        `Reloading disconnected tab (ID: ${details.tabId}")`
      );
      chrome.tabs.reload(details.tabId);
    }, disconnectRetryInterval);
  }
})

/*
 * The handling of crashed tabs has been disabled because it seems like Chrome won't allow
 * executing a function over a crashed tab (with the error: frame with id 0 is not ready)
 */
// setInterval(() => {
//   // console.log("Checking tabs...");
//   chrome.tabs.query({}, reloadCrashedTabs);
// }, tabCheckInterval);
