import { useState, useEffect, useRef } from 'react';

/* Names only. The hexes used to live here AND in the Base.astro head script,
   two tables that had to be kept in sync by hand. They are now in exactly one
   place, the [data-theme][data-accent] matrix in tokens.css, and the swatch
   buttons below take their fill from `var(--accent)` via their own
   data-accent attribute. Side effect worth having: the swatches are now
   theme-correct, where before they showed light-theme hexes on both dark
   themes. */
const PUBLIC_ACCENTS = {
  terracotta: { name: 'Terracotta' },
  ink:        { name: 'Navy' },
  forest:     { name: 'Forest' },
  amber:      { name: 'Amber' },
  violet:     { name: 'Violet' },
};

const PUBLIC_THEMES = [
  { v: 'light', label: 'Light' },
  { v: 'dark',  label: 'Dark' },
  { v: 'ink',   label: 'Ink' },
];

const PUBLIC_DENSITIES = [
  { v: 'compact', label: 'Compact' },
  { v: 'default', label: 'Default' },
  { v: 'airy',    label: 'Airy' },
];

const STORAGE_KEY = 'ts-display-prefs';

function loadPrefs() {
  if (typeof window === 'undefined') return { theme: 'light', accent: 'terracotta', density: 'default' };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      theme: saved.theme || 'light',
      accent: saved.accent || 'terracotta',
      density: saved.density || 'default',
    };
  } catch (e) {
    return { theme: 'light', accent: 'terracotta', density: 'default' };
  }
}

function savePrefs(p) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) {}
}

function applyPrefs(p) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', p.theme);
  if (p.density && p.density !== 'default') root.setAttribute('data-density', p.density);
  else root.removeAttribute('data-density');
  /* Attribute, not inline style. Both writers had to change or the defect
     would have survived on whichever path still wrote inline; the other one
     is the head script in Base.astro. */
  root.setAttribute('data-accent', PUBLIC_ACCENTS[p.accent] ? p.accent : 'terracotta');
  /* HeroLattice.astro registers a `ts-display-prefs` listener that nothing in
     the tree ever fired, so the lattice only picked up a theme change on the
     next navigation. One line honours the contract rather than leaving one
     side believing in it. */
  try { window.dispatchEvent(new CustomEvent('ts-display-prefs', { detail: p })); } catch (e) {}
}

export default function DisplayPanel() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState({ theme: 'light', accent: 'terracotta', density: 'default' });
  const [pos, setPos] = useState({ x: null, y: null });
  const dragRef = useRef(null);
  const drag = useRef({ active: false, dx: 0, dy: 0 });
  const hydrated = useRef(false);

  // Read prefs after hydration to avoid SSR/client mismatch.
  useEffect(() => {
    setPrefs(loadPrefs());
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    applyPrefs(prefs);
    savePrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    function onMove(e) {
      if (!drag.current.active) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - drag.current.dx;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - drag.current.dy;
      setPos({
        x: Math.max(8, Math.min(window.innerWidth - 280, x)),
        y: Math.max(8, Math.min(window.innerHeight - 80, y)),
      });
    }
    function onUp() { drag.current.active = false; document.body.style.userSelect = ''; }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'd' || e.key === 'D') setOpen((o) => !o);
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function startDrag(e) {
    const rect = dragRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    drag.current = { active: true, dx: cx - rect.left, dy: cy - rect.top };
    document.body.style.userSelect = 'none';
  }

  const panelStyle = {
    position: 'fixed',
    zIndex: 100,
    width: 260,
    background: 'var(--bg)',
    color: 'var(--ink)',
    border: '1px solid var(--rule)',
    borderRadius: 14,
    boxShadow: '0 30px 60px -20px rgba(0,0,0,.25), 0 8px 16px -8px rgba(0,0,0,.12)',
    fontFamily: "'Inter', system-ui, sans-serif",
    overflow: 'hidden',
    transformOrigin: 'bottom right',
    transition: 'opacity .18s ease, transform .18s ease',
    opacity: open ? 1 : 0,
    transform: open ? 'scale(1) translateY(0)' : 'scale(.96) translateY(8px)',
    pointerEvents: open ? 'auto' : 'none',
    ...(pos.x === null ? { right: 24, bottom: 80 } : { left: pos.x, top: pos.y }),
  };

  const fabStyle = {
    position: 'fixed', right: 24, bottom: 24,
    width: 44, height: 44, borderRadius: 999,
    background: 'var(--ink)', color: 'var(--bg)', border: 'none',
    cursor: 'pointer', display: 'grid', placeItems: 'center',
    boxShadow: '0 12px 24px -8px rgba(0,0,0,.3), 0 4px 8px -2px rgba(0,0,0,.15)',
    zIndex: 101, transition: 'transform .15s ease',
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={fabStyle}
        aria-label="Display settings"
        title="Display settings (D)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3 V12 L18 15" />
        </svg>
      </button>

      <div style={panelStyle} ref={dragRef} role="dialog" aria-label="Display settings">
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', borderBottom: '1px solid var(--rule)',
            cursor: 'grab', userSelect: 'none', background: 'var(--bg-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)' }} />
            <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)' }}>
              Display
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 2L12 12M12 2L2 12" />
            </svg>
          </button>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
              Theme
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 3, background: 'var(--bg-2)', borderRadius: 10, border: '1px solid var(--rule)' }}>
              {PUBLIC_THEMES.map((th) => (
                <button
                  key={th.v}
                  type="button"
                  onClick={() => setPrefs((p) => ({ ...p, theme: th.v }))}
                  style={{
                    padding: '8px 10px', fontSize: 12.5, fontWeight: 500,
                    border: 'none', borderRadius: 7, cursor: 'pointer',
                    background: prefs.theme === th.v ? 'var(--ink)' : 'transparent',
                    color: prefs.theme === th.v ? 'var(--bg)' : 'var(--ink-2)',
                    transition: 'all .15s ease', fontFamily: 'inherit',
                  }}
                >
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
              Accent
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(PUBLIC_ACCENTS).map(([k, a]) => {
                const active = prefs.accent === k;
                return (
                  <button
                    key={k}
                    type="button"
                    data-accent={k}
                    onClick={() => setPrefs((p) => ({ ...p, accent: k }))}
                    title={a.name}
                    aria-label={a.name}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      border: active ? '2px solid var(--ink)' : '1px solid var(--rule)',
                      background: 'var(--accent)', cursor: 'pointer', padding: 0,
                      outline: active ? '2px solid var(--bg)' : 'none', outlineOffset: -4,
                      transition: 'transform .15s ease',
                    }}
                  />
                );
              })}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
              {PUBLIC_ACCENTS[prefs.accent]?.name}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
              Density
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 3, background: 'var(--bg-2)', borderRadius: 10, border: '1px solid var(--rule)' }}>
              {PUBLIC_DENSITIES.map((d) => (
                <button
                  key={d.v}
                  type="button"
                  onClick={() => setPrefs((p) => ({ ...p, density: d.v }))}
                  style={{
                    padding: '8px 10px', fontSize: 12.5, fontWeight: 500,
                    border: 'none', borderRadius: 7, cursor: 'pointer',
                    background: prefs.density === d.v ? 'var(--ink)' : 'transparent',
                    color: prefs.density === d.v ? 'var(--bg)' : 'var(--ink-2)',
                    transition: 'all .15s ease', fontFamily: 'inherit',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: 12, borderTop: '1px solid var(--rule)', fontSize: 11, color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace", display: 'flex', justifyContent: 'space-between' }}>
            <span>press <kbd style={{ background: 'var(--bg-2)', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--rule)' }}>D</kbd></span>
            <button
              type="button"
              onClick={() => setPrefs({ theme: 'light', accent: 'terracotta', density: 'default' })}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, textDecoration: 'underline' }}
            >
              reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
