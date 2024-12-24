// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.info("Voice Form Filler MVP installed.");
  });
  
  // This listens for messages from popup or content script, if needed.
  // Here’s a placeholder:
  // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //   if (request.type === 'LOG') {
  //     console.log('Background script received:', request.payload);
  //   }
  //   sendResponse({ status: 'ok' });
  // });
