document.addEventListener('DOMContentLoaded', function() {
  const toggleCheckbox = document.getElementById('transformToggle');
  const statusEl = document.getElementById('status');
  
  console.log('Popup initialized');
  
  // Load saved state
  chrome.storage.sync.get('enabled', function(data) {
    toggleCheckbox.checked = data.enabled || false;
    updateStatus(data.enabled || false);
    console.log('Loaded state:', data.enabled ? 'enabled' : 'disabled');
  });
  
  // Handle toggle changes
  toggleCheckbox.addEventListener('change', function() {
    const isEnabled = toggleCheckbox.checked;
    console.log('Toggle changed to:', isEnabled ? 'enabled' : 'disabled');
    
    // Save state
    chrome.storage.sync.set({enabled: isEnabled}, function() {
      updateStatus(isEnabled);
      console.log('State saved');
      
      // Send message to active tabs
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length > 0) {
          const activeTab = tabs[0];
          console.log('Active tab:', activeTab.url);
          
          if (activeTab.url && activeTab.url.includes('app.glean.com/search')) {
            console.log('Sending message to tab:', activeTab.id);
            
            chrome.tabs.sendMessage(
              activeTab.id, 
              {action: "toggleTransform", enabled: isEnabled},
              response => {
                if (chrome.runtime.lastError) {
                  console.error('Error sending message:', chrome.runtime.lastError);
                } else {
                  console.log('Message response:', response);
                }
              }
            );
          } else {
            console.log('Tab not on Glean search page');
            statusEl.textContent = isEnabled ? 
              'Status: Active (Navigate to Glean search)' : 
              'Status: Inactive';
          }
        } else {
          console.log('No active tab found');
        }
      });
    });
  });
  
  function updateStatus(isEnabled) {
    statusEl.textContent = `Status: ${isEnabled ? 'Active' : 'Inactive'}`;
  }
});