/*
 * tomOS windowing engine: drag, focus, minimize, maximize/restore, resize, dock,
 * and in-window OS-nav (Back button). Desktop only (>= 1200px). Vanilla, no deps.
 *
 * MARKUP CONTRACT (the desktop layer must conform):
 *   [data-os]                      desktop root (CSS shows it only >= 1200px)
 *     [data-os-menubar]            top bar; items: [data-open="<app>"]; clock: #os-clock
 *     [data-os-canvas]             window canvas (positioning context)
 *       .os-win[data-app=<id>]     a window; data-x,data-y,data-w,data-h (initial px)
 *         .os-titlebar             drag handle; holds the three lights:
 *            .os-light.os-close / .os-light.os-min / .os-light.os-max
 *         .os-win-body             scrollable content
 *            [data-os-nav]         optional drill-down region inside a window:
 *               [data-os-crumb]    breadcrumb text target (optional)
 *               [data-os-back]     back control (disabled at root)
 *               [data-os-view=root]  + [data-os-view="<name>"] sibling views
 *               [data-os-go="<name>"] trigger that pushes a view
 *     [data-os-dock]               dock; items: .os-dock-item[data-open="<id>"]
 */
export function initTomOS() {
  const root = document.querySelector('[data-os]');
  if (!root) return;
  const canvas = root.querySelector('[data-os-canvas]');
  if (!canvas) return;

  const DESKTOP = '(min-width: 1200px)';
  const mq = window.matchMedia(DESKTOP);
  // Desktop mode is LOCKED at entry (html.os-mode, set in Base.astro head before paint),
  // not read live, so interactions stay consistent with the locked layer: a window
  // maximize or any width jitter never demotes the OS to the editorial layer mid-session.
  const isDesktop = () => document.documentElement.classList.contains('os-mode');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- clock ----
  const clock = document.getElementById('os-clock');
  const tick = () => { if (clock) clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  tick(); setInterval(tick, 15000);

  let z = 100;
  const wins = Array.from(canvas.querySelectorAll('.os-win'));
  const dockItems = Array.from(root.querySelectorAll('.os-dock-item'));
  const winById = (id) => canvas.querySelector('.os-win[data-app="' + id + '"]');
  const navByApp = {};           // app id -> its [data-os-nav] (drill-down windows only)

  const MIN_W = 280, MIN_H = 160, BAR = 44, DOCK = 72; // canvas insets for maximize

  function place(w) {
    w.style.left  = (parseInt(w.dataset.x || '48', 10)) + 'px';
    w.style.top   = (parseInt(w.dataset.y || '64', 10)) + 'px';
    w.style.width = (parseInt(w.dataset.w || '460', 10)) + 'px';
    if (w.dataset.h) w.style.height = parseInt(w.dataset.h, 10) + 'px';
  }
  function geom(w) { return { left: w.style.left, top: w.style.top, width: w.style.width, height: w.style.height }; }
  function setGeom(w, g) { w.style.left = g.left; w.style.top = g.top; w.style.width = g.width; w.style.height = g.height; }

  // ---- proportional tiling ----
  // Position every windowed tile as a fraction (data-fx/fy/fw/fh) of the LIVE
  // canvas, so the desktop fills any screen size with no wallpaper gaps. Runs at
  // load and on resize. A window the user has dragged/resized (w._userPlaced) or
  // maximized is left alone, so tiling never fights manual control. Floors keep
  // narrow tiles usable on small desktops; the editorial layer covers < 1200px.
  const GUT = 10;
  function layoutTiles() {
    if (!isDesktop()) return;
    const W = canvas.clientWidth;
    const Hu = Math.max(220, canvas.clientHeight - BAR - DOCK);
    wins.forEach((w) => {
      if (w._userPlaced || w.dataset.max === '1') return;
      const fx = parseFloat(w.dataset.fx), fy = parseFloat(w.dataset.fy);
      const fw = parseFloat(w.dataset.fw), fh = parseFloat(w.dataset.fh);
      if ([fx, fy, fw, fh].some((n) => Number.isNaN(n))) return; // not a tiled window
      const left = Math.round(fx * W) + GUT;
      const top = BAR + Math.round(fy * Hu) + GUT;
      const width = Math.max(150, Math.round(fw * W) - 2 * GUT);
      const height = Math.max(110, Math.round(fh * Hu) - 2 * GUT);
      w.style.left = left + 'px'; w.style.top = top + 'px';
      w.style.width = width + 'px'; w.style.height = height + 'px';
    });
  }

  function focusWin(w) {
    wins.forEach((o) => o.classList.remove('focused'));
    w.classList.add('focused');
    w.style.zIndex = String(++z);
  }
  function setDockState() {
    dockItems.forEach((di) => {
      const w = winById(di.dataset.open);
      if (!w) return;
      di.classList.toggle('open', !w.classList.contains('minimized') && w.style.display !== 'none');
    });
  }
  function openWin(id) {
    const w = winById(id); if (!w || !isDesktop()) return;
    w.classList.remove('minimized'); w.style.display = 'flex';
    focusWin(w); setDockState();
  }
  function closeWin(w) { w.style.display = 'none'; setDockState(); }
  function minWin(w)   { w.classList.add('minimized'); setDockState(); }

  // ---- W2: true maximize / restore ----
  function maxWin(w) {
    if (w.dataset.max === '1') {            // restore
      if (w._restore) setGeom(w, w._restore);
      w.dataset.max = '0'; w.classList.remove('maximized');
    } else {                                 // maximize: fill canvas
      w._restore = geom(w);
      const r = canvas.getBoundingClientRect();
      w.style.left = '0px'; w.style.top = BAR + 'px';
      w.style.width = r.width + 'px';
      w.style.height = Math.max(MIN_H, r.height - BAR - DOCK) + 'px';
      w.dataset.max = '1'; w.classList.add('maximized');
    }
    focusWin(w);
  }

  // ---- drag ----
  function point(e) { return e.touches && e.touches[0] ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY }; }
  function enableDrag(w, handle) {
    let sx, sy, ox, oy, on = false;
    const down = (e) => {
      if (e.target.closest('.os-light') || e.target.closest('[data-os-back]') || e.target.closest('[data-os-go]')) return;
      if (w.dataset.max === '1') return;     // do not drag while maximized
      on = true; focusWin(w); w._userPlaced = true;   // opt out of auto-tiling
      const p = point(e); sx = p.x; sy = p.y; ox = w.offsetLeft; oy = w.offsetTop;
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
      window.addEventListener('touchmove', move, { passive: false }); window.addEventListener('touchend', up);
    };
    const move = (e) => {
      if (!on) return; if (e.cancelable) e.preventDefault();
      const p = point(e);
      const nx = Math.max(2, Math.min(ox + (p.x - sx), canvas.clientWidth - 80));
      const ny = Math.max(BAR, Math.min(oy + (p.y - sy), canvas.clientHeight - 40));
      w.style.left = nx + 'px'; w.style.top = ny + 'px';
    };
    const up = () => {
      on = false; document.body.style.userSelect = '';
      window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up);
    };
    handle.addEventListener('mousedown', down);
    handle.addEventListener('touchstart', down, { passive: true });
    handle.addEventListener('dblclick', () => maxWin(w));
  }

  // ---- W3: resize (8 handles) ----
  const DIRS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
  function enableResize(w) {
    DIRS.forEach((dir) => {
      const h = document.createElement('div');
      h.className = 'os-resize os-resize-' + dir;
      h.dataset.dir = dir;
      w.appendChild(h);
      let sx, sy, sl, st, sw, sh, on = false;
      const down = (e) => {
        if (w.dataset.max === '1') return;
        on = true; focusWin(w); e.stopPropagation(); w._userPlaced = true; // opt out of auto-tiling
        const p = point(e); sx = p.x; sy = p.y;
        sl = w.offsetLeft; st = w.offsetTop; sw = w.offsetWidth; sh = w.offsetHeight;
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
        window.addEventListener('touchmove', move, { passive: false }); window.addEventListener('touchend', up);
      };
      const move = (e) => {
        if (!on) return; if (e.cancelable) e.preventDefault();
        const p = point(e); const dx = p.x - sx, dy = p.y - sy;
        let nl = sl, nt = st, nw = sw, nh = sh;
        if (dir.includes('e')) nw = Math.max(MIN_W, sw + dx);
        if (dir.includes('s')) nh = Math.max(MIN_H, sh + dy);
        if (dir.includes('w')) { nw = Math.max(MIN_W, sw - dx); nl = sl + (sw - nw); }
        if (dir.includes('n')) { nh = Math.max(MIN_H, sh - dy); nt = st + (sh - nh); }
        // keep within canvas
        nl = Math.max(0, nl); nt = Math.max(BAR, nt);
        nw = Math.min(nw, canvas.clientWidth - nl); nh = Math.min(nh, canvas.clientHeight - nt);
        w.style.left = nl + 'px'; w.style.top = nt + 'px';
        w.style.width = nw + 'px'; w.style.height = nh + 'px';
      };
      const up = () => {
        on = false; document.body.style.userSelect = '';
        window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up);
        window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up);
      };
      h.addEventListener('mousedown', down);
      h.addEventListener('touchstart', down, { passive: true });
    });
  }

  // ---- W4: in-window OS-nav (Back) ----
  function enableNav(w) {
    const nav = w.querySelector('[data-os-nav]'); if (!nav) return;
    const crumb = nav.querySelector('[data-os-crumb]');
    const back = nav.querySelector('[data-os-back]');
    const views = Array.from(nav.querySelectorAll('[data-os-view]'));
    const show = (name) => views.forEach((v) => { v.hidden = v.dataset.osView !== name; });
    const stack = ['root'];
    const render = () => {
      const top = stack[stack.length - 1];
      show(top);
      if (back) back.disabled = stack.length <= 1;
      if (crumb) crumb.textContent = stack.length <= 1 ? '' : top;
      const body = w.querySelector('.os-win-body'); if (body) body.scrollTop = 0;
    };
    const goTo = (name) => {
      if (name && nav.querySelector('[data-os-view="' + name + '"]')) { stack.push(name); render(); }
    };
    const reset = () => { stack.length = 1; render(); };
    nav.querySelectorAll('[data-os-go]').forEach((t) => t.addEventListener('click', (e) => {
      e.preventDefault(); goTo(t.dataset.osGo);
    }));
    if (back) back.addEventListener('click', (e) => { e.preventDefault(); if (stack.length > 1) { stack.pop(); render(); } });
    render();
    // Expose drill helpers so internal-link routing (V1c) can open a window AND
    // jump straight to a child view (e.g. a /case/<slug>/ link).
    nav._osGoTo = goTo;
    nav._osReset = reset;
    if (w.dataset.app) navByApp[w.dataset.app] = nav;
  }

  // ---- V1c: keep ALL navigation INSIDE the OS (no full-page nav) ----
  // Any same-origin, same-tab <a> click inside a window is intercepted: if it
  // maps to a drill-down window we open that window (and the right child view);
  // otherwise we open the standalone page in a NEW TAB so the OS is never left.
  // Explicit target=_blank / mailto: / external links open normally.
  const LOC_RE = /^\/(?:de|fr|ru)(?=\/|$)/;
  function routeInternal(url) {
    let path = url.pathname.replace(/\/+$/, '').replace(LOC_RE, '');
    let appId = null, slug = null;
    const seg = (base) => path === base ? '' : path.slice(base.length + 1);
    if (path === '/case' || path.startsWith('/case/')) { appId = 'work'; slug = seg('/case'); }
    else if (path === '/projects' || path.startsWith('/projects/')) { appId = 'projects'; slug = seg('/projects'); }
    else if (path === '/notes' || path.startsWith('/notes/')) { appId = 'notes'; slug = seg('/notes'); }
    else return false;
    if (!winById(appId)) return false;
    openWin(appId);
    const w = winById(appId); if (w && w.focus) w.focus({ preventScroll: true });
    const nav = navByApp[appId];
    if (nav) {
      if (nav._osReset) nav._osReset();
      if (slug && nav._osGoTo) {
        const esc = (window.CSS && CSS.escape) ? CSS.escape(slug) : slug.replace(/"/g, '\\"');
        const btn = nav.querySelector('[data-os-go][data-os-slug="' + esc + '"]');
        if (btn && btn.dataset.osGo) nav._osGoTo(btn.dataset.osGo);
      }
    }
    return true;
  }
  canvas.addEventListener('click', (e) => {
    if (!isDesktop()) return;
    const a = e.target.closest('a[href]');
    if (!a || !canvas.contains(a)) return;
    const href = a.getAttribute('href') || '';
    if (a.target === '_blank' || a.hasAttribute('download')) return;     // open normally
    if (/^(?:mailto:|tel:|sms:|#)/i.test(href)) return;                  // non-navigational
    let url; try { url = new URL(href, location.href); } catch (_e) { return; }
    if (url.origin !== location.origin) return;                         // external -> normal
    e.preventDefault();                                                  // never full-page nav inside the OS
    if (routeInternal(url)) return;
    window.open(url.href, '_blank', 'noopener');                         // standalone page, OS intact
  });

  // ---- V4b: simulated autonomous workstreams (deterministic, reduced-motion-safe) ----
  function initActivity() {
    const wrap = root.querySelector('[data-os-activity]');
    if (!wrap) return;
    const labels = {
      running: wrap.dataset.labelRunning || 'Running',
      done: wrap.dataset.labelDone || 'Done',
      queued: wrap.dataset.labelQueued || 'Queued',
    };
    const procs = Array.from(wrap.querySelectorAll('.os-proc')).map((el, i) => ({
      el,
      i,
      fill: el.querySelector('.os-proc-fill'),
      statusEl: el.querySelector('[data-proc-status]'),
      pctEl: el.querySelector('[data-proc-pct]'),
      state: el.dataset.state || 'queued',
      delay: parseInt(el.dataset.delay || '0', 10),
      loops: el.dataset.proc === 'mailbox' || el.dataset.proc === 'peer' || el.dataset.proc === 'reconcile',
      pct: el.dataset.state === 'done' ? 100 : el.dataset.state === 'queued' ? 0 : 52 + ((i * 11) % 28),
      doneAt: 0,
    }));
    const render = (p) => {
      const pct = Math.round(p.pct);
      if (p.fill) p.fill.style.width = pct + '%';
      if (p.pctEl) p.pctEl.textContent = pct + '%';
      if (p.statusEl) { p.statusEl.textContent = labels[p.state] || ''; p.statusEl.className = 'os-status os-status-' + p.state; }
      p.el.dataset.state = p.state;
    };
    procs.forEach(render);
    if (reduce) return;                       // static snapshot; honor reduced motion
    let tick = 0;
    setInterval(() => {
      tick++;
      procs.forEach((p) => {
        if (p.state === 'queued') {
          if (tick >= p.delay) { p.state = 'running'; p.pct = 5; }
        } else if (p.state === 'running') {
          p.pct += 6 * (0.6 + ((p.i + tick) % 3) * 0.2);   // deterministic per (stream, tick)
          if (p.pct >= 100) { p.pct = 100; p.state = 'done'; p.doneAt = tick; }
        } else if (p.state === 'done' && p.loops && tick - p.doneAt >= 4) {
          p.state = 'running'; p.pct = 6;                  // keep a few streams alive in a loop
        }
        render(p);
      });
    }, 1500);
  }

  // ---- init ----
  const defaultOpen = (root.dataset.osDefault || 'about,work,now').split(',').map((s) => s.trim());
  wins.forEach((w) => {
    place(w);
    w.style.display = defaultOpen.indexOf(w.dataset.app) === -1 ? 'none' : 'flex';
    w.addEventListener('mousedown', () => focusWin(w));
    const bar = w.querySelector('.os-titlebar');
    const c = w.querySelector('.os-light.os-close'), m = w.querySelector('.os-light.os-min'), x = w.querySelector('.os-light.os-max');
    if (c) c.addEventListener('click', (e) => { e.stopPropagation(); closeWin(w); });
    if (m) m.addEventListener('click', (e) => { e.stopPropagation(); minWin(w); });
    if (x) x.addEventListener('click', (e) => { e.stopPropagation(); maxWin(w); });
    if (bar) enableDrag(w, bar);
    enableResize(w);
    enableNav(w);
  });
  layoutTiles();   // proportional initial placement (overrides the px fallback)
  defaultOpen.forEach((id) => { const w = winById(id); if (w) focusWin(w); });
  setDockState();
  initActivity();

  // Re-tile on viewport change (debounced) and when crossing the desktop bp.
  let _rt;
  window.addEventListener('resize', () => { clearTimeout(_rt); _rt = setTimeout(layoutTiles, 120); });
  if (mq.addEventListener) mq.addEventListener('change', layoutTiles);

  // openers (dock + menubar + in-window)
  root.querySelectorAll('[data-open]').forEach((el) => {
    if (el.classList.contains('os-light')) return;
    el.addEventListener('click', (e) => {
      const id = el.dataset.open; if (!id) return;
      if (!isDesktop()) return; // mobile uses the editorial layer
      e.preventDefault(); openWin(id);
      const w = winById(id); if (w) w.focus && w.focus({ preventScroll: true });
    });
  });

  // Esc closes focused window
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDesktop()) {
      const f = canvas.querySelector('.os-win.focused');
      if (f) closeWin(f);
    }
  });
}
