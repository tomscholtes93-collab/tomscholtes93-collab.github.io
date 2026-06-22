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
  const isDesktop = () => mq.matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- clock ----
  const clock = document.getElementById('os-clock');
  const tick = () => { if (clock) clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  tick(); setInterval(tick, 15000);

  let z = 100;
  const wins = Array.from(canvas.querySelectorAll('.os-win'));
  const dockItems = Array.from(root.querySelectorAll('.os-dock-item'));
  const winById = (id) => canvas.querySelector('.os-win[data-app="' + id + '"]');

  const MIN_W = 280, MIN_H = 160, BAR = 44, DOCK = 72; // canvas insets for maximize

  function place(w) {
    w.style.left  = (parseInt(w.dataset.x || '48', 10)) + 'px';
    w.style.top   = (parseInt(w.dataset.y || '64', 10)) + 'px';
    w.style.width = (parseInt(w.dataset.w || '460', 10)) + 'px';
    if (w.dataset.h) w.style.height = parseInt(w.dataset.h, 10) + 'px';
  }
  function geom(w) { return { left: w.style.left, top: w.style.top, width: w.style.width, height: w.style.height }; }
  function setGeom(w, g) { w.style.left = g.left; w.style.top = g.top; w.style.width = g.width; w.style.height = g.height; }

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
      on = true; focusWin(w);
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
        on = true; focusWin(w); e.stopPropagation();
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
    nav.querySelectorAll('[data-os-go]').forEach((t) => t.addEventListener('click', (e) => {
      e.preventDefault(); const name = t.dataset.osGo;
      if (name && nav.querySelector('[data-os-view="' + name + '"]')) { stack.push(name); render(); }
    }));
    if (back) back.addEventListener('click', (e) => { e.preventDefault(); if (stack.length > 1) { stack.pop(); render(); } });
    render();
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
  defaultOpen.forEach((id) => { const w = winById(id); if (w) focusWin(w); });
  setDockState();

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
