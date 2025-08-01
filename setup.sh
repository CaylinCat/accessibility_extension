#!/bin/bash

# Setup script for A11y Scanner Chrome Extension
echo "🔧 Setting up A11y Scanner Chrome Extension..."

# Check if ImageMagick is available for icon generation
if command -v convert >/dev/null 2>&1; then
    echo "📸 Creating placeholder icons with ImageMagick..."
    
    # Create simple colored icons with accessibility symbol
    echo "  Creating icon16.png..."
    convert -size 16x16 xc:'#667eea' -gravity center -pointsize 10 -fill white -annotate +0+0 "♿" icons/icon16.png
    
    echo "  Creating icon32.png..."
    convert -size 32x32 xc:'#667eea' -gravity center -pointsize 20 -fill white -annotate +0+0 "♿" icons/icon32.png
    
    echo "  Creating icon48.png..."
    convert -size 48x48 xc:'#667eea' -gravity center -pointsize 30 -fill white -annotate +0+0 "♿" icons/icon48.png
    
    echo "  Creating icon128.png..."
    convert -size 128x128 xc:'#667eea' -gravity center -pointsize 80 -fill white -annotate +0+0 "♿" icons/icon128.png
    
    echo "✅ Placeholder icons created successfully!"
else
    echo "❌ ImageMagick not found. You'll need to manually create the icon files."
    echo "📝 Required icons in icons/ directory:"
    echo "   - icon16.png (16x16 pixels)"
    echo "   - icon32.png (32x32 pixels)"  
    echo "   - icon48.png (48x48 pixels)"
    echo "   - icon128.png (128x128 pixels)"
    echo ""
    echo "💡 Install ImageMagick and run this script again to auto-generate placeholder icons:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu: sudo apt-get install imagemagick"
    echo "   Windows: Download from https://imagemagick.org/script/download.php"
fi

echo ""
echo "🚀 Next steps:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' in the top right"
echo "3. Click 'Load unpacked' and select this directory"
echo "4. The extension should now be ready to use!"
echo ""
echo "🔗 Extension features:"
echo "   - Click the extension icon for quick access popup"
echo "   - Right-click on any page to scan with A11y"
echo "   - Automatic enhancements when on the A11y scanner domain"
echo ""
echo "📖 See README.md for detailed usage instructions" 