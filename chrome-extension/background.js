chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sync_to_crm') {
    // Replace with actual production domain when deployed
    const apiUrl = 'http://localhost:3000/api/webhooks/clay';
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer zirith-clay-secret-2026'
      },
      body: JSON.stringify(request.payload)
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({ success: true, data });
    })
    .catch(error => {
      console.error('Error syncing:', error);
      sendResponse({ success: false, error: error.toString() });
    });

    return true; // Keep the message channel open for async response
  }
});
