
console.log('A11y Scanner Extension: Background service worker loaded');


chrome.runtime.onInstalled.addListener((details) => {
    console.log('A11y Scanner Extension: Installed/Updated', details.reason);
    
    if (details.reason === 'install') {

        chrome.tabs.create({
            url: chrome.runtime.getURL('welcome.html')
        });
    }
    

    setupContextMenus();
});


function setupContextMenus() {

    chrome.contextMenus.removeAll(() => {

        chrome.contextMenus.create({
            id: 'scanWithA11y',
            title: 'Scan with A11y Scanner',
            contexts: ['page', 'link']
        });
        
        chrome.contextMenus.create({
            id: 'scanLinkWithA11y',
            title: 'Scan this link with A11y',
            contexts: ['link']
        });
        
        chrome.contextMenus.create({
            id: 'separator1',
            type: 'separator',
            contexts: ['page', 'link']
        });
        
        chrome.contextMenus.create({
            id: 'openA11yDashboard',
            title: 'Open A11y Dashboard',
            contexts: ['page']
        });
    });
}


chrome.contextMenus.onClicked.addListener((info, tab) => {
    const baseUrl = 'https://a11y-scanner-admin.sgw.prod.atl-paas.net';
    
    switch (info.menuItemId) {
        case 'scanWithA11y':
            const currentUrl = encodeURIComponent(tab.url);
            chrome.tabs.create({
                url: `${baseUrl}/create?url=${currentUrl}`
            });
            break;
            
        case 'scanLinkWithA11y':
            const linkUrl = encodeURIComponent(info.linkUrl);
            chrome.tabs.create({
                url: `${baseUrl}/create?url=${linkUrl}`
            });
            break;
            
        case 'openA11yDashboard':
            chrome.tabs.create({
                url: baseUrl
            });
            break;
    }
});


chrome.action.onClicked.addListener((tab) => {

    console.log('Extension icon clicked on tab:', tab.url);
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    switch (request.action) {
        case 'openTab':
            chrome.tabs.create({ url: request.url }, (tab) => {
                sendResponse({ success: true, tabId: tab.id });
            });
            return true;
            
        case 'getCurrentTab':
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                sendResponse({ tab: tabs[0] });
            });
            return true;
            
        case 'updateBadge':
            chrome.action.setBadgeText({
                text: request.text || '',
                tabId: sender.tab?.id
            });
            chrome.action.setBadgeBackgroundColor({
                color: request.color || '#667eea',
                tabId: sender.tab?.id
            });
            sendResponse({ success: true });
            break;
            
        case 'showNotification':

            console.log('Notification request:', request.message);
            sendResponse({ success: true });
            break;
            
        case 'getStorageData':
            chrome.storage.local.get(request.keys, (result) => {
                sendResponse({ data: result });
            });
            return true;
            
        case 'setStorageData':
            chrome.storage.local.set(request.data, () => {
                sendResponse({ success: true });
            });
            return true;
    }
});


// chrome.commands.onCommand.addListener((command) => {
//     console.log('Command received:', command);
//     
//     switch (command) {
//         case 'open-a11y-create':
//             chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//                 const currentUrl = encodeURIComponent(tabs[0].url);
//                 chrome.tabs.create({
//                     url: `https://a11y-scanner-admin.sgw.prod.atl-paas.net/create?url=${currentUrl}`
//                 });
//             });
//             break;
//             
//         case 'open-a11y-dashboard':
//             chrome.tabs.create({
//                 url: 'https://a11y-scanner-admin.sgw.prod.atl-paas.net'
//             });
//             break;
//     }
// });


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {

        if (tab.url.includes('a11y-scanner-admin.sgw.prod.atl-paas.net')) {

            chrome.action.setBadgeText({
                text: '✓',
                tabId: tabId
            });
            chrome.action.setBadgeBackgroundColor({
                color: '#28a745',
                tabId: tabId
            });
        } else {

            chrome.action.setBadgeText({
                text: '',
                tabId: tabId
            });
        }
    }
});


// chrome.webRequest.onBeforeRequest.addListener(
//     (details) => {
//         // Log requests to A11y scanner for debugging
//         if (details.url.includes('a11y-scanner-admin.sgw.prod.atl-paas.net')) {
//             console.log('A11y Scanner request:', details.url);
//         }
//     },
//     { urls: ["https://a11y-scanner-admin.sgw.prod.atl-paas.net/*"] }
// );


chrome.runtime.onSuspend.addListener(() => {
    console.log('A11y Scanner Extension: Service worker suspending');
});


chrome.runtime.onStartup.addListener(() => {
    console.log('A11y Scanner Extension: Browser startup');
});



// setInterval(() => {
//     console.log('A11y Scanner Extension: Service worker heartbeat');
// }, 30000); 