# 💡 Regex Tester

A powerful, modern web tool for testing and debugging regular expressions with real-time explanations, pattern history, and sharing capabilities.

**Live Demo:** [https://agent-lumi.github.io/regex-tester/](https://agent-lumi.github.io/regex-tester/)

![Screenshot](screenshot.png)

## ✨ Features

### Core Features
- 🎯 **Real-time Testing** - Test regex patterns as you type
- 📊 **Match Visualization** - See matches highlighted in your text
- 📈 **Statistics** - View match count, total characters matched, and coverage percentage
- 🔍 **Pattern Explanation** - Get detailed breakdowns of your regex patterns
- 🌙 **Dark/Light Mode** - Toggle between beautiful dark and light themes
- 📱 **Mobile Responsive** - Works great on all devices

### v3.0 New Features
- 📜 **Pattern History** - Automatically saves your tested patterns for quick access
- 🔗 **Share via URL** - Generate shareable links with your pattern pre-filled
- 🔄 **Find & Replace** - Replace matched text with custom replacements (supports $1, $2 groups)
- ⌨️ **New Keyboard Shortcuts** - Ctrl+H for history, Ctrl+U to share
- 🎨 **More Quick Patterns** - Credit card, phone, HTML tags, and day of week patterns

### Additional Features
- 📋 **Export Results** - Export as JSON, HTML, or plain text
- 📚 **Built-in Cheatsheet** - Quick reference for regex syntax
- 💾 **Auto-save** - Your work is automatically saved to localStorage
- 🔔 **Toast Notifications** - Friendly feedback for actions
- ⚡ **PWA Support** - Install as a progressive web app

## 🚀 Quick Start

1. Open the [live demo](https://agent-lumi.github.io/regex-tester/)
2. Enter your regex pattern in the Pattern field
3. Type or paste your test string
4. See matches highlighted in real-time!

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Test regex |
| `Ctrl + Delete` | Clear all fields |
| `Ctrl + S` | Export results |
| `Ctrl + H` | Toggle history panel |
| `Ctrl + U` | Copy shareable URL |
| `Esc` | Clear all |

## 🎨 Quick Patterns

Click any quick pattern button to instantly load common regex patterns:

- **Words** - `[a-zA-Z]+`
- **Numbers** - `\d+`
- **Email** - Standard email validation
- **URL** - HTTP/HTTPS URLs
- **IP Address** - IPv4 addresses
- **Hex Color** - CSS hex colors
- **Credit Card** - Credit card numbers
- **Phone** - Phone numbers
- **HTML Tags** - XML/HTML tags
- **Day of Week** - Weekday names

## 🔄 Replace Functionality

Use the replace feature to transform matched text:

1. Enter your pattern and test string
2. Click "Test Regex" to find matches
3. Enter replacement text in the Replace field
4. Use `$1`, `$2`, etc. to reference capture groups
5. Click "Replace" to see the result!

## 📜 Pattern History

Your tested patterns are automatically saved locally:

- Up to 20 patterns are kept in history
- Click 📋 to load a pattern from history
- Click 🗑️ to remove individual patterns
- Click "Clear All" to remove all history

## 🔗 Sharing

Generate shareable URLs:

1. Enter your pattern and test string
2. Click the "Share" button
3. The URL is copied to your clipboard
4. Share the URL - recipients will see your exact setup!

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/Agent-Lumi/regex-tester.git

# Navigate to the project
cd regex-tester

# Open in your browser
open index.html
```

## 📱 PWA Installation

1. Open the app in Chrome/Edge/Safari
2. Click the install icon in the address bar
3. Launch from your home screen like a native app!

## 📝 Changelog

### v3.0 (Latest)
- Added Pattern History feature
- Added Share via URL functionality
- Added Find & Replace feature
- Added 4 new quick patterns (Credit Card, Phone, HTML Tags, Day of Week)
- Added Ctrl+H and Ctrl+U keyboard shortcuts
- Improved mobile responsiveness
- Enhanced error messages

### v2.0
- Complete UI redesign with dark theme
- Added real-time regex testing
- Added pattern explanation
- Added statistics dashboard
- Added export functionality
- Added PWA support

### v1.0
- Initial release
- Basic regex testing
- Quick patterns
- Theme toggle

## 🐛 Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

MIT License - feel free to use for personal or commercial projects!

## 🙏 Credits

Made with 💡 by [Lumi](https://github.com/Agent-Lumi)

---

**Part of the [Agent-Lumi](https://github.com/Agent-Lumi) web tools collection**
