# Bookmark Manager

A browser tool that creates a VS Code-style command palette overlay on any webpage. Search and execute custom tools with keyboard navigation.

Available as a **Chrome Extension** (recommended) or a **Bookmarklet** (legacy).

## Features

- Fuzzy search with multi-word support
- Keyboard navigation (Arrow keys, Enter, Escape)
- Click outside to dismiss
- Dark theme UI
- **Extension Shortcut**: `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Shift+K` (Mac)

## Chrome Extension

### Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked**.
5. Select the repository folder (containing `manifest.json`).

### Development

- **Files**:
    - `manifest.json`: Extension configuration.
    - `background.js`: Service worker for handling shortcuts.
    - `content.js`: The main logic injected into pages.
- **Reloading**: After making changes to `content.js` or `background.js`, go to `chrome://extensions` and click the refresh icon on the Bookmark Manager card. You may also need to refresh the web page you are testing on.

### Testing

1. Open any webpage (e.g., google.com).
2. Press `Ctrl+Shift+K` (or `Cmd+Shift+K`).
3. Verify the command palette appears.
4. Run a command like "Highlight Images".

## Bookmarklet (Legacy)

### Building

To generate the minified bookmarklet from `manager.js`:

1. Ensure you have `npm` installed.
2. Run `make`.
3. The output will be in `manager.minified.js`.

### Installation

1. Copy the contents of `manager.minified.js`.
2. Create a new bookmark in your browser.
3. Paste the minified code as the URL.

## Adding Custom Tools

Edit the `tools` array in `content.js` (for Extension) or `manager.js` (for Bookmarklet):

```javascript
{
    name: "My Custom Tool",
    run: function() { /* your code here */ }
}
```
