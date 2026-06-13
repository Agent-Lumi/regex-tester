# regex-tester

A powerful, real-time regular expression tester with explanations and a cheatsheet.

## 🚀 Live Demo

**[👉 Try it now](https://agent-lumi.github.io/regex-tester/)**

## ✨ Features

### Core Features
- 🎯 **Real-time regex testing** - See matches as you type
- 🔍 **Pattern breakdown** - Understand what each part of your regex does
- 📊 **Match statistics** - Count, positions, and coverage percentage
- 🏷️ **Capture groups** - View captured groups and submatches
- 💡 **Quick patterns** - One-click common patterns (email, URL, IP, etc.)
- 📝 **Regex cheatsheet** - Built-in reference guide
- 💾 **Auto-save** - Your work is saved automatically

### UI Features
- 🌙 **Dark theme** - Easy on the eyes
- 📱 **Fully responsive** - Works on mobile and desktop
- ⌨️ **Keyboard shortcuts**:
  - `Ctrl/Cmd + Enter` - Test regex
  - `Ctrl/Cmd + Escape` - Clear all fields
- 🔔 **Toast notifications** - Feedback for actions

### Technical Features
- 🔄 **PWA support** - Works offline
- ⚡ **Fast** - No dependencies, vanilla JS
- 🛡️ **Error handling** - Friendly error messages
- 🎨 **Modern CSS** - Glassmorphism effects

## 📦 Usage

### Online
Visit the [live demo](https://agent-lumi.github.io/regex-tester/) and start testing!

### Local
```bash
git clone https://github.com/Agent-Lumi/regex-tester.git
cd regex-tester
# Open index.html in your browser
```

## 🛠️ Quick Patterns

Click any quick pattern button to instantly test:

| Pattern | Description |
|---------|-------------|
| Words | `[a-zA-Z]+` - Match word sequences |
| Numbers | `\d+` - Match digit sequences |
| Email | Email address validation |
| URL | HTTP/HTTPS URL matching |
| IP Address | IPv4 address format |
| Hex Color | CSS color codes |

## 📝 Regex Flags

| Flag | Description |
|------|-------------|
| `g` | **Global** - Find all matches (not just first) |
| `i` | **Case-insensitive** - Match uppercase and lowercase |
| `m` | **Multiline** - `^` and `$` match line boundaries |
| `s` | **Dotall** - `.` matches newlines too |
| `u` | **Unicode** - Full Unicode support |

## 🧪 Example Patterns

```javascript
// Email validation
/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

// Phone number (US)
/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/

// Hex color code
/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/

// Credit card (simplified)
/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/

// Date (YYYY-MM-DD)
/\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/
```

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, grid, flexbox, animations
- **Vanilla JavaScript** - No dependencies!
- **Service Worker** - Offline support

## 📱 Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13.1+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

MIT - Free to use and modify!

---

Made with 💡 by [Lumi](https://github.com/Agent-Lumi)

## 🔄 Version History

### v2.0 (Current)
- ✨ Complete rewrite with real regex engine
- 🎯 Live pattern testing with highlighted matches
- 📊 Match statistics and capture groups
- 🎨 Redesigned UI with better UX
- 📝 Added regex cheatsheet
- 💾 Auto-save functionality
- ⌨️ Keyboard shortcuts

### v1.0
- Initial template-based release
