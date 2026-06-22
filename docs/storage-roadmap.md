<!--
SPDX-FileCopyrightText: 2025 Paul Debus

SPDX-License-Identifier: CC0-1.0
-->

# Storage Roadmap

This document records the storage design and the planned expansion path, so the
context isn't lost.

## Background: the per-item limit

`chrome.storage.sync` enforces two separate quotas:

- **`QUOTA_BYTES_PER_ITEM` = 8 KB** — applies to each individual key/value.
- **`QUOTA_BYTES` = 100 KB** — total across all keys (max 512 items).

Originally every script was packed into a single `tools` array under one key.
That meant the 8 KB per-item limit applied to **all scripts combined** — the
wall users were hitting.

## Current design (implemented): one item per script

Each script is now stored as its own item in `chrome.storage.sync`:

- `script_<id>` → the script object `{ id, name, shortcut, code, enabled }`
- `tool_order` → array of ids defining display order

Result:

- **Each script gets its own 8 KB budget** (not 8 KB shared across all scripts).
- Up to ~512 scripts / 100 KB total.
- Cross-device **Sync** is preserved.
- Legacy `tools` arrays are migrated automatically on first load.

All storage access goes through `storage.js` (`ScriptStore`), which is shared by
the service worker (`importScripts`), the injected content script
(`executeScript` files), and the options page (`<script src>`).

> **Remaining limitation:** a *single* script still maxes out at 8 KB in sync.
> Scripts larger than that need the local/hybrid path below.

## Planned expansion: per-script "sync vs local" toggle (hybrid)

The goal is to let users choose, per script, whether it syncs across devices or
stays local:

- **Synced scripts** → `chrome.storage.sync` (small, important, available
  everywhere; 8 KB each).
- **Local-only scripts** → `chrome.storage.local` (≈5 MB, or unlimited with the
  `unlimitedStorage` permission; no meaningful per-item limit — good for large
  scripts).

### Why this is cheap to add

The current per-item design is the foundation. `storage.js` has a single `area`
indirection (currently always `chrome.storage.sync`). The work to add the
toggle:

1. **Data model** — add a `sync: true | false` field to each script object
   (default `true` to preserve current behavior).
2. **Area selection** — in `storage.js`, choose the area per script:
   `const area = script.sync ? chrome.storage.sync : chrome.storage.local;`
   for `saveScript` / `deleteScript`.
3. **Loading** — `loadAll()` reads from **both** areas and merges them, using a
   combined order. Consider an order key per area, or one shared order list with
   ids resolved against whichever area holds them.
4. **Moving between areas** — when a script's `sync` flag flips, write it to the
   new area and remove it from the old one.
5. **UI** — add a "Sync across devices" checkbox to the options editor, next to
   the enabled toggle.
6. **Manifest** — add the `unlimitedStorage` permission if we want local storage
   to exceed ~5 MB.
7. **Live updates** — `content.js` already reloads on `script_*` / `tool_order`
   changes in the `sync` namespace; extend the `onChanged` listener to also
   handle the `local` namespace.
8. **Usage UI** — show sync vs local usage separately (sync against 100 KB,
   local against its larger quota).

### Migration / compatibility notes

- Existing scripts have no `sync` field; treat missing as `true`.
- Keep the legacy `tools` migration in place (it predates the hybrid).
- Order handling is the main design decision: a single shared `tool_order` is
  simplest for the UI, as long as `loadAll()` can resolve each id against the
  correct area.

## Alternative considered: move everything to `storage.local`

Simplest possible change (swap `sync` → `local` + `unlimitedStorage`), removes
the size limit entirely, but loses cross-device sync for everyone. The hybrid
toggle is preferred because it covers both use cases without forcing a choice.
