# Tournament Results: tomscholtes.com Homepage Concepts

Six bold homepage concepts judged by a three-lens panel (craft-and-originality,
clarity-and-completeness, hiring-impact). Aggregation uses two methods: a combined
score (sum of each judge's numeric total) and a Borda count (each judge's ranking,
1st place = 6 points down to 6th = 1 point).

## Final Ranking

| Rank | Route     | Concept                          | Combined | Borda |
|------|-----------|----------------------------------|----------|-------|
| 1    | /lab/v2/  | Print editorial / magazine spread| 103      | 14    |
| 2    | /lab/v3/  | Live systems architecture map    | 102      | 14    |
| 3    | /lab/v6/  | Swiss / brutalist life-index     | 100      | 12    |
| 4    | /lab/v5/  | Cinematic scrollytelling timeline| 95       | 9     |
| 5    | /lab/v1/  | Real command-line terminal       | 89       | 10    |
| 6    | /lab/v4/  | tomOS faux desktop               | 82       | 4     |

Note on method agreement: the two methods agree on the top three (v2, v3, v6) and
on the bottom design (v4). They disagree only in the middle, on v1 vs v5. Borda
ranks v1 above v5 (10 vs 9) because v1 places highly in two of three lenses;
combined score ranks v5 above v1 (95 vs 89) because v1's catastrophic
clarity-completeness total (22) drags its sum down further than its strong finishes
lift it. The combined-score order is used for the final table below the top three,
since one judge scoring a design near-unusable is a heavier signal than placement.
The winner is unaffected: v2 leads on both methods (it ties v3 on Borda at 14 but
edges it on combined, 103 vs 102).

## Winner: /lab/v2/ (Print editorial / magazine spread)

v2 is the only concept that builds genuine layout structure rather than decorating
stacked sections: true CSS multi-column runs with column rules, a serif drop cap, a
double-rule masthead, section paragraph-mark bullets, and a print-grain multiply
overlay, all carried by a single disciplined oxblood accent on warm paper. It tops
the craft lens outright and finishes second on clarity, so it wins on both
aggregation methods. It is not the boldest idea (v3 is), but it is the most uniformly
excellent execution end to end, and a near-flawless, fully static, scannable page is
the safest high-quality bet for a personal site.

## One-line Verdict per Design

- /lab/v2/: Best-crafted and most complete; magazine furniture done for real, wins on both methods.
- /lab/v3/: Boldest idea and the strongest hiring signal; form proves the thesis, but the payoff is desktop-bound.
- /lab/v6/: The clarity champion and fastest-trust read; gorgeous and legible, just less surprising.
- /lab/v5/: Best atmosphere and a conventional complete page underneath, but cinematic chrome over a standard stack.
- /lab/v1/: A genuinely functional shell with a killer hook, undone by content living only in JS strings.
- /lab/v4/: The most ambitious build, the weakest first impression; overlapping windows hide half the brief on load.

## Each Judge's Headline Take

- craft-originality (winner: /lab/v2/): "v2 is the only entry that builds genuine
  layout structures rather than decorating stacked sections. v3 is the more original
  idea with the highest impact ceiling but its wow is desktop-bound. v4 ranks last:
  the macOS skin is the most borrowed concept with the least authored personality."
- clarity-completeness (winner: /lab/v6/): "v6 makes density and findability the
  entire design; the page is 100% complete and scannable with scripting off. v2 is a
  very close, best-crafted second. v1 ranks last: nearly all section bodies live only
  as JS strings, so with JS off only the footer survives."
- hiring-impact (winner: /lab/v3/): "v3 is the only concept where the medium IS the
  message; a live node graph of the person proves the agent-infrastructure pitch by
  demonstration. v1 is the close runner-up on hook strength. v4 is the worst
  hiring bet: it tries hardest and trusts the viewer least."

## Where Each Design Is Strong / Weak

- /lab/v2/: STRONG real multi-column editorial structure, top typographic craft,
  fully static and complete, single coherent accent. WEAK magazine metaphor is a
  known genre (lower novelty), and the CSS-columns case run creates down-column-then-
  across reading order; signals "editor" more than "engineer" to a finance founder.
- /lab/v3/: STRONG most original, best concept-to-person fit, ambitious cleanly
  engineered pan/zoom/SVG canvas, genuine no-JS linear fallback. WEAK headline desktop
  mode reveals content one node-click at a time with no see-everything view; content
  duplicated (linear DOM + JS templates); collapses to an ordinary stack on mobile.
- /lab/v6/: STRONG highest clarity, density-as-aesthetic, numbered index doubles as
  nav, fully static, fastest 20-second scan, restraint reads as confidence. WEAK
  brutalist ledger is a heavily-trodden trend; header numerals do not align with the
  index order; the keyboard number-jump signature is partly dead; does not prove
  technical depth.
- /lab/v5/: STRONG best atmosphere (grain, vignette, gold/blue), a genuinely
  complete static long-scroll under the chrome, motion correctly gated. WEAK
  scrollytelling-plus-grain is a familiar prestige move; low information density and
  tall acts cost scan efficiency; value gated behind scrolling fails the fast-read test.
- /lab/v1/: STRONG truly functional shell (history, Tab-complete, aliases, palette),
  strongest 5-second hook, high build-skill signal, static footer survives JS-off.
  WEAK nearly all content lives in JS strings so the page is near-empty without
  scripting; even with JS, output appears one command at a time with no full view;
  terminal-portfolio is a familiar trope.
- /lab/v4/: STRONG the windowing engine is real and works (draggable, focusable,
  traffic lights, magnifying dock, live clock), separate clean static mobile stack.
  WEAK most borrowed concept (macOS skin), generic product-blue palette, default
  opens four overlapping windows with CV and Contact hidden behind the dock, poor
  no-JS desktop degradation; the worst cold first impression.

## Shared Note

All six designs carry the same data inconsistency: a hero stat reads "7 case studies"
while nine case studies are listed. It is most glaring in v1, where both numbers
appear in a single view. Fix before any of these ships.
