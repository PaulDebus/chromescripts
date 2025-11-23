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



## Distribution

To share this extension with others, you have two main options:

### 1. Chrome Web Store (Recommended)
This allows anyone to easily install and update the extension.

1.  **Create a Zip**: Compress the project folder (excluding `.git`, `node_modules`, and other dev files).
2.  **Developer Account**: Register for a [Chrome Web Store Developer](https://chrome.google.com/webstore/dev/register) account (requires a one-time $5 fee).
3.  **Upload**: Go to the [Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard), click "New Item", and upload your zip file.
4.  **Listing Details**: Fill in the store listing information (description, screenshots, icon).
5.  **Submit**: Submit your item for review. Once approved, it will be public.

### 2. Manual Installation (Developer Mode)
For internal use or testing without publishing:

1.  **Zip the Folder**: Send the project folder (or a zip of it) to the user.
2.  **Install**: The user must follow the **Installation** steps above (Enable Developer Mode -> Load Unpacked).

## 🤖 Generated with AI

> [!NOTE]
> This project was entirely generated using **Gemini 3 Pro** with **Antigravity**.

This project was done on a Sunday to test the power of AI-assisted coding, building out a simple bookmarklet to a full-featured Chrome Extension with a custom Admin Interface, all built through natural language prompts.
