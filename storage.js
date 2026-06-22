// SPDX-FileCopyrightText: 2025 Paul Debus
//
// SPDX-License-Identifier: GPL-3.0-only

/*
 * Shared storage layer for Chrome Scripts.
 *
 * Scripts are stored as ONE item per script instead of a single packed
 * `tools` array. This means Chrome's 8 KB per-item quota now applies to
 * each individual script (not all of them combined), and we can hold up
 * to ~512 scripts / 100 KB total in storage.sync.
 *
 * Storage layout (in chrome.storage.sync):
 *   tool_order      -> array of script ids, defines display order
 *   script_<id>     -> the full script object { id, name, shortcut, code, enabled }
 *
 * This module is intentionally written as a classic (non-module) script so it
 * can be shared by the service worker (importScripts), the injected content
 * script (executeScript files), and the options page (<script src>).
 *
 * NOTE: All scripts currently live in storage.sync. The single `area` indirection
 * below is the seam for a future per-script "sync vs local" hybrid: pick the
 * area based on a script's `sync` flag and the rest of the logic stays the same.
 */
(function (global) {
    const ORDER_KEY = 'tool_order';
    const SCRIPT_PREFIX = 'script_';
    const QUOTA_BYTES_TOTAL = 102400; // 100 KB total for chrome.storage.sync
    const QUOTA_BYTES_PER_ITEM = 8192; // 8 KB per item (now per individual script)

    const area = chrome.storage.sync;

    function scriptKey(id) {
        return SCRIPT_PREFIX + id;
    }

    function itemBytes(value) {
        return new Blob([JSON.stringify(value)]).size;
    }

    // One-time migration from the legacy single `tools` array to per-script items.
    async function migrateIfNeeded() {
        const data = await area.get(['tools', ORDER_KEY]);
        if (!data.tools) return;

        const writes = {};
        const order = [];
        for (const s of data.tools) {
            writes[scriptKey(s.id)] = s;
            order.push(s.id);
        }
        // Preserve any existing order if a partial migration happened before.
        writes[ORDER_KEY] = data[ORDER_KEY] && data[ORDER_KEY].length ? data[ORDER_KEY] : order;
        await area.set(writes);
        await area.remove('tools');
    }

    // Returns all scripts as an ordered array.
    async function loadAll() {
        await migrateIfNeeded();
        const all = await area.get(null);
        const order = all[ORDER_KEY] || [];
        const scripts = [];
        const seen = new Set();

        for (const id of order) {
            const s = all[scriptKey(id)];
            if (s) {
                scripts.push(s);
                seen.add(id);
            }
        }
        // Safety net: include any script items missing from the order array.
        for (const key of Object.keys(all)) {
            if (key.startsWith(SCRIPT_PREFIX) && !seen.has(all[key].id)) {
                scripts.push(all[key]);
            }
        }
        return scripts;
    }

    // Saves (creates or updates) a single script and ensures it is in the order.
    async function saveScript(script) {
        await area.set({ [scriptKey(script.id)]: script });
        const data = await area.get(ORDER_KEY);
        const order = data[ORDER_KEY] || [];
        if (!order.includes(script.id)) {
            order.push(script.id);
            await area.set({ [ORDER_KEY]: order });
        }
    }

    // Removes a single script and drops it from the order.
    async function deleteScript(id) {
        await area.remove(scriptKey(id));
        const data = await area.get(ORDER_KEY);
        const order = (data[ORDER_KEY] || []).filter((x) => x !== id);
        await area.set({ [ORDER_KEY]: order });
    }

    // Persists a new display order (array of ids).
    async function saveOrder(ids) {
        await area.set({ [ORDER_KEY]: ids });
    }

    // Total bytes currently used in the storage area.
    async function getBytesInUse() {
        return area.getBytesInUse(null);
    }

    global.ScriptStore = {
        ORDER_KEY,
        SCRIPT_PREFIX,
        QUOTA_BYTES_TOTAL,
        QUOTA_BYTES_PER_ITEM,
        scriptKey,
        itemBytes,
        migrateIfNeeded,
        loadAll,
        saveScript,
        deleteScript,
        saveOrder,
        getBytesInUse,
    };
})(typeof self !== 'undefined' ? self : this);
