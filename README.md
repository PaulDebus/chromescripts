# Bookmark Manager

A browser bookmarklet that creates a VS Code-style command palette overlay on any webpage. Search and execute custom tools with keyboard navigation.

## Features

- Fuzzy search with multi-word support
- Keyboard navigation (Arrow keys, Enter, Escape)
- Click outside to dismiss
- Dark theme UI

## Installation

1. Copy the contents of `manager.minified.js`
2. Create a new bookmark in your browser
3. Paste the minified code as the URL

## Adding Custom Tools

Edit the `tools` array in `manager.js`:

```javascript
{
    name: "My Custom Tool",
    run: function() { /* your code here */ }
}
```

## Building

After modifying `manager.js`, minify it using [make-bookmarklets.com](https://make-bookmarklets.com/). Paste the output into `manager.minified.js`.

## Usage

Click the bookmarklet on any page to open the command palette. Type to filter commands, use arrow keys to navigate, and press Enter to execute.
