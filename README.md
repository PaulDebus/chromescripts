<!--
SPDX-FileCopyrightText: 2025 Paul Debus

SPDX-License-Identifier: CC0-1.0
-->

# Chrome Scripts

**Tired of repetitive browser tasks?** Run custom JavaScript on any webpage with a VS Code-style command palette.

**Too many bookmarklets?** Chrome Scripts is a better alternative.

> A Chrome Extension that brings VS Code's command palette to every webpage. Execute custom JavaScript snippets with keyboard shortcuts.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)

## ✨ Features

### 🎯 Dual-Mode Interface
- **Search Mode** (`Ctrl+Shift+K`): Fuzzy search through all your scripts
- **Leader Mode** (`Ctrl+Shift+L`): Vim-style single-key execution for power users

### ⚡ Smart Script Management
- **Live Updates**: Changes in the admin panel instantly reflect in all open palettes
- **Syntax Highlighting**: Full JavaScript highlighting with CodeJar + PrismJS
- **Drag-Free Reordering**: Simple up/down buttons to organize your scripts
- **Auto-Save Toggles**: Enable/disable scripts without clicking save

### 🎨 Beautiful UI
- Dark theme optimized for readability
- Keyboard-first navigation (arrows, enter, escape)
- Shortcut badges displayed as button-like indicators
- Click-outside-to-dismiss overlay

### 🔧 Developer-Friendly
- Execute scripts in the page's Main World (bypasses extension CSP)
- Assign single-key shortcuts to frequently-used scripts
- Filter scripts by enabled status
- Persistent storage with Chrome Sync

## 🎬 Quick Start

### Installation

**Option 1: Download Latest Release (Recommended)**

1. Go to the [Releases page](../../releases)
2. Download the latest `chrome-scripts-vX.X.X.zip` file
3. Extract the zip file to a folder
4. **Enable User Scripts API:**
   - Open Chrome and navigate to `chrome://flags/#userscripts-api`
   - Set **"Experimental UserScripts API"** to **Enabled**
   - Click **Relaunch** to restart Chrome
5. Open Chrome and navigate to `chrome://extensions`
6. Enable **Developer mode** (top right corner)
7. Click **Load unpacked**
8. Select the extracted folder

**Option 2: Clone from Source**

1. Clone this repository:
   ```bash
   git clone https://github.com/PaulDebus/chromescripts.git
   ```

2. **Enable User Scripts API:**
   - Open Chrome and navigate to `chrome://flags/#userscripts-api`
   - Set **"Experimental UserScripts API"** to **Enabled**
   - Click **Relaunch** to restart Chrome

3. Load in Chrome:
   - Navigate to `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select the `bookmarkmanager` folder

4. Start using:
   - Press `Ctrl+Shift+K` (or `Cmd+Shift+K` on Mac)
   - Try the default scripts or create your own!

### Creating Your First Script

1. Right-click the extension icon → **Options**
2. Click **+ Add** to create a new script
3. Give it a name and optional shortcut key
4. Write your JavaScript in the highlighted editor
5. Toggle it on and press **Save**

**Example Script:**
```javascript
// Highlight all links on the page
document.querySelectorAll('a').forEach(link => {
    link.style.backgroundColor = 'yellow';
});
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+K` / `Cmd+Shift+K` | Open Search Mode |
| `Ctrl+Shift+L` / `Cmd+Shift+L` | Open Leader Mode |
| `↑` / `↓` | Navigate scripts |
| `Enter` | Execute selected script |
| `Esc` | Close palette |
| `[a-z]` | Execute script with matching shortcut (Leader Mode only) |

> 💡 **Tip**: Customize shortcuts at `chrome://extensions/shortcuts`

## 🎨 Admin Interface

Access the full-featured admin panel by right-clicking the extension icon and selecting **Options**.

### Features:
- ✏️ **Syntax-highlighted editor** for writing JavaScript
- 🔤 **Single-key shortcuts** for instant execution
- 🔄 **Reorder scripts** with up/down buttons
- 🎚️ **Toggle scripts** on/off with auto-save
- 🗑️ **Delete scripts** with confirmation
- 📊 **Visual status indicators** (green dot = enabled)

## 🏗️ Architecture

```
bookmarkmanager/
├── manifest.json       # Extension configuration
├── background.js       # Service worker (handles shortcuts & script execution)
├── content.js          # Command palette UI & storage listener
├── options.html        # Admin interface structure
├── options.js          # Admin interface logic
├── options.css         # Admin interface styling
└── vendor/             # Third-party libraries
    ├── codejar.js      # Lightweight code editor
    ├── prism.js        # Syntax highlighting
    └── prism.css       # Syntax theme
```

### How It Works

1. **Keyboard Shortcut** → `background.js` injects `content.js`
2. **Content Script** → Loads scripts from `chrome.storage.sync`
3. **User Selection** → Sends script code to `background.js`
4. **Background Worker** → Executes in Main World via `chrome.scripting.executeScript`
5. **Storage Changes** → Live updates via `chrome.storage.onChanged` listener

## 🚢 Distribution

### Chrome Web Store
1. Zip the project (exclude `.git`, `node_modules`)
2. Register at [Chrome Web Store Developer](https://chrome.google.com/webstore/dev/register) ($5 one-time fee)
3. Upload and submit for review

### Manual Sharing
Share the folder directly with users who can load it in Developer Mode.

## 🛠️ Development

### Prerequisites
- Node.js (for dependencies)
- Chrome browser

### Setup
```bash
# Install dependencies
npm install
```

### Testing
1. Make changes to source files
2. Go to `chrome://extensions`
3. Click refresh icon on the extension card
4. Reload your test webpage
5. Test with `Ctrl+Shift+K`

### Creating Releases

This project uses GitHub Actions to automatically build release packages.

**To create a new release:**

1. Update version in `manifest.json`
2. Commit your changes
3. Create and push a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. GitHub Actions will automatically:
   - Build the extension package
   - Create a GitHub release
   - Attach the zip file for download

Users can then download the zip file from the Releases page and load it directly into Chrome.

## 📄 License

**GPL-3.0-only** - Because good things should stay free. 😏

Fork it, hack it, share it—just keep it open source. See [LICENSES/GPL-3.0-only.txt](LICENSES/GPL-3.0-only.txt) for the legal stuff.

**Third-party bits**: CodeJar (MIT), PrismJS (MIT) - all GPL-compatible and lovely.

## 🙏 Acknowledgments

- **Anton Medvedev** - Creator of CodeJar
- **Lea Verou & PrismJS Contributors** - Syntax highlighting

---

<sub>Built with assistance from Gemini 3 Pro and Antigravity.</sub>
