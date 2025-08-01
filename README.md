# A11y Scanner Chrome Extension

A Chrome extension that provides quick access to the accessibility scanner admin interface at `https://a11y-scanner-admin.sgw.prod.atl-paas.net`.

## Features

- **Quick Access Popup**: Click the extension icon to access the A11y scanner interface
- **Current Page Scanning**: Scan the currently active tab with one click
- **Context Menu Integration**: Right-click on any page or link to scan with A11y
- **Form Enhancement**: Automatically enhances forms on the A11y scanner domain with:
  - Auto-save functionality
  - Visual feedback
  - Form data restoration
- **Quick Action Panel**: When on the A11y scanner domain, get additional tools like:
  - Clear forms
  - Export form data
  - Toggle help mode
- **Keyboard Shortcuts**: Use Ctrl/Cmd + 1, 2, 3 for quick actions
- **Badge Indicators**: Shows a green checkmark when on the A11y scanner domain

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Enable Developer Mode** in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

2. **Add Icons** (Required):
   ```bash
   # You need to add icon files to the icons/ directory:
   # - icon16.png (16x16 pixels)
   # - icon32.png (32x32 pixels)  
   # - icon48.png (48x48 pixels)
   # - icon128.png (128x128 pixels)
   ```

3. **Load the Extension**:
   - Click "Load unpacked"
   - Select this directory (`accessibility_extension`)
   - The extension should now appear in your extensions list

### Method 2: Package for Distribution

1. Add the required icon files (see above)
2. Go to `chrome://extensions/`
3. Click "Pack extension"
4. Select this directory as the extension root
5. This will create a `.crx` file for distribution

## Usage

### Popup Interface

Click the extension icon in the toolbar to open the popup with these options:

- **📝 Open Create Page**: Opens the A11y scanner create page directly
- **📊 Open Dashboard**: Opens the main A11y scanner dashboard  
- **🔗 Scan Current Page**: Scans the currently active tab
- **Quick Links**: Access Reports, Settings, History, and Help pages

### Context Menu

Right-click on any webpage to see:
- "Scan with A11y Scanner" - Scans the current page
- "Scan this link with A11y" (when right-clicking on links)
- "Open A11y Dashboard"

### Keyboard Shortcuts

When the popup is open:
- `Ctrl/Cmd + 1`: Open create page
- `Ctrl/Cmd + 2`: Open dashboard  
- `Ctrl/Cmd + 3`: Scan current page

### Enhanced Features on A11y Scanner Domain

When visiting `https://a11y-scanner-admin.sgw.prod.atl-paas.net`, the extension adds:

#### Auto-Save Forms
- Automatically saves form data as you type
- Restores form data if you accidentally navigate away
- Data is kept for 1 hour

#### Quick Action Panel
A floating panel in the top-right corner provides:
- **Clear Forms**: Reset all forms on the page
- **Export Data**: Download saved form data as JSON
- **Toggle Help**: Show/hide element information overlays

#### Visual Enhancements
- Form highlighting on hover
- Better visual feedback for interactive elements
- Accessibility-focused styling improvements

## Files Structure

```
accessibility_extension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup interface HTML
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── content.js            # Content script for A11y domain
├── background.js         # Background service worker
├── icons/                # Extension icons (you need to add these)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## Required Icons

You need to add the following icon files to the `icons/` directory:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon32.png` - 32x32 pixels (extension management)
- `icon48.png` - 48x48 pixels (extension management)  
- `icon128.png` - 128x128 pixels (Chrome Web Store)

All icons should be PNG format with transparent backgrounds. Consider using an accessibility-themed icon (like a magnifying glass, accessibility symbol, or scanner icon).

## Permissions

The extension requests these permissions:

- `activeTab`: To get the current page URL for scanning
- `storage`: To save user preferences and form data
- `host_permissions`: To interact with the A11y scanner domain
- `contextMenus`: To add right-click menu options

## Development

### Testing

1. Load the extension in development mode
2. Navigate to any webpage
3. Click the extension icon to test the popup
4. Visit the A11y scanner domain to test enhanced features
5. Use right-click context menus to test integration

### Debugging

- Open Chrome DevTools on the popup: Right-click the extension icon → Inspect popup
- View background script logs: Go to `chrome://extensions/` → Click "background page" under your extension
- View content script logs: Open DevTools on the A11y scanner pages

### Customization

- Modify `popup.html` and `popup.css` to change the interface design
- Update `content.js` to add more enhancements for the A11y scanner domain
- Edit `background.js` to add more context menu options or keyboard shortcuts

## Troubleshooting

### Extension Not Loading
- Ensure all required icon files are present
- Check for syntax errors in the developer console
- Verify manifest.json is valid JSON

### Popup Not Working
- Check browser console for JavaScript errors
- Ensure popup.js is loading correctly
- Verify permissions in manifest.json

### Content Script Not Working
- Confirm you're on the correct domain
- Check if content script permissions are granted
- Look for errors in the page console

## Security Notes

- The extension only requests necessary permissions
- Form data is stored locally and never transmitted
- Content scripts only run on the specified A11y scanner domain
- All URLs are validated before opening new tabs

## License

This extension is created for internal use with the A11y Scanner Admin interface. 