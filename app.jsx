const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "density": "default",
  "heroLayout": "split",
  "headline": "editorial",
  "accent": "terracotta"
}/*EDITMODE-END*/;

const ACCENTS = {
  terracotta: { accent: "#C4623A", accentInk: "#8A3F1E" },
  ink:        { accent: "#1B2B4B", accentInk: "#0E1A2E" },
  forest:     { accent: "#2F6B4F", accentInk: "#1E4A35" },
  amber:      { accent: "#C8902A", accentInk: "#8A6217" },
  violet:     { accent: "#6A4BA8", accentInk: "#48327A" },
};

const HEADLINES = {
  editorial: { pre: "Notes from a finance ops desk, ", em: "quietly", post: " automated." },
  bold:      { pre: "Building AI tools for ", em: "the work", post: " I do every day." },
  plain:     { pre: "Finance operations, ", em: "augmented by AI", post: "." },
  punchy:    { pre: "Less manual work. ", em: "More controls", post: " that hold." },
};

function App() {
  const [t, setT] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", t.theme);
    root.setAttribute("data-density", t.density);
    const accent = ACCENTS[t.accent] || ACCENTS.terracotta;
    root.style.setProperty("--accent", accent.accent);
    root.style.setProperty("--accent-ink", accent.accentInk);
  }, [t.theme, t.density, t.accent]);

  return (
    <>
      <Nav />
      <main>
        <Hero layout={t.heroLayout} headline={HEADLINES[t.headline] || HEADLINES.editorial} />
        <Now />
        <CaseStudies />
        <Writing />
        <CV />
        <Reading />
        <Languages />
        <Colophon />
        <Contact />
      </main>
      <Footer />
      <DisplayPanel />
      <TweaksPanel title="Tweaks">
        <TweakSection title="Theme">
          <TweakRadio label="Palette" value={t.theme} onChange={v => setT('theme', v)}
            options={[{value:'light', label:'Light'}, {value:'dark', label:'Dark'}, {value:'ink', label:'Ink'}]} />
          <TweakSelect label="Accent" value={t.accent} onChange={v => setT('accent', v)}
            options={[
              {value:'terracotta', label:'Terracotta'},
              {value:'ink', label:'Navy'},
              {value:'forest', label:'Forest'},
              {value:'amber', label:'Amber'},
              {value:'violet', label:'Violet'},
            ]} />
        </TweakSection>
        <TweakSection title="Layout">
          <TweakRadio label="Hero" value={t.heroLayout} onChange={v => setT('heroLayout', v)}
            options={[{value:'split', label:'Split'}, {value:'centered', label:'Centered'}, {value:'left', label:'Left only'}]} />
          <TweakRadio label="Density" value={t.density} onChange={v => setT('density', v)}
            options={[{value:'compact', label:'Compact'}, {value:'default', label:'Default'}, {value:'airy', label:'Airy'}]} />
        </TweakSection>
        <TweakSection title="Copy">
          <TweakSelect label="Headline" value={t.headline} onChange={v => setT('headline', v)}
            options={[
              {value:'editorial', label:'Editorial · "quietly automated"'},
              {value:'bold', label:'Bold · "for the work"'},
              {value:'plain', label:'Plain · "augmented by AI"'},
              {value:'punchy', label:'Punchy · "controls that hold"'},
            ]} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#" className="brand">
          <span className="brand-mark">T</span>
          <span>Tom Scholtes</span>
        </a>
        <nav className="nav-links">
          <a href="#now">Now</a>
          <a href="#work">Work</a>
          <a href="#writing">Writing</a>
          <a href="#cv">CV</a>
          <a href="thesis.html">Thesis</a>
          <a href="#reading">Reading</a>
          <a href="#contact">Contact</a>
        </nav>
        <a href="#contact" className="nav-cta">Say hi <Arr /></a>
      </div>
    </header>
  );
}

function Hero({ layout, headline }) {
  const isCentered = layout === 'centered';
  const isLeftOnly = layout === 'left';

  const heading = (
    <>
      <span className="eyebrow">Personal site · Manternach, Luxembourg</span>
      <h1>{headline.pre}<em>{headline.em}</em>{headline.post}</h1>
      <p className="lead">
        I'm Tom. I work as an SPV Controller at a private equity house in Luxembourg.
        Five years now in fund services across PE, Private Debt and Real Estate.
        This site is my live CV, a portfolio of the automation work I've built inside
        my day job, and a place to put down what I'm figuring out about AI in regulated
        finance. Not selling anything. Just keeping notes in public.
      </p>
      <div className="hero-actions">
        <a href="#work" className="btn btn-primary">See the work <Arr /></a>
        <a href="#cv" className="btn btn-ghost">Read the CV</a>
      </div>
      <div className="hero-meta">
        <div><strong>5+ yrs</strong>in Lux fund services</div>
        <div><strong>7</strong>case studies on file</div>
        <div><strong>5</strong>languages spoken</div>
      </div>
    </>
  );

  if (isCentered) {
    return (
      <section className="hero">
        <div className="container" style={{textAlign: 'center'}}>
          <div style={{display:'inline-flex', flexDirection:'column', alignItems:'center', maxWidth: 880}}>
            {heading}
          </div>
          <div style={{marginTop: 56, maxWidth: 640, marginInline: 'auto'}}>
            <HeroCard />
          </div>
        </div>
      </section>
    );
  }
  if (isLeftOnly) {
    return (
      <section className="hero">
        <div className="container">
          <div style={{maxWidth: 820}}>{heading}</div>
        </div>
      </section>
    );
  }
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>{heading}</div>
        <HeroCard />
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="hero-card" aria-hidden="true">
      <div className="head">
        <span className="dots"><i /><i /><i /></span>
        <span>~/skills · annual-accounts</span>
      </div>
      <div className="flow">
        <FlowRow state="done"  label="Read trial balance · Excel"            tag="0:08" />
        <FlowRow state="done"  label="Identify entity type · holding/SPV"    tag="0:02" />
        <FlowRow state="done"  label="Pull prior-year notes pattern"         tag="0:14" />
        <FlowRow state="live"  label="Generate disclosure notes · Word"      tag="drafting" pulse />
        <FlowRow state="queued" label="Cross-check vs. recon file"           tag="queued" />
      </div>
      <div className="foot">
        <span>3h → 30m per entity set</span>
        <strong>↓ 83%</strong>
      </div>
    </div>
  );
}

function FlowRow({ state, label, tag, pulse }) {
  return (
    <div className={`flow-row ${state}`}>
      <div className="flow-tick">
        {state === 'done' && (
          <svg viewBox="0 0 12 12" fill="none"><path d="M2 6.5L5 9.5L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </div>
      <span>{label}</span>
      <span className="flow-tag">{pulse && <span className="pulse" style={{marginRight:6}} />}{tag}</span>
    </div>
  );
}

function Now() {
  const items = [
    { k: "Working on", v: "SPV control, statutory reporting and waterfall mechanics at a Luxembourg PE house. Day job." },
    { k: "Building", v: "A personal library of Claude skills for the recurring stuff in fund accounting. Slow but it's adding up." },
    { k: "Learning", v: "How to design AI skills that other people on the team can actually use without me hovering." },
    { k: "Reading", v: "Mostly non-fiction. Right now, going back through books on systems thinking and operational quality." },
    { k: "Off the clock", v: "Lifting in the morning. A bit of writing in the evening. Trying to be outside more." },
  ];
  return (
    <section id="now">
      <div className="container">
        <div className="sec-head">
          <span className="eyebrow">/ now · April 2026</span>
          <div>
            <h2>What I'm focused on this quarter.</h2>
            <p className="blurb" style={{marginTop:18}}>A public note of where my head is right now, in the spirit of <span style={{fontStyle:'italic'}}>nownownow.com</span>. I update it when things change, not on a schedule.</p>
          </div>
        </div>
        <div style={{borderTop:'1px solid var(--rule)'}}>
          {items.map(it => (
            <div key={it.k} style={{display:'grid', gridTemplateColumns:'minmax(140px, 200px) 1fr', gap: 24, padding: '20px 0', borderBottom: '1px solid var(--rule)', alignItems: 'baseline'}}>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 12, color: 'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em'}}>{it.k}</div>
              <div style={{color:'var(--ink-2)', fontSize: 16, textWrap:'pretty'}}>{it.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudies() {
  const studies = [
    {
      n: "01",
      title: "Automated Regulatory Notes Generation",
      metric: "3h → 30m",
      label: "per entity set · 83% time reduction",
      blurb: "A reusable Claude skill that reads the trial balance, figures out the entity type, and generates the full annual-accounts disclosure notes. Tables, movement schedules, narrative, all in the firm's house style.",
      tags: ["Claude skills", "Word generation", "LuxGAAP"],
    },
    {
      n: "02",
      title: "Annual Accounts Quality Review",
      metric: "Pre-audit",
      label: "automated cross-checker",
      blurb: "A review skill that takes the produced annual accounts (PDF) and the source reconciliation (Excel), checks every cross-reference between the primary statements and the notes, and flags inconsistencies before the auditor finds them.",
      tags: ["PDF parsing", "Excel", "QA automation"],
    },
    {
      n: "03",
      title: "Confidential Document Anonymisation",
      metric: "Hours → mins",
      label: "share registers for KYC/AML reviews",
      blurb: "A pipeline that takes raw transactional share-register data, aggregates net positions per shareholder per share class, applies rule-based redaction for non-strategic shareholders, and spits out a print-ready Excel and PDF.",
      tags: ["Data aggregation", "Compliance", "Multi-format"],
    },
    {
      n: "04",
      title: "Cross-Platform Mailbox Intelligence",
      metric: "Daily",
      label: "morning briefing automation",
      blurb: "A morning assistant that scans the last day or two of email and meeting transcripts, pulls out unanswered messages, follow-ups and half-finished commitments, and hands me a briefing organised by priority and workstream.",
      tags: ["M365", "Outlook", "Triage"],
    },
    {
      n: "05",
      title: "Process Documentation & Knowledge Transfer",
      metric: "Onboarding",
      label: "structured payment & accounting guide",
      blurb: "A proper Payment and Accounting Platform Process Guide. Full payment workflow, exception handling, approval routing, recharge and intercompany cases. Used it to onboard a new team member and cut down on repeated explanations.",
      tags: ["Technical writing", "Process mapping"],
    },
    {
      n: "06",
      title: "Fund Accounting Platform Integration",
      metric: "Above-target",
      label: "implementation contribution",
      blurb: "Worked on a fund-accounting platform rollout. Pref-share reconciliation methodology, waterfall validation against the existing manual models, edge-case identification. Direct contact with the vendor implementation team.",
      tags: ["Reconciliation", "Vendor collab", "Validation"],
    },
    {
      n: "07",
      title: "AI Skill Architecture & Reusable Tooling",
      metric: "Library",
      label: "of reusable Claude skills",
      blurb: "A personal library of small, opinionated AI skills. Notes generation, quality review, anonymisation, mailbox triage, classification. Each one with deterministic inputs and outputs, and the institutional knowledge baked in. A pattern others can copy.",
      tags: ["Skill design", "Knowledge eng.", "Infrastructure"],
    },
  ];

  return (
    <section id="work">
      <div className="container">
        <div className="sec-head">
          <span className="eyebrow">Case studies</span>
          <div>
            <h2>Work I've built inside my role.</h2>
            <p className="blurb" style={{marginTop:18}}>
              Sanitised case studies. Employer name, entity names and figures removed.
              These describe automation work I shipped during my employment. A record
              of what I've done. Not an offer of services.
            </p>
          </div>
        </div>
        <div className="cases">
          {studies.map(s => (
            <article className="case" key={s.n}>
              <div className="case-head">
                <span className="svc-num">Case {s.n}</span>
                <div className="case-metric">
                  <div className="case-metric-num">{s.metric}</div>
                  <div className="case-metric-lbl">{s.label}</div>
                </div>
              </div>
              <h3>{s.title}</h3>
              <p>{s.blurb}</p>
              <div className="tags">
                {s.tags.map(t => <span className="tag" key={t}>{t}</span>)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Writing() {
  const posts = [
    { date: "Coming soon", title: "On encoding institutional knowledge into AI skills", kicker: "Why “just give it a prompt” falls apart on regulated workflows, and what actually works.", tag: "Notes" },
    { date: "Coming soon", title: "What annual accounts taught me about pattern matching", kicker: "Disclosure notes are 90% pattern, 10% judgement. The split changes how you build for them.", tag: "Notes" },
    { date: "Coming soon", title: "A small library beats a big platform", kicker: "On building reusable AI skills versus buying enterprise AI products.", tag: "Notes" },
    { date: "Coming soon", title: "Quality review, automated", kicker: "Cross-checking annual accounts against source files, before the auditor does.", tag: "Case note" },
  ];
  return (
    <section id="writing">
      <div className="container">
        <div className="sec-head">
          <span className="eyebrow">Writing</span>
          <div>
            <h2>Notes, in progress.</h2>
            <p className="blurb" style={{marginTop:18}}>Short pieces on AI, finance ops, and the seams between them. Drafts only for now. I'll publish when they're worth reading.</p>
          </div>
        </div>
        <div style={{borderTop:'1px solid var(--rule)'}}>
          {posts.map(p => (
            <a key={p.title} href="#" style={{display:'grid', gridTemplateColumns:'minmax(140px, 180px) 1fr auto', gap: 24, padding: '24px 0', borderBottom: '1px solid var(--rule)', alignItems:'baseline', textDecoration:'none', color:'inherit'}}>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 12, color:'var(--muted)'}}>{p.date}</div>
              <div>
                <div style={{fontFamily:"'Instrument Serif', serif", fontSize: 26, lineHeight: 1.1, letterSpacing:'-0.01em'}}>{p.title}</div>
                <div style={{color:'var(--ink-2)', fontSize: 14.5, marginTop: 6, maxWidth: '60ch'}}>{p.kicker}</div>
              </div>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em'}}>{p.tag}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CV() {
  const roles = [
    { co: "Triton Partners", role: "Junior SPV Controller", period: "Mar 2025 · Present", note: "End-to-end SPV finance, statutory reporting, cash flows and investor distributions. Hands-on in Investran. Construction and maintenance of waterfall models. LuxGAAP / eCDF annual accounts and BCL Annex IV filings." },
    { co: "Alter Domus", role: "Fund & Corporate Services Officer", period: "Feb 2023 · Mar 2025", note: "Full-cycle accounting for management companies, funds, SPVs and GPs. NAVs, financial statements, CSSF/BCL regulatory filings. Drove process improvements through technology and structured methodologies." },
    { co: "Waystone Administration Solutions", role: "Junior Associate Fund Accountant", period: "Sep 2022 · Jan 2023", note: "Capital calls, distributions, OPEX payments. LuxGAAP financial statements. Audit coordination. Investran import automation." },
    { co: "Aztec Group", role: "Junior Depositary Analyst", period: "Feb 2021 · Aug 2022", note: "Asset confirmation and reconciliation for alternative investment funds. Depositary obligations and oversight duties. eFront reporting." },
    { co: "European Fund Administration", role: "Intern Fund Accountant", period: "Nov 2019 · Nov 2020", note: "NAV calculations, financial-statement preparation, first-level controls and reconciliations. Year-end audit support." },
  ];
  const edu = [
    { school: "Erasmus School of Economics, University of Rotterdam", degree: "MSc Economics & Business, International Economics", period: "2017 · 2020" },
    { school: "University of Luxembourg", degree: "BSc Economics, Law & Management", period: "2014 · 2017" },
  ];
  return (
    <section id="cv">
      <div className="container">
        <div className="sec-head">
          <span className="eyebrow">Live CV</span>
          <div>
            <h2>Five years in Luxembourg fund services.</h2>
            <p className="blurb" style={{marginTop:18}}>Updated as roles, projects and credentials change. The condensed PDF version is on request.</p>
          </div>
        </div>

        <div style={{borderTop:'1px solid var(--ink)'}}>
          <div style={{padding:'14px 0 22px', display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em'}}>Experience</span>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, color:'var(--muted)'}}>5 roles · 5+ years</span>
          </div>
          {roles.map(r => (
            <div key={r.co} style={{display:'grid', gridTemplateColumns:'1fr 1.4fr 0.8fr', gap: 24, padding: '22px 0', borderTop: '1px solid var(--rule)'}}>
              <div>
                <div style={{fontFamily:"'Instrument Serif', serif", fontSize: 28, lineHeight: 1.05, letterSpacing:'-0.01em'}}>{r.co}</div>
                <div style={{fontWeight: 500, marginTop: 4, fontSize: 14.5}}>{r.role}</div>
              </div>
              <div style={{color:'var(--ink-2)', fontSize: 14.5, textWrap:'pretty', maxWidth:'60ch'}}>{r.note}</div>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 12, color: 'var(--muted)', textAlign: 'right'}}>{r.period}</div>
            </div>
          ))}
        </div>

        <div style={{marginTop: 56, borderTop:'1px solid var(--ink)'}}>
          <div style={{padding:'14px 0 22px'}}>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em'}}>Education</span>
          </div>
          {edu.map(e => (
            <div key={e.school} style={{display:'grid', gridTemplateColumns:'1fr 1.4fr 0.8fr', gap: 24, padding: '22px 0', borderTop: '1px solid var(--rule)'}}>
              <div style={{fontFamily:"'Instrument Serif', serif", fontSize: 22, lineHeight: 1.1, letterSpacing:'-0.01em'}}>{e.school}</div>
              <div style={{color:'var(--ink-2)', fontSize: 14.5}}>{e.degree}</div>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 12, color: 'var(--muted)', textAlign: 'right'}}>{e.period}</div>
            </div>
          ))}
        </div>

        <div style={{marginTop: 56, borderTop:'1px solid var(--ink)'}}>
          <div style={{padding:'14px 0 22px'}}>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em'}}>Skills</span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 24}}>
            {[
              ["Accounting systems", "Investran · eFront · BOB50 · SAP"],
              ["IT / scripting", "VBA · Python · Microsoft Power Automate"],
              ["Office", "Advanced Excel · Word · PowerPoint"],
              ["Fund types", "Private Equity · Private Debt · Real Estate"],
              ["AI tooling", "Claude · Claude Code · ChatGPT · Glean"],
              ["Frameworks", "LuxGAAP · eCDF · CSSF / BCL filings"],
            ].map(([k, v]) => (
              <div key={k} style={{padding: '20px 0', borderTop: '1px solid var(--rule)'}}>
                <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em'}}>{k}</div>
                <div style={{marginTop: 6, fontWeight: 500}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop: 56, borderTop:'1px solid var(--ink)'}}>
          <div style={{padding:'14px 0 22px'}}>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em'}}>Publication</span>
          </div>
          <div style={{padding: '22px 0', borderTop:'1px solid var(--rule)', display:'grid', gridTemplateColumns:'1fr 0.4fr', gap: 24, alignItems:'baseline'}}>
            <div>
              <div style={{fontFamily:"'Instrument Serif', serif", fontSize: 22, lineHeight: 1.15, letterSpacing:'-0.01em'}}>Augmented gravity model: Institutions, Infrastructure and Globalization impact on bilateral exports among OECD countries</div>
              <div style={{color:'var(--ink-2)', fontSize: 14, marginTop: 6}}>MSc thesis · Erasmus University Rotterdam</div>
            </div>
            <div style={{textAlign:'right'}}>
              <a href="thesis.html" className="btn btn-ghost" style={{padding:'10px 16px', fontSize: 13}}>Read</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Reading() {
  const themes = [
    { theme: "Systems & ops quality", note: "How operational excellence actually gets built and kept. Applies to finance ops as much as to engineering." },
    { theme: "Knowledge engineering", note: "Encoding expertise into tools other people can use without becoming experts themselves." },
    { theme: "AI & cognition", note: "Practical books on what current AI can and cannot do, and where it changes the work." },
    { theme: "Economics & finance", note: "Continuing the line my degrees started. International economics, capital markets, regulation." },
  ];
  return (
    <section id="reading">
      <div className="container">
        <div className="sec-head">
          <span className="eyebrow">Reading</span>
          <div>
            <h2>Mostly non-fiction.</h2>
            <p className="blurb" style={{marginTop:18}}>Themes I keep coming back to. A proper bookshelf with titles will go here once I've trimmed the list.</p>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 1, background:'var(--rule)', border:'1px solid var(--rule)', borderRadius: 18, overflow:'hidden'}} className="reading-grid">
          {themes.map(t => (
            <div key={t.theme} style={{background:'var(--bg)', padding: 32}}>
              <div style={{fontFamily:"'Instrument Serif', serif", fontSize: 26, lineHeight: 1.1, letterSpacing:'-0.01em'}}>{t.theme}</div>
              <p style={{color:'var(--ink-2)', fontSize: 14.5, marginTop: 10, marginBottom: 0}}>{t.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Languages() {
  const langs = [
    { code: "EN", name: "English" },
    { code: "FR", name: "Français" },
    { code: "DE", name: "Deutsch" },
    { code: "LU", name: "Lëtzebuergesch" },
    { code: "RU", name: "Русский" },
  ];
  return (
    <section>
      <div className="container">
        <div className="sec-head">
          <span className="eyebrow">Languages</span>
          <div>
            <h2>Five, used regularly.</h2>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 16}} className="lang-grid">
          {langs.map(l => (
            <div key={l.code} style={{border:'1px solid var(--rule)', borderRadius: 14, padding: 24, textAlign:'center', background:'var(--bg-2)'}}>
              <div style={{fontFamily:"'Instrument Serif', serif", fontStyle:'italic', fontSize: 56, lineHeight: 1, color:'var(--accent)', letterSpacing:'-0.02em'}}>{l.code}</div>
              <div style={{marginTop: 10, fontWeight: 500}}>{l.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Colophon() {
  return (
    <section>
      <div className="container">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1.6fr', gap: 56, alignItems:'baseline'}} className="colo-grid">
          <div>
            <span className="eyebrow">Colophon</span>
            <h2 style={{fontFamily:"'Instrument Serif', serif", fontWeight: 400, fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.05, margin: '14px 0 0', letterSpacing: '-0.02em'}}>How this site is made.</h2>
          </div>
          <div style={{color:'var(--ink-2)', fontSize: 16, maxWidth:'62ch'}}>
            <p style={{marginTop: 0}}>
              Designed and written in the open. Type set in <span style={{fontFamily:"'Instrument Serif', serif", fontStyle:'italic'}}>Instrument Serif</span> for display,
              <span style={{fontWeight: 500}}> Inter</span> for body, and <span style={{fontFamily:"'JetBrains Mono', monospace"}}>JetBrains Mono</span> for the small machine voice.
            </p>
            <p>
              Built with help from <span style={{fontFamily:"'JetBrains Mono', monospace"}}>Claude</span>. Fittingly, the same tool I use at work to build the skills described in the case studies above.
            </p>
            <p>
              Personal site. Opinions my own. Nothing here is investment advice or a commercial offer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact">
      <div className="container">
        <div className="cta-card">
          <div className="cta-bg">hi.</div>
          <div style={{position:'relative', zIndex: 1}}>
            <span className="eyebrow" style={{color:'inherit', opacity:.6}}>Contact</span>
            <h2 style={{marginTop: 16}}>If any of this is <em>interesting</em>, say hi.</h2>
          </div>
          <div className="right" style={{position:'relative', zIndex: 1}}>
            <p>I'm not taking on commercial work. But I like meeting people working on similar problems. Finance ops, AI tooling, knowledge engineering, regulated workflows. Drop a note.</p>
            <a href="https://www.linkedin.com/messaging/compose/?recipient=tomscholtes93" target="_blank" rel="noopener" className="btn btn-primary">Message on LinkedIn <Arr /></a>
            <div style={{display:'flex', gap: 12, flexWrap:'wrap'}}>
              <a href="https://www.linkedin.com/in/tomscholtes93/" target="_blank" rel="noopener" className="btn btn-ghost">View profile</a>
              <a href="mailto:tom.scholtes.93@hotmail.com" className="btn btn-ghost">Email</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div>
            <div className="brand" style={{marginBottom: 14}}>
              <span className="brand-mark">T</span>
              <span style={{color:'var(--ink)', fontWeight: 600}}>Tom Scholtes</span>
            </div>
            <p style={{margin: 0, maxWidth: '38ch', fontSize: 14}}>
              Personal site. SPV Controller in Luxembourg. Notes on AI in finance ops, a live CV,
              and a portfolio of work. Non-commercial.
            </p>
          </div>
          <div>
            <h5>Site</h5>
            <a href="#now">Now</a>
            <a href="#work">Work</a>
            <a href="#writing">Writing</a>
            <a href="#cv">CV</a>
            <a href="#reading">Reading</a>
          </div>
          <div>
            <h5>Elsewhere</h5>
            <a href="https://www.linkedin.com/in/tomscholtes93/">LinkedIn</a>
            <a href="thesis.html">MSc thesis</a>
          </div>
          <div>
            <h5>Contact</h5>
            <a href="mailto:tom.scholtes.93@hotmail.com">tom.scholtes.93@hotmail.com</a>
            <a href="#contact">Say hi</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Tom Scholtes · Manternach, Luxembourg</span>
          <span>Personal site · opinions my own</span>
        </div>
      </div>
    </footer>
  );
}

function Arr() {
  return (
    <svg className="arr" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8H13M9 4L13 8L9 12" />
    </svg>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
