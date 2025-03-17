chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ enabled: false });
});


// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('app.glean.com/search')) {
    chrome.storage.sync.get('enabled', function(data) {
      if (data.enabled) {
        chrome.tabs.sendMessage(tabId, { 
          action: "toggleTransform", 
          enabled: true 
        });
      }
    });
  }
});