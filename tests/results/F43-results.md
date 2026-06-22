# tomOS interaction proof — F43 (sofia@fedora-2)

Date: 2026-06-22 08:01 CEST
Runner: `tests/tomos.spec.mjs` (playwright 1.60.0 chromium, headless), serving `dist/` on an ephemeral loopback port.
Command: `PW_DIR=/home/sofia/.npm/_npx/e41f203b7505f1fb/node_modules node tests/tomos.spec.mjs`

## Result: 38 passed, 0 failed (F43 pw 1.60) — and 38/38 on F44 (pw 1.61, same dist)

| Group | Assertions | Status |
|-------|-----------|--------|
| A layer split @1440 | desktop visible, editorial hidden, default window flex | PASS |
| B drag (W1) | titlebar drag moves window by ~dx/dy | PASS |
| C minimize/dock (W1) | minimize hides, dock loses open state, dock click reopens, open state returns | PASS |
| D maximize/restore (W2) | fills canvas width (1440=1440), top=44, height=vh-44-72=784, restore exact left/top/width/height, double-click titlebar maximizes + restores | PASS |
| E resize (W3) | SE corner grows w/h; min-width clamp =280; min-height clamp =160 | PASS |
| F close/reopen (W1) | close hides, dock reopen | PASS |
| G Notes drill-down (W4) | window opens, root visible, back disabled at root, drill-in shows one child + hides root, back enabled, crumb non-empty, back returns to list, back disabled again | PASS |
| J keyboard/Esc (W8) | Enter on dock opens + focuses window; Esc closes focused window | PASS |
| H console | error-free during desktop run | PASS |
| I mobile (W5) | @480 tomOS hidden, editorial visible (h=12400) | PASS |
| K reduced-motion (W8) | window transition-duration = 0s under prefers-reduced-motion:reduce | PASS |

## Cross-machine
- F43 (sofia@fedora-2, playwright 1.60.0): 38/38 PASS.
- F44 (tom@fedora-44, playwright 1.61.0, same dist rsynced to ~/lab-preview/dist): 38/38 PASS.
- Peer-mailbox critique requested from F44 (msg 20260622T060725Z-22ec); reply pending (not a DONE gate).

## Bugs found + fixed during verification
1. **Maximize did not fully fill canvas** (1424 vs 1440): `.os-win` had `max-width:calc(100vw-16px)` clamping the maximized width. Fixed with `.os-win.maximized { max-width: none; }`.
2. **Window floored at ~175px, titlebar pushed down ~86px**: `.os-win` is a `<section>` and inherited the global `section { padding: var(--pad-y) 0 }` rule (6vw = 86.4px at 1440). With border-box this ate the content and floored the window. Fixed with `.os-win { padding: 0 }` + `.os-win-body { min-height: 0 }` (flex scroll fix). After the fix the min-height clamp renders at exactly 160px.

## Screenshots
- `desktop-1440.png` — three default windows (About/Work/Now), menubar, dock.
- `desktop-notes-drilled.png` — Notes window drilled into a note with Back + breadcrumb.
- `mobile-480.png` — editorial homepage, tomOS hidden.
