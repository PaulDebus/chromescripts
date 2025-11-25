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

// Storage quota constants
const QUOTA_BYTES_TOTAL = 102400; // 100 KB total for chrome.storage.sync
const QUOTA_BYTES_PER_ITEM = 8192; // 8 KB per item

// Load scripts on startup
chrome.storage.sync.get(['tools'], (result) => {
    if (result.tools) {
        scripts = result.tools;
        renderList();
        updateStorageUsage();
    } else {
        updateStorageUsage();
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

    saveScriptsToStorage(() => {
        renderList();
    });
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

        saveScriptsToStorage(() => {
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
        saveScriptsToStorage(() => {
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
    saveScriptsToStorage(() => {
        selectScript(newScript.id);
    });
}

function saveScriptsToStorage(callback) {
    // Calculate storage size
    const json = JSON.stringify({ tools: scripts });
    const totalBytes = new Blob([json]).size;
    const itemBytes = new Blob([JSON.stringify(scripts)]).size;

    // Check per-item quota (8 KB)
    if (itemBytes > QUOTA_BYTES_PER_ITEM) {
        const kb = (itemBytes / 1024).toFixed(1);
        const limitKb = (QUOTA_BYTES_PER_ITEM / 1024).toFixed(0);
        alert(`Per-item storage limit exceeded! (${kb}/${limitKb} KB)\n\nPlease delete some scripts or reduce their size.`);
        return;
    }

    // Check total quota (100 KB)
    if (totalBytes > QUOTA_BYTES_TOTAL) {
        const kb = (totalBytes / 1024).toFixed(1);
        const limitKb = (QUOTA_BYTES_TOTAL / 1024).toFixed(0);
        alert(`Total storage limit exceeded! (${kb}/${limitKb} KB)\n\nPlease delete some scripts to free up space.`);
        return;
    }

    // Warn if approaching total quota (>80%)
    const percentage = (totalBytes / QUOTA_BYTES_TOTAL) * 100;
    if (percentage > 80 && percentage <= 90) {
        console.warn(`Storage usage is at ${percentage.toFixed(1)}%. Consider removing unused scripts.`);
    }

    chrome.storage.sync.set({ tools: scripts }, () => {
        if (chrome.runtime.lastError) {
            console.error("Storage error:", chrome.runtime.lastError);
            alert("Failed to save changes: " + chrome.runtime.lastError.message);
            return;
        }
        updateStorageUsage();
        if (callback) callback();
    });
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
    const json = JSON.stringify({ tools: scripts });
    const bytes = new Blob([json]).size;
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
}
