// Inject a button into the LinkedIn profile page
function injectSyncButton() {
  if (document.getElementById('zirith-sync-btn')) return;

  const button = document.createElement('button');
  button.id = 'zirith-sync-btn';
  button.innerText = 'Sync to ZIRITH CRM';
  button.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 9999;
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 16px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  `;

  button.onclick = extractAndSyncData;
  document.body.appendChild(button);
}

function extractAndSyncData() {
  // Very basic extraction, would need to be robust in production due to LinkedIn DOM changes
  const contactName = document.querySelector('h1.text-heading-xlarge')?.innerText.trim() || '';
  const companyName = document.querySelector('.pv-text-details__right-panel .inline-show-more-text')?.innerText.trim() || 'Unknown Company';
  const linkedInUrl = window.location.href;

  const payload = {
    companyName,
    contactName,
    linkedInUrl,
    source: 'linkedin-extension'
  };

  chrome.runtime.sendMessage({ action: 'sync_to_crm', payload }, (response) => {
    if (response && response.success) {
      alert('Successfully synced to ZIRITH CRM!');
    } else {
      alert('Failed to sync. Check console for details.');
    }
  });
}

// Run injection periodically to handle SPA navigation
setInterval(injectSyncButton, 2000);
