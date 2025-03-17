// Define text replacement mappings - only the 3 requested replacements
const replacements = {
  'Google Drive': 'SharePoint',
  'Drive': 'SharePoint',
  'Gmail': 'Outlook',
  'Slack': 'Microsoft Teams',
  // Added new replacements for document types
  'Google Docs': 'Word',
  'Google Slides': 'PowerPoint',
  'Google Sheets': 'Excel'
};

// Debug mode - set to true to see console logs
const DEBUG = true;

// Helper function for logging when in debug mode
function debugLog(...args) {
  if (DEBUG) {
    console.log('[Glean Transformer]', ...args);
  }
}

// Function to replace text in an element and its children
function replaceTextInElement(element) {
  if (!element) return;
  
  if (element.nodeType === Node.TEXT_NODE) {
    let newText = element.nodeValue;
    let originalText = element.nodeValue;
    
    // Apply all replacements
    for (const [original, replacement] of Object.entries(replacements)) {
      // Use case-insensitive regular expression to catch variations
      const regex = new RegExp('\\b' + original + '\\b', 'gi');
      newText = newText.replace(regex, replacement);
    }
    
    if (newText !== originalText) {
      element.nodeValue = newText;
      if (DEBUG) {
        debugLog('Replaced:', originalText, '->', newText);
      }
    }
  } else if (element.nodeType === Node.ELEMENT_NODE) {
    // Skip certain elements
    if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE' || element.tagName === 'TITLE') {
      return;
    }
    
    // Process child nodes
    Array.from(element.childNodes).forEach(child => {
      replaceTextInElement(child);
    });
  }
}

// Function to replace document type icons (Google Docs, Slides, etc.)
function replaceDocumentIcons() {
  debugLog('Replacing document type icons');
  
  // Find all document/presentation thumbnails
  const docElements = document.querySelectorAll('img[src*="vnd.google-apps.document"], img[src*="google-docs"]');
  const slideElements = document.querySelectorAll('img[src*="vnd.google-apps.presentation"], img[src*="google-slides"]');
  
  // Replace document icons
  docElements.forEach(element => {
    element.src = chrome.runtime.getURL('images/docx.svg');
    debugLog('Replaced Google Docs icon');
  });
  
  // Replace presentation icons
  slideElements.forEach(element => {
    element.src = chrome.runtime.getURL('images/pptx.svg');
    debugLog('Replaced Google Slides icon');
  });
}

// Function to replace the specific app icons in the sidebar
function replaceAppIcons() {
  debugLog('Attempting to replace app icons');
  
  // Try to find app icons in the sidebar
  try {
    // Find sidebar filter buttons
    const sidebarButtons = document.querySelectorAll('button[id^="filter-row-"]');
    debugLog(`Found ${sidebarButtons.length} sidebar filter buttons`);
    
    sidebarButtons.forEach(button => {
      const buttonId = button.id;
      debugLog('Processing button:', buttonId);
      
      // Replace Slack icon
      if (buttonId === 'filter-row-slack') {
        const slackIcon = button.querySelector('img, .iwpqfy0');
        if (slackIcon) {
          debugLog('Found Slack icon:', slackIcon);
          
          // If it's an image, replace the src
          if (slackIcon.tagName === 'IMG') {
            slackIcon.src = chrome.runtime.getURL('images/teams.svg');
            debugLog('Replaced Slack image source');
          } 
          // If it's a div with mask-image, replace the background or mask-image
          else if (slackIcon.classList.contains('iwpqfy0')) {
            slackIcon.style.maskImage = `url('${chrome.runtime.getURL('images/teams.svg')}')`;
            debugLog('Replaced Slack mask image');
          }
        }
      }
      
      // Replace Google Drive icon
      if (buttonId === 'filter-row-gdrive') {
        const driveIcon = button.querySelector('img, .iwpqfy0');
        if (driveIcon) {
          debugLog('Found Google Drive icon:', driveIcon);
          
          if (driveIcon.tagName === 'IMG') {
            driveIcon.src = chrome.runtime.getURL('images/sharepoint.svg');
            debugLog('Replaced Google Drive image source');
          } else if (driveIcon.classList.contains('iwpqfy0')) {
            driveIcon.style.maskImage = `url('${chrome.runtime.getURL('images/sharepoint.svg')}')`;
            debugLog('Replaced Google Drive mask image');
          }
        }
      }
      
      // Replace Gmail icon
      if (buttonId === 'filter-row-gmail') {
        const gmailIcon = button.querySelector('img, .iwpqfy0');
        if (gmailIcon) {
          debugLog('Found Gmail icon:', gmailIcon);
          
          if (gmailIcon.tagName === 'IMG') {
            gmailIcon.src = chrome.runtime.getURL('images/outlook.svg');
            debugLog('Replaced Gmail image source');
          } else if (gmailIcon.classList.contains('iwpqfy0')) {
            gmailIcon.style.maskImage = `url('${chrome.runtime.getURL('images/outlook.svg')}')`;
            debugLog('Replaced Gmail mask image');
          }
        }
      }
    });
    
    // Also find and replace top navigation icons
    const navLinks = document.querySelectorAll('a[href*="gmail"], a[href*="drive"], a[href*="slack"]');
    debugLog(`Found ${navLinks.length} navigation links`);
    
    navLinks.forEach(link => {
      const href = link.href || '';
      const icon = link.querySelector('img, .iwpqfy0');
      
      if (!icon) return;
      
      if (href.includes('gmail')) {
        if (icon.tagName === 'IMG') {
          icon.src = chrome.runtime.getURL('images/outlook.svg');
          debugLog('Replaced Gmail nav icon');
        } else if (icon.classList.contains('iwpqfy0')) {
          icon.style.maskImage = `url('${chrome.runtime.getURL('images/outlook.svg')}')`;
          debugLog('Replaced Gmail nav mask icon');
        }
      } 
      else if (href.includes('drive')) {
        if (icon.tagName === 'IMG') {
          icon.src = chrome.runtime.getURL('images/sharepoint.svg');
          debugLog('Replaced Drive nav icon');
        } else if (icon.classList.contains('iwpqfy0')) {
          icon.style.maskImage = `url('${chrome.runtime.getURL('images/sharepoint.svg')}')`;
          debugLog('Replaced Drive nav mask icon');
        }
      }
      else if (href.includes('slack')) {
        if (icon.tagName === 'IMG') {
          icon.src = chrome.runtime.getURL('images/teams.svg');
          debugLog('Replaced Slack nav icon');
        } else if (icon.classList.contains('iwpqfy0')) {
          icon.style.maskImage = `url('${chrome.runtime.getURL('images/teams.svg')}')`;
          debugLog('Replaced Slack nav mask icon');
        }
      }
    });
    
    // Try to directly find and modify app icons in the results list
    const appIcons = {
      slack: {
        selectors: ['img[src*="slack2.svg"]', 'img[title="Slack"]', 'img[alt="Slack"]'],
        newSrc: 'images/teams.svg'
      },
      drive: {
        selectors: ['img[src*="gdrive3.svg"]', 'img[title="Google Drive"]', 'img[alt="Google Drive"]'],
        newSrc: 'images/sharepoint.svg'
      },
      gmail: {
        selectors: ['img[src*="gmail3.svg"]', 'img[title="Gmail"]', 'img[alt="Gmail"]'],
        newSrc: 'images/outlook.svg'
      },
      // Add Google Docs icon replacement
      docs: {
        selectors: [
          'img[src*="vnd.google-apps.document"]', 
          'img[alt="gdrive"][src*="document"]',
          'img[src*="google-docs"]'
        ],
        newSrc: 'images/docx.svg'
      },
      // Add Google Slides icon replacement
      slides: {
        selectors: [
          'img[src*="vnd.google-apps.presentation"]', 
          'img[alt="gdrive"][src*="presentation"]',
          'img[src*="google-slides"]'
        ],
        newSrc: 'images/pptx.svg'
      }
    };
    
    // Replace each app icon type
    Object.values(appIcons).forEach(iconInfo => {
      iconInfo.selectors.forEach(selector => {
        const icons = document.querySelectorAll(selector);
        
        icons.forEach(icon => {
          if (icon.width < 50 && icon.height < 50) { // Likely an app icon, not a large screenshot
            icon.src = chrome.runtime.getURL(iconInfo.newSrc);
            debugLog(`Replaced icon matching ${selector}`);
          }
        });
      });
    });
    
  } catch (error) {
    debugLog('Error replacing app icons:', error);
  }
}

// Function to transform the page
function transformPage() {
  debugLog('Transforming page...');
  
  // Replace text in the main content areas
  const elements = document.querySelectorAll('.secondary-column, .primary-column');
  debugLog(`Found ${elements.length} main content elements`);
  
  elements.forEach(element => {
    replaceTextInElement(element);
  });
  
  // Replace app icons
  replaceAppIcons();
  
  // Replace document icons
  replaceDocumentIcons();
  
  debugLog('Transformation complete');
}

// Function to observe DOM changes and apply transformations
function observePageChanges() {
  debugLog('Setting up MutationObserver');
  
  const observer = new MutationObserver((mutations) => {
    let shouldTransform = false;
    
    mutations.forEach((mutation) => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        shouldTransform = true;
      }
    });
    
    if (shouldTransform) {
      debugLog('DOM changes detected, re-applying transformations');
      transformPage();
    }
  });
  
  // Start observing the document body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

// State variables
let isEnabled = false;
let observer = null;

// Initialize
debugLog('Extension initialized');

// Check storage for enabled state
chrome.storage.sync.get('enabled', function(data) {
  isEnabled = data.enabled || false;
  debugLog('Initial state:', isEnabled ? 'enabled' : 'disabled');
  
  if (isEnabled) {
    // Initial transformation
    setTimeout(() => {
      transformPage();
      
      // Set up observer
      observer = observePageChanges();
      
      // Apply transformation again after a delay to catch late-loading content
      setTimeout(transformPage, 1500);
    }, 500);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  debugLog('Message received:', request);
  
  if (request.action === "toggleTransform") {
    isEnabled = request.enabled;
    debugLog('Toggle state:', isEnabled ? 'enabled' : 'disabled');
    
    if (isEnabled) {
      transformPage();
      if (!observer) {
        observer = observePageChanges();
      }
      
      // Re-apply after a delay to catch anything that might have loaded late
      setTimeout(transformPage, 1000);
    } else {
      // Reload the page to restore original text
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      location.reload();
    }
    
    // Send acknowledgment
    sendResponse({success: true});
  }
  
  return true; // Keep the message channel open for async response
});