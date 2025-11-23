let scripts = [];
let currentScriptId = null;

const scriptList = document.getElementById('script-list');
const editorContainer = document.getElementById('editor-container');
const emptyState = document.getElementById('empty-state');
const nameInput = document.getElementById('script-name');
const shortcutInput = document.getElementById('script-shortcut');
const codeInput = document.getElementById('script-code');
const enabledInput = document.getElementById('script-enabled');
const saveBtn = document.getElementById('save-btn');
const deleteBtn = document.getElementById('delete-btn');
const addBtn = document.getElementById('add-btn');

// Load scripts on startup
chrome.storage.sync.get(['tools'], (result) => {
    if (result.tools) {
        scripts = result.tools;
        renderList();
    }
});

function renderList() {
    scriptList.innerHTML = '';
    scripts.forEach((script, index) => {
        const li = document.createElement('li');
        li.className = script.id === currentScriptId ? 'active' : '';
        if (script.enabled) li.classList.add('enabled');

        const shortcutDisplay = script.shortcut ? `[${script.shortcut}] ` : '';

        const content = document.createElement('div');
        content.className = 'script-content';
        content.innerHTML = `
            <span>${shortcutDisplay}${script.name}</span>
            <span class="status"></span>
        `;

        const controls = document.createElement('div');
        controls.className = 'script-controls';

        const upBtn = document.createElement('button');
        upBtn.className = 'move-btn';
        upBtn.innerHTML = '&#9650;'; // Up arrow
        upBtn.title = 'Move Up';
        upBtn.onclick = (e) => { e.stopPropagation(); moveScript(script.id, -1); };
        if (index === 0) upBtn.disabled = true;

        const downBtn = document.createElement('button');
        downBtn.className = 'move-btn';
        downBtn.innerHTML = '&#9660;'; // Down arrow
        downBtn.title = 'Move Down';
        downBtn.onclick = (e) => { e.stopPropagation(); moveScript(script.id, 1); };
        if (index === scripts.length - 1) downBtn.disabled = true;

        controls.appendChild(upBtn);
        controls.appendChild(downBtn);

        li.appendChild(content);
        li.appendChild(controls);

        li.onclick = () => selectScript(script.id);
        scriptList.appendChild(li);
    });
}

function moveScript(id, direction) {
    const index = scripts.findIndex(s => s.id === id);
    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= scripts.length) return;

    // Swap
    [scripts[index], scripts[newIndex]] = [scripts[newIndex], scripts[index]];

    chrome.storage.sync.set({ tools: scripts }, () => {
        renderList();
    });
}

function selectScript(id) {
    currentScriptId = id;
    const script = scripts.find(s => s.id === id);

    if (script) {
        nameInput.value = script.name;
        shortcutInput.value = script.shortcut || '';
        codeInput.value = script.code;
        enabledInput.checked = script.enabled;

        editorContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
        renderList();
    }
}

function saveScript() {
    if (!currentScriptId) return;

    const scriptIndex = scripts.findIndex(s => s.id === currentScriptId);
    if (scriptIndex !== -1) {
        scripts[scriptIndex].name = nameInput.value;
        scripts[scriptIndex].shortcut = shortcutInput.value.toLowerCase();
        scripts[scriptIndex].code = codeInput.value;
        scripts[scriptIndex].enabled = enabledInput.checked;

        chrome.storage.sync.set({ tools: scripts }, () => {
            renderList();
            // Show simple feedback
            const originalText = saveBtn.innerText;
            saveBtn.innerText = 'Saved!';
            setTimeout(() => saveBtn.innerText = originalText, 1000);
        });
    }
}

function deleteScript() {
    if (!currentScriptId) return;

    if (confirm('Are you sure you want to delete this script?')) {
        scripts = scripts.filter(s => s.id !== currentScriptId);
        chrome.storage.sync.set({ tools: scripts }, () => {
            currentScriptId = null;
            editorContainer.classList.add('hidden');
            emptyState.classList.remove('hidden');
            renderList();
        });
    }
}

function addScript() {
    const newScript = {
        id: Date.now().toString(),
        name: 'New Script',
        code: '// console.log("Hello World");',
        enabled: true
    };

    scripts.push(newScript);
    chrome.storage.sync.set({ tools: scripts }, () => {
        selectScript(newScript.id);
    });
}

saveBtn.onclick = saveScript;
deleteBtn.onclick = deleteScript;
addBtn.onclick = addScript;
