
console.log('A11y Scanner Extension: Content script loaded');


(function() {
    'use strict';
    

    const EXTENSION_PREFIX = 'a11y-ext';
    

    function addCustomStyles() {
        const style = document.createElement('style');
        style.id = `${EXTENSION_PREFIX}-styles`;
        style.textContent = `
            .${EXTENSION_PREFIX}-highlight {
                border: 2px solid #667eea !important;
                box-shadow: 0 0 10px rgba(102, 126, 234, 0.3) !important;
                transition: all 0.3s ease !important;
            }
            
            .${EXTENSION_PREFIX}-enhanced-form {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
                border-radius: 8px !important;
                padding: 20px !important;
                margin: 10px 0 !important;
            }
            
            .${EXTENSION_PREFIX}-quick-action {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                background: white;
                border: 2px solid #667eea;
                border-radius: 8px;
                padding: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                font-family: 'Segoe UI', sans-serif;
            }
            
            .${EXTENSION_PREFIX}-button {
                background: #667eea;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                margin: 4px;
                transition: background 0.3s ease;
            }
            
            .${EXTENSION_PREFIX}-button:hover {
                background: #5a6fd8;
            }
        `;
        document.head.appendChild(style);
    }
    

    function enhanceForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.classList.contains(`${EXTENSION_PREFIX}-enhanced`)) {
                form.classList.add(`${EXTENSION_PREFIX}-enhanced`, `${EXTENSION_PREFIX}-enhanced-form`);
                

                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    input.addEventListener('input', debounce(() => {
                        saveFormData(form);
                    }, 1000));
                });
                

                form.addEventListener('mouseenter', () => {
                    form.classList.add(`${EXTENSION_PREFIX}-highlight`);
                });
                
                form.addEventListener('mouseleave', () => {
                    form.classList.remove(`${EXTENSION_PREFIX}-highlight`);
                });
            }
        });
    }
    

    function saveFormData(form) {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        const formId = form.id || form.action || 'default-form';
        localStorage.setItem(`${EXTENSION_PREFIX}-form-${formId}`, JSON.stringify({
            data: data,
            timestamp: Date.now(),
            url: window.location.href
        }));
        
        console.log('A11y Scanner Extension: Form data auto-saved');
    }
    

    function restoreFormData() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const formId = form.id || form.action || 'default-form';
            const savedData = localStorage.getItem(`${EXTENSION_PREFIX}-form-${formId}`);
            
            if (savedData) {
                try {
                    const { data, timestamp } = JSON.parse(savedData);
                    

                    if (Date.now() - timestamp < 3600000) {
                        Object.entries(data).forEach(([key, value]) => {
                            const input = form.querySelector(`[name="${key}"]`);
                            if (input && !input.value) {
                                input.value = value;
                                input.style.background = '#fff3cd'; // Yellow background to indicate restored data
                                

                                setTimeout(() => {
                                    input.style.background = '';
                                }, 3000);
                            }
                        });
                        
                        console.log('A11y Scanner Extension: Form data restored');
                    }
                } catch (error) {
                    console.error('Error restoring form data:', error);
                }
            }
        });
    }
    

    function addQuickActions() {
        if (document.getElementById(`${EXTENSION_PREFIX}-quick-actions`)) {
            return;
        }
        
        const panel = document.createElement('div');
        panel.id = `${EXTENSION_PREFIX}-quick-actions`;
        panel.className = `${EXTENSION_PREFIX}-quick-action`;
        panel.innerHTML = `
            <div style="margin-bottom: 8px; font-weight: bold; color: #333;">A11y Extension</div>
            <button class="${EXTENSION_PREFIX}-button" id="${EXTENSION_PREFIX}-clear-forms">Clear Forms</button>
            <button class="${EXTENSION_PREFIX}-button" id="${EXTENSION_PREFIX}-export-data">Export Data</button>
            <button class="${EXTENSION_PREFIX}-button" id="${EXTENSION_PREFIX}-toggle-help">Toggle Help</button>
        `;
        
        document.body.appendChild(panel);
        

        document.getElementById(`${EXTENSION_PREFIX}-clear-forms`).addEventListener('click', clearForms);
        document.getElementById(`${EXTENSION_PREFIX}-export-data`).addEventListener('click', exportFormData);
        document.getElementById(`${EXTENSION_PREFIX}-toggle-help`).addEventListener('click', toggleHelpMode);
    }
    

    function clearForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.reset();
            const formId = form.id || form.action || 'default-form';
            localStorage.removeItem(`${EXTENSION_PREFIX}-form-${formId}`);
        });
        console.log('A11y Scanner Extension: All forms cleared');
    }
    

    function exportFormData() {
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`${EXTENSION_PREFIX}-form-`)) {
                allData[key] = JSON.parse(localStorage.getItem(key));
            }
        }
        
        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `a11y-scanner-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('A11y Scanner Extension: Data exported');
    }
    

    function toggleHelpMode() {
        const body = document.body;
        if (body.classList.contains(`${EXTENSION_PREFIX}-help-mode`)) {
            body.classList.remove(`${EXTENSION_PREFIX}-help-mode`);
            removeHelpOverlays();
        } else {
            body.classList.add(`${EXTENSION_PREFIX}-help-mode`);
            addHelpOverlays();
        }
    }
    

    function addHelpOverlays() {
        const interactiveElements = document.querySelectorAll('button, input, select, textarea, a[href]');
        interactiveElements.forEach((element, index) => {
            const overlay = document.createElement('div');
            overlay.className = `${EXTENSION_PREFIX}-help-overlay`;
            overlay.style.cssText = `
                position: absolute;
                background: rgba(102, 126, 234, 0.1);
                border: 2px solid #667eea;
                border-radius: 4px;
                pointer-events: none;
                z-index: 9999;
                font-size: 12px;
                color: #333;
                padding: 4px;
                font-family: monospace;
            `;
            
            const rect = element.getBoundingClientRect();
            overlay.style.left = `${rect.left + window.scrollX}px`;
            overlay.style.top = `${rect.top + window.scrollY - 25}px`;
            overlay.style.width = `${rect.width}px`;
            overlay.textContent = `${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}`;
            
            document.body.appendChild(overlay);
        });
    }
    

    function removeHelpOverlays() {
        const overlays = document.querySelectorAll(`.${EXTENSION_PREFIX}-help-overlay`);
        overlays.forEach(overlay => overlay.remove());
    }
    

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    

    function checkUrlForFormData() {
        const hash = window.location.hash;
        if (hash.includes('formData=')) {
            try {
                const dataParam = hash.split('formData=')[1];
                const formData = JSON.parse(decodeURIComponent(dataParam));
                console.log('A11y Scanner Extension: Found form data in URL hash:', formData);
                

                setTimeout(() => {
                    fillScanForm(formData);
                }, 1000);
                

                window.history.replaceState({}, document.title, window.location.pathname);
                
            } catch (error) {
                console.log('A11y Scanner Extension: Error parsing form data from URL:', error);
            }
        }
    }


    function init() {
        addCustomStyles();
        enhanceForms();
        restoreFormData();
        addQuickActions();
        

        checkUrlForFormData();
        

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    enhanceForms();
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('A11y Scanner Extension: Enhancements initialized');
    }
    

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    

    function inspectFormFields() {
        console.log('A11y Scanner Extension: Inspecting form fields...');
        
        const allInputs = document.querySelectorAll('input, select, textarea');
        const formFieldInfo = [];
        
        allInputs.forEach((field, index) => {
            const info = {
                index: index,
                type: field.type || field.tagName.toLowerCase(),
                name: field.name || '',
                id: field.id || '',
                placeholder: field.placeholder || '',
                className: field.className || '',
                value: field.value || ''
            };
            formFieldInfo.push(info);
            console.log(`Field ${index}:`, info);
        });
        
        return formFieldInfo;
    }


    function fillScanForm(data) {
        console.log('A11y Scanner Extension: Filling scan form with data:', data);
        

        const fieldInfo = inspectFormFields();
        

        const fieldMappings = {

            url: [
                'input[name*="url"]', 'input[id*="url"]', 'input[placeholder*="url"]', 'input[type="url"]',
                'input[name*="URL"]', 'input[id*="URL"]', 'input[placeholder*="URL"]',
                'input[name*="site"]', 'input[id*="site"]', 'input[placeholder*="site"]',
                'input[name*="domain"]', 'input[id*="domain"]', 'input[placeholder*="domain"]',
                'input[name*="address"]', 'input[id*="address"]', 'input[placeholder*="address"]',
                'input[name*="link"]', 'input[id*="link"]', 'input[placeholder*="link"]'
            ],

            name: [
                'input[name*="name"]', 'input[name*="title"]', 'input[id*="name"]', 'input[id*="title"]',
                'input[name*="Name"]', 'input[name*="Title"]', 'input[id*="Name"]', 'input[id*="Title"]',
                'input[placeholder*="name"]', 'input[placeholder*="title"]', 'input[placeholder*="Name"]',
                'input[name*="label"]', 'input[id*="label"]', 'input[placeholder*="label"]',
                'input[name*="description"]', 'input[id*="description"]'
            ],

            type: [
                'select[name*="type"]', 'select[id*="type"]', 'select[name*="scan"]', 'select[id*="scan"]',
                'select[name*="Type"]', 'select[id*="Type"]', 'select[name*="Scan"]', 'select[id*="Scan"]',
                'select[name*="mode"]', 'select[id*="mode"]', 'select[name*="kind"]'
            ],

            level: [
                'select[name*="level"]', 'select[id*="level"]', 'select[name*="wcag"]', 'select[id*="wcag"]',
                'select[name*="Level"]', 'select[id*="Level"]', 'select[name*="WCAG"]', 'select[id*="WCAG"]',
                'select[name*="standard"]', 'select[id*="standard"]', 'select[name*="compliance"]'
            ]
        };
        
        let filledFields = 0;
        const fieldsAttempted = [];
        

        Object.entries(data).forEach(([key, value]) => {
            if (fieldMappings[key]) {
                let fieldFilled = false;
                
                for (const selector of fieldMappings[key]) {
                    if (fieldFilled) break;
                    
                    const field = document.querySelector(selector);
                    if (field) {
                        try {

                            field.focus();
                            field.value = '';
                            

                            field.value = value;
                            

                            field.dispatchEvent(new Event('focus', { bubbles: true }));
                            field.dispatchEvent(new Event('input', { bubbles: true }));
                            field.dispatchEvent(new Event('change', { bubbles: true }));
                            field.dispatchEvent(new Event('blur', { bubbles: true }));
                            

                            if (field._reactInternalFiber || field._reactInternalInstance) {

                                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                                nativeInputValueSetter.call(field, value);
                                field.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            
                            filledFields++;
                            fieldFilled = true;
                            fieldsAttempted.push({ key, selector, value, success: true });
                            console.log(`✅ Filled ${key} field:`, selector, '=', value);
                            
                        } catch (error) {
                            console.log(`❌ Error filling ${key} field:`, selector, error);
                            fieldsAttempted.push({ key, selector, value, success: false, error: error.message });
                        }
                    }
                }
                
                if (!fieldFilled) {
                    console.log(`⚠️  Could not find ${key} field. Tried:`, fieldMappings[key]);
                    fieldsAttempted.push({ key, selectors: fieldMappings[key], value, success: false, reason: 'No matching field found' });
                }
            }
        });
        
        console.log('Field filling summary:', fieldsAttempted);
        

        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.style.border = '3px solid #667eea';
            form.style.borderRadius = '8px';
            form.style.boxShadow = '0 0 15px rgba(102, 126, 234, 0.3)';
            form.style.backgroundColor = '#f8f9ff';
        });
        

        setTimeout(() => {
            const submitSelectors = [
                'button[type="submit"]', 'input[type="submit"]', 
                'button[id*="submit"]', 'button[id*="create"]', 'button[id*="start"]',
                'button[class*="submit"]', 'button[class*="create"]', 'button[class*="start"]',
                'button:contains("Submit")', 'button:contains("Create")', 'button:contains("Start")',
                '[role="button"][id*="submit"]', '[role="button"][class*="submit"]'
            ];
            
            let submitButton = null;
            for (const selector of submitSelectors) {
                submitButton = document.querySelector(selector);
                if (submitButton) break;
            }
            
            if (submitButton) {
                console.log('A11y Scanner Extension: Found submit button:', submitButton);
                submitButton.style.border = '3px solid #28a745';
                submitButton.style.boxShadow = '0 0 15px rgba(40, 167, 69, 0.5)';
                

                console.log('A11y Scanner Extension: Form ready - please review and submit manually');
            } else {
                console.log('A11y Scanner Extension: No submit button found');
            }
        }, 500);
        
        return { 
            success: true, 
            filledFields, 
            fieldsAttempted,
            totalFields: fieldInfo.length,
            fieldInfo: fieldInfo.slice(0, 10)
        };
    }


    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getCurrentPageInfo') {
            sendResponse({
                url: window.location.href,
                title: document.title,
                forms: document.querySelectorAll('form').length
            });
        }
        
        if (request.action === 'enhancePage') {
            init();
            sendResponse({ success: true });
        }
        
        if (request.action === 'fillScanForm') {
            const result = fillScanForm(request.data);
            sendResponse(result);
        }
        
        if (request.action === 'inspectFormFields') {
            const fieldInfo = inspectFormFields();
            sendResponse({ success: true, fields: fieldInfo });
        }
    });
    
})(); 