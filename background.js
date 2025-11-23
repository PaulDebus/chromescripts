chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });
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

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(['tools'], (result) => {
        if (!result.tools) {
            chrome.storage.sync.set({ tools: defaultTools });
        }
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'executeScript' && request.code) {
        chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            world: 'MAIN',
            func: (code) => {
                try {
                    const func = new Function(code);
                    func();
                } catch (e) {
                    alert("Error executing script: " + e);
                }
            },
            args: [request.code]
        });
    }
});
