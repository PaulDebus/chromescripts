// SPDX-FileCopyrightText: 2025 Paul Debus
//
// SPDX-License-Identifier: GPL-3.0-only

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { action: 'open', mode: 'search' }).catch(() => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }).then(() => {
            setTimeout(() => {
                chrome.tabs.sendMessage(tab.id, { action: 'open', mode: 'search' });
            }, 100);
        });
    });
});

chrome.commands.onCommand.addListener((command, tab) => {
    if (command === 'toggle-leader') {
        chrome.tabs.sendMessage(tab.id, { action: 'open', mode: 'leader' }).catch(() => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }).then(() => {
                setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id, { action: 'open', mode: 'leader' });
                }, 100);
            });
        });
    }
});

const defaultTools = [
    {
        id: '1',
        name: "Highlight Images",
        code: "document.querySelectorAll('img').forEach(img => img.style.border = '5px solid red');",
        enabled: true
    },
    {
        id: '2',
        name: "Show Page Title",
        code: "alert('Title: ' + document.title);",
        enabled: true
    },
    {
        id: '3',
        name: "Edit Page Content",
        code: "document.body.contentEditable = 'true'; document.designMode = 'on';",
        enabled: true
    },
    {
        id: '4',
        name: "Scroll to Top",
        code: "window.scrollTo(0,0);",
        enabled: true
    },
    {
        id: '5',
        name: "Scroll to Bottom",
        code: "window.scrollTo(0, document.body.scrollHeight);",
        enabled: true
    }
];

// Simple warning icon for notifications
const WARNING_ICON = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="%234285F4"/><text x="64" y="90" font-size="80" text-anchor="middle" fill="white">!</text></svg>';

function checkUserScriptsAvailability() {
    if (!chrome.userScripts) {
        console.error('User Scripts API is not available. Please enable it in the extension details page at chrome://extensions');
        
        // Show a warning notification to the user
        chrome.notifications.create({
            type: 'basic',
            iconUrl: WARNING_ICON,
            title: 'Chrome Scripts - Configuration Required',
            message: 'User Scripts are not enabled. Go to chrome://extensions, click Details on this extension, and enable "Allow access to user scripts".',
            priority: 2
        });
        
        return false;
    }
    return true;
}

async function registerScripts() {
    if (!checkUserScriptsAvailability()) {
        return;
    }

    try {
        await chrome.userScripts.unregister();
    } catch (e) {
        console.debug('userScripts.unregister:', e.message);
    }

    try {
        await chrome.userScripts.configureWorld({
            csp: "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
        });
    } catch (e) {
        console.warn('userScripts.configureWorld failed:', e.message);
    }

    try {
        await chrome.userScripts.register([{
            id: 'executor',
            js: [{ file: 'executor.js' }],
            world: 'USER_SCRIPT',
            matches: ['<all_urls>']
        }]);
    } catch (e) {
        console.warn('userScripts.register failed:', e.message);
    }
}

chrome.runtime.onInstalled.addListener(async () => {
    chrome.storage.sync.get(['tools'], (result) => {
        if (!result.tools) {
            chrome.storage.sync.set({ tools: defaultTools });
        }
    });
    await registerScripts();
});

chrome.runtime.onStartup.addListener(registerScripts);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'executeScript' && request.code) {
        chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            world: 'MAIN',
            func: (code) => {
                document.dispatchEvent(new CustomEvent('antigravity-execute', { detail: code }));
            },
            args: [request.code]
        });
    }
});
