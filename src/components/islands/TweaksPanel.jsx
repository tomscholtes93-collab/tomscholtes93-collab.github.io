import { useState, useEffect } from 'react';

// Minimal port of V2's editor-mode Tweaks panel. The full panel only matters
// inside the editor host that postMessages __activate_edit_mode; for the public
// site it stays inert. We register the protocol so any future host integration
// keeps working without re-rolling the contract.
export default function TweaksPanel() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onMsg(e) {
      const t = e && e.data && e.data.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    }
    window.addEventListener('message', onMsg);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
    return () => window.removeEventListener('message', onMsg);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Tweaks"
      style={{
        position: 'fixed', right: 16, bottom: 16, zIndex: 2147483646,
        width: 280, padding: 14,
        background: 'rgba(250,249,247,.92)', color: '#29261b',
        backdropFilter: 'blur(24px) saturate(160%)',
        border: '.5px solid rgba(255,255,255,.6)', borderRadius: 14,
        boxShadow: '0 12px 40px rgba(0,0,0,.18)',
        font: '11.5px/1.4 ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <b style={{ fontSize: 12 }}>Tweaks</b>
        <button
          type="button"
          aria-label="Close tweaks"
          onClick={() => {
            setOpen(false);
            try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
          }}
          style={{ background: 'transparent', border: 0, fontSize: 13, cursor: 'pointer', color: 'rgba(41,38,27,.55)' }}
        >
          ✕
        </button>
      </div>
      <div style={{ color: 'rgba(41,38,27,.72)' }}>
        Editor controls available via host postMessage protocol.
        Public display preferences live in the floating Display panel (press <kbd>D</kbd>).
      </div>
    </div>
  );
}
