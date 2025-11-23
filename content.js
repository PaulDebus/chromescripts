(function () {
    /* --- UI LOGIC --- */
    const id = 'my-cmd-palette';
    if (document.getElementById(id)) { document.getElementById(id).remove(); return; }

    let tools = [];
    let filteredTools = [];
    let selectedIndex = 0;
    let currentMode = 'search'; // 'search' or 'leader'

    /* Create Overlay */
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.3); z-index: 2147483647; display: flex; justify-content: center; align-items: flex-start; padding-top: 10vh; font-family: sans-serif;';

    /* Create Main Box */
    const box = document.createElement('div');
    box.style.cssText = 'width: 500px; max-width: 90%; background: #1e1e1e; border-radius: 8px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column; border: 1px solid #333;';

    /* Search Input */
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type to search commands...';
    input.style.cssText = 'width: 100%; padding: 15px; font-size: 18px; background: #252526; color: #ddd; border: none; border-bottom: 1px solid #333; outline: none; box-sizing: border-box;';

    /* Results List */
    const list = document.createElement('ul');
    list.style.cssText = 'list-style: none; margin: 0; padding: 0; max-height: 300px; overflow-y: auto;';

    box.appendChild(input);
    box.appendChild(list);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    /* Initialize Tools from Storage */
    function loadTools() {
        chrome.storage.sync.get(['tools'], (result) => {
            if (result.tools) {
                tools = result.tools.filter(t => t.enabled).map(t => ({
                    name: t.name,
                    shortcut: t.shortcut,
                    code: t.code,
                    run: function () {
                        chrome.runtime.sendMessage({
                            action: 'executeScript',
                            code: t.code
                        });
                    }
                }));
                filteredTools = [...tools];
                renderList();
            }
        });
    }

    loadTools();

    // Listen for storage changes to update tools in real-time
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes.tools) {
            loadTools();
        }
    });

    /* Render Function */
    function renderList() {
        // Clear list safely
        list.replaceChildren();

        if (filteredTools.length === 0) {
            const empty = document.createElement('div');
            empty.innerText = 'No matching tools';
            empty.style.cssText = 'padding: 15px; color: #666; text-align: center;';
            list.appendChild(empty);
            return;
        }

        filteredTools.forEach((tool, index) => {
            const li = document.createElement('li');
            const isSelected = (index === selectedIndex);

            li.style.cssText = `
                padding: 10px 15px; 
                cursor: pointer; 
                border-bottom: 1px solid #2d2d2d; 
                background: ${isSelected ? '#094771' : 'transparent'}; 
                color: ${isSelected ? '#fff' : '#ccc'}; 
                font-size: 14px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            const nameSpan = document.createElement('span');
            nameSpan.innerText = tool.name;
            li.appendChild(nameSpan);

            if (tool.shortcut) {
                const shortcutSpan = document.createElement('span');
                shortcutSpan.innerText = tool.shortcut.toUpperCase();
                shortcutSpan.style.cssText = `
                    background-color: ${isSelected ? 'rgba(255,255,255,0.2)' : '#333'};
                    border: 1px solid ${isSelected ? 'rgba(255,255,255,0.3)' : '#555'};
                    border-radius: 4px;
                    padding: 2px 6px;
                    font-size: 11px;
                    font-family: monospace;
                    color: ${isSelected ? '#fff' : '#eee'};
                    min-width: 12px;
                    text-align: center;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
                `;
                li.appendChild(shortcutSpan);
            }

            li.onmouseover = function () { selectedIndex = index; renderList(); };
            li.onclick = function () { execute(tool); };

            list.appendChild(li);
        });

        // Scroll active item into view
        if (list.children[selectedIndex]) {
            list.children[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    function execute(tool) {
        try { tool.run(); } catch (e) { alert("Error: " + e); }
        closeMenu();
    }

    function closeMenu() {
        document.body.removeChild(overlay);
    }

    /* Event Listeners */
    input.focus();
    box.onclick = (e) => e.stopPropagation();
    overlay.onclick = () => closeMenu();

    input.oninput = function (e) {
        const term = e.target.value.toLowerCase();
        const terms = term.split(' ').filter(t => t.length > 0);

        filteredTools = tools.filter(tool => {
            const nameLower = tool.name.toLowerCase();
            return terms.every(t => nameLower.includes(t));
        });

        selectedIndex = 0;
        renderList();
    };

    input.onkeydown = function (e) {
        // Check for shortcut keys first (ONLY in Leader Mode)
        if (currentMode === 'leader' && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            const shortcutTool = tools.find(t => t.shortcut === e.key.toLowerCase());
            if (shortcutTool) {
                e.preventDefault();
                execute(shortcutTool);
                return;
            }
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % filteredTools.length;
            renderList();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + filteredTools.length) % filteredTools.length;
            renderList();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredTools[selectedIndex]) execute(filteredTools[selectedIndex]);
        } else if (e.key === 'Escape') {
            closeMenu();
        }
    };

    // Handle messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'open') {
            // Ensure overlay is in the DOM
            if (!document.getElementById(id)) {
                document.body.appendChild(overlay);
            }

            currentMode = request.mode; // Update current mode

            if (request.mode === 'leader') {
                input.placeholder = 'Press a key...';
                box.style.borderColor = '#0e639c'; // Blue border for Leader Mode
                // Filter to show only tools with shortcuts
                filteredTools = tools.filter(t => t.shortcut);
                renderList();
            } else {
                input.placeholder = 'Type to search commands...';
                box.style.borderColor = '#333';
                filteredTools = [...tools];
                renderList();
            }
            input.focus();
            input.value = '';
        }
    });
})();
