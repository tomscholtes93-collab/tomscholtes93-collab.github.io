// Public-facing floating display panel.
// Lets visitors switch theme + accent. Persists in localStorage.
// Independent of the editor Tweaks panel.

const { useState: useState_, useEffect: useEffect_, useRef: useRef_ } = React;

const PUBLIC_ACCENTS = {
  terracotta: { name: "Terracotta", accent: "#C4623A", accentInk: "#8A3F1E", swatch: "#C4623A" },
  ink:        { name: "Navy",       accent: "#1B2B4B", accentInk: "#0E1A2E", swatch: "#1B2B4B" },
  forest:     { name: "Forest",     accent: "#2F6B4F", accentInk: "#1E4A35", swatch: "#2F6B4F" },
  amber:      { name: "Amber",      accent: "#C8902A", accentInk: "#8A6217", swatch: "#C8902A" },
  violet:     { name: "Violet",     accent: "#6A4BA8", accentInk: "#48327A", swatch: "#6A4BA8" },
};

const PUBLIC_THEMES = [
  { v: "light", label: "Light" },
  { v: "dark",  label: "Dark"  },
  { v: "ink",   label: "Ink"   },
];

const STORAGE_KEY = "ts-display-prefs";

function loadPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      theme: saved.theme || "light",
      accent: saved.accent || "terracotta",
    };
  } catch (e) {
    return { theme: "light", accent: "terracotta" };
  }
}

function savePrefs(p) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) {}
}

function applyPrefs(p) {
  const root = document.documentElement;
  root.setAttribute("data-theme", p.theme);
  const a = PUBLIC_ACCENTS[p.accent] || PUBLIC_ACCENTS.terracotta;
  root.style.setProperty("--accent", a.accent);
  root.style.setProperty("--accent-ink", a.accentInk);
}

function DisplayPanel() {
  const [open, setOpen] = useState_(false);
  const [prefs, setPrefs] = useState_(loadPrefs);
  const [pos, setPos] = useState_({ x: null, y: null });
  const dragRef = useRef_(null);
  const drag = useRef_({ active: false, dx: 0, dy: 0 });

  useEffect_(() => {
    applyPrefs(prefs);
    savePrefs(prefs);
  }, [prefs]);

  // Drag handling
  useEffect_(() => {
    function onMove(e) {
      if (!drag.current.active) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - drag.current.dx;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - drag.current.dy;
      setPos({ x: Math.max(8, Math.min(window.innerWidth - 280, x)), y: Math.max(8, Math.min(window.innerHeight - 80, y)) });
    }
    function onUp() { drag.current.active = false; document.body.style.userSelect = ""; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  function startDrag(e) {
    const rect = dragRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    drag.current = { active: true, dx: cx - rect.left, dy: cy - rect.top };
    document.body.style.userSelect = "none";
  }

  // Keyboard: D toggles
  useEffect_(() => {
    function onKey(e) {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key === "d" || e.key === "D") setOpen(o => !o);
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const panelStyle = {
    position: "fixed",
    zIndex: 100,
    width: 260,
    background: "var(--bg)",
    color: "var(--ink)",
    border: "1px solid var(--rule)",
    borderRadius: 14,
    boxShadow: "0 30px 60px -20px rgba(0,0,0,.25), 0 8px 16px -8px rgba(0,0,0,.12)",
    fontFamily: "'Inter', system-ui, sans-serif",
    overflow: "hidden",
    transformOrigin: "bottom right",
    transition: "opacity .18s ease, transform .18s ease",
    opacity: open ? 1 : 0,
    transform: open ? "scale(1) translateY(0)" : "scale(.96) translateY(8px)",
    pointerEvents: open ? "auto" : "none",
    ...(pos.x === null
      ? { right: 24, bottom: 80 }
      : { left: pos.x, top: pos.y }),
  };

  const fabStyle = {
    position: "fixed",
    right: 24,
    bottom: 24,
    width: 44,
    height: 44,
    borderRadius: 999,
    background: "var(--ink)",
    color: "var(--bg)",
    border: "none",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 12px 24px -8px rgba(0,0,0,.3), 0 4px 8px -2px rgba(0,0,0,.15)",
    zIndex: 101,
    transition: "transform .15s ease",
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        style={fabStyle}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
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
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 14px", borderBottom: "1px solid var(--rule)",
            cursor: "grab", userSelect: "none",
            background: "var(--bg-2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--accent)", display: "inline-block" }} />
            <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: ".08em", color: "var(--muted)" }}>
              Display
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4, display: "grid", placeItems: "center" }}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 2L12 12M12 2L2 12" />
            </svg>
          </button>
        </div>

        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Theme segmented control */}
          <div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
              Theme
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, padding: 3, background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--rule)" }}>
              {PUBLIC_THEMES.map(th => (
                <button
                  key={th.v}
                  onClick={() => setPrefs(p => ({ ...p, theme: th.v }))}
                  style={{
                    padding: "8px 10px",
                    fontSize: 12.5,
                    fontWeight: 500,
                    border: "none",
                    borderRadius: 7,
                    cursor: "pointer",
                    background: prefs.theme === th.v ? "var(--ink)" : "transparent",
                    color: prefs.theme === th.v ? "var(--bg)" : "var(--ink-2)",
                    transition: "all .15s ease",
                    fontFamily: "inherit",
                  }}
                >
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent swatches */}
          <div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
              Accent
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(PUBLIC_ACCENTS).map(([k, a]) => {
                const active = prefs.accent === k;
                return (
                  <button
                    key={k}
                    onClick={() => setPrefs(p => ({ ...p, accent: k }))}
                    title={a.name}
                    style={{
                      width: 32, height: 32,
                      borderRadius: "50%",
                      border: active ? "2px solid var(--ink)" : "1px solid var(--rule)",
                      background: a.swatch,
                      cursor: "pointer",
                      padding: 0,
                      outline: active ? "2px solid var(--bg)" : "none",
                      outlineOffset: -4,
                      transition: "transform .15s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    aria-label={a.name}
                  />
                );
              })}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
              {PUBLIC_ACCENTS[prefs.accent]?.name}
            </div>
          </div>

          <div style={{ paddingTop: 12, borderTop: "1px solid var(--rule)", fontSize: 11, color: "var(--muted)", fontFamily: "'JetBrains Mono', monospace", display: "flex", justifyContent: "space-between" }}>
            <span>press <kbd style={{ background: "var(--bg-2)", padding: "1px 5px", borderRadius: 3, border: "1px solid var(--rule)" }}>D</kbd></span>
            <button
              onClick={() => setPrefs({ theme: "light", accent: "terracotta" })}
              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontFamily: "inherit", fontSize: 11, textDecoration: "underline" }}
            >
              reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Apply saved prefs immediately on load (before React mounts) to prevent flash
applyPrefs(loadPrefs());

window.DisplayPanel = DisplayPanel;
