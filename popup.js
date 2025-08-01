const BASE_URL = 'https://a11y-scanner-admin.sgw.prod.atl-paas.net';
const openCreatePageBtn = document.getElementById('openCreatePage');
const openDashboardBtn = document.getElementById('openDashboard');
const getCurrentPageBtn = document.getElementById('getCurrentPage');
const statusMessage = document.getElementById('statusMessage');


const scanForm = document.getElementById('scanForm');
const createScanForm = document.getElementById('createScanForm');
const scanUrlInput = document.getElementById('scanUrl');
const scanNameInput = document.getElementById('scanName');
const scanTypeSelect = document.getElementById('scanType');
const scanLevelSelect = document.getElementById('scanLevel');
const useCurrentUrlBtn = document.getElementById('useCurrentUrl');
const createScanBtn = document.getElementById('createScan');
const toggleFormViewBtn = document.getElementById('toggleFormView');
const quickLinks = document.getElementById('quickLinks');


const toggleDebugBtn = document.getElementById('toggleDebug');
const debugPanel = document.getElementById('debugPanel');
const debugContent = document.getElementById('debugContent');
const inspectFormFieldsBtn = document.getElementById('inspectFormFields');

// Quick links
const reportsLink = document.getElementById('reportsLink');
const settingsLink = document.getElementById('settingsLink');
const historyLink = document.getElementById('historyLink');
const helpLink = document.getElementById('helpLink');


function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    

    setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
    }, 3000);
}


function openUrl(url) {
    chrome.tabs.create({ url: url }, (tab) => {
        if (chrome.runtime.lastError) {
            showStatus('Error opening page', 'error');
            console.error('Error:', chrome.runtime.lastError);
        } else {
            showStatus('Page opened successfully', 'success');
            window.close();
        }
    });
}


async function getCurrentTabUrl() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab.url;
    } catch (error) {
        console.error('Error getting current tab:', error);
        return null;
    }
}


async function createScan(formData) {
    showStatus('Creating scan...', 'info');
    
    try {

        const tab = await chrome.tabs.create({ url: `${BASE_URL}/create` });
        

        let attempts = 0;
        const maxAttempts = 5;
        
        const tryFillForm = () => {
            attempts++;
            console.log(`Attempt ${attempts} to fill form...`);
            
            chrome.tabs.sendMessage(tab.id, {
                action: 'fillScanForm',
                data: formData
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log(`Attempt ${attempts} failed:`, chrome.runtime.lastError.message);
                    
                    if (attempts < maxAttempts) {

                        setTimeout(tryFillForm, 1000 * attempts);
                                        } else {
                        console.log('All attempts failed, using URL parameters fallback...');
                        showStatus('Using fallback method...', 'info');
                        
                        // Show debug info
                        if (debugPanel.style.display !== 'none') {
                            debugContent.textContent = `⚠️ Content script failed after ${maxAttempts} attempts\n\nUsing URL hash fallback method...\n\nForm Data:\n${JSON.stringify(formData, null, 2)}`;
                        }
                        

                        const encodedData = encodeURIComponent(JSON.stringify(formData));
                        chrome.tabs.update(tab.id, { 
                            url: `${BASE_URL}/create#formData=${encodedData}` 
                        });
                    }
                } else {
                    console.log('Form filling response:', response);
                    if (response && response.success) {
                        showStatus(`Form filled successfully! (${response.filledFields} fields)`, 'success');
                        
                        // Show debug info
                        if (debugPanel.style.display !== 'none') {
                            debugContent.textContent = `✅ Form filling successful!\n\nFields filled: ${response.filledFields}/${response.totalFields}\n\nAttempted fields:\n${JSON.stringify(response.fieldsAttempted, null, 2)}`;
                        }
                    } else {
                        showStatus('Form filling failed', 'error');
                        if (debugPanel.style.display !== 'none') {
                            debugContent.textContent = `❌ Form filling failed\n\nResponse: ${JSON.stringify(response, null, 2)}`;
                        }
                    }
                }
            });
        };
        

        setTimeout(tryFillForm, 2000);
        
        showStatus('Opening A11y scanner...', 'info');
        
    } catch (error) {
        console.error('Error creating scan:', error);
        showStatus('Error creating scan', 'error');
    }
}


createScanForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        url: scanUrlInput.value,
        name: scanNameInput.value,
        type: scanTypeSelect.value,
        level: scanLevelSelect.value
    };
    
    await createScan(formData);
});

useCurrentUrlBtn.addEventListener('click', async () => {
    const currentUrl = await getCurrentTabUrl();
    if (currentUrl) {
        scanUrlInput.value = currentUrl;
        

        try {
            const url = new URL(currentUrl);
            scanNameInput.value = `Scan of ${url.hostname}`;
        } catch (e) {
            scanNameInput.value = 'Current Page Scan';
        }
        
        showStatus('Current URL populated', 'success');
    } else {
        showStatus('Could not get current page URL', 'error');
    }
});

toggleFormViewBtn.addEventListener('click', () => {
    const isQuickLinksVisible = quickLinks.style.display !== 'none';
    
    if (isQuickLinksVisible) {
        quickLinks.style.display = 'none';
        toggleFormViewBtn.textContent = '📝 Quick Links';
    } else {
        quickLinks.style.display = 'block';
        toggleFormViewBtn.textContent = '🚀 Create Scan';
    }
});

toggleDebugBtn.addEventListener('click', () => {
    const isDebugVisible = debugPanel.style.display !== 'none';
    
    if (isDebugVisible) {
        debugPanel.style.display = 'none';
        toggleDebugBtn.textContent = '🐛 Debug';
    } else {
        debugPanel.style.display = 'block';
        toggleDebugBtn.textContent = '❌ Hide Debug';
        debugContent.textContent = 'Debug mode enabled. Click "Create Scan" to see detailed logs.';
    }
});

inspectFormFieldsBtn.addEventListener('click', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab.url && tab.url.includes('a11y-scanner-admin.sgw.prod.atl-paas.net')) {
            chrome.tabs.sendMessage(tab.id, {
                action: 'inspectFormFields'
            }, (response) => {
                if (chrome.runtime.lastError) {
                    debugContent.textContent = `❌ Error: ${chrome.runtime.lastError.message}\n\nMake sure you're on the A11y scanner create page.`;
                } else if (response && response.fields) {
                    debugContent.textContent = `📋 Found ${response.fields.length} form fields:\n\n${JSON.stringify(response.fields, null, 2)}`;
                } else {
                    debugContent.textContent = '❌ No form fields found or content script not responding.';
                }
            });
        } else {
            debugContent.textContent = '❌ Please navigate to the A11y scanner create page first.';
        }
    } catch (error) {
        debugContent.textContent = `❌ Error: ${error.message}`;
    }
});

openCreatePageBtn.addEventListener('click', () => {
    const createUrl = `${BASE_URL}/create`;
    openUrl(createUrl);
});

openDashboardBtn.addEventListener('click', () => {
    openUrl(BASE_URL);
});

getCurrentPageBtn.addEventListener('click', async () => {
    const currentUrl = await getCurrentTabUrl();
    if (currentUrl) {

        const encodedUrl = encodeURIComponent(currentUrl);
        const scanUrl = `${BASE_URL}/create?url=${encodedUrl}`;
        openUrl(scanUrl);
    } else {
        showStatus('Could not get current page URL', 'error');
    }
});


reportsLink.addEventListener('click', (e) => {
    e.preventDefault();
    openUrl(`${BASE_URL}/reports`);
});

settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    openUrl(`${BASE_URL}/settings`);
});

historyLink.addEventListener('click', (e) => {
    e.preventDefault();
    openUrl(`${BASE_URL}/history`);
});

helpLink.addEventListener('click', (e) => {
    e.preventDefault();
    openUrl(`${BASE_URL}/help`);
});


document.addEventListener('DOMContentLoaded', async () => {
    showStatus('Ready to scan for accessibility issues!');
    

    const currentUrl = await getCurrentTabUrl();
    if (currentUrl && currentUrl.includes('a11y-scanner-admin.sgw.prod.atl-paas.net')) {
        showStatus('On A11y Scanner domain', 'success');
    }
    

    if (currentUrl && (currentUrl.startsWith('http://') || currentUrl.startsWith('https://'))) {

        if (!currentUrl.includes('a11y-scanner-admin.sgw.prod.atl-paas.net')) {
            scanUrlInput.value = currentUrl;
            

            try {
                const url = new URL(currentUrl);
                scanNameInput.value = `Accessibility Scan - ${url.hostname}`;
            } catch (e) {
                scanNameInput.value = 'Accessibility Scan';
            }
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
        e.target.click();
    }
    
    // Ctrl/Cmd + 1 for create page
    if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        openCreatePageBtn.click();
    }
    
    // Ctrl/Cmd + 2 for dashboard
    if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        openDashboardBtn.click();
    }
    
    // Ctrl/Cmd + 3 for current page scan
    if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault();
        getCurrentPageBtn.click();
    }
}); 