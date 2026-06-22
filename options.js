// SPDX-FileCopyrightText: 2025 Paul Debus
//
// SPDX-License-Identifier: GPL-3.0-only

import { CodeJar } from './vendor/codejar.js';

let scripts = [];
let currentScriptId = null;
let jar;

const scriptList = document.getElementById('script-list');
const editorContainer = document.getElementById('editor-container');
const emptyState = document.getElementById('empty-state');
const nameInput = document.getElementById('script-name');
const shortcutInput = document.getElementById('script-shortcut');
const enabledInput = document.getElementById('script-enabled');
const saveBtn = document.getElementById('save-btn');
const deleteBtn = document.getElementById('delete-btn');
const addBtn = document.getElementById('add-btn');
const storageFill = document.getElementById('storage-fill');
const storageText = document.getElementById('storage-text');

// Initialize CodeJar
const editorElement = document.getElementById('editor');
const highlight = editor => {
    // Prism.highlightElement(editor); // This might not work if Prism isn't global or if we need to call it differently
    // Prism is loaded via script tag, so global Prism should be available
    if (window.Prism) {
        window.Prism.highlightElement(editor);
    }
};

jar = CodeJar(editorElement, highlight);

editorElement.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveScript();
    }
});

// Storage quota constants (provided by storage.js / ScriptStore)
const QUOTA_BYTES_TOTAL = ScriptStore.QUOTA_BYTES_TOTAL; // 100 KB total for chrome.storage.sync
const QUOTA_BYTES_PER_ITEM = ScriptStore.QUOTA_BYTES_PER_ITEM; // 8 KB per item (now per individual script)

// Load scripts on startup
ScriptStore.loadAll().then((all) => {
    scripts = all;
    renderList();
    updateStorageUsage();
}).catch(handleStorageError);

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

    ScriptStore.saveOrder(scripts.map(s => s.id)).then(() => {
        renderList();
        updateStorageUsage();
    }).catch(handleStorageError);
}

function selectScript(id) {
    currentScriptId = id;
    const script = scripts.find(s => s.id === id);

    if (script) {
        nameInput.value = script.name;
        shortcutInput.value = script.shortcut || '';
        jar.updateCode(script.code);
        enabledInput.checked = script.enabled;

        editorContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
        renderList();
    }
}

function saveScript() {
    if (!currentScriptId) return;

    const shortcutValue = shortcutInput.value.trim().toLowerCase();

    // Validation: Only allow single alphanumeric characters
    if (shortcutValue.length > 0) {
        if (shortcutValue.length > 1) {
            alert("Shortcut must be a single character.");
            return;
        }
        if (!/^[\p{L}\p{N}]$/u.test(shortcutValue)) {
            alert("Shortcut must be a letter or number.");
            return;
        }

        // Check for duplicate shortcuts
        const duplicateScript = scripts.find(s => s.shortcut === shortcutValue && s.id !== currentScriptId);
        if (duplicateScript) {
            alert(`Shortcut '${shortcutValue}' is already assigned to script "${duplicateScript.name}".`);
            return;
        }
    }

    const scriptIndex = scripts.findIndex(s => s.id === currentScriptId);
    if (scriptIndex !== -1) {
        scripts[scriptIndex].name = nameInput.value;
        scripts[scriptIndex].shortcut = shortcutValue;
        scripts[scriptIndex].code = jar.toString();
        scripts[scriptIndex].enabled = enabledInput.checked;

        const script = scripts[scriptIndex];

        // Per-item quota now applies to a single script (8 KB each).
        const bytes = ScriptStore.itemBytes(script);
        if (bytes > QUOTA_BYTES_PER_ITEM) {
            const kb = (bytes / 1024).toFixed(1);
            const limitKb = (QUOTA_BYTES_PER_ITEM / 1024).toFixed(0);
            alert(`This script is too large! (${kb}/${limitKb} KB)\n\nEach script must stay under ${limitKb} KB. Please shorten it.`);
            return;
        }

        ScriptStore.saveScript(script).then(() => {
            renderList();
            updateStorageUsage();
            // Show simple feedback
            const originalText = saveBtn.innerText;
            saveBtn.innerText = 'Saved!';
            setTimeout(() => saveBtn.innerText = originalText, 1000);
        }).catch(handleStorageError);
    }
}

function deleteScript() {
    if (!currentScriptId) return;

    if (confirm('Are you sure you want to delete this script?')) {
        const idToDelete = currentScriptId;
        scripts = scripts.filter(s => s.id !== idToDelete);
        ScriptStore.deleteScript(idToDelete).then(() => {
            currentScriptId = null;
            editorContainer.classList.add('hidden');
            emptyState.classList.remove('hidden');
            renderList();
            updateStorageUsage();
        }).catch(handleStorageError);
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
    ScriptStore.saveScript(newScript).then(() => {
        selectScript(newScript.id);
        updateStorageUsage();
    }).catch(handleStorageError);
}

function handleStorageError(error) {
    console.error("Storage error:", error);
    const message = (error && error.message) ? error.message : String(error);
    alert("Failed to save changes: " + message + "\n\nYou may have hit the total storage limit. Try deleting some scripts.");
}

saveBtn.onclick = saveScript;
deleteBtn.onclick = deleteScript;
addBtn.onclick = addScript;

// Auto-save when toggling enabled/disabled
enabledInput.onchange = function () {
    if (currentScriptId) {
        saveScript();
    }
};

function updateStorageUsage() {
    ScriptStore.getBytesInUse().then((bytes) => {
        const percentage = (bytes / QUOTA_BYTES_TOTAL) * 100;
        const kb = (bytes / 1024).toFixed(1);
        const totalKb = (QUOTA_BYTES_TOTAL / 1024).toFixed(0);

        // Update progress bar
        storageFill.style.width = `${Math.min(percentage, 100)}%`;

        // Update color based on usage
        storageFill.classList.remove('warning', 'danger');
        if (percentage >= 90) {
            storageFill.classList.add('danger');
        } else if (percentage >= 70) {
            storageFill.classList.add('warning');
        }

        // Update text
        storageText.textContent = `${kb} / ${totalKb} KB (${percentage.toFixed(1)}%)`;
    }).catch(handleStorageError);
}
