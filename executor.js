// SPDX-FileCopyrightText: 2025 Paul Debus
//
// SPDX-License-Identifier: GPL-3.0-only

document.addEventListener('antigravity-execute', (event) => {
    try {
        new Function(event.detail)();
    } catch (e) {
        console.error("Script execution failed:", e);
    }
});
